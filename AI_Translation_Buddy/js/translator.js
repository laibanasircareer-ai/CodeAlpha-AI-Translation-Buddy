// ===================== Groq API Key =====================
const GROQ_API_KEY = "..."; // Add your own Groq API key here
/* ================= Languages ================= */
const FEATURED = [
  ["auto","Detect language"],["es","Spanish"],["fr","French"],["de","German"],
  ["it","Italian"],["pt","Portuguese"],["ja","Japanese"],["ko","Korean"],
  ["zh-CN","Chinese (Simplified)"],["ar","Arabic"],["th","Thai"],["vi","Vietnamese"],
  ["tr","Turkish"],["el","Greek"],["hi","Hindi"],["id","Indonesian"],
  ["nl","Dutch"],["pl","Polish"],["ru","Russian"],["sv","Swedish"]
];
const MORE = [
  ["af","Afrikaans"],["sq","Albanian"],["am","Amharic"],["hy","Armenian"],["az","Azerbaijani"],
  ["eu","Basque"],["be","Belarusian"],["bn","Bengali"],["bs","Bosnian"],["bg","Bulgarian"],
  ["ca","Catalan"],["ceb","Cebuano"],["ny","Chichewa"],["zh-TW","Chinese (Traditional)"],
  ["co","Corsican"],["hr","Croatian"],["cs","Czech"],["da","Danish"],["eo","Esperanto"],
  ["et","Estonian"],["tl","Filipino"],["fi","Finnish"],["fy","Frisian"],["gl","Galician"],
  ["ka","Georgian"],["gu","Gujarati"],["ht","Haitian Creole"],["ha","Hausa"],["haw","Hawaiian"],
  ["he","Hebrew"],["hmn","Hmong"],["hu","Hungarian"],["is","Icelandic"],["ig","Igbo"],
  ["ga","Irish"],["jw","Javanese"],["kn","Kannada"],["kk","Kazakh"],["km","Khmer"],
  ["rw","Kinyarwanda"],["ku","Kurdish"],["ky","Kyrgyz"],["lo","Lao"],["la","Latin"],
  ["lv","Latvian"],["lt","Lithuanian"],["lb","Luxembourgish"],["mk","Macedonian"],
  ["mg","Malagasy"],["ms","Malay"],["ml","Malayalam"],["mt","Maltese"],["mi","Maori"],
  ["mr","Marathi"],["mn","Mongolian"],["my","Myanmar (Burmese)"],["ne","Nepali"],
  ["no","Norwegian"],["or","Odia"],["ps","Pashto"],["fa","Persian"],["pa","Punjabi"],
  ["ro","Romanian"],["sm","Samoan"],["gd","Scots Gaelic"],["sr","Serbian"],["st","Sesotho"],
  ["sn","Shona"],["sd","Sindhi"],["si","Sinhala"],["sk","Slovak"],["sl","Slovenian"],
  ["so","Somali"],["su","Sundanese"],["sw","Swahili"],["tg","Tajik"],["ta","Tamil"],
  ["tt","Tatar"],["te","Telugu"],["ug","Uyghur"],["uk","Ukrainian"],["ur","Urdu"],
  ["uz","Uzbek"],["cy","Welsh"],["xh","Xhosa"],["yi","Yiddish"],["yo","Yoruba"],["zu","Zulu"]
];

const sourceSel = document.getElementById('sourceLang');
const targetSel = document.getElementById('targetLang');
sourceSel.setAttribute('aria-label', 'Source language');
targetSel.setAttribute('aria-label', 'Target language');

function buildOptions(select, list, skipAuto){
  list.forEach(([code, name])=>{
    if(skipAuto && code === 'auto') return;
    const opt = document.createElement('option');
    opt.value = code; opt.textContent = name;
    select.appendChild(opt);
  });
}
buildOptions(sourceSel, FEATURED, false);
const sep1 = document.createElement('option'); sep1.disabled = true; sep1.textContent = '────────';
sourceSel.appendChild(sep1);
buildOptions(sourceSel, MORE, false);

buildOptions(targetSel, FEATURED, true);
const sep2 = document.createElement('option'); sep2.disabled = true; sep2.textContent = '────────';
targetSel.appendChild(sep2);
buildOptions(targetSel, MORE, false);

sourceSel.value = 'auto';
targetSel.value = 'es';

/* ================= AI Explanation DOM elements ================= */
/* These were being used throughout the file (explainTranslation,
   resetExplainUI, enableExplainUI) but were never actually initialized.
   That's the root cause of the Explain button doing nothing. */
const explainBtn = document.getElementById("explainBtn");
const aiExplanation = document.getElementById("aiExplanation");
const aiExplanationText = document.getElementById("aiExplanationText");

/* Helper used by explainTranslation() to turn a language code into a
   human-readable name using the same lists used for the selects. */
