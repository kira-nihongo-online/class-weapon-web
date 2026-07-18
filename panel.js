// ========================================
// Class Weapon
// panel.js (字幕表示対応版)
// ========================================

// ========================================
// 授業翻訳
// ========================================
async function translateText() {
  const text = document.getElementById("inputText").value;
  const resultDiv = document.getElementById("translateResult");
  const sourceLang = document.getElementById("sourceLang").value;
  const targetLang = document.getElementById("targetLang").value;

  if (!text) {
    resultDiv.innerHTML = "";
    document.getElementById("sentenceResult").innerHTML = "";
    return;
  }

  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
    sourceLang +
    "&tl=" +
    targetLang +
    "&dt=t&q=" +
    encodeURIComponent(text);

  const res = await fetch(url);
  const data = await res.json();
  const translated = data[0].map(t => t[0]).join("");

  // サイドパネル表示
  resultDiv.innerHTML = `<span class="translated">${translated}</span>`;

  wordSupport();

 // 翻訳後に自動で1回再生
 Voice.speak(translated, targetLang);

}

// ========================================
// 単語辞書
// ========================================
//async function searchWord() {
  //const word = document.getElementById("dictInput").value;
  //const resultDiv = document.getElementById("dictResult");

  //if (!word) {
    //resultDiv.innerHTML = "";
    //return;
  //}

  //const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=th&dt=t&q=" +
    //encodeURIComponent(word);

  //const res = await fetch(url);
  //const data = await res.json();
  //const translated = data[0].map(t => t[0]).join("");

  //resultDiv.innerHTML = `<span class="translated">${translated}</span>`;
//}

// ========================================
// 初期設定
// ========================================
document.addEventListener("DOMContentLoaded", function () {

  Voice.init();  

  const textarea = document.getElementById("inputText");
  const resultDiv = document.getElementById("translateResult");

  const sentenceResult = document.getElementById("sentenceResult");

  const copyBtn = document.getElementById("copyInputBtn");
  console.log(copyBtn);

  copyBtn.onclick = function () {
      alert("クリックされた");
  };

  // ===== 入力欄変更時に結果をクリア =====
  textarea.addEventListener("input", function() {
if (!this.value) {
  resultDiv.innerHTML = "";
  sentenceResult.innerHTML = "";
}
  });

  // ===== ボタンイベント =====

  document.getElementById("micBtn").addEventListener("click", function () {

      const sourceLang = document.getElementById("sourceLang").value;

      if (recognition) {

          if (sourceLang === "ja") {
              recognition.lang = "ja-JP";
          } else if (sourceLang === "th") {
              recognition.lang = "th-TH";
          } else if (sourceLang === "en") {
              recognition.lang = "en-US";
          }

          recognition.start();
      }

      });

  document.getElementById("translateBtn").addEventListener("click", translateText);

  document.getElementById("clearBtn").addEventListener("click", function () {

    document.getElementById("inputText").value = "";
    document.getElementById("translateResult").innerHTML = "";
    document.getElementById("sentenceResult").innerHTML = "";

  });

  // ===== Enterキーで実行 =====
  textarea.addEventListener("keydown", function(e) { if (e.key === "Enter") { e.preventDefault(); translateText(); }});

  document.getElementById("jpMode").addEventListener("click", function () {

    speakMode = "ja";

    this.classList.add("active");
    document.getElementById("thMode").classList.remove("active");

  });

  document.getElementById("thMode").addEventListener("click", function () {

    speakMode = "th";

    this.classList.add("active");
    document.getElementById("jpMode").classList.remove("active");

  });

});

