const {JSDOM}=require('jsdom');
const html=require('fs').readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const dom=new JSDOM(html,{url:"https://aidenwright973.github.io/commute-verbal/",runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.scrollTo=()=>{};w.SpeechSynthesisUtterance=function(t){this.text=t};
  w.speechSynthesis={getVoices:()=>[],cancel(){},speak(u){setTimeout(()=>u.onend&&u.onend(),5)}};
  w.webkitSpeechRecognition=function(){const r=this;r.start=()=>setTimeout(()=>{r.onerror({error:"not-allowed"});r.onend&&r.onend()},5);r.abort=r.stop=()=>{}};}});
const d=dom.window.document;
setTimeout(()=>{d.getElementById("hfBtn").click();d.getElementById("micBtn").click()},200);
setTimeout(()=>{console.log("note shown:",!d.getElementById("micNote").hidden);console.log(d.getElementById("micNote").textContent);console.log("running?",d.getElementById("play").textContent,"| voice:",d.getElementById("micBtn").textContent);process.exit(0)},800);