function langLabelForExplain(code){
  const entry = [...FEATURED, ...MORE].find(([c]) => c === code);
  return entry ? entry[1] : code;
}

/* Turns Groq's raw "Meaning: ... Tone: ... " text into tidy HTML blocks
   instead of one unformatted wall of text. Falls back to plain-text
   paragraphs (with basic **bold** -> <strong> handling) if the expected
   section headers aren't found, so unusual responses still display safely. */
function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatAIExplanation(raw){
  const knownHeadings = ['Alternative', 'Cultural Tip'];
  const headingPattern = knownHeadings.join('|');
  const regex = new RegExp(`(^|\\n)\\s*\\**(${headingPattern})\\**\\s*:?\\s*`, 'g');

  const matches = [...raw.matchAll(regex)];

  if(matches.length === 0){
    // No recognizable section headers — just render as paragraphs.
    return raw
      .split(/\n{2,}/)
      .map(p => `<p>${escapeHtml(p.trim()).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`)
      .join('');
  }

  let html = '';
  for(let i = 0; i < matches.length; i++){
    const heading = matches[i][2];
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : raw.length;
    const body = raw.slice(start, end).trim();
    if(!body) continue;
    html += `
      <div class="ai-section">
        <div class="ai-section-heading">${escapeHtml(heading)}</div>
        <div class="ai-section-body">${escapeHtml(body).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</div>
      </div>`;
  }
  return html || `<p>${escapeHtml(raw)}</p>`;
}

/* Explain button starts disabled until a translation exists. */
if (explainBtn) explainBtn.disabled = true;


/* ================= Offline phrasebook ================= */
/* Hand-curated common travel phrases in widely-used tourist languages.
   These work with zero connection. Free-typed text still needs a network call. */
const PHRASES = [
  "Hello, nice to meet you",
  "Thank you very much",
  "Where is the bathroom?",
  "How much does this cost?",
  "Can you help me, please?",
  "I don't understand",
  "Where is the nearest hospital?",
  "One ticket, please",
  "Is this the way to the station?",
  "I am allergic to nuts",
  "Call the police, please",
  "Do you speak English?"
];

const OFFLINE_PHRASEBOOK = {
  es: ["Hola, mucho gusto","Muchas gracias","¿Dónde está el baño?","¿Cuánto cuesta esto?","¿Puede ayudarme, por favor?","No entiendo","¿Dónde está el hospital más cercano?","Un boleto, por favor","¿Es este el camino a la estación?","Soy alérgico a los frutos secos","Llame a la policía, por favor","¿Habla inglés?"],
  fr:["Bonjour, enchanté(e)","Merci beaucoup","Où sont les toilettes ?","Combien ça coûte ?","Pouvez-vous m'aider, s'il vous plaît ?","Je ne comprends pas","Où est l'hôpital le plus proche ?","Un billet, s'il vous plaît","Est-ce le chemin vers la gare ?","Je suis allergique aux noix","Appelez la police, s'il vous plaît","Parlez-vous anglais ?"],
  de:["Hallo, freut mich","Vielen Dank","Wo ist die Toilette?","Wie viel kostet das?","Können Sie mir bitte helfen?","Ich verstehe nicht","Wo ist das nächste Krankenhaus?","Ein Ticket, bitte","Ist das der Weg zum Bahnhof?","Ich bin allergisch gegen Nüsse","Rufen Sie bitte die Polizei","Sprechen Sie Englisch?"],
  it:["Ciao, piacere di conoscerti","Grazie mille","Dov'è il bagno?","Quanto costa questo?","Può aiutarmi, per favore?","Non capisco","Dov'è l'ospedale più vicino?","Un biglietto, per favore","È questa la strada per la stazione?","Sono allergico alla frutta secca","Chiami la polizia, per favore","Parla inglese?"],
  pt:["Olá, prazer em conhecê-lo","Muito obrigado","Onde fica o banheiro?","Quanto custa isso?","Pode me ajudar, por favor?","Não entendo","Onde fica o hospital mais próximo?","Uma passagem, por favor","Este é o caminho para a estação?","Sou alérgico a nozes","Chame a polícia, por favor","Você fala inglês?"],
  ja:["はじめまして","どうもありがとうございます","お手洗いはどこですか？","これはいくらですか？","手伝っていただけますか？","わかりません","一番近い病院はどこですか？","切符を一枚お願いします","これは駅への道ですか？","ナッツアレルギーがあります","警察を呼んでください","英語を話せますか？"],
  ar:["مرحباً، سعدت بلقائك","شكراً جزيلاً","أين الحمام؟","كم يكلف هذا؟","هل يمكنك مساعدتي من فضلك؟","لا أفهم","أين أقرب مستشفى؟","تذكرة واحدة من فضلك","هل هذا هو الطريق إلى المحطة؟","لدي حساسية من المكسرات","اتصل بالشرطة من فضلك","هل تتحدث الإنجليزية؟"],
  "zh-CN":["你好，很高兴认识你","非常感谢","洗手间在哪里？","这个多少钱？","请问能帮我一下吗？","我不明白","最近的医院在哪里？","请给我一张票","这是去车站的路吗？","我对坚果过敏","请报警","你会说英语吗？"]
};
const OFFLINE_LANGS = Object.keys(OFFLINE_PHRASEBOOK);