// ========================================
// 単語サポート
// ========================================
async function wordSupport() {

  const sourceLang = document.getElementById("sourceLang").value;

  const text = document.getElementById("inputText").value;
  const resultDiv = document.getElementById("sentenceResult");

  if (!text) {
    resultDiv.innerHTML = "";
    return;
  }

  resultDiv.innerHTML = "解析中...";

  if (sourceLang !== "ja") {
    resultDiv.innerHTML = "単語サポートは日本語入力のみ対応しています。";
    return;
  }

  const tokens = tokenizer.tokenize(text);

  const words = tokens.filter(token => {

    // 助詞を除外
    if (token.pos === "助詞") return false;

    // 記号を除外
    if (token.pos === "記号") return false;

    return true;

  });

  let html = "";

  for (const token of words) {

    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=th&dt=t&q=" +
      encodeURIComponent(token.surface_form);

    const res = await fetch(url);
    const data = await res.json();

    const translated = data[0].map(t => t[0]).join("");

    html += `
    <div class="wordRow">

      <span>${token.surface_form}</span>

      <span class="translated">${translated}</span>

      <button
        class="wordSpeak"
        data-ja="${token.surface_form}"
        data-th="${translated}">
        🔊
      </button>

    </div>
    `;

  }

  resultDiv.innerHTML = html;

  resultDiv.querySelectorAll(".wordSpeak").forEach(button => {

    button.addEventListener("click", function () {

      if (speakMode === "ja") {
        Voice.speak(this.dataset.ja, "ja");
      } else {
        Voice.speak(this.dataset.th, "th");
      }

    });

  });

 }

// ========================================
// Kuromoji
// ========================================
let tokenizer = null;

kuromoji.builder({
  dicPath: "dict"
}).build(function(err, t) {

  if (err) {
    console.error(err);
    return;
  }

  tokenizer = t;
  console.log("Kuromoji Ready");

});

let speakMode = "ja";

// ========================================
// Speech Recognition
// ========================================
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;

if (SpeechRecognition) {

  recognition = new SpeechRecognition();

  recognition.lang = "ja-JP";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onresult = function (event) {

    const text = event.results[0][0].transcript;

    document.getElementById("inputText").value = text;

    translateText();

  };

  recognition.onstart = function () {

    const micBtn = document.getElementById("micBtn");

    micBtn.textContent = "🎙️";
    micBtn.classList.add("listening");

  };

  recognition.onend = function () {

    const micBtn = document.getElementById("micBtn");

    micBtn.textContent = "🎤";
    micBtn.classList.remove("listening");

  };

}

// ========================================
// Voice Controller
// ========================================
const Voice = (function () {

  let ready = false;
  let voiceJP = null;
  let voiceTH = null;
  let voiceEN = null;

  function init() {

    const setVoices = () => {

      const voices = speechSynthesis.getVoices();

      voiceJP =
        voices.find(v => v.name.includes("七海")) ||
        voices.find(v => v.lang === "ja-JP");

      voiceTH =
        voices.find(v => v.name.includes("เปรมวดี")) ||
        voices.find(v => v.lang === "th-TH");

      voiceEN =
        voices.find(v => v.name.includes("Jenny")) ||
        voices.find(v => v.lang.startsWith("en"));

      if (voiceJP || voiceTH || voiceEN) {
        ready = true;
      }

    };

    setVoices();
    speechSynthesis.onvoiceschanged = setVoices;

  }

  function speak(text, lang) {

    if (!ready || !text) return;

    const uttr = new SpeechSynthesisUtterance(text);

    if (lang === "ja") {
      uttr.lang = "ja-JP";
      if (voiceJP) uttr.voice = voiceJP;
    }

    if (lang === "th") {
      uttr.lang = "th-TH";
      if (voiceTH) uttr.voice = voiceTH;
    }

    if (lang === "en") {
      uttr.lang = "en-US";
      if (voiceEN) uttr.voice = voiceEN;
    }

    speechSynthesis.cancel();
    speechSynthesis.speak(uttr);

  }

  return {
    init,
    speak
  };

})();

// ========================================
// 音声ボタン
// ========================================
document.getElementById("speakBtn").addEventListener("click", function () {

  const text =
    document.getElementById("translateResult").innerText.trim();

  if (!text) return;

  const lang =
    document.getElementById("targetLang").value;

  Voice.speak(text, lang);

});

console.log(kuromoji);
