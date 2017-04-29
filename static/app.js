// アプリ起動時
window.addEventListener('DOMContentLoaded', () => {
  startIntro().then(() => {
    // ボタンの表示
    document.querySelector('.js-btn-group').classList.add('--visible');
    // ボタンクリック時の挙動の設定
    document.getElementById('startButton').onclick = handleStartButtonClick;
    document.getElementById('stopButton').onclick = handleStopButtonClick;
  });
});

let recognition;
// 開始ボタンを押したときのイベント
function handleStartButtonClick() {
  recognition = new webkitSpeechRecognition();
  recognition.lang = 'ja';
  // 音声認識開始時のイベント
  recognition.onstart = function() {
    console.log('onstart');
    document.querySelector('.js-btn-group').classList.add('--recording');
  };
  // 音声認識エラー発生時のイベント
  recognition.onerror = function(event) {
    console.log('on error:', event.error);
    document.querySelector('.js-btn-group').classList.remove('--recording');
  };
  // 音声認識終了時のイベント
  recognition.onend = function() {
    console.log('onend');
    document.querySelector('.js-btn-group').classList.remove('--recording');
  };
  // 音声認識の結果
  recognition.onresult = event => {
    console.log(event.results);
    let voice = event.results.item(0).item(0).transcript;
    if (voice.indexOf('ニュース') !== -1) {
      // 「ニュース」が音声に合った場合APIでニュースを取得
      showRecommendArticle();
    } else {
      let synthes = new SpeechSynthesisUtterance('ごめんなさい、ニュース以外はわかりません');
      synthes.lang ="ja-JP";
      speechSynthesis.speak(synthes);
    }
  };
  recognition.start();
}

// 停止ボタンを押した場合のイベント
function handleStopButtonClick() {
  if (recognition) {
    recognition.stop();
  }
}

// 音声入力を読み取ったら発火
function showRecommendArticle() {
  api('/api/recommend_article').then(response => {
    let {content, link} = JSON.parse(response);
    // console.log(content);
    content = content.split("-")[0];
    let synthes = new SpeechSynthesisUtterance(content);
    synthes.lang = "ja-JP";
    speechSynthesis.speak(synthes);

    document.getElementById('text').innerHTML = `<a href="${link}">${content}</a>`;
  });
}

// アプリ起動時のメッセージ
function startIntro() {
  let elm = document.getElementById('text');
  return new Promise((resolve, reject) => {

    let synthes = new SpeechSynthesisUtterance("おすすめのニュースを教えてと聞いてみてください。");
    synthes.lang = "ja-JP";
    speechSynthesis.speak(synthes);

    let texts = "「おすすめのニュースを教えて」と聞いてみてください。".split('');
    function showMessage(texts, cb) {
      if (texts.length === 0) {
        return cb();
      }
      let ch = texts.shift();
      elm.innerHTML += ch;
      console.log(elm.innerHTML);
      setTimeout(() => {
        showMessage(texts, cb);
      }, 120);
    }
    elm.innerHTML = '';
    showMessage(texts, resolve);
  });
}

// Ajaxでサーバーと通信する
function api(url) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onreadystatechange = function(e) {
      if (this.readyState === 4 && this.status === 200) {
        resolve(this.responseText);
      }
    };
    xhr.send();
  });
}

// クリックで挙動の確認用
// document.addEventListener('click', () => {
//   // Ajaxで取得したニュースを表示
//   api('/api/recommend_article').then(response => {
//     let {content, link} = JSON.parse(response);
//     console.log(content);
//     document.getElementById('text').innerHTML = `<a href="${link}">${content}</a>`
//     content = content.split("-")[0];
//     let synthes = new SpeechSynthesisUtterance(content);
//     synthes.lang = "ja-JP";
//     speechSynthesis.speak(synthes);

//   });
// });