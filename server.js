// load http module
const http = require('http');
const fs = require('fs');
const url = require('url');

// create http server
http.createServer(function (req, res) {
  const URL = req.url;
  if(URL === '/') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(fs.readFileSync('index.html'));
    return;
  }
  const action = url.parse(req.url, true).pathname;
  // post requests
  if(req.method === 'POST') {
    let body = '';
    req.on('data', function(data) {
      body += data;
    });
    req.on('end', function() {
      res.writeHead(200, {'Content-Type':'text/html'});
      res.end('post received');
      //console.log('action: "' + action + '", body: "' + body + '"');
      fs.writeFile(__dirname + action, body, function(err) {
        if(err) {
          console.log(err.message);
        }
        else {
          console.log(action + ' written');
        }
      });
    })
  } else if(req.method === 'GET') {
    const contentType = action.substr(action.lastIndexOf('.') + 1);
    let img;
    switch(contentType) {
    case 'png':
      img = fs.readFileSync('.' + action);
      res.writeHead(200, {'Content-Type':'image/png'});
      res.end(img, 'binary');
      break;
    case 'jpg':
      img = fs.readFileSync('.' + action);
      res.writeHead(200, {'Content-Type':'image/jpeg'});
      res.end(img, 'binary');
      break;
    case 'ico':
      img = fs.readFileSync('.' + action);
      res.writeHead(200,
        {'Content-Type':'image/vnd.microsoft.icon'});
      res.end(img, 'binary');
      break;
    case 'ttf':
      const font = fs.readFileSync('.' + action);
      res.writeHead(200,{'Content-Type':'font/ttf'});
      res.end(font, 'binary');
      break;
    case 'mp3':
      const sound = fs.readFileSync('.' + action);
      res.writeHead(200, {'Content-Type':'audio/mpeg'});
      res.end(sound, 'binary');
      break;
    case 'css':
      fs.readFile('.' + action, 'utf8', function(err, data) {
        res.writeHead(200, {'Content-Type':'text/css'});
        res.write(data);
        res.end();
      });
      break;
    case 'js':
      fs.readFile('.' + action, 'utf8', function(err, data) {
        res.writeHead(200, {'Content-Type':'text/javascript'});
        res.write(data);
        res.end();
      });
      break;
      case 'svg':
        fs.readFile('.' + action, 'utf8', function(err, data) {
          res.writeHead(200, {'Content-Type':'image/svg+xml'});
          res.write(data);
          res.end();
        });
        console.log('serving up SVG file: ' + action);
        break;
      case 'json':
        fs.readFile('.' + action, 'utf8', (err, data) => {
          //console.log(`callback for reading "${action}"`);
          if(err) {
            //console.log(`message:${err.message}, name:${err.name}`);
            res.end(err.name);
          } else {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(data);
            res.end();
          }
        });
        console.log('trying to serving up JSON file: ' + action);
        break;
    default:
      const parsed = url.parse(URL, true).query;
      if(parsed.passcode === 'getPasscode') {
        const charPool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`~!@#$%^&*()-_=+[{]}\\|;:\'",<.>/?';
        let content = '';
        for(let i = 0; i < 10; i++) {
          content += charPool[Math.floor(Math.random() * charPool.length)];
        }
        res.end(JSON.stringify({passcode:content}));
      }
    }
  } else {
    console.log('unhandled request method: ' + req.method);
  }
}).listen(5000, '127.0.0.1', function() {
  console.log('remote sentry server on');
});
