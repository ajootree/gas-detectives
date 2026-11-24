import {BANK,CATEGORIES,concept,sentence,explain,question} from './data.mjs';
import {KEY,MODES,fresh,restore,next,complete} from './score.mjs';
import {augment,activeRun,remaining,expired,startRun,runAnswer,reviewRun,endRun,PASS_SCORE,PASS_ACCURACY} from './challenge.mjs';
import {ready as onlineReady,beginOnlineRun,submitOnlineRun,fetchLeaderboard} from './leaderboard.mjs';
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let raw=null,storageOK=true;try{raw=JSON.parse(localStorage.getItem(KEY));}catch{try{localStorage.getItem(KEY);}catch{storageOK=false;}}
let state=augment(restore(raw),raw||{}),shown=null,busy=false,dialog=null,dialogType='',transition=null,rankRequest=0;
const uploads=new Set();
function nickname(){const a=['씩씩한','반짝이는','차분한','용감한','즐거운','꼼꼼한'],b=['수달','기린','고래','토끼','다람쥐','펭귄'];const n=crypto.getRandomValues(new Uint32Array(3));return a[n[0]%a.length]+b[n[1]%b.length]+String(n[2]%10000).padStart(4,'0');}
if(!state.nickname)state.nickname=nickname();if(!state.current)next(state);
if(!state.run&&raw?.mode!==state.mode){state.current.part=0;state.review=false;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{storageOK=false;}}
function say(text){$('#status').textContent=text;}
function kindName(type){return {practice:'연습',gate60:'60초 도전',marathon:'무한 마라톤',sprint120:'120초 도전'}[type];}
function best(type){return type==='gate60'?state.bests.gate60[state.mode]||0:state.bests[type]||0;}
function scoreValue(){return state.activity==='practice'?state.points:state.run?.type===state.activity?state.run.score:best(state.activity);}
function header(){
  const running=activeRun(state),types=state.mode===3?['practice','marathon','sprint120']:['practice','gate60'];
  return `<header class="header"><div class="title">기체 단어 퀴즈</div><div class="score" aria-label="현재 점수 ${scoreValue()}점"><small>${state.activity==='practice'?'연습 누적':'도전 점수'}</small><strong id="points">${scoreValue()}</strong><span>점</span></div>${running?'<div class="timer" id="clock" aria-label="도전 시간"></div><button class="small-button" id="quit">그만하기</button>':`<button class="small-button" id="ranking">랭킹</button>${state.activity==='practice'?'<button class="small-button" id="help">학습 도움</button>':''}<button class="small-button" id="reset">기록 초기화</button>`}</header><nav class="modes" aria-label="학습 단계">${MODES.map((name,i)=>`<button class="mode ${state.mode===i?'active':''}" data-mode="${i}" ${i>state.unlocked||running?'disabled':''} aria-pressed="${state.mode===i}" title="${i>state.unlocked?'앞 단계의 60초 도전을 통과하면 열려요':name}"><span>${i+1} · ${name}</span>${i>state.unlocked?'<small>잠김</small>':''}</button>`).join('')}</nav><div class="activity-bar" role="group" aria-label="연습과 도전 선택">${types.map(type=>`<button class="activity ${state.activity===type?'active':''}" data-activity="${type}" ${running?'disabled':''} aria-pressed="${state.activity===type}">${kindName(type)}</button>`).join('')}</div>`;
}
function bindHeader(){
  document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{if(busy||activeRun(state))return;state.mode=Number(b.dataset.mode);state.activity='practice';state.run=null;next(state);save();render();});
  document.querySelectorAll('[data-activity]').forEach(b=>b.onclick=()=>{if(busy||activeRun(state))return;state.activity=b.dataset.activity;state.run=null;if(state.activity==='practice')next(state);save();render();});
  $('#ranking')?.addEventListener('click',()=>ranking());$('#help')?.addEventListener('click',help);$('#reset')?.addEventListener('click',reset);
  $('#quit')?.addEventListener('click',()=>{if(state.run?.type==='gate60'){open(`<h2 id="dialog-title">이번 도전을 그만할까요?</h2><p>60초를 끝까지 풀어야 다음 단계로 갈 수 있어요. 연습 기록은 유지돼요.</p><div class="dialog-actions"><button class="small-button" id="keep-going">계속 도전</button><button class="primary" id="end-now">그만하기</button></div>`,'quit');$('#keep-going').onclick=close;$('#end-now').onclick=()=>{close();finishChallenge('quit');};}else finishChallenge('quit');});
}
function render(){
  clearTimeout(transition);busy=false;
  if(state.activity==='practice'||activeRun(state)||state.review)renderQuestion();else renderLobby();
  bindHeader();save();updateClock();
  if(state.review)review();
}
function renderQuestion(){
  const scenario=BANK.find(s=>s.id===state.current.id),q=question(state.mode,scenario,state.current.part);shown={scenario,q,mode:state.mode,part:state.current.part};const c=concept(scenario.cat),cycle=state.cycles[state.mode];
  const context=activeRun(state)?state.run.type==='gate60'?'60초 동안 차근차근 풀어요':`완성한 문장 ${state.run.completed}개 · 단어 ${state.current.part+1}/3`:(state.mode===1||state.mode===2)?cycle<4?'온도부터 연습해요':cycle<8?'압력을 연습해요':'온도와 압력을 섞어서 연습해요':state.mode===3?`단어 ${state.current.part+1} / 3`:'상황을 읽고 알맞은 단어를 골라요';
  const text=state.mode===2?`기체의 ${c.kind}가 ${c.direction==='높아진다'?'높아졌어요':'낮아졌어요'}.`:scenario.text;
  $('#app').innerHTML=header()+`<section class="question-area"><div class="context">${context}</div><h1 class="scenario" id="scenario">${esc(text)}</h1>${state.mode===3?`<div class="chain" aria-label="연결 문장">${['kind','direction','volume'].map((k,i)=>`<span class="blank ${i<state.current.part?'filled':i===state.current.part?'current':''}">${i<state.current.part?c[k]:['온도 / 압력','변화 방향','기체의 부피'][i]}</span>`).join('<span aria-hidden="true">›</span>')}</div>`:''}<div class="prompt" id="question">${q.prompt}</div><div class="answers">${q.options.map((word,i)=>`<button class="answer" data-answer="${i}">${word}</button>`).join('')}</div><div class="feedback" id="feedback" aria-live="polite"></div></section>`;
  document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.answer)));say(`${text} ${q.prompt} ${q.options.join(', ')}`);
}
function renderLobby(){
  const type=state.activity;
  const info=type==='gate60'?`60초 동안 <strong>${PASS_SCORE}점 이상</strong>, <strong>정답률 ${PASS_ACCURACY*100}% 이상</strong>이면 다음 단계가 열려요.`:type==='marathon'?'첫 오답이 나올 때까지 이어서 풀어요. 세 단어를 모두 맞힌 연결 문장마다 <strong>30점</strong>을 받아요.':'120초 동안 연결 문장을 완성해요. 틀리지 않고 완성한 문장마다 <strong>30점</strong>을 받아요.';
  $('#app').innerHTML=header()+`<section class="question-area lobby"><div class="context">${state.mode+1}단계 · ${MODES[state.mode]}</div><h1 class="lobby-title">${kindName(type)}</h1><p class="lobby-info">${info}</p><div class="personal-best">이 기기 최고 기록 <strong>${best(type)}점</strong></div>${type!=='gate60'?`<div class="nickname">랭킹 별명 <strong id="nickname">${esc(state.nickname)}</strong><button class="small-button" id="new-nickname">다른 별명</button></div>`:''}<button class="primary start-button" id="start-run">${kindName(type)} 시작</button>${state.run?.ended?'<button class="small-button" id="show-result">지난 도전 결과</button>':''}</section>`;
  $('#start-run').onclick=begin;$('#new-nickname')?.addEventListener('click',()=>{state.nickname=nickname();save();$('#nickname').textContent=state.nickname;});$('#show-result')?.addEventListener('click',showResult);
}
async function begin(){
  if(busy)return;busy=true;const button=$('#start-run');button.disabled=true;button.textContent='시작 준비 중…';
  document.querySelectorAll('.mode,.activity,#ranking,#help,#reset,#new-nickname').forEach(b=>b.disabled=true);
  const type=state.activity,id=crypto.randomUUID();let online=null;
  if(type!=='gate60'&&onlineReady()){
    try{online=await beginOnlineRun(type,id);}catch(error){busy=false;render();open(`<h2 id="dialog-title">랭킹에 연결하지 못했어요.</h2><p>연결을 확인하고 다시 시작하거나, 이 기기 기록으로 도전할 수 있어요.</p><div class="dialog-actions"><button class="small-button" id="cancel-start">돌아가기</button><button class="primary" id="offline-start">이 기기 기록으로 시작</button></div>`,'connection');$('#cancel-start').onclick=close;$('#offline-start').onclick=()=>{close();launch(type,id,null);};return;}
  }
  launch(type,id,online);
}
function launch(type,id,online){startRun(state,type,Date.now(),id);state.run.online=online;save();busy=false;render();}
function answer(i){
  if(busy||dialog||!shown||(state.activity!=='practice'&&!activeRun(state)))return;
  if(state.activity==='practice'){if(shown.q.options[i]!==shown.q.answer){state.review=true;state.helped=true;save();review();return;}finishPractice(false);return;}
  const result=runAnswer(state,shown.q.options[i]===shown.q.answer,Date.now());save();
  if(result.review){if(state.run.ended)upload();review();return;}
  if(result.ended){finishChallenge('time');return;}success(result.gain,false);
}
function finishPractice(reviewed){const gain=complete(state,reviewed);save();success(gain,reviewed);}
function success(gain,reviewed){
  busy=true;document.querySelectorAll('[data-answer],.mode,.activity,#help,#reset').forEach(b=>b.disabled=true);document.querySelectorAll('[data-answer]').forEach(b=>b.classList.toggle('correct',b.textContent===shown.q.answer));
  if(shown.mode===3){const c=concept(shown.scenario.cat);document.querySelectorAll('.blank').forEach((b,i)=>{if(i<=shown.part){b.textContent=c[['kind','direction','volume'][i]];b.className='blank filled';}});}
  $('#points').textContent=scoreValue();$('.score').setAttribute('aria-label',`현재 점수 ${scoreValue()}점`);
  const message=gain?`${reviewed?'복습 완료!':'정답!'} +${gain}점`:reviewed?'복습 완료! 다음 문제로 가요.':`정답! ${shown.part+1}/3 연결`;
  $('#feedback').textContent=message;say(message);clearTimeout(transition);transition=setTimeout(()=>{if(expired(state))finishChallenge('time');else render();},state.activity==='practice'?650:250);
}
function updateClock(){
  const clock=$('#clock');if(clock&&state.run){const ms=remaining(state);clock.textContent=ms===null?`${Math.floor((Date.now()-state.run.startedAt)/1000)}초 진행`:`${Math.ceil(ms/1000)}초`;clock.classList.toggle('urgent',ms!==null&&ms<=10000);}
  if(expired(state))finishChallenge('time');
}
function finishChallenge(reason){
  if(!state.run)return;clearTimeout(transition);busy=false;
  if(!state.run.ended)endRun(state,reason,reason==='time'&&state.run.deadline!==null?state.run.deadline:Date.now());save();upload();
  if(state.review){updateResultClock();return;}
  close();render();showResult();
}
function updateResultClock(){const clock=$('#clock');if(clock&&state.run.ended)clock.textContent=state.run.type==='marathon'?'도전 종료':'0초';}
function open(content,type){
  dialog?.remove();dialogType=type;dialog=document.createElement('div');dialog.className='backdrop';dialog.innerHTML=`<section class="dialog" role="${type==='review'?'alertdialog':'dialog'}" aria-modal="true" aria-labelledby="dialog-title">${content}</section>`;document.body.append(dialog);
  dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();if(dialogType!=='review')close();}if(e.key==='Tab'){const nodes=[...dialog.querySelectorAll('button:not(:disabled),input')],first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});requestAnimationFrame(()=>dialog?.querySelector('button:not(:disabled),input')?.focus({preventScroll:true}));
}
function close(){dialog?.remove();dialog=null;dialogType='';document.querySelector('.answer,#start-run')?.focus({preventScroll:true});}
function review(){
  const {scenario,q}=shown,c=concept(scenario.cat),explanation=q.type==='volume'?sentence(scenario.cat):explain(scenario),cue=q.type==='kind'?`${scenario.cat[0]==='T'?'따뜻하게 / 차갑게':'누르기 / 누르던 힘 줄이기'} → ${c.kind}`:q.type==='direction'?`${c.kind}가 ${c.direction==='높아진다'?'높아져요':'낮아져요'}`:`${c.kind} ${c.direction==='높아진다'?'높아짐':'낮아짐'} → 부피 ${c.volume==='늘어난다'?'늘어남':'줄어듦'}`;
  open(`<h2 id="dialog-title">해설을 보고 다시 골라요.</h2><p class="review-scenario">${esc(scenario.text)}</p><div class="explanation"><p>${esc(explanation)}</p><strong>${esc(cue)}</strong></div><p class="review-prompt">${esc(q.prompt)}</p><div class="review-answers">${q.options.map((word,i)=>`<button class="review-answer" data-review="${i}" aria-label="복습 답: ${word}">${word}</button>`).join('')}</div><p class="review-note" id="review-note" role="status">${state.run?.ended?'도전은 끝났어요. 이 문제를 복습하면 결과를 볼 수 있어요.':'정답을 직접 다시 눌러야 다음으로 넘어가요.'}</p>`,'review');
  document.querySelectorAll('[data-review]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.review);if(q.options[i]!==q.answer){b.classList.add('wrong');$('#review-note').textContent=`해설에서 ‘${q.answer}’를 다시 찾아보세요.`;return;}state.review=false;close();if(state.activity==='practice')finishPractice(true);else{const result=reviewRun(state,Date.now());save();if(result.ended)finishChallenge(state.run.reason||'time');else success(0,true);}});
}
function showResult(){
  const r=state.run;if(!r?.ended)return;
  const title=r.type==='gate60'?r.passed?'다음 단계가 열렸어요!':'한 번 더 도전해 볼까요?':r.type==='marathon'?'마라톤 기록 완성!':r.reason==='quit'?'이번 도전을 멈췄어요':'120초 도전 완료!';
  const details=r.type==='gate60'?`${r.correct}문제 정답 / ${r.attempts}문제 · 정답률 ${Math.round((r.accuracy||0)*100)}%`:`연결 문장 ${r.completed}개 완성`;
  open(`<h2 id="dialog-title">${title}</h2><div class="result-score">${r.score}<span>점</span></div><p class="result-detail">${details}</p><p class="subtle">${r.type==='gate60'?r.passed?`${r.stage+2}단계 ${MODES[r.stage+1]}를 연습할 수 있어요.`:`통과 기준은 100점·정답률 80%예요.${r.reason==='quit'?' 60초를 끝까지 풀어 주세요.':''}`:'완성하지 못한 문장과 틀린 문장은 점수에 넣지 않아요.'}</p>${r.type!=='gate60'?`<p class="subtle" id="upload-status">${uploadText()}</p>`:''}<div class="dialog-actions"><button class="small-button" id="back-practice">연습하기</button>${r.type!=='gate60'?'<button class="small-button" id="result-ranking">랭킹 보기</button>':''}<button class="primary" id="result-primary">${r.passed?'다음 단계로':'다시 도전'}</button></div>`,'result');
  $('#back-practice').onclick=()=>{close();state.activity='practice';state.run=null;next(state);save();render();};$('#result-primary').onclick=()=>{close();if(r.passed){state.mode=r.stage+1;state.activity='practice';state.run=null;next(state);}else state.run=null;save();render();};$('#result-ranking')?.addEventListener('click',()=>ranking(r.type));
}
function uploadText(){const r=state.run;if(r?.type==='sprint120'&&r.reason!=='time')return '120초를 끝까지 도전하면 최고 기록과 랭킹에 반영해요.';if(!r?.online)return '이 기기 최고 기록으로 저장했어요.';if(!r.completed)return '완성한 문장이 생기면 온라인 랭킹에 기록을 올려요.';return r.uploadStatus==='saved'?'온라인 랭킹에 기록을 저장했어요.':r.uploadStatus==='best'?'온라인에는 더 높은 기존 기록을 유지해요.':r.uploadStatus==='error'?'온라인에 저장하지 못했어요. 이 기기 최고 기록은 유지돼요.':'온라인 기록을 저장하고 있어요…';}
async function upload(){
  const r=state.run;if(!r?.ended||r.type==='gate60'||(r.type==='sprint120'&&r.reason!=='time')||!r.online||!r.completed||uploads.has(r.id)||r.submitted)return;
  uploads.add(r.id);try{const result=await submitOnlineRun(r.online,r,state.nickname);r.uploadStatus=result.saved?'saved':'best';r.submitted=true;}catch{r.uploadStatus='error';}finally{uploads.delete(r.id);save();if($('#upload-status'))$('#upload-status').textContent=uploadText();}
}
async function ranking(type='marathon'){
  if(!['marathon','sprint120'].includes(type))type='marathon';const token=++rankRequest;
  open(`<h2 id="dialog-title">연결하기 랭킹</h2><div class="rank-tabs"><button class="activity ${type==='marathon'?'active':''}" data-board="marathon">무한 마라톤</button><button class="activity ${type==='sprint120'?'active':''}" data-board="sprint120">120초 도전</button></div><p class="subtle">이 기기 최고 <strong>${best(type)}점</strong> · 내 별명 ${esc(state.nickname)}</p><div id="rank-content" class="rank-content" aria-live="polite">기록을 불러오고 있어요…</div><div class="dialog-actions"><button class="small-button" id="refresh-rank">새로고침</button><button class="primary" id="close-rank">돌아가기</button></div>`,'ranking');
  document.querySelectorAll('[data-board]').forEach(b=>b.onclick=()=>ranking(b.dataset.board));$('#refresh-rank').onclick=()=>ranking(type);$('#close-rank').onclick=close;
  try{const rows=await fetchLeaderboard(type);if(token!==rankRequest||dialogType!=='ranking')return;$('#rank-content').innerHTML=rows.length?`<table class="rank-table"><thead><tr><th>순위</th><th>별명</th><th>점수</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.nickname)}</td><td><strong>${r.score}</strong></td></tr>`).join('')}</tbody></table><p class="subtle">상위 10개 기록 · 내 기록은 모드별 최고 점수만 남아요.</p>`:'아직 등록된 기록이 없어요. 첫 기록에 도전해 보세요!';}catch(error){if(token===rankRequest&&$('#rank-content'))$('#rank-content').textContent=onlineReady()?'랭킹을 불러오지 못했어요. 잠시 뒤 다시 확인해 주세요.':'온라인 랭킹 연결을 준비하고 있어요. 이 기기 최고 기록은 계속 저장돼요.';}
}
function help(){if(busy||activeRun(state))return;state.helped=true;save();open(`<h2 id="dialog-title">기억할 네 가지 관계</h2><div class="relations">${CATEGORIES.map(cat=>`<p>${esc(sentence(cat))}</p>`).join('')}</div><p class="subtle">따뜻하게·차갑게 하는 상황은 온도, 누르거나 누르던 힘을 줄이는 상황은 압력과 관련돼요.</p><div class="dialog-actions"><button class="primary" id="close-help">계속 풀기</button></div>`,'help');$('#close-help').onclick=close;}
function reset(){
  if(activeRun(state))return;open(`<h2 id="dialog-title">이 기기 기록 초기화</h2><p>이 기기의 <strong>연습 점수, 열린 단계, 도전 최고 기록, 현재 문제와 별명</strong>을 초기화해요. 온라인 랭킹과 다른 게임의 기록은 유지돼요.</p><label for="reset-text">아래에 ‘초기화합니다’를 직접 입력해 주세요.</label><input id="reset-text" autocomplete="off" spellcheck="false" placeholder="초기화합니다"><div class="dialog-actions"><button class="small-button" id="cancel-reset">취소 · 기록 유지</button><button class="primary" id="confirm-reset" disabled>기록 초기화</button></div>`,'reset');$('#reset-text').oninput=e=>$('#confirm-reset').disabled=e.target.value!=='초기화합니다';$('#cancel-reset').onclick=close;$('#confirm-reset').onclick=()=>{if($('#reset-text').value!=='초기화합니다')return;try{localStorage.removeItem(KEY);}catch{storageOK=false;}state=augment(fresh());state.nickname=nickname();next(state);close();save();render();};
}
document.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement||busy)return;if(e.key==='1'||e.key==='2'){e.preventDefault();const i=Number(e.key)-1;if(dialogType==='review')document.querySelector(`[data-review="${i}"]`)?.click();else if(!dialog)answer(i);}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateClock();});
setInterval(updateClock,200);if(expired(state))endRun(state,'time',state.run.deadline);render();if(state.run?.ended&&!state.review){showResult();upload();}

