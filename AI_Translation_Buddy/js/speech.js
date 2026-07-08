/* ================= Text to speech ================= */
function speak(text, langCode){
  if(!('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = langCode === 'auto' ? 'en' : langCode;
  window.speechSynthesis.speak(utter);
}
listenSourceBtn.addEventListener('click', ()=> speak(inputText.value, sourceSel.value));
listenTargetBtn.addEventListener('click', ()=> speak(lastTranslatedText, targetSel.value));

/* ================= Voice input ================= */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if(SpeechRecognition){
  const recog = new SpeechRecognition();
  recog.interimResults = false;
  micBtn.addEventListener('click', ()=>{
    recog.lang = sourceSel.value === 'auto' ? 'en-US' : sourceSel.value;
    micBtn.classList.add('recording');
    try{ recog.start(); }catch(e){}
  });
  recog.addEventListener('result', (e)=>{
    const said = e.results[0][0].transcript;
    inputText.value = said;
    charCount.textContent = `${said.length} / 500`;
    runTranslate();
  });
  recog.addEventListener('end', ()=>{ micBtn.classList.remove('recording'); });
  recog.addEventListener('error', ()=>{ micBtn.classList.remove('recording'); });
}else{
  micBtn.disabled = true;
  micBtn.title = 'Voice input not supported on this browser';
}