import {SAVE_KEY,STAGES,CATEGORIES,BANK,concept,sentence,explain,question,initialState,sanitize,record,ready,nextCategory,pickScenario} from './core.mjs';

const $=s=>document.querySelector(s);
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let storageOk=true;
let state;
try{state=sanitize(JSON.parse(localStorage.getItem(SAVE_KEY)));}catch{state=initialState();try{localStorage.getItem(SAVE_KEY);}catch{storageOk=false;}}
let screen='home',displayed=null,selected=0,busy=false,drag=null,modal=null,audio=null,shotSerial=0;
const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const motion=()=>state.settings.motion&&!prefersReduced;
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch{storageOk=false;}}
function announce(s){$('#announcer').textContent=s;}
function tone(kind='launch'){
  if(!state.settings.sound)return;
  try{
    audio??=new(window.AudioContext||window.webkitAudioContext)();
    if(audio.state==='suspended')audio.resume().catch(()=>{});
    const values=kind==='good'?[523,659,784]:kind==='wrong'?[220,196]:kind==='big'?[392,523,659,784]:[300,650];
    values.forEach((f,i)=>{const osc=audio.createOscillator(),gain=audio.createGain();osc.type=kind==='launch'?'sine':'triangle';osc.frequency.setValueAtTime(f,audio.currentTime+i*.065);gain.gain.setValueAtTime(.0001,audio.currentTime+i*.065);gain.gain.exponentialRampToValueAtTime(.055,audio.currentTime+i*.065+.015);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+i*.065+.13);osc.connect(gain);gain.connect(audio.destination);osc.start(audio.currentTime+i*.065);osc.stop(audio.currentTime+i*.065+.15);});
  }catch{/* Sound is optional. */}
}
function svg(content,view='0 0 120 100'){return `<svg viewBox="${view}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${content}</svg>`;}
function scene(s){
  const outlines='stroke="#33435b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"';
  const art={
    balloon:`<path d="M60 69l-5 9h10z" fill="#e76c56" ${outlines}/><path d="M60 78c-14 7 13 12-2 20" fill="none" ${outlines}/><ellipse cx="60" cy="39" rx="26" ry="32" fill="#ff9675" ${outlines}/><path d="M45 22q-8 7-7 17" stroke="white" stroke-width="6" fill="none" stroke-linecap="round"/>`,
    bottle:`<path d="M49 18v12L37 45v42q0 7 8 7h31q7 0 7-7V45L71 30V18" fill="#b8e5ed" ${outlines}/><rect x="47" y="9" width="26" height="13" rx="4" fill="#5b7ce1" ${outlines}/><path d="M39 55h42M39 73h42" stroke="#79b9c9" stroke-width="5"/><circle cx="58" cy="43" r="3" fill="white"/>`,
    flask:`<path d="M51 40v13L30 85q-4 9 8 9h47q9 0 4-9L69 53V40" fill="#c8e7ee" ${outlines}/><path d="M48 39h25" ${outlines}/><ellipse cx="61" cy="23" rx="18" ry="21" fill="#ff9675" ${outlines}/><path d="M39 78h41" stroke="#8ac5d6" stroke-width="4"/>`,
    ball:`<circle cx="60" cy="54" r="30" fill="#fff7dc" ${outlines}/><path d="M39 38q9-9 17-9" stroke="white" stroke-width="6" stroke-linecap="round"/>`,
    snack:`<path d="M31 16l9 4 10-4 10 4 10-4 10 4 10-4-4 33 4 40-10-4-10 4-10-4-10 4-10-4-9 4 4-40z" fill="#ffd369" ${outlines}/><rect x="40" y="34" width="40" height="35" rx="9" fill="#fff2bb"/><path d="M49 44h22M49 53h17" stroke="#c79838" stroke-width="4" stroke-linecap="round"/>`,
    cushion:`<path d="M20 38q-10-10-9 6l4 11-4 15q-2 12 9 5 36 17 80 0 12 8 9-6l-4-15 4-11q0-14-10-5-42-14-79 0z" fill="#a4d9b9" ${outlines}/><path d="M29 50q32-10 63 0" fill="none" stroke="#dff5e4" stroke-width="6" stroke-linecap="round"/>`,
    bubble:`<rect x="17" y="17" width="87" height="71" rx="12" fill="#cee9f7" ${outlines}/>${[35,60,85].flatMap(x=>[36,65].map(y=>`<circle cx="${x}" cy="${y}" r="11" fill="#effaff" stroke="#71a7c2" stroke-width="2.5"/><circle cx="${x-3}" cy="${y-4}" r="3" fill="white"/>`)).join('')}`,
    syringe:`<g transform="rotate(-25 60 55)"><rect x="35" y="35" width="50" height="38" rx="3" fill="#d4edf7" ${outlines}/><path d="M85 44h16v20H85M101 39v30M35 54H15M30 47v14M52 36v12M65 36v12" fill="none" ${outlines}/><path d="M75 39v30" stroke="#779ab5" stroke-width="5"/></g>`,
    shoe:`<path d="M15 48q21 4 29-14l18 3 13 22 30 9q9 5 5 19H17q-9-4-2-39z" fill="#aab2ef" ${outlines}/><path d="M15 75h95v12H17z" fill="#e4f0f9" ${outlines}/><rect x="27" y="76" width="25" height="10" rx="5" fill="#80c5c9"/><path d="M58 49l14-4M63 57l14-4" fill="none" ${outlines}/>`
  }[s.object]||'';
  let symbol='';
  if(s.cat[0]==='T'){
    symbol=s.cat[1]==='U'?'<circle cx="101" cy="18" r="9" fill="#ffb85a"/><path d="M101 2v3m0 26v3M85 18h3m26 0h3M90 7l3 3m16 16 3 3M90 29l3-3m16-16 3-3" stroke="#e99a3f" stroke-width="2"/>':'<path d="M99 3v30M86 10l26 16M86 26l26-16M95 6l4 5 4-5M95 30l4-5 4 5" stroke="#5b9ddc" stroke-width="3" fill="none"/>';
  }else symbol=s.cat[1]==='U'?'<path d="M83 5h25v17H83z" fill="#ffc39b" stroke="#33435b" stroke-width="2"/><path d="M96 25v11m-5-5 5 5 5-5" stroke="#455a79" stroke-width="3" fill="none"/>':'<path d="M83 4h25v17H83z" fill="#ffc39b" stroke="#33435b" stroke-width="2"/><path d="M96 36V26m-5 5 5-5 5 5" stroke="#455a79" stroke-width="3" fill="none"/>';
  return svg(art+symbol);
}
function castle(classes=''){
  return `<svg viewBox="0 0 230 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g stroke="#34425d" stroke-width="4" stroke-linejoin="round"><g class="tower-part"><path d="M43 56V37h16v10h16V37h17v89H43z" fill="#a4b8f1"/><path d="M56 75h20v22H56z" fill="#e9f2ff"/></g><g class="tower-part"><path d="M144 55V35h15v10h16V35h16v91h-47z" fill="#a4b8f1"/><path d="M158 74h19v22h-19z" fill="#e9f2ff"/></g><g class="tower-part"><path d="M82 69h70v61H82z" fill="#c2cef4"/><path d="M100 130v-25a16 16 0 0 1 32 0v25" fill="#6f85c7"/></g><g class="tower-part"><path d="M115 67V11" fill="none"/><path d="M117 12h34l-9 13 9 12h-34" fill="#ff8667"/></g><path d="M29 132h177" stroke="#568d65" stroke-width="9" stroke-linecap="round"/></g></svg>`;
}
function homeArt(){return svg(`<ellipse cx="275" cy="267" rx="230" ry="27" fill="#cee5d1"/><path d="M30 250q70-100 166-28t299 20" fill="#d9ecd6"/><g class="floaty"><circle cx="417" cy="40" r="22" fill="#ffdc7e"/><path d="M417 8v-8m0 80v-8m-32-32h-8m80 0h-8" stroke="#f2c567" stroke-width="4" stroke-linecap="round"/></g><g transform="translate(226 70) scale(1.12)">${castle().replace(/<svg[^>]*>|<\/svg>/g,'')}</g><g stroke="#543d3a" stroke-linecap="round" stroke-linejoin="round"><path d="M118 250V159l-43-66M118 159l44-66" fill="none" stroke-width="24"/><path d="M75 93l35 31 52-31" fill="none" stroke="#aa7560" stroke-width="7"/><circle cx="113" cy="120" r="23" fill="#d2eaff" stroke="#34425d" stroke-width="4"/><path d="M102 108l-3 4" stroke="white" stroke-width="7"/></g><path d="M138 108Q226 6 310 118" fill="none" stroke="#8e9fcb" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 11"/><g transform="translate(191 30) rotate(-13)"><path d="m0 0 7 15 17 2-12 12 3 17-15-8-15 8 3-17-12-12 17-2z" fill="#ffc959" stroke="#b58535" stroke-width="3"/></g><circle cx="456" cy="215" r="13" fill="#ff9e80" stroke="#34425d" stroke-width="3"/><path d="M82 273h69M367 273h70" stroke="#95ba92" stroke-width="5" stroke-linecap="round"/>`,'0 0 540 310');}
function header(){return `<header class="topbar"><button class="brand" id="home" aria-label="기체 팡! 탐험 지도"><img src="./icon.svg" alt=""><span>기체 팡!</span><small>새총 탐험대</small></button><div class="tools"><div class="star-count" aria-label="모은 별 ${state.stars}개">⭐ ${state.stars}</div><button class="tool" id="help" aria-label="게임 방법">?<span>방법</span></button><button class="tool" id="settings" aria-label="설정과 기록 초기화">⚙<span>설정</span></button><button class="tool" id="fullscreen" aria-label="전체 화면">⛶</button></div></header>${storageOk?'':'<div class="storage-warning" role="status">이 브라우저에서는 기록을 저장할 수 없어요. 지금은 계속 플레이할 수 있어요.</div>'}`;}
function bindHeader(){
  $('#home').onclick=()=>{if(busy)return;renderHome();};
  $('#help').onclick=()=>showHelp();$('#settings').onclick=()=>showSettings();
  $('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{announce('브라우저의 전체 화면 기능을 사용할 수 없어요. 지금 화면에서도 플레이할 수 있어요.');}};
}
function renderHome(){
  shotSerial++;screen='home';busy=false;drag=null;displayed=null;modal?.remove();modal=null;
  document.body.classList.toggle('reduced-motion',!motion());
  const stage=state.session?.stage??state.unlocked;
  $('#app').innerHTML=header()+`<main class="home"><section class="hero"><div class="hero-copy"><div class="eyebrow">초등 4학년 · 여러 가지 기체</div><h1>생각하고, 당기고,<br><em>와르르 팡!</em></h1><p>온도와 압력, 하나씩 익혀요.<br>정답 표적을 맞히며 기체 탐정이 되어 봐요!</p><div class="hero-actions"><button class="primary" id="start">${state.total||state.session?'이어서 탐험하기':'새총 탐험 시작'}</button><span class="home-continue">${state.badges.every(Boolean)?'기체 탐정 완성!<br>끝없는 탐험이 열렸어요.':`지금은 ${stage+1}단계<br>${STAGES[stage].name}에 도전해요.`}</span></div></div><div class="home-art">${homeArt()}</div></section><div class="map-title">나의 탐험 지도 <small>한 단계씩 익히면 다음 길이 열려요</small></div><nav class="stage-map" aria-label="학습 단계">${STAGES.map((s,i)=>`<button class="stage-card ${state.badges[i]?'complete':i===stage?'current':''}" data-stage="${i}" ${i>state.unlocked?'disabled':''}><span class="stage-number">${i===4?'FREE PLAY':`STAGE 0${i+1}`}</span><span class="badge">${i>state.unlocked?'🔒':s.badge}</span><strong>${s.short}</strong><span class="status">${state.badges[i]?'✓ 배지 획득 · 다시 연습':i>state.unlocked?'앞 단계를 통과하면 열려요':i===4?'원하는 만큼 계속 도전':state.stats[i].total?`${state.stats[i].total}상황 연습했어요`:'탐험할 준비 완료!'}</span></button>`).join('')}</nav><footer class="home-footer"><span>시간제한 없이, 틀려도 다시! · 기록은 이 기기에 저장돼요.</span><button class="text-button" id="teacher">학습 안내와 기록</button></footer></main>`;
  bindHeader();$('#start').onclick=()=>startStage(stage,true);
  document.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>startStage(Number(b.dataset.stage),state.session?.stage===Number(b.dataset.stage)));
  $('#teacher').onclick=()=>showLearning();
}
function newSession(stage){return {stage,id:'',part:0,first:true,mode:'practice',trial:[],trialCats:[],cycle:0,round:[],seen:[],review:[]};}
function prepareNext(){
  const s=state.session;
  let cat=nextCategory(s.stage,s.cycle,s.mode,s.trial.length),scenario;
  const due=s.mode==='practice'?s.review.findIndex(r=>r.due<=s.cycle):-1;
  if(due>=0){const item=s.review.splice(due,1)[0];scenario=BANK.find(x=>x.id===item.id);}
  if(!scenario)scenario=pickScenario(cat,s.seen);
  s.id=scenario.id;s.part=0;s.first=true;s.seen.push(s.id);s.seen=s.seen.slice(-5);save();
}
function startStage(stage,resume=false){
  if(stage>state.unlocked)return;
  const fresh=!resume||state.session?.stage!==stage;
  if(fresh){state.session=newSession(stage);prepareNext();}
  renderGame();
  if(fresh&&state.stats[stage].total===0)showIntro(stage);
}
function renderGame(){
  shotSerial++;screen='game';busy=false;drag=null;
  modal?.remove();modal=null;
  const s=state.session,scenario=BANK.find(x=>x.id===s.id);
  if(!scenario){renderHome();return;}
  displayed={stage:s.stage,scenario,part:s.part,first:s.first};
  const q=question(s.stage,scenario,s.part),c=concept(scenario.cat),stat=state.stats[s.stage],recent=stat.history.slice(-10);
  selected=Math.random()<.5?0:1;
  const text=s.stage===2?`${c.kind}가 ${c.direction==='높아진다'?'높아졌어요':'낮아졌어요'}.`:scenario.text;
  const status=s.mode==='challenge'?`통과 도전 ${s.trial.length+1} / 5`:s.stage===4?`이번 탐험 ${s.round.length+1} / 5`:`혼자 맞힘 ${recent.filter(h=>h.solo).length} / ${recent.length||10}`;
  const mode=s.mode==='challenge'?'통과 도전':s.stage===4?'끝없는 탐험':s.stage===1||s.stage===2?s.cycle<4?'온도 먼저 연습':s.cycle<8?'압력 먼저 연습':'섞어서 연습':'차근차근 연습';
  $('#app').innerHTML=header()+`<div class="rotate-note">↻ 태블릿을 가로로 돌리면 더 넓게 쏠 수 있어요.</div><main class="game"><nav class="stage-strip" aria-label="현재 학습 단계">${STAGES.slice(0,4).map((st,i)=>`${i?'<span class="step-link"></span>':''}<span class="step-node ${i===s.stage?'active':state.badges[i]?'done':''}"><b>${state.badges[i]?'✓':i+1}</b> ${st.name}</span>`).join('')}<div class="strip-end"><span class="progress-mini">${status}</span>${s.stage<4&&s.mode==='practice'&&ready(state,s.stage)?'<button class="challenge-button" id="challenge">🏁 통과 도전</button>':''}</div></nav><section class="mission" aria-label="퀴즈 문제"><div class="scene-icon">${s.stage===2?svg(`<text x="60" y="65" text-anchor="middle" font-size="55">${scenario.cat[0]==='T'?'🌡️':'✋'}</text>`):scene(scenario)}</div><div><div class="mission-top"><span class="mode-tag ${s.mode==='challenge'?'challenge':''}">${mode}</span><span class="subnote">${s.stage>=3?`연결 ${s.part+1} / 3`:`${s.stage+1}단계 · ${STAGES[s.stage].name}`}</span></div><div class="scenario" id="scenario">${text}</div>${s.stage>=3?`<div class="chain" aria-label="연결 문장">${['종류','변화','기체의 부피'].map((t,i)=>`<span class="chain-chip ${i<s.part?'done':i===s.part?'now':''}">${i<s.part?c[['kind','direction','volume'][i]]:t}</span>${i<2?'<span aria-hidden="true">›</span>':''}`).join('')}</div>`:''}<div class="prompt" id="question">${q.prompt}</div></div><div class="mission-side"><div class="progress-mini">${status}</div><div class="pip-row" aria-label="최근 기록">${(s.mode==='challenge'?s.trial:recent.map(h=>h.solo)).map(v=>`<i class="pip ${v?'solo':'help'}"></i>`).join('')}</div>${s.mode==='challenge'?'<span class="mini-trial">5문제 중 4문제 혼자!</span>':`<button class="text-button" id="progress">통과 기준 보기</button>`}</div></section><section class="field" id="field" aria-label="새총 놀이판"><div class="hill"></div><div class="hill two"></div><div class="field-label">${s.mode==='challenge'?'🏁 도움 없이 도전해 봐요':'🎯 조준은 도와줄게요. 정답을 생각해요!'}</div><div class="castle-decor">${castle()}</div><svg class="aim-path" id="aim" aria-hidden="true"><path id="aim-line"/></svg><div class="targets">${q.options.map((label,i)=>`<button class="target ${selected===i?'selected':''}" data-choice="${i}" aria-label="${label} 표적 선택" aria-pressed="${selected===i}"><span class="target-face"><small class="target-code">${i+1}</small>${label}</span><span class="crate-stack" aria-hidden="true"><i class="crate"></i><i class="crate"></i><i class="crate"></i></span><span class="support" aria-hidden="true"></span></button>`).join('')}</div><div class="sling" aria-hidden="true">${svg('<path d="M58 115V62L21 12M58 62L95 12" fill="none" stroke="#684835" stroke-width="19" stroke-linecap="round"/><path d="M58 110V64L24 17M58 64L92 17" fill="none" stroke="#b38355" stroke-width="9" stroke-linecap="round"/><path id="band" class="sling-band" d="M21 12L58 22L95 12"/>','0 0 116 123')}</div><button class="ball-control" id="ball" aria-label="새총 공. 아래로 당겨 놓으면 발사. 왼쪽 오른쪽 키로 표적 선택, Enter 키로 발사"><span aria-hidden="true">✦</span></button><div class="launch-help"><b>공을 아래로 당겼다가 놓아요.</b><br>표적을 누른 뒤 발사해도 돼요.</div><div class="shoot-panel"><div class="power"><span>당기는 힘</span><div class="power-bar"><div class="power-fill" id="power"></div></div></div><button class="primary" id="fire">${q.options[selected]} 표적 발사</button></div></section><section class="feedback" id="feedback" aria-live="polite"><div class="feedback-copy"><span class="feedback-icon">💭</span><div><h2>정답 표적을 골라 쏴 보세요!</h2><p>서두르지 않아도 괜찮아요. 틀리면 다시 생각해요.</p></div></div><div class="feedback-actions">${s.mode==='practice'?'<button class="secondary" id="hint">도움말</button>':'<span class="pill">혼자서 도전 중</span>'}</div></section></main>`;
  bindHeader();document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{if(!busy)setAim(Number(b.dataset.choice));});
  $('#fire').onclick=()=>shoot(selected,.65);
  $('#ball').addEventListener('pointerdown',pointerDown);
  $('#ball').addEventListener('pointermove',pointerMove);
  $('#ball').addEventListener('pointerup',pointerUp);
  $('#ball').addEventListener('pointercancel',()=>resetDrag());
  $('#ball').addEventListener('lostpointercapture',()=>{if(drag)resetDrag();});
  $('#ball').onkeydown=e=>{if(busy)return;if(e.key==='ArrowLeft'||e.key==='1'){e.preventDefault();setAim(0);}if(e.key==='ArrowRight'||e.key==='2'){e.preventDefault();setAim(1);}if(e.key==='Enter'||e.key===' '){e.preventDefault();shoot(selected,.65);}};
  if($('#hint'))$('#hint').onclick=hint;
  if($('#progress'))$('#progress').onclick=()=>showProgress();
  if($('#challenge'))$('#challenge').onclick=offerChallenge;
  requestAnimationFrame(()=>updateAim());
  announce(`${text} ${q.prompt} ${q.options.join(', ')}`);
}
function setAim(i){selected=i;document.querySelectorAll('[data-choice]').forEach((b,n)=>{b.classList.toggle('selected',n===i);b.setAttribute('aria-pressed',String(n===i));});const q=question(displayed.stage,displayed.scenario,displayed.part);$('#fire').textContent=`${q.options[i]} 표적 발사`;updateAim();}
function localRect(el){const f=$('#field').getBoundingClientRect(),r=el.getBoundingClientRect();return{x:r.left-f.left+r.width/2,y:r.top-f.top+r.height/2};}
function updateAim(){if(screen!=='game'||!$('#ball'))return;const b=localRect($('#ball')),t=localRect(document.querySelectorAll('.target-face')[selected]);$('#aim-line').setAttribute('d',`M${b.x} ${b.y} Q${(b.x+t.x)/2} ${Math.max(5,t.y-65)} ${t.x} ${t.y}`);}
function pointerDown(e){if(busy||e.button!==0)return;e.preventDefault();const b=$('#ball');drag={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0};b.setPointerCapture(e.pointerId);b.classList.add('dragging');tone('launch');}
function pointerMove(e){if(!drag||e.pointerId!==drag.id)return;e.preventDefault();let dx=e.clientX-drag.x,dy=e.clientY-drag.y;const length=Math.hypot(dx,dy),limit=67;if(length>limit){dx*=limit/length;dy*=limit/length;}drag.dx=dx;drag.dy=dy;
  if(Math.abs(dx)>9)setAim(dx>0?0:1);
  $('#ball').style.translate=`${dx}px ${dy}px`;$('#power').style.width=`${Math.min(100,length/limit*100)}%`;
  const sy=22+dy*.8,sx=58+dx*.8;$('#band').setAttribute('d',`M21 12L${sx} ${sy}L95 12`);updateAim();
}
function resetDrag(){if($('#ball')){$('#ball').classList.remove('dragging');$('#ball').style.translate='';$('#power').style.width='0%';$('#band').setAttribute('d','M21 12L58 22L95 12');}drag=null;updateAim();}
function pointerUp(e){if(!drag||drag.id!==e.pointerId)return;const length=Math.hypot(drag.dx,drag.dy),dy=drag.dy;resetDrag();if(length>=16&&dy>=-10)shoot(selected,Math.min(1,length/67));else announce('공을 아래로 조금 더 당겨 보세요. 표적을 누른 뒤 발사 버튼을 눌러도 돼요.');}
async function shoot(choice,power){
  if(busy||screen!=='game'||modal)return;
  busy=true;const serial=++shotSerial,active={...displayed},q=question(active.stage,active.scenario,active.part),correct=q.options[choice]===q.answer;
  document.querySelectorAll('.target,#fire,#ball,#hint,#challenge').forEach(b=>b.disabled=true);
  const from=localRect($('#ball')),target=document.querySelectorAll('.target')[choice],to=localRect(target.querySelector('.target-face'));
  const ball=document.createElement('div');ball.className='shot-ball';ball.style.left=`${from.x-15}px`;ball.style.top=`${from.y-15}px`;$('#field').append(ball);$('#ball').style.visibility='hidden';tone('launch');
  if(motion()){
    const dx=to.x-from.x,dy=to.y-from.y;
    const animation=ball.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${dx*.5}px,${dy*.5-65}px) scale(1.12)`,offset:.5},{transform:`translate(${dx}px,${dy}px) scale(.85)`}],{duration:430-power*100,easing:'ease-in',fill:'forwards'});
    try{await animation.finished;}catch{}
  }
  ball.remove();if(serial!==shotSerial||screen!=='game')return;
  if(correct){target.classList.add('hit');tone('good');particles(to.x,to.y,power);}
  else{target.classList.add('wrong');tone('wrong');}
  const session=state.session;
  if(!correct){
    session.first=false;save();
    const tip=q.type==='volume'?sentence(active.scenario.cat):explain(active.scenario);
    showFeedback('retry','다시 생각해 볼까요?',`${tip} 정답 표적을 다시 골라 보세요.`,'다시 쏘기',()=>{renderGame();});
    announce(`다시 생각해 볼까요? ${tip}`);
    busy=false;return;
  }
  const final=active.stage<3||active.part===2;
  if(!final){
    session.part++;save();const c=concept(active.scenario.cat);
    const message=active.part===0?`${q.answer}와 관련된 상황을 찾았어요. 이제 변화의 방향을 생각해요.`:`${c.kind}가 ${c.direction==='높아진다'?'높아져요':'낮아져요'}. 이제 기체의 부피를 생각해요.`;
    showFeedback('good','명중! 연결을 이어 가요.',message,'다음 표적',()=>renderGame());
    busy=false;return;
  }
  const solo=session.first;
  if(active.stage>=3){const c=concept(active.scenario.cat);document.querySelectorAll('.chain-chip').forEach((chip,i)=>{chip.textContent=c[['kind','direction','volume'][i]];chip.className='chain-chip done';});}
  record(state,session.stage,active.scenario.cat,solo);
  if(!solo&&session.mode==='practice')session.review.push({id:active.scenario.id,due:session.cycle+3});
  session.cycle++;
  if(session.mode==='challenge'){session.trial.push(solo);session.trialCats.push(active.scenario.cat);}
  else session.round.push(solo);
  const finishedTrial=session.mode==='challenge'&&session.trial.length>=5;
  const finishedRound=session.mode==='practice'&&session.round.length>=5;
  const result=finishedTrial?[...session.trial]:finishedRound?[...session.round]:null;
  if(finishedTrial&&result.filter(Boolean).length>=4){state.badges[active.stage]=true;state.unlocked=Math.max(state.unlocked,active.stage+1);}
  if(finishedTrial){session.mode='practice';session.trial=[];session.trialCats=[];}
  if(finishedRound)session.round=[];
  prepareNext();updateStarCount();
  const text=active.stage===0?explain(active.scenario):active.stage===1?explain(active.scenario):sentence(active.scenario.cat);
  showFeedback('good',solo?'명중! 혼자서 해결했어요.':'끝까지 완성했어요!',`${text}${solo?'':' 조금 뒤에 다시 만나 봐요.'}`,finishedTrial?'도전 결과':finishedRound?'탐험 결과':'다음 상황',()=>{
    if(finishedTrial)finishChallenge(result,active.stage);
    else if(finishedRound)showRound(result,active.stage);
    else renderGame();
  });
  if(active.stage>=3)particles($('#field').clientWidth/2,70,1,14);
  busy=false;save();
}
function updateStarCount(){const el=$('.star-count');if(el){el.textContent=`⭐ ${state.stars}`;el.setAttribute('aria-label',`모은 별 ${state.stars}개`);}}
function particles(x,y,power=1,count=9){if(!motion())return;for(let i=0;i<count;i++){const p=document.createElement('span');p.className='particle';p.textContent=i%3?'✦':'★';p.style.setProperty('--x',`${x}px`);p.style.setProperty('--y',`${y}px`);p.style.setProperty('--dx',`${(Math.random()-.5)*(150+power*110)}px`);p.style.setProperty('--dy',`${-30-Math.random()*120}px`);p.style.color=['#ffad45','#f47760','#6d82df','#5aa681'][i%4];$('#field').append(p);setTimeout(()=>p.remove(),900);}}
function showFeedback(type,title,body,button,callback){
  const f=$('#feedback');f.className=`feedback ${type}`;f.innerHTML=`<div class="feedback-copy"><span class="feedback-icon">${type==='good'?'⭐':'💡'}</span><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p></div></div><button class="${type==='good'?'primary':'secondary'}" id="next">${button}</button>`;
  $('#next').onclick=callback;$('#next').focus({preventScroll:true});
}
function hint(){
  if(busy)return;state.session.first=false;save();
  const q=question(displayed.stage,displayed.scenario,displayed.part),text=q.type==='volume'?sentence(displayed.scenario.cat):explain(displayed.scenario);
  openModal(`<h2>💡 한 번 생각해 봐요</h2><p>${text}</p><p class="setting-note">도움을 받아 완성해도 별을 받아요. 통과 기준에는 혼자 맞힌 상황이 기록돼요.</p><div class="modal-buttons"><button class="primary" id="close-modal">다시 생각해 볼게요</button></div>`);
}
function openModal(content,center=false){
  modal?.remove();modal=document.createElement('div');modal.className='modal-backdrop';modal.innerHTML=`<section class="modal ${center?'center':''}" role="dialog" aria-modal="true">${content}</section>`;document.body.append(modal);
  const heading=modal.querySelector('h2');if(heading){heading.id='modal-title';modal.querySelector('section').setAttribute('aria-labelledby','modal-title');}
  modal.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeModal();}if(e.key==='Tab'){const focusable=[...modal.querySelectorAll('button:not(:disabled),input:not(:disabled),[tabindex="0"]')];if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  if($('#close-modal'))$('#close-modal').onclick=closeModal;
  requestAnimationFrame(()=>modal?.querySelector('button:not(:disabled),input')?.focus({preventScroll:true}));
}
function closeModal(){modal?.remove();modal=null;const target=screen==='game'?$('#ball'):$('#start');target?.focus({preventScroll:true});}
function showIntro(stage){
  const texts=[
    '따뜻하게 하거나 차갑게 하면 온도! 누르거나 누르던 힘을 줄이면 압력! 먼저 상황만 구분해요.',
    '따뜻해지면 온도가 높아져요. 차가워지면 온도가 낮아져요. 세게 누르면 압력이 높아지고, 누르던 힘을 줄이면 압력이 낮아져요.',
    '이번에는 상황 없이 관계만 연습해요. 온도 두 가지, 압력 두 가지를 따로 연습한 뒤 섞어서 풀어요.',
    '하나의 상황에서 세 번 이어 쏴요. 온도·압력, 변화의 방향, 기체의 부피를 차례로 생각해요.',
    '이제 원하는 만큼 탐험해요! 세 번 연결해 상황을 완성하고, 다섯 상황마다 성을 무너뜨려요.'
  ];
  openModal(`<span class="big-badge">${STAGES[stage].badge}</span><h2>${stage===4?'끝없는 탐험':`${stage+1}단계 · ${STAGES[stage].name}`}</h2><p>${texts[stage]}</p>${stage===2?relations():''}<div class="modal-buttons"><button class="primary" id="close-modal">준비됐어요!</button></div>`,true);
}
function relations(){return `<div class="relation-grid">${CATEGORIES.map(cat=>{const c=concept(cat);return `<div class="relation-card">${c.kind}가 ${c.direction==='높아진다'?'높아지면':'낮아지면'}<strong>부피가 ${c.volume==='늘어난다'?'늘어나요':'줄어들어요'}</strong></div>`;}).join('')}</div>`;}
function showHelp(){openModal(`<h2>당기고, 쏘고, 와르르!</h2><p>정답을 생각한 다음, 새총으로 표적을 맞혀요.</p><div class="instruction-list"><div class="instruction"><b>1</b><span>공을 아래로 당겨요.<br>오른쪽으로 당기면 왼쪽 표적,<br>왼쪽으로 당기면 오른쪽 표적을 겨눠요.</span></div><div class="instruction"><b>2</b><span>노란색으로 빛나는 표적을 확인하고<br>손을 놓으면 발사!</span></div><div class="instruction"><b>3</b><span>끌기가 어렵다면 표적을 누르고<br>‘쏘기’ 버튼을 눌러도 돼요.</span></div></div><p class="setting-note">키보드: 공에 초점을 두고 좌우 방향키로 선택, Enter로 발사해요. 시간제한은 없어요.</p><div class="modal-buttons"><button class="primary" id="close-modal">알겠어요!</button></div>`);}
function showProgress(){const stage=state.session.stage,recent=state.stats[stage].history.slice(-10),good=recent.filter(h=>h.solo).length;openModal(`<h2>다음 길은 언제 열릴까요?</h2><p>${stage===4?'끝없는 탐험에서는 원하는 만큼 계속 연습해요.':`${STAGES[stage].goal}상황 이상 연습하고, 최근 10상황 중 8상황을 도움 없이 맞히면 <b>통과 도전</b>이 열려요.`}</p>${stage<4?`<p class="setting-note">${stage===0?'온도·압력 상황을 각각 2번 이상':'네 가지 변화 상황을 각각 1번 이상'} 혼자 맞혀야 해요. 통과 도전은 다섯 상황 중 네 상황을 혼자 완성하면 성공!</p><div class="round-numbers"><div>연습한 상황<strong>${state.stats[stage].total}</strong></div><div>최근 혼자 맞힘<strong>${good} / ${recent.length||10}</strong></div></div>`:''}<div class="modal-buttons"><button class="primary" id="close-modal">계속 연습하기</button></div>`);}
function offerChallenge(){openModal(`<span class="big-badge">🏁</span><h2>통과 도전이 열렸어요!</h2><p>다섯 상황 중 네 상황을 도움 없이 완성하면<br>배지를 얻고 다음 길로 갈 수 있어요.</p><p class="setting-note">틀려도 다시 쏠 수 있어요. 도전이 끝나면 어려웠던 부분을 더 연습할 수 있어요.</p><div class="modal-buttons"><button class="secondary" id="close-modal">조금 더 연습</button><button class="primary" id="begin-trial">통과 도전 시작</button></div>`,true);$('#begin-trial').onclick=()=>{const s=state.session;s.mode='challenge';s.trial=[];s.trialCats=[];prepareNext();renderGame();};}
function finishChallenge(results,stage){
  const solo=results.filter(Boolean).length,passed=solo>=4;
  if(passed){state.badges[stage]=true;state.unlocked=Math.max(state.unlocked,stage+1);save();tone('big');}
  openModal(`<span class="big-badge">${passed?STAGES[stage].badge:'🌱'}</span><h2>${passed?`${STAGES[stage].name} 배지 획득!`:'조금 더 연습하면 돼요!'}</h2><p>${passed?['온도와 압력 상황을 구별했어요.','높아짐과 낮아짐을 알아냈어요.','기체의 부피 변화를 알아냈어요.','상황부터 기체의 부피까지 연결했어요!'][stage]:'도움이 필요했던 상황을 다시 만나 봐요.<br>모은 별과 탐험 기록은 그대로예요.'}</p><div class="round-numbers"><div>혼자 완성<strong>${solo} / 5</strong></div><div>도움받아 완성<strong>${5-solo}</strong></div></div><div class="modal-buttons"><button class="secondary" id="map-result">탐험 지도</button><button class="primary" id="continue-result">${passed?stage===3?'끝없는 탐험 시작':'다음 단계 시작':'다시 연습하기'}</button></div>`,true);
  $('#map-result').onclick=renderHome;$('#continue-result').onclick=()=>passed?startStage(stage+1,false):renderGame();
}
function showRound(results,stage){
  const solo=results.filter(Boolean).length,can=stage<4&&ready(state,stage);
  openModal(`<div class="bonus-castle">${castle()}</div><h2>다섯 상황을 완성했어요!</h2><p>혼자 완성 ${solo}개 · 도움받아 완성 ${5-solo}개<br>이번 탐험에서 별 다섯 개를 모았어요.</p><div class="modal-buttons"><button class="primary" id="bonus">보너스! 성 무너뜨리기</button></div>`,true);
  $('#bonus').onclick=()=>{
    tone('big');$('.bonus-castle').classList.add('crumble');$('#bonus').disabled=true;
    setTimeout(()=>{
      if(!modal)return;
      const buttons=modal.querySelector('.modal-buttons');buttons.innerHTML=`<button class="secondary" id="round-home">오늘은 여기까지</button><button class="primary" id="round-next">${can?'통과 도전하기':'한 판 더 쏘기'}</button>`;
      $('#round-home').onclick=renderHome;$('#round-next').onclick=()=>{renderGame();if(can)offerChallenge();};
      $('#round-next').focus({preventScroll:true});
    },motion()?850:60);
  };
}
function showSettings(){
  openModal(`<h2>설정</h2><div class="toggle-row"><span>효과음</span><button id="sound" class="${state.settings.sound?'on':''}" aria-pressed="${state.settings.sound}">${state.settings.sound?'켜짐':'꺼짐'}</button></div><div class="toggle-row"><span>움직임 효과</span><button id="motion" class="${state.settings.motion?'on':''}" aria-pressed="${state.settings.motion}">${state.settings.motion?'켜짐':'꺼짐'}</button></div><p class="setting-note">브라우저의 ‘움직임 줄이기’ 설정도 함께 적용해요.<br>이 게임의 학습 기록과 설정은 현재 기기에만 저장돼요.</p><div class="reset-box"><p>처음부터 새로 시작하려면 이 게임의 배지, 별, 학습 기록과 설정을 초기화할 수 있어요.</p><button class="text-button" id="reset-open">이 게임 기록 초기화</button></div><div class="modal-buttons"><button class="primary" id="close-modal">돌아가기</button></div>`);
  $('#sound').onclick=()=>{state.settings.sound=!state.settings.sound;save();if(state.settings.sound)tone('good');showSettings();};
  $('#motion').onclick=()=>{state.settings.motion=!state.settings.motion;document.body.classList.toggle('reduced-motion',!motion());save();showSettings();};
  $('#reset-open').onclick=showReset;
}
function showReset(){openModal(`<h2>이 게임 기록 초기화</h2><p><b>이 기기에 저장된 기체 팡!의 배지, 별, 열린 단계, 학습 기록, 설정</b>을 삭제해요. 다른 게임과 사이트의 기록은 지우지 않아요.</p><div class="reset-box"><label for="reset-text">아래에 ‘초기화합니다’를 직접 입력해 주세요.</label><input id="reset-text" type="text" autocomplete="off" spellcheck="false" placeholder="초기화합니다"></div><div class="modal-buttons"><button class="secondary" id="close-modal">취소 · 기록 유지</button><button class="primary" id="reset-confirm" disabled>기록 초기화</button></div>`);$('#reset-text').oninput=e=>{$('#reset-confirm').disabled=e.target.value!=='초기화합니다';};$('#reset-confirm').onclick=()=>{if($('#reset-text').value!=='초기화합니다')return;try{localStorage.removeItem(SAVE_KEY);}catch{storageOk=false;}state=initialState();renderHome();announce('기체 팡!의 기록만 초기화했어요.');};}
function showLearning(){openModal(`<h2>학습 안내와 기록</h2><p>온도·압력 상황 구분, 변화 방향, 부피 관계, 세 칸 연결 순서로 익혀요. 연습 중 도움을 받거나 다시 쏜 상황도 별을 얻지만, 단계 통과에는 첫 시도에 혼자 완성한 상황만 반영해요.</p><div class="relation-grid">${CATEGORIES.map(cat=>{const c=concept(cat),level=Math.min(5,state.mastery[cat]);return `<div class="relation-card">${c.kind} ${c.direction==='높아진다'?'높아짐':'낮아짐'}<strong>부피 ${c.volume==='늘어난다'?'늘어남':'줄어듦'}</strong><div class="mastery" aria-label="연결 문제 혼자 완성 ${state.mastery[cat]}회">${Array.from({length:5},(_,i)=>`<i class="${i<level?'filled':''}"></i>`).join('')}</div></div>`;}).join('')}</div><p>총 ${state.total}상황 완성 · 배지 ${state.badges.filter(Boolean).length}개</p><p class="setting-note">기본 문제는 기체가 새거나 추가되지 않는 상황이에요. 온도 문제는 압력이 비슷하고, 압력 문제는 온도가 비슷한 조건으로 다뤄요. 산·비행기·잠수 상황과 내부·외부 압력 구분은 넣지 않았어요.</p><div class="modal-buttons"><button class="primary" id="close-modal">돌아가기</button></div>`);}
window.addEventListener('resize',()=>{if(drag)resetDrag();requestAnimationFrame(updateAim);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&drag)resetDrag();});
save();renderHome();
