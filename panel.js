// ========================================
// Class Weapon
// panel.js (字幕表示対応版)
// ========================================

// ========================================
// 授業翻訳
// ========================================
async function translateText() {
  const text = document.getElementById("jpInput").value;
  const resultDiv = document.getElementById("translateResult");

  if (!text) {
    resultDiv.innerHTML = "";
    document.getElementById("sentenceResult").innerHTML = "";
    return;
  }

  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=th&dt=t&q=" +
    encodeURIComponent(text);

  const res = await fetch(url);
  const data = await res.json();
  const translated = data[0].map(t => t[0]).join("");

  // サイドパネル表示
  resultDiv.innerHTML = `<span class="translated">${translated}</span>`;

  // ===== 文サポート連動 =====
  sentenceSupport();

  // ===== 字幕表示 =====
  //openSubtitleWindow(translated);
}

// ========================================
// 字幕用ウィンドウ表示
// ========================================
let subtitlePopup = null;
function openSubtitleWindow(translated) {
  if (!translated) return;

  // ウィンドウが開いていなければ新規作成
  if (!subtitlePopup || subtitlePopup.closed) {
    subtitlePopup = window.open(
      "",
      "SubtitlePopup",
      "width=800,height=100,left=100,top=600,resizable=yes,scrollbars=no"
    );

    subtitlePopup.document.write(`
      <html>
      <head>
        <style>
          body {
            margin:0;
            font-family:sans-serif;
            background:#000;
            color:#fff;
            display:flex;
            align-items:center;
            justify-content:center;
            height:100%;
          }
          .subtitle {
            font-size:2em;
            font-weight:normal;
            line-height:1.4;
          }
        </style>
      </head>
      <body>
        <div class="subtitle" id="subtitleContent">${translated}</div>
      </body>
      </html>
    `);
  } else {
    // 既存ウィンドウがあれば内容を更新
    const content = subtitlePopup.document.getElementById("subtitleContent");
    if (content) content.innerText = translated;
  }
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
    //"https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=th&dt=t&q=" +
    //encodeURIComponent(word);

  //const res = await fetch(url);
  //const data = await res.json();
  //const translated = data[0].map(t => t[0]).join("");

  //resultDiv.innerHTML = `<span class="translated">${translated}</span>`;
//}

// ========================================
// 文サポート
// ========================================
async function sentenceSupport() {
  const text = document.getElementById("jpInput").value;
  const resultDiv = document.getElementById("sentenceResult");

  if (!text) {
    resultDiv.innerHTML = "";
    return;
  }

  resultDiv.innerHTML = "解析中...";

  let words = text.split(/は|が|を|に|で|と|も|へ|や|の|、|。|\s/);
  words = words.filter(w => w.trim() !== "");
  words = [...new Set(words)];

  let html = "";
  for (const word of words) {
    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=th&dt=t&q=" +
      encodeURIComponent(word);

    const res = await fetch(url);
    const data = await res.json();
    const translated = data[0].map(t => t[0]).join("");

    html += `<div class="wordRow" data-word="${word}">
      <span>${word}</span>
      <span class="translated">${translated}</span>
    </div>`;
  }

  resultDiv.innerHTML = html;

}

// ========================================
// 初期設定
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  const textarea = document.getElementById("jpInput");
  const resultDiv = document.getElementById("translateResult");
  
  const sentenceResult = document.getElementById("sentenceResult");

  // ===== 入力欄変更時に結果をクリア =====
  textarea.addEventListener("input", function() {
if (!this.value) {
  resultDiv.innerHTML = "";
  sentenceResult.innerHTML = "";
}
  });

  // ===== ボタンイベント =====
  document.getElementById("translateBtn").addEventListener("click", translateText);

  document.getElementById("clearBtn").addEventListener("click", function () {

    document.getElementById("jpInput").value = "";
    document.getElementById("translateResult").innerHTML = "";
    document.getElementById("sentenceResult").innerHTML = "";

  });

  // ===== Enterキーで実行 =====
  textarea.addEventListener("keydown", function(e) { if (e.key === "Enter") { e.preventDefault(); translateText(); }});

});
