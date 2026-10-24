const {JSDOM}=require('jsdom');
const html=require('fs').readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
let clock=new Date("2026-10-23T07:30:00").getTime();
const dom=new JSDOM(html,{url:"https://aidenwright973.github.io/commute-verbal/",runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.Date.now=()=>clock;w.scrollTo=()=>{};w.SpeechSynthesisUtterance=function(t){this.text=t};
  w.speechSynthesis={getVoices:()=>[],cancel(){},speak(u){w.__said=(w.__said||[]).concat(u.text);setTimeout(()=>u.onend&&u.onend(),1)}};
  w.localStorage.setItem("cv2_settings",JSON.stringify({intro:0,newDay:30,pause:0.01,auto:"10"}));}});
const w=dom.window,d=w.document,$=id=>d.getElementById(id),q=s=>d.querySelector(s);
const out=[];const ok=(n,c,x)=>out.push((c?"PASS ":"FAIL ")+n+(c?"":"  → "+x));
const pos=()=>$("pos").textContent;
setTimeout(async()=>{
  q('#rideLen [data-v="10"]').click();ok("10-word ride",pos()==="1 of 10",pos());ok("estimate shown",/10 words · ~\d+ min/.test($("rideEst").textContent),$("rideEst").textContent);
  q('#rideLen [data-v="all"]').click();ok("all due = 30 new",pos()==="1 of 30",pos());
  q('#rideLen [data-v="custom"]').click();ok("custom shows stepper",!$("customRow").hidden);
  $("customN").value="7";$("customN").dispatchEvent(new w.Event("change"));ok("custom 7",pos()==="1 of 7",pos());
  $("cPlus").click();ok("stepper +5",pos()==="1 of 12",pos());
  q('#rideLen [data-v="t10"]').click();ok("time mode estimate",/stops after 10 min/.test($("rideEst").textContent),$("rideEst").textContent);
  // run a timed ride: auto-rate after 10s keeps it moving; advance the fake clock 2 min per check
  $("tapStart").click();ok("plan card hidden while riding",d.body.classList.contains("riding"));
  let rated=0;for(let i=0;i<600;i++){await new Promise(r=>setTimeout(r,40));if($("rates").classList.contains("await")){q('#rates [data-r="2"]').click();rated++;clock+=60000}if(!d.body.classList.contains("riding"))break}
  const said=(w.__said||[]).join(" | ");
  ok("ride stopped on time",!d.body.classList.contains("riding"),"still riding");
  ok("timed ride rated ~10 words (1 min each) in 10 min",rated>=10&&rated<=11,rated);ok("announced time's up",said.includes("Time's up"),said.slice(-200));
  // settings: presets
  q('[data-tab=settings]').click();q('#presetSeg [data-v="light"]').click();
  const S=JSON.parse(w.localStorage.getItem("cv2_settings"));ok("light preset applied",S.ret===2&&S.newDay===10&&S.weakCap===25,JSON.stringify(S));
  ok("summary text",$("loopSum").textContent.includes("every other day"),$("loopSum").textContent);
  q('[data-set="grad"] [data-v="3"]').click();ok("tweak → custom",q('#presetSeg [data-v="custom"]').getAttribute("aria-pressed")==="true");
  ok("summary updates",$("loopSum").textContent.includes("3 different days"),$("loopSum").textContent);
  q('#presetSeg [data-v="standard"]').click();ok("back to standard",q('#presetSeg [data-v="standard"]').getAttribute("aria-pressed")==="true");
  console.log(out.join("\n"));process.exit(0)},300);