function findOfflineTranslation(text, targetCode){
  const idx = PHRASES.findIndex(p => p.trim().toLowerCase() === text.trim().toLowerCase());
  if(idx === -1) return null;
  const table = OFFLINE_PHRASEBOOK[targetCode];
  if(!table) return null;
  return table[idx];
}

/* ================= Translate engines ================= */
async function googleEndpoint(text, sl, tl){
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('google-unavailable');
  const data = await res.json();
  const translated = data[0].map(seg => seg[0]).join('');
  const detected = data[2] || null;
  return { translated, detected };
}
async function myMemoryFallback(text, sl, tl){
  const from = sl === 'auto' ? 'en' : sl;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${tl}`;
  const res = await fetch(url);
  const data = await res.json();
  if(!data || !data.responseData) throw new Error('fallback-unavailable');
  return { translated: data.responseData.translatedText, detected: from };
}
async function translateOnline(text, sl, tl){
  try{ return await googleEndpoint(text, sl, tl); }
  catch(e){ return await myMemoryFallback(text, sl, tl); }
}


/* ================= Groq ================= */
async function explainTranslation() {
  if (!explainBtn || !aiExplanation || !aiExplanationText) return;

  const original = inputText.value.trim();
  const translated = lastTranslatedText;

  if (!original || !translated) return;

  const sourceLangName =
    sourceSel.value === "auto"
      ? "the detected language"
      : langLabelForExplain(sourceSel.value);

  const targetLangName = langLabelForExplain(targetSel.value);

  explainBtn.disabled = true;
  aiExplanation.style.display = "block";
  aiExplanationText.innerHTML = `<p class="ai-loading">✨ AI is analyzing the translation...</p>`;

  const prompt = `
You are a concise language tutor helping a traveler.

Original (${sourceLangName}):
"${original}"

Translation (${targetLangName}):
"${translated}"

Give a SHORT, to-the-point response in exactly this format (1 sentence per line, no extra commentary):

Alternative: one other common way to say this
Cultural Tip: one short, practical cultural tip a traveler would find useful

Keep it brief — no more than 2 short sentences total.
`;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.4,
          max_tokens: 100,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Groq request failed");
    }

    const data = await response.json();
    const rawExplanation = data.choices[0].message.content.trim();

    aiExplanationText.innerHTML = formatAIExplanation(rawExplanation);

  } catch (err) {
    console.error(err);
    aiExplanationText.innerHTML =
      `<p class="ai-error">Unable to generate AI explanation.</p>`;
  } finally {
    explainBtn.disabled = false;
  }
}

/* This was the missing piece: the button existed in the DOM and
   explainTranslation() was fully implemented, but nothing ever wired
   them together, so clicks did nothing. */
if (explainBtn) {
  explainBtn.addEventListener("click", explainTranslation);
}


function resetExplainUI() {
  if (!explainBtn || !aiExplanation || !aiExplanationText) return;

  explainBtn.disabled = true;
  aiExplanation.style.display = "none";
  aiExplanationText.textContent = "";
}

function enableExplainUI() {
  if (!explainBtn) return;

  explainBtn.disabled = false;
}

/* ================= Run translate ================= */
async function runTranslate(){
  const text = inputText.value.trim();
  if(!text){
    outputText.innerHTML = '<span class="placeholder-text">Your translation lands here.</span>';
    copyBtn.disabled = true;
    listenTargetBtn.disabled = true;
    resetExplainUI();
    detectedPill.classList.remove('show');
    statusLine.textContent = '';
    statusLine.classList.remove('error','offline-note');
    return;
  }

  const sl = sourceSel.value;
  const tl = targetSel.value;
  const seq = ++requestSeq;

  // Offline path: try the curated phrasebook first if we have no connection
  if(!navigator.onLine){
    const offline = findOfflineTranslation(text, tl);
    if(offline){
      outputText.textContent = offline;
      lastTranslatedText = offline;
      copyBtn.disabled = false;
      listenTargetBtn.disabled = false;
      enableExplainUI();
      detectedPill.classList.remove('show');
      statusLine.textContent = 'translated offline ⚡';
      statusLine.classList.remove('error');
      statusLine.classList.add('offline-note');
      void stamp.offsetWidth;
      stamp.textContent = 'offline ⚡';
      stamp.classList.remove('thud'); void stamp.offsetWidth; stamp.classList.add('thud');
      addToHistory(text, offline, sl, tl, null);
    }else{
      statusLine.textContent = "You're offline — free typing needs a connection. Try a saved phrase below.";
      statusLine.classList.remove('error');
      statusLine.classList.add('offline-note');
      resetExplainUI();
    }
    return;
  }

  statusLine.textContent = 'translating…';
  statusLine.classList.remove('error','offline-note');
  translateBtn.disabled = true;
  stamp.textContent = 'translated';
  stamp.classList.remove('thud');

  try{
    const { translated, detected } = await translateOnline(text, sl, tl);
    if(seq !== requestSeq) return;

    outputText.textContent = translated;
    lastTranslatedText = translated;
    copyBtn.disabled = false;
    listenTargetBtn.disabled = false;
    enableExplainUI();
    statusLine.textContent = '';

    if(sl === 'auto' && detected){
      const label = [...FEATURED, ...MORE].find(([c])=>c===detected);
      detectedPill.textContent = label ? label[1] : detected;
      detectedPill.classList.add('show');
    }else{
      detectedPill.classList.remove('show');
    }

    void stamp.offsetWidth;
    stamp.classList.add('thud');

    addToHistory(text, translated, sl, tl, detected);
  }catch(err){
    if(seq !== requestSeq) return;
    // last resort: check offline phrasebook even if "online" flag was wrong
    const offline = findOfflineTranslation(text, tl);
    if(offline){
      outputText.textContent = offline;
      lastTranslatedText = offline;
      copyBtn.disabled = false;
      listenTargetBtn.disabled = false;
      enableExplainUI();
      statusLine.textContent = 'translated offline ⚡';
      statusLine.classList.add('offline-note');
    }else{
      statusLine.textContent = 'Connection trouble — check your network and try again.';
      statusLine.classList.add('error');
      resetExplainUI();
    }
  }finally{
    if(seq === requestSeq) translateBtn.disabled = false;
  }
}

translateBtn.addEventListener('click', runTranslate);
inputText.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    runTranslate();
  }
});

/* ================= Swap ================= */
swapBtn.addEventListener('click', ()=>{
  if(sourceSel.value === 'auto'){
    statusLine.textContent = "Pick a specific source language first to swap.";
    statusLine.classList.add('error');
    setTimeout(()=>{ statusLine.textContent=''; statusLine.classList.remove('error'); }, 2200);
    return;
  }
  const sTmp = sourceSel.value;
  sourceSel.value = targetSel.value;
  targetSel.value = sTmp;

  inputText.value = lastTranslatedText;
  outputText.innerHTML = '<span class="placeholder-text">Your translation lands here.</span>';
  charCount.textContent = `${inputText.value.length} / 500`;
  if(inputText.value.trim()) runTranslate();
});

/* ================= Copy ================= */
copyBtn.addEventListener('click', async ()=>{
  try{
    await navigator.clipboard.writeText(lastTranslatedText);
    const original = copyBtn.innerHTML;
    copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    setTimeout(()=>{ copyBtn.innerHTML = original; }, 1200);
  }catch(e){
    statusLine.textContent = 'Could not copy — select and copy manually.';
    statusLine.classList.add('error');
  }
});


/* ================= Quick phrases ================= */
PHRASES.forEach(p=>{
  const btn = document.createElement('button');
  btn.className = 'phrase-tag offline-ready';
  btn.textContent = p;
  btn.title = 'Works offline for languages marked with ⚡ in the list';
  btn.addEventListener('click', ()=>{
    inputText.value = p;
    charCount.textContent = `${p.length} / 500`;
    runTranslate();
  });
  phraseGrid.appendChild(btn);
});

/* ================= History ================= */
function addToHistory(original, translated, sl, tl, detected){
  history.unshift({ original, translated, sl: (sl==='auto'? (detected||'auto'):sl), tl });
  history = history.slice(0,5);
  renderHistory();
}
function renderHistory(){
  if(!history.length){ historySection.style.display='none'; return; }
  historySection.style.display='block';
  historyList.innerHTML = '';
  history.forEach(item=>{
    const row = document.createElement('div');
    row.className = 'history-item';
    const original = document.createElement('span');
    original.textContent = item.original;
    const arrow = document.createElement('span');
    arrow.className = 'arrow'; arrow.textContent = '→';
    const translated = document.createElement('span');
    translated.className = 'h-from'; translated.textContent = item.translated;
    row.append(original, arrow, translated);
    row.addEventListener('click', ()=>{
      inputText.value = item.original;
      sourceSel.value = item.sl === 'auto' ? 'auto' : item.sl;
      targetSel.value = item.tl;
      charCount.textContent = `${item.original.length} / 500`;
      runTranslate();
    });
    historyList.appendChild(row);
  });
}