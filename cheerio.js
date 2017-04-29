const cheerio = require('cheerio-httpcli');
const http = require('http');
const fs = require('fs');

var i = 0;
var content = '';

http.createServer((req, res) => {
  if (req.url == '/' && req.method == 'GET') {
    fs.readFile('./templates/index.html', 'utf-8', (err, html) => {
      res.end(html);
    });
  }

  if (req.url == '/static/human.png') {
    fs.readFile('./static/human.png', (err, png) => {
      res.end(png, {'Content-Type': 'image/png'}, 200);
    });
  }

  if (req.url == '/static/app.js' && req.method == 'GET') {
    fs.readFile('./static/app.js', 'utf-8', (err, js) => {
      res.end(js);
    });
  }

  if (req.url == '/api/recommend_article') {
    return new Promise((resolve, reject) => {
    
      cheerio.fetch('http://b.hatena.ne.jp/hotentry',　{}, (err, $, res) => {
        $('.entry-link').each(function(idx) {
          i = idx;
          console.log(idx);
          console.log($(this).text());
        });
        var rand = Math.ceil(Math.random()*i);
        content = $('.entry-link').eq(rand).text();
        link = $('.entry-link').eq(rand).attr('href');
        console.log(content);
        console.log(link);
        resolve(content, link);
      });
    })
    .then(content => {
      console.log(content);
      res.end(JSON.stringify({content: content, link:link}));
    });
  }

}).listen(5000, () => console.log('Listen at *:5000'));
