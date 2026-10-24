const {JSDOM}=require('jsdom');
const html=require('fs').readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
let clock=new Date("2026-10-23T07:30:00").getTime();
const dom=new JSDOM(html,{url:"https://aidenwright973.github.io/commute-verbal/",runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.Date.now=()=>clock;w.scrollTo=()=>{};w.SpeechSynthesisUtterance=function(t){this.text=t};
  w.speechSynthesis={getVoices:()=>[],cancel(){},speak(u){setTimeout(()=>u.onend&&u.onend(),1)}};
  w.localStorage.setItem("cv2_settings",JSON.stringify(Object.assign({intro:0,rideLen:"all"},JSON.parse(process.env.PRESET||"{}"))));}});
const w=dom.window,d=w.document;
// learner: each word has a hidden difficulty; knowledge grows by one per day it is reviewed
const know={},hard={},lastDay={};let rng=7;const rand=()=>(rng=(rng*16807)%2147483647)/2147483647;
function answer(word,day){if(!(word in know)){know[word]=0;hard[word]=rand()<.3?2:rand()<.5?1:0}
  if(lastDay[word]!==day){if(lastDay[word]!=null)know[word]++;lastDay[word]=day}
  const k=know[word]-hard[word];return k<=0?(rand()<.5?5:4):k===1?(rand()<.6?3:4):k===2?(rand()<.7?2:3):(rand()<.6?1:2)}
const days=[];
setTimeout(()=>{
 for(let day=0;day<14;day++){
  clock=new Date(2026,9,23+day,7,30).getTime();
  w.refreshAll();
  const seenToday=new Map();let guard=0,rides=0;
  const pl=()=>({weak:+d.getElementById("pWeak").textContent,rev:+d.getElementById("pRev").textContent,nw:+d.getElementById("pNew").textContent});
  const start=pl();
  w.buildRide();w.renderCard(true);
  while(guard++<2000){
    const word=d.getElementById("word").textContent;
    if(word==="Ride complete"||word==="All caught up"){w.refreshPlan();const p=pl();if(p.weak+p.rev+p.nw===0)break;rides++;clock+=11*60000;w.buildRide();w.renderCard(true);continue}
    const r=answer(word,day);seenToday.set(word,(seenToday.get(word)||[]).concat(r));
    d.querySelector(`#rates [data-r="${r}"]`).click();clock+=20000;
  }
  const P=JSON.parse(w.localStorage.getItem("cv2_progress"));
  const learning=Object.values(P.w).filter(x=>x.r&&!x.gr&&!x.a).length;
  const grads=Object.values(P.w).filter(x=>x.gr).length;
  days.push({day,start,cards:[...seenToday.values()].flat().length,unique:seenToday.size,newIntroduced:(P.days[Object.keys(P.days).sort().pop()]||{}).nw,learningAfter:learning,graduated:grads,missed:[...seenToday].filter(([k,v])=>v[v.length-1]>=4).map(([k])=>k),seen:new Set(seenToday.keys())});
 }
 // check: every word whose last rating on day d was 4-5 appears on day d+1
 let ok=0,bad=0;for(let i=0;i<days.length-1;i++){for(const wd of days[i].missed){days[i+1].seen.has(wd)?ok++:bad++}}
 console.log("day | plan at start (weak/rev/new) | cards rated | unique words | new introduced | learning after | graduated");
 days.forEach(x=>console.log(String(x.day+1).padStart(3),"|",`${x.start.weak}/${x.start.rev}/${x.start.nw}`.padEnd(12),"|",String(x.cards).padStart(5),"|",String(x.unique).padStart(5),"|",String(x.newIntroduced).padStart(4),"|",String(x.learningAfter).padStart(4),"|",x.graduated));
 console.log(`\nmissed words that came back the next day: ${ok} of ${ok+bad}`);
 process.exit(0)},300);
