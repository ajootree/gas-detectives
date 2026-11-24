export const NICKNAME_KEY='gas-detectives.nickname.v1';
export const ADJECTIVES=[
  '씩씩한','반짝이는','차분한','용감한','즐거운','꼼꼼한','다정한','신나는',
  '활발한','명랑한','상냥한','친절한','든든한','튼튼한','포근한','따뜻한',
  '시원한','산뜻한','싱그러운','느긋한','부지런한','똑똑한','슬기로운','재치있는',
  '기발한','호기심많은','발랄한','쾌활한','깜찍한','귀여운','멋진','빛나는',
  '눈부신','반듯한','정직한','성실한','믿음직한','지혜로운','대담한','당당한',
  '고요한','맑은','푸른','새하얀','노란','분홍빛','초록빛','무지갯빛',
  '향긋한','달콤한','새콤한','고소한','보송한','폭신한','말랑한','몽글몽글한',
  '통통한','동글동글한','알록달록한','폴짝이는','깡충뛰는','씽씽달리는','두근두근한','반짝반짝한',
];
export const NOUNS=[
  '수달','기린','고래','토끼','다람쥐','펭귄','판다','코알라',
  '알파카','고슴도치','햄스터','사막여우','북극여우','아기곰','해달','물개',
  '돌고래','바다거북','하마','코끼리','사슴','고양이','강아지','병아리',
  '오리','참새','파랑새','앵무새','부엉이','올빼미','두루미','홍학',
  '나비','꿀벌','무당벌레','잠자리','사마귀','달팽이','장수풍뎅이','사슴벌레',
  '해바라기','민들레','튤립','장미','코스모스','데이지','라벤더','수국',
  '제비꽃','봉선화','도토리','솔방울','네잎클로버','새싹','대나무','은행잎',
  '딸기','복숭아','사과','배','포도','청포도','수박','멜론',
  '귤','오렌지','키위','파인애플','체리','블루베리','망고','살구',
  '마시멜로','푸딩','젤리','도넛','쿠키','솜사탕','찐빵','붕어빵',
  '별','달','햇살','구름','무지개','샛별','은하수','별똥별',
  '비눗방울','종이배','종이비행기','풍차','풍선','연','등대','보물상자',
];
export function createNickname(values=crypto.getRandomValues(new Uint32Array(3))){
  return ADJECTIVES[values[0]%ADJECTIVES.length]+NOUNS[values[1]%NOUNS.length]+String(values[2]%10000).padStart(4,'0');
}
export function validNickname(value){return typeof value==='string'&&/^[가-힣0-9]{2,16}$/.test(value);}
export function fixedNickname(previous='',storage){
  let local;
  try{local=storage??globalThis.localStorage;const cached=local.getItem(NICKNAME_KEY);if(validNickname(cached))return cached;}catch{}
  const chosen=validNickname(previous)?previous:createNickname();
  try{local?.setItem(NICKNAME_KEY,chosen);}catch{}
  return chosen;
}
