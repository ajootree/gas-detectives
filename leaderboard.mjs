import {firebaseConfig} from './firebase-config.mjs';
let connection=null;
export const ready=()=>!!firebaseConfig?.projectId;
async function connect(){
  if(!ready())throw Error('온라인 랭킹 연결을 준비하고 있어요. 이 기기 기록은 계속 저장돼요.');
  if(!connection)connection=(async()=>{
    const [appSDK,authSDK,dbSDK]=await Promise.all([
      import('https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore-lite.js'),
    ]);
    const app=appSDK.initializeApp(firebaseConfig),auth=authSDK.getAuth(app),db=dbSDK.getFirestore(app);
    await auth.authStateReady();if(!auth.currentUser)await authSDK.signInAnonymously(auth);
    return {auth,db,dbSDK};
  })().catch(error=>{connection=null;throw error;});
  return connection;
}
export async function beginOnlineRun(mode,nonce){
  if(!['marathon','sprint120'].includes(mode))throw Error('Invalid ranking mode');
  const {auth,db,dbSDK:f}=await connect(),uid=auth.currentUser.uid;
  await f.setDoc(f.doc(db,'gasQuizRuns',uid),{mode,nonce,startedAt:f.serverTimestamp()});
  return {uid,nonce,mode};
}
export async function submitOnlineRun(online,result,nickname){
  if(!online||result.completed<1||result.score!==result.completed*30||result.reason==='abandon'||(result.type==='sprint120'&&result.reason!=='time'))return {saved:false};
  const {auth,db,dbSDK:f}=await connect();if(auth.currentUser.uid!==online.uid)throw Error('도전을 시작한 기기에서 기록을 올려 주세요.');
  const ref=f.doc(db,'gasQuizScores',`${online.mode}_${online.uid}`);
  return f.runTransaction(db,async tx=>{
    const old=await tx.get(ref);if(old.exists()&&old.data().score>=result.score)return {saved:false,best:old.data().score};
    tx.set(ref,{uid:online.uid,mode:online.mode,nonce:online.nonce,nickname,score:result.score,completed:result.completed,elapsedMs:Math.max(1,Math.round(result.elapsed)),updatedAt:f.serverTimestamp()});return {saved:true,best:result.score};
  });
}
export async function fetchLeaderboard(mode){
  const {db,dbSDK:f}=await connect();
  const query=f.query(f.collection(db,'gasQuizScores'),f.where('mode','==',mode),f.orderBy('score','desc'),f.limit(10));
  const snapshot=await f.getDocs(query);return snapshot.docs.map(doc=>{const d=doc.data();return{nickname:d.nickname,score:d.score,completed:d.completed};});
}
