// 기존 퀴즈의 24개 상황과 정답 관계를 재사용합니다.
export const CATEGORIES = ['TU','TD','PU','PD'];
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
  return `${subject(c.kind)} ${c.direction==='높아진다'?'높아지면':'낮아지면'} 기체의 부피가 ${c.volume==='늘어난다'?'늘어나요':'줄어들어요'}.`;
}
export function subject(kind){return kind==='압력'?'압력이':'온도가';}
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
  const prompt=type==='kind'?'무엇과 관련된 상황일까요?':type==='direction'?`${subject(c.kind)} 어떻게 달라질까요?`:'기체의 부피는 어떻게 될까요?';
  return {type,options,answer:c[type],prompt};
}
