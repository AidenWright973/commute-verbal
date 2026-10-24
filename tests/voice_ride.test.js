const {JSDOM}=require('jsdom');
const html=require('fs').readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const script=["three","five","repeat","two","star","one","um","uh","skip","pause","resume","four","two","two"];
const log=[];
const dom=new JSDOM(html,{url:"https://aidenwright973.github.io/commute-verbal/",runScripts:'dangerously',pretendToBeVisual:true,
 beforeParse(w){
  w.localStorage.setItem("cv2_settings",JSON.stringify({pause:0.05,size:6,newDay:6,sayEx:"1",sayHook:"1",auto:"0",mic:false,rate:1,intro:0}));
  w.scrollTo=()=>{};
  w.SpeechSynthesisUtterance=function(t){this.text=t};
  w.speechSynthesis={getVoices:()=>[],cancel(){},speak(u){log.push((Date.now()%100000)+" SAY: "+u.text.slice(0,40));setTimeout(()=>u.onend&&u.onend(),5)},onvoiceschanged:null};
  let active=0;
  w.webkitSpeechRecognition=function(){const r=this;r.start=()=>{active++;if(active>1)log.push("!! TWO RECOGNIZERS ACTIVE");setTimeout(()=>{r.onstart&&r.onstart();
      if(r.interimResults===undefined){return}
      const t=script.shift();setTimeout(()=>{ if(r.dead)return;
        if(t===undefined){r.onerror&&r.onerror({error:"no-speech"});r.onend&&r.onend();return}
        log.push((Date.now()%100000)+" HEARD: "+t);r.onresult&&r.onresult({results:[[{transcript:t}]]});r.onend&&r.onend()},20)},5)};
    r.abort=r.stop=()=>{if(!r.dead){r.dead=true;active--;setTimeout(()=>r.onend&&r.onend(),1)}}};
  w.AudioContext=function(){return{state:"running",currentTime:0,destination:{},resume(){},createOscillator:()=>({frequency:{},connect:x=>x,start(){},stop(){}}),createGain:()=>({gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect:x=>({connect(){}})})}};
 }});
const w=dom.window,d=w.document;
setTimeout(()=>{
  log.push("hf button visible: "+!d.getElementById("hfBtn").hidden+" text: "+d.getElementById("hfBtn").textContent);
  d.getElementById("hfBtn").click();
},200);
setTimeout(()=>{
  const P=JSON.parse(w.localStorage.getItem("cv2_progress"));
  const S=JSON.parse(w.localStorage.getItem("cv2_settings"));
  console.log(log.join("\n"));
  console.log("---\nmic setting:",S.mic,"| voice btn:",d.getElementById("micBtn").textContent,"| play:",d.getElementById("play").textContent,"| hf hidden:",d.getElementById("hfBtn").hidden);
  console.log("ratings:",Object.entries(P.w).map(([k,v])=>k+"="+v.r+(v.s?"★":"")).join(", "));
  console.log("today:",JSON.stringify(P.days));
  process.exit(0);
},14000);
