import {BANK,CATEGORIES} from './data.mjs';
export const PASS_SCORE=100;
export const PASS_ACCURACY=.8;
export const RUN_TYPES=['gate60','marathon','sprint120'];
export function augment(s,raw={}){
  s.unlocked=Math.max(0,Math.min(3,Math.floor(Number(raw.unlocked)||0)));
  s.mode=Math.min(s.mode,s.unlocked);
  s.activity=['practice',...RUN_TYPES].includes(raw.activity)?raw.activity:'practice';
  s.bests={gate60:[0,1,2].map(i=>Math.max(0,Number(raw.bests?.gate60?.[i])||0)),marathon:Math.max(0,Number(raw.bests?.marathon)||0),sprint120:Math.max(0,Number(raw.bests?.sprint120)||0)};
  s.nickname=typeof raw.nickname==='string'?raw.nickname.slice(0,16):'';
  s.run=null;
  const r=raw.run;
  if(r&&RUN_TYPES.includes(r.type)&&Number.isInteger(r.stage)&&r.stage>=0&&r.stage<=s.unlocked&&r.stage<4&&Number.isFinite(r.startedAt)&&r.startedAt>0){
    s.run={...r,score:Math.max(0,Math.floor(Number(r.score)||0)),attempts:Math.max(0,Math.floor(Number(r.attempts)||0)),correct:Math.max(0,Math.floor(Number(r.correct)||0)),completed:Math.max(0,Math.floor(Number(r.completed)||0)),resolved:Math.max(0,Math.floor(Number(r.resolved)||0)),ended:r.ended===true,caseWrong:r.caseWrong===true};
    s.run.deadline=r.type==='marathon'?null:r.startedAt+(r.type==='gate60'?60000:120000);
    s.mode=r.stage;s.activity=r.type;
  }
  return s;
}
export function activeRun(s){return !!s.run&&!s.run.ended;}
export function remaining(s,now=Date.now()){return !s.run||s.run.deadline===null?null:Math.max(0,s.run.deadline-now);}
export function expired(s,now=Date.now()){return activeRun(s)&&s.run.deadline!==null&&now>=s.run.deadline;}
export function pickRunQuestion(s,random=Math.random){
  const category=CATEGORIES[s.run.resolved%4];let pool=BANK.filter(x=>x.cat===category&&!s.seen.includes(x.id));if(!pool.length)pool=BANK.filter(x=>x.cat===category);
  const entry=pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];s.current={id:entry.id,part:0};s.seen.push(entry.id);s.seen=s.seen.slice(-5);s.review=false;s.helped=false;s.run.caseWrong=false;
}
export function startRun(s,type,now=Date.now(),id=''){
  if(!RUN_TYPES.includes(type))throw Error('Invalid challenge');
  if((type==='gate60'&&s.mode>=3)||(type!=='gate60'&&s.mode!==3))throw Error('Challenge does not match stage');
  s.run={id,type,stage:s.mode,startedAt:now,deadline:type==='marathon'?null:now+(type==='gate60'?60000:120000),score:0,attempts:0,correct:0,completed:0,resolved:0,caseWrong:false,ended:false,submitted:false,onlineId:null};s.activity=type;pickRunQuestion(s);
}
export function endRun(s,reason,now=Date.now()){
  const r=s.run;if(!r||r.ended)return r;
  r.ended=true;r.reason=reason;r.finishedAt=now;r.elapsed=Math.max(0,now-r.startedAt);r.accuracy=r.attempts?r.correct/r.attempts:0;
  r.passed=r.type==='gate60'&&reason==='time'&&r.score>=PASS_SCORE&&r.accuracy>=PASS_ACCURACY;
  if(r.type==='gate60'){s.bests.gate60[r.stage]=Math.max(s.bests.gate60[r.stage],r.score);if(r.passed)s.unlocked=Math.max(s.unlocked,r.stage+1);}
  else if(reason!=='abandon'&&(r.type!=='sprint120'||reason==='time'))s.bests[r.type]=Math.max(s.bests[r.type],r.score);
  return r;
}
export function runAnswer(s,correct,now=Date.now()){
  const r=s.run;if(!r||r.ended)return {ended:true};
  if(expired(s,now)){endRun(s,'time',now);return {ended:true};}
  r.attempts++;if(correct)r.correct++;
  if(!correct){r.caseWrong=true;s.review=true;s.helped=true;if(r.type==='marathon')endRun(s,'mistake',now);return {review:true,gain:0};}
  return advanceRun(s);
}
export function advanceRun(s){
  const r=s.run;if(r.ended){s.review=false;return {ended:true,gain:0};}
  s.review=false;let gain=0,full=false;
  if(r.type==='gate60'){gain=r.caseWrong?0:10;r.completed+=gain?1:0;full=true;}
  else if(s.current.part<2)s.current.part++;
  else{gain=r.caseWrong?0:30;r.completed+=gain?1:0;full=true;}
  r.score+=gain;
  if(full){r.resolved++;pickRunQuestion(s);}
  return {gain,full};
}
export function reviewRun(s,now=Date.now()){
  if(expired(s,now))endRun(s,'time',now);
  return advanceRun(s);
}
