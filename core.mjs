export const SAVE_KEY = 'gas-pang.slingshot.v1';
export const CATEGORIES = ['TU','TD','PU','PD'];
export const STAGES = [
  { name:'상황 탐정', short:'온도? 압력?', desc:'어떤 것과 관련된 상황인지 찾아요.', badge:'🔍', goal:10 },
  { name:'변화 탐정', short:'높아져? 낮아져?', desc:'상황을 읽고 변화의 방향을 찾아요.', badge:'🧭', goal:12 },
  { name:'부피 전문가', short:'늘어나? 줄어들어?', desc:'온도·압력과 부피의 관계를 익혀요.', badge:'🎈', goal:12 },
  { name:'기체 탐정', short:'세 번 이어 쏘기', desc:'상황부터 기체의 부피까지 연결해요.', badge:'🏅', goal:12 },
  { name:'끝없는 탐험', short:'계속 쏘고, 와르르!', desc:'다섯 상황씩, 원하는 만큼 도전해요.', badge:'🏰', goal:5 },
];
const row = (id, cat, text, object, setting) => ({id,cat,text,object,setting});
export const BANK = [
  row('t01','TU','풍선을 차가운 복도에서 따뜻한 교실로 옮겼어요.','balloon','warm'),
  row('t02','TU','공기가 든 풍선을 따뜻한 물에 담갔어요.','balloon','warm'),
  row('t03','TU','차가워진 페트병을 따뜻한 곳으로 옮겼어요.','bottle','warm'),
  row('t04','TU','밀봉한 과자 봉지를 따뜻한 햇볕 아래 두었어요.','snack','sun'),
  row('t05','TU','구멍이 없는 찌그러진 탁구공을 뜨거운 물에 넣었어요.','ball','warm'),
  row('t06','TU','풍선을 씌운 병을 따뜻한 물에 담갔어요.','flask','warm'),
  row('t07','TD','교실에 있던 풍선을 추운 바깥으로 옮겼어요.','balloon','cold'),
  row('t08','TD','공기가 든 풍선을 찬물에 담갔어요.','balloon','cold'),
  row('t09','TD','마개를 닫은 빈 페트병을 냉장고에 넣었어요.','bottle','fridge'),
  row('t10','TD','풍선을 씌운 병을 따뜻한 물에서 찬물로 옮겼어요.','flask','cold'),
  row('t11','TD','따뜻한 실내의 은박 풍선을 추운 곳으로 가져갔어요.','balloon','cold'),
  row('t12','TD','공기가 든 풍선을 얼음물에 담갔어요.','balloon','ice'),
  row('p01','PU','입구를 막은 주사기의 피스톤을 더 세게 눌렀어요.','syringe','press'),
  row('p02','PU','공기주머니를 손으로 더 세게 눌렀어요.','cushion','press'),
  row('p03','PU','공기 방석 위에 앉아 방석을 눌렀어요.','cushion','sit'),
  row('p04','PU','뽁뽁이를 터지지 않을 정도로 꾹 눌렀어요.','bubble','press'),
  row('p05','PU','공기주머니가 든 운동화로 땅을 디디며 주머니를 눌렀어요.','shoe','press'),
  row('p06','PU','공기가 든 말랑한 밀폐 봉지를 손으로 눌렀어요.','snack','press'),
  row('p07','PD','공기주머니를 누르던 손의 힘을 줄였어요.','cushion','release'),
  row('p08','PD','공기 방석에서 일어나 방석을 누르던 힘을 줄였어요.','cushion','stand'),
  row('p09','PD','터지지 않은 뽁뽁이를 누르던 손을 뗐어요.','bubble','release'),
  row('p10','PD','입구를 막은 주사기의 피스톤을 천천히 당겼어요.','syringe','pull'),
  row('p11','PD','공기가 든 밀폐 봉지를 누르다가 손의 힘을 줄였어요.','snack','release'),
  row('p12','PD','운동화의 공기주머니를 누르던 발을 들어 누르는 힘을 줄였어요.','shoe','release'),
];
export function concept(cat) {
  const kind = cat[0]==='T' ? '온도':'압력';
  const direction = cat[1]==='U' ? '높아진다':'낮아진다';
  const volume = (cat==='TU'||cat==='PD') ? '늘어난다':'줄어든다';
  return {kind,direction,volume};
}
export function sentence(cat) {
  const c=concept(cat);
  return `${c.kind}가 ${c.direction==='높아진다'?'높아지면':'낮아지면'} 기체의 부피가 ${c.volume==='늘어난다'?'늘어나요':'줄어들어요'}.`;
}
export function explain(s) {
  const c=concept(s.cat);
  if(s.cat[0]==='T') return `${s.cat[1]==='U'?'따뜻해지는':'차가워지는'} 상황이에요. 온도가 ${c.direction==='높아진다'?'높아져요':'낮아져요'}.`;
  if(s.setting==='pull') return '피스톤을 당기는 상황이에요. 주사기 속 기체의 압력이 낮아져요.';
  return s.cat[1]==='U' ? '누르는 힘이 커지는 상황이에요. 압력이 높아져요.' : '누르던 힘이 줄어드는 상황이에요. 압력이 낮아져요.';
}
export function question(stage,s,part=0) {
  const c=concept(s.cat);
  let type=stage===0?'kind':stage===1?'direction':stage===2?'volume':['kind','direction','volume'][part];
  const options=type==='kind'?['온도','압력']:type==='direction'?['높아진다','낮아진다']:['늘어난다','줄어든다'];
  const prompt=type==='kind'?'무엇과 관련된 상황일까요?':type==='direction'?`${c.kind}가 어떻게 달라질까요?`:'기체의 부피는 어떻게 될까요?';
  return {type,options,answer:c[type],prompt};
}
export function initialState() {
  return {version:1,unlocked:0,badges:[false,false,false,false],total:0,stars:0,settings:{sound:true,motion:true},
    stats:STAGES.map(()=>({history:[],total:0,solo:0})),mastery:Object.fromEntries(CATEGORIES.map(k=>[k,0])),session:null};
}
export function sanitize(value) {
  const blank=initialState();
  if(!value||value.version!==1)return blank;
  blank.unlocked=Math.min(4,Math.max(0,Math.floor(Number(value.unlocked)||0)));
  blank.badges=blank.badges.map((_,i)=>value.badges?.[i]===true);
  blank.total=Math.max(0,Math.floor(Number(value.total)||0));
  blank.stars=Math.max(0,Math.floor(Number(value.stars)||0));
  blank.settings.sound=value.settings?.sound!==false;
  blank.settings.motion=value.settings?.motion!==false;
  blank.stats=blank.stats.map((stat,i)=>({...stat,total:Math.max(0,Number(value.stats?.[i]?.total)||0),solo:Math.max(0,Number(value.stats?.[i]?.solo)||0),history:(Array.isArray(value.stats?.[i]?.history)?value.stats[i].history:[]).filter(h=>CATEGORIES.includes(h.cat)&&typeof h.solo==='boolean').slice(-30)}));
  CATEGORIES.forEach(k=>blank.mastery[k]=Math.max(0,Math.floor(Number(value.mastery?.[k])||0)));
  const s=value.session;
  if(s&&Number.isInteger(s.stage)&&s.stage>=0&&s.stage<=blank.unlocked&&BANK.some(x=>x.id===s.id)) {
    blank.session={stage:s.stage,id:s.id,part:[0,1,2].includes(s.part)?s.part:0,first:s.first!==false,
      mode:s.mode==='challenge'?'challenge':'practice',trial:Array.isArray(s.trial)?s.trial.filter(v=>typeof v==='boolean').slice(0,4):[],
      trialCats:Array.isArray(s.trialCats)?s.trialCats.filter(c=>CATEGORIES.includes(c)).slice(0,4):[],
      cycle:Math.max(0,Math.floor(Number(s.cycle)||0)),round:Array.isArray(s.round)?s.round.filter(v=>typeof v==='boolean').slice(0,4):[],
      seen:Array.isArray(s.seen)?s.seen.filter(id=>BANK.some(x=>x.id===id)).slice(-5):[],review:[],};
  }
  return blank;
}
export function record(state,stage,cat,solo) {
  const stat=state.stats[stage];
  stat.total++; if(solo)stat.solo++;
  stat.history.push({cat,solo});stat.history=stat.history.slice(-30);
  state.total++;state.stars++;
  if(stage>=3&&solo) state.mastery[cat]++;
}
export function ready(state,stage) {
  if(stage>=4)return false;
  const stats=state.stats[stage], recent=stats.history.slice(-10);
  if(stats.total<STAGES[stage].goal||recent.length<10||recent.filter(h=>h.solo).length<8)return false;
  const good=recent.filter(h=>h.solo);
  return stage===0?['T','P'].every(k=>good.filter(h=>h.cat[0]===k).length>=2):CATEGORIES.every(k=>good.some(h=>h.cat===k));
}
export function nextCategory(stage,cycle,mode,trialLength=0) {
  if(mode==='challenge')return CATEGORIES[trialLength%4];
  if((stage===1||stage===2)&&cycle<4)return ['TU','TD'][cycle%2];
  if((stage===1||stage===2)&&cycle<8)return ['PU','PD'][cycle%2];
  return CATEGORIES[cycle%4];
}
export function pickScenario(cat,seen=[],random=Math.random) {
  let pool=BANK.filter(x=>x.cat===cat&&!seen.includes(x.id));
  if(!pool.length)pool=BANK.filter(x=>x.cat===cat);
  return pool[Math.floor(random()*pool.length)];
}
