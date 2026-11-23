import {BANK,CATEGORIES,concept,sentence,explain,question} from './data.mjs';
import {KEY,MODES,fresh,restore,next,complete} from './score.mjs';
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state,storageOK=true,shown=null,busy=false,dialog=null,dialogType='',timer=null;
try{state=restore(JSON.parse(localStorage.getItem(KEY)));}catch{state=fresh();try{localStorage.getItem(KEY);}catch{storageOK=false;}}
if(!state.current)next(state);
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{storageOK=false;}}
function say(text){$('#status').textContent=text;}
function render(){
  busy=false;const scenario=BANK.find(s=>s.id===state.current.id),q=question(state.mode,scenario,state.current.part);shown={scenario,q,mode:state.mode,part:state.current.part};
  const c=concept(scenario.cat),cycle=state.cycles[state.mode],context=(state.mode===1||state.mode===2)?cycle<4?'온도부터 연습해요':cycle<8?'압력을 연습해요':'온도와 압력을 섞어서 연습해요':state.mode===3?`단어 ${state.current.part+1} / 3`:'상황을 읽고 알맞은 단어를 골라요';
  const text=state.mode===2?`기체의 ${c.kind}가 ${c.direction==='높아진다'?'높아졌어요':'낮아졌어요'}.`:scenario.text;
  $('#app').innerHTML=`<header class="header"><div class="title">기체 단어 퀴즈</div><div class="score" aria-label="총점 ${state.points}점"><strong id="points">${state.points}</strong><span>점</span></div><button class="small-button" id="help">학습 도움</button><button class="small-button" id="reset">기록 초기화</button></header><nav class="modes" aria-label="연습 종류">${MODES.map((name,i)=>`<button class="mode ${state.mode===i?'active':''}" data-mode="${i}" aria-pressed="${state.mode===i}">${name}</button>`).join('')}</nav><section class="question-area"><div class="context">${context}</div><h1 class="scenario" id="scenario">${esc(text)}</h1>${state.mode===3?`<div class="chain" aria-label="연결 문장">${['kind','direction','volume'].map((k,i)=>`<span class="blank ${i<state.current.part?'filled':i===state.current.part?'current':''}">${i<state.current.part?c[k]:['온도 / 압력','변화 방향','기체의 부피'][i]}</span>`).join('<span aria-hidden="true">›</span>')}</div>`:''}<div class="prompt" id="question">${q.prompt}</div><div class="answers">${q.options.map((word,i)=>`<button class="answer" data-answer="${i}">${word}</button>`).join('')}</div><div class="feedback" id="feedback" aria-live="polite"></div></section><footer class="footer"><span>혼자 맞히면 <b>10점</b> · 복습·도움 후 완성하면 <b>5점</b></span><span ${storageOK?'':'class="storage-warning"'}>${storageOK?`풀어본 상황 ${state.completed}개 · 이 기기에 저장돼요`:'지금은 기록을 저장할 수 없어요'}</span></footer>`;
  document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{if(busy)return;state.mode=Number(b.dataset.mode);next(state);save();render();});
  document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.answer)));
  $('#help').onclick=help;$('#reset').onclick=reset;save();say(`${text} ${q.prompt} ${q.options.join(', ')}`);
  if(state.review)review();
}
function answer(i){if(busy||dialog)return;if(shown.q.options[i]!==shown.q.answer){state.review=true;state.helped=true;save();review();return;}finish(false);}
function finish(reviewed){
  if(busy)return;busy=true;const word=shown.q.answer,gain=complete(state,reviewed);save();
  document.querySelectorAll('#app button').forEach(b=>b.disabled=true);
  document.querySelectorAll('[data-answer]').forEach(b=>b.classList.toggle('correct',b.textContent===word));
  if(shown.mode===3){const c=concept(shown.scenario.cat);document.querySelectorAll('.blank').forEach((b,i)=>{if(i<=shown.part){b.textContent=c[['kind','direction','volume'][i]];b.className='blank filled';}});}
  $('#points').textContent=state.points;$('.score').setAttribute('aria-label',`총점 ${state.points}점`);$('#feedback').textContent=`${reviewed?'복습 완료!':'정답!'} +${gain}점`;say(`${word}. ${gain}점, 총 ${state.points}점.`);
  clearTimeout(timer);timer=setTimeout(render,700);
}
function open(content,type){
  dialog?.remove();dialogType=type;dialog=document.createElement('div');dialog.className='backdrop';dialog.innerHTML=`<section class="dialog" role="${type==='review'?'alertdialog':'dialog'}" aria-modal="true" aria-labelledby="dialog-title">${content}</section>`;document.body.append(dialog);
  dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();if(dialogType!=='review')close();}if(e.key==='Tab'){const nodes=[...dialog.querySelectorAll('button:not(:disabled),input')],first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  requestAnimationFrame(()=>dialog?.querySelector('button:not(:disabled),input')?.focus({preventScroll:true}));
}
function close(){dialog?.remove();dialog=null;dialogType='';document.querySelector('.answer')?.focus({preventScroll:true});}
function review(){
  const {scenario,q}=shown,c=concept(scenario.cat),explanation=q.type==='volume'?sentence(scenario.cat):explain(scenario),cue=q.type==='kind'?`${scenario.cat[0]==='T'?'따뜻하게 / 차갑게':'누르기 / 누르던 힘 줄이기'} → ${c.kind}`:q.type==='direction'?`${c.kind}가 ${c.direction==='높아진다'?'높아져요':'낮아져요'}`:`${c.kind} ${c.direction==='높아진다'?'높아짐':'낮아짐'} → 부피 ${c.volume==='늘어난다'?'늘어남':'줄어듦'}`;
  open(`<h2 id="dialog-title">해설을 보고 다시 골라요.</h2><p class="review-scenario">${esc(scenario.text)}</p><div class="explanation"><p>${esc(explanation)}</p><strong>${esc(cue)}</strong></div><p class="review-prompt">${esc(q.prompt)}</p><div class="review-answers">${q.options.map((word,i)=>`<button class="review-answer" data-review="${i}" aria-label="복습 답: ${word}">${word}</button>`).join('')}</div><p class="review-note" id="review-note" role="status">정답을 직접 다시 눌러야 다음으로 넘어가요.</p>`,'review');
  document.querySelectorAll('[data-review]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.review);if(q.options[i]!==q.answer){b.classList.add('wrong');$('#review-note').textContent=`해설에서 ‘${q.answer}’를 다시 찾아보세요.`;return;}state.review=false;close();finish(true);});
}
function help(){
  if(busy)return;state.helped=true;save();
  open(`<h2 id="dialog-title">기억할 네 가지 관계</h2><div class="relations">${CATEGORIES.map(cat=>`<p>${esc(sentence(cat))}</p>`).join('')}</div><p class="subtle">따뜻하게·차갑게 하는 상황은 온도, 누르거나 누르던 힘을 줄이는 상황은 압력과 관련돼요.</p><p class="subtle">도움을 보고 완성한 단어는 5점을 받아요.</p><div class="dialog-actions"><button class="primary" id="close-help">계속 풀기</button></div>`,'help');$('#close-help').onclick=close;
}
function reset(){
  if(busy)return;
  open(`<h2 id="dialog-title">이 퀴즈 기록 초기화</h2><p>이 기기의 <strong>단어 퀴즈 점수, 풀이 기록, 현재 문제</strong>를 삭제해요. 다른 게임이나 사이트의 기록은 지우지 않아요.</p><label for="reset-text">아래에 ‘초기화합니다’를 직접 입력해 주세요.</label><input id="reset-text" autocomplete="off" spellcheck="false" placeholder="초기화합니다"><div class="dialog-actions"><button class="small-button" id="cancel-reset">취소 · 기록 유지</button><button class="primary" id="confirm-reset" disabled>기록 초기화</button></div>`,'reset');$('#reset-text').oninput=e=>$('#confirm-reset').disabled=e.target.value!=='초기화합니다';$('#cancel-reset').onclick=close;$('#confirm-reset').onclick=()=>{if($('#reset-text').value!=='초기화합니다')return;try{localStorage.removeItem(KEY);}catch{storageOK=false;}state=fresh();next(state);close();render();};
}
document.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement||busy)return;if(e.key==='1'||e.key==='2'){e.preventDefault();const i=Number(e.key)-1;if(dialogType==='review')document.querySelector(`[data-review="${i}"]`)?.click();else if(!dialog)answer(i);}});
render();
