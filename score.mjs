import {BANK,CATEGORIES} from './data.mjs';
export const KEY='gas-pang.cards.v1';
export const MODES=['상황 구분','높아짐·낮아짐','부피 변화','연결하기'];
export function fresh(){return {version:1,points:0,answers:0,solo:0,completed:0,mode:0,cycles:[0,0,0,0],seen:[],current:null,review:false,helped:false};}
export function restore(raw){
  const s=fresh();if(!raw||raw.version!==1)return s;
  for(const k of ['points','answers','solo','completed'])s[k]=Math.max(0,Math.floor(Number(raw[k])||0));
  s.mode=Number.isInteger(raw.mode)&&raw.mode>=0&&raw.mode<4?raw.mode:0;
  s.cycles=s.cycles.map((_,i)=>Math.max(0,Math.floor(Number(raw.cycles?.[i])||0)));
  s.seen=Array.isArray(raw.seen)?raw.seen.filter(id=>BANK.some(x=>x.id===id)).slice(-5):[];
  if(raw.current&&BANK.some(x=>x.id===raw.current.id))s.current={id:raw.current.id,part:s.mode===3&&[0,1,2].includes(raw.current.part)?raw.current.part:0};
  s.review=!!s.current&&raw.review===true;s.helped=raw.helped===true||s.review;return s;
}
export function next(s,random=Math.random){
  const n=s.cycles[s.mode];let category;
  if((s.mode===1||s.mode===2)&&n<4)category=['TU','TD'][n%2];
  else if((s.mode===1||s.mode===2)&&n<8)category=['PU','PD'][n%2];
  else category=CATEGORIES[n%4];
  let pool=BANK.filter(x=>x.cat===category&&!s.seen.includes(x.id));if(!pool.length)pool=BANK.filter(x=>x.cat===category);
  const scenario=pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];s.current={id:scenario.id,part:0};s.review=false;s.helped=false;s.seen.push(scenario.id);s.seen=s.seen.slice(-5);
}
export function complete(s,review=false){
  const independent=!review&&!s.helped,gain=independent?10:5;s.points+=gain;s.answers++;if(independent)s.solo++;
  if(s.mode===3&&s.current.part<2){s.current.part++;s.review=false;s.helped=false;}
  else{s.completed++;s.cycles[s.mode]++;next(s);}
  return gain;
}
