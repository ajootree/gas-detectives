// 온도·압력 네 관계를 익히는 48개 상황. 부피 문항은 다른 조건이 같다고 생각합니다.
export const CATEGORIES = ['TU','TD','PU','PD'];
const row = (id, cat, text, object, setting) => ({id,cat,text,object,setting});
export const BANK = [
  row('t01','TU','풍선을 차가운 복도에서 따뜻한 교실로 옮겼어요.','balloon','warm'),
  row('t02','TU','공기가 든 풍선을 따뜻한 물에 담갔어요.','balloon','warm'),
  row('t03','TU','마개를 닫은 차가운 페트병을 따뜻한 곳으로 옮겼어요.','bottle','warm'),
  row('t04','TU','밀봉한 과자 봉지를 따뜻한 햇볕 아래 두었어요.','snack','sun'),
  row('t05','TU','구멍이 없는 찌그러진 탁구공을 뜨거운 물에 넣었어요.','ball','warm'),
  row('t06','TU','풍선을 씌운 병을 따뜻한 물에 담갔어요.','flask','warm'),
  row('t07','TD','교실에 있던 풍선을 추운 바깥으로 옮겼어요.','balloon','cold'),
  row('t08','TD','공기가 든 풍선을 찬물에 담갔어요.','balloon','cold'),
  row('t09','TD','마개를 닫은 빈 페트병을 냉장고에 넣었어요.','bottle','fridge'),
  row('t10','TD','풍선을 씌운 병을 따뜻한 물에서 찬물로 옮겼어요.','flask','cold'),
  row('t11','TD','따뜻한 실내의 은박 풍선을 추운 곳으로 가져갔어요.','balloon','cold'),
  row('t12','TD','공기가 든 풍선을 얼음물에 담갔어요.','balloon','ice'),
  row('t13','TU','공기가 든 밀폐 지퍼백을 찬 곳에서 따뜻한 곳으로 옮겼어요.','pouch','warm'),
  row('t14','TU','마개를 닫은 말랑한 빈 병을 찬물에서 따뜻한 물로 옮겼어요.','bottle','warm'),
  row('t15','TU','생일 풍선을 추운 베란다에서 따뜻한 거실로 가져왔어요.','balloon','warm'),
  row('t16','TU','풍선을 씌운 차가운 병을 따뜻한 물수건으로 감쌌어요.','flask','warm'),
  row('t17','TU','공기가 든 밀폐 주머니를 햇빛에 데워진 창가에 두었어요.','pouch','sun'),
  row('t18','TU','마개를 닫은 차가운 빈 병을 미지근한 물에서 데웠어요.','bottle','warm'),
  row('t19','TD','공기가 든 밀폐 지퍼백을 따뜻한 곳에서 차가운 곳으로 옮겼어요.','pouch','cold'),
  row('t20','TD','풍선을 씌운 병을 얼음주머니 옆에 놓아 차갑게 식혔어요.','flask','ice'),
  row('t21','TD','생일 풍선을 따뜻한 거실에서 추운 베란다로 가져갔어요.','balloon','cold'),
  row('t22','TD','마개를 닫은 말랑한 병을 따뜻한 물에서 찬물로 옮겼어요.','bottle','cold'),
  row('t23','TD','따뜻해진 밀봉 과자 봉지를 시원한 냉장고에 넣었어요.','snack','fridge'),
  row('t24','TD','풍선을 씌운 따뜻한 병을 차가운 물수건으로 감쌌어요.','flask','cold'),
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
  row('p13','PU','밀봉한 과자 봉지를 들고 산 정상에서 산 아래로 내려왔어요.','snack','mountain-down'),
  row('p14','PU','공기주머니를 들고 케이블카로 산 위에서 아래로 내려왔어요.','pouch','cable-down'),
  row('p15','PU','밀봉한 과자 봉지를 들고 탄 비행기가 착륙하려고 내려왔어요.','snack','flight-down'),
  row('p16','PU','산 위 가게에서 밀봉한 과자 봉지를 낮은 마을로 가져왔어요.','snack','mountain-down'),
  row('p17','PU','공기주머니 위에 가벼운 책 대신 더 무거운 책을 올렸어요.','pouch','press'),
  row('p18','PU','공기가 든 말랑한 밀폐 주머니를 물속 더 깊은 곳으로 내렸어요.','pouch','water-down'),
  row('p19','PD','밀봉한 과자 봉지를 들고 산기슭에서 높은 산 정상으로 올라갔어요.','snack','mountain-up'),
  row('p20','PD','공기주머니를 들고 케이블카로 산 아래에서 산 위로 올라갔어요.','pouch','cable-up'),
  row('p21','PD','밀봉한 과자 봉지를 들고 탄 비행기가 이륙해 높이 올라갔어요.','snack','flight-up'),
  row('p22','PD','밀봉한 과자 봉지를 낮은 마을에서 높은 산마을로 가져갔어요.','snack','mountain-up'),
  row('p23','PD','공기주머니를 누르고 있던 무거운 책을 치웠어요.','pouch','release'),
  row('p24','PD','물속 깊은 곳의 공기 방울이 수면 가까이 올라왔어요.','bubble','water-up'),
];
export function pickScenario(previousId,seen=[],random=Math.random){
  const previousCategory=BANK.find(s=>s.id===previousId)?.cat;
  let unseen=BANK.filter(s=>!seen.includes(s.id));
  if(!unseen.length){seen.splice(0);unseen=BANK;}
  const counts=Object.fromEntries(CATEGORIES.map(cat=>[cat,unseen.filter(s=>s.cat===cat).length]));
  const remaining=unseen.length-1;
  // Keep the remainder arrangeable, so a round finishes without repeated types.
  const safe=CATEGORIES.filter(cat=>cat!==previousCategory&&counts[cat]>0&&CATEGORIES.every(other=>counts[other]-(other===cat?1:0)<=(other===cat?Math.floor(remaining/2):Math.ceil(remaining/2))));
  let pool=unseen.filter(s=>safe.includes(s.cat));
  if(!pool.length)pool=unseen.filter(s=>s.cat!==previousCategory);
  if(!pool.length){seen.splice(0);pool=BANK.filter(s=>s.cat!==previousCategory);}
  return pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];
}
export function concept(cat) {
  const kind = cat[0]==='T' ? '온도':'압력';
  const direction = cat[1]==='U' ? '높아진다':'낮아진다';
  const volume = (cat==='TU'||cat==='PD') ? '늘어난다':'줄어든다';
  return {kind,direction,volume};
}
export function sentence(cat) {
  const c=concept(cat);
  return `${subject(c.kind)} ${c.direction==='높아진다'?'높아지면':'낮아지면'} 기체의 부피가 ${c.volume==='늘어난다'?'늘어나요':'줄어들어요'}.`;
}
export function subject(kind){return kind==='압력'?'압력이':'온도가';}
export function explain(s) {
  const c=concept(s.cat);
  if(s.cat[0]==='T') return `${s.cat[1]==='U'?'따뜻해지는':'차가워지는'} 상황이에요. 온도가 ${c.direction==='높아진다'?'높아져요':'낮아져요'}.`;
  if(['mountain-up','cable-up'].includes(s.setting))return '산 위로 높이 올라갈수록 압력이 낮아져요.';
  if(['mountain-down','cable-down'].includes(s.setting))return '산 위에서 낮은 곳으로 내려오면 압력이 높아져요.';
  if(s.setting==='flight-up')return '비행기가 이륙해 높이 올라가는 동안 압력이 낮아지는 상황이에요.';
  if(s.setting==='flight-down')return '비행기가 착륙하려고 내려오는 동안 압력이 높아지는 상황이에요.';
  if(s.setting==='water-up')return '물속에서 수면 가까이 올라갈수록 압력이 낮아져요.';
  if(s.setting==='water-down')return '물속에서 더 깊이 내려갈수록 압력이 높아져요.';
  if(s.setting==='pull') return '피스톤을 당기는 상황이에요. 주사기 속 기체의 압력이 낮아져요.';
  return s.cat[1]==='U' ? '누르는 힘이 커지는 상황이에요. 압력이 높아져요.' : '누르던 힘이 줄어드는 상황이에요. 압력이 낮아져요.';
}
export function kindClue(s){
  if(s.cat[0]==='T')return '따뜻하게 / 차갑게 → 온도';
  if(s.setting.endsWith('-up')&&!s.setting.startsWith('water'))return '높은 곳으로 올라가기 → 압력';
  if(s.setting.endsWith('-down')&&!s.setting.startsWith('water'))return '낮은 곳으로 내려오기 → 압력';
  if(s.setting.startsWith('water'))return '물속 깊이의 변화 → 압력';
  return '누르는 힘의 변화 → 압력';
}
export function question(stage,s,part=0) {
  const c=concept(s.cat);
  let type=stage===0?'kind':stage===1?'direction':stage===2?'volume':['kind','direction','volume'][part];
  const options=type==='kind'?['온도','압력']:type==='direction'?['높아진다','낮아진다']:['늘어난다','줄어든다'];
  const prompt=type==='kind'?'무엇과 관련된 상황일까요?':type==='direction'?`${subject(c.kind)} 어떻게 달라질까요?`:'기체의 부피는 어떻게 될까요?';
  return {type,options,answer:c[type],prompt};
}
