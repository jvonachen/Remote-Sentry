'use strict'

class Button {
  constructor(p) {
    this.x = p[0]; this.y = p[1]; this.w = p[2]; this.h = p[3];
    this.f = p[4]; // fillet radius
    this.lw = p[5]; this.s = p[6]; this.ss = p[7]; this.fl = p[8];
    this.fs = p[9]; this.t = p[10]; this.tfs = p[11]; this.fontSize = p[12];
    this.callback = p[13]; this.skip = p[14]; this.id = p[15]; this.ch = p[16];
    this.toggle = false; // not on whatever that means for this button
  }

  draw() {
    if(!this.skip) {
      if(this.fl) ctxGameArea.fillStyle = this.toggle ? invertColor(this.fs) : this.fs;
      if(this.s) ctxGameArea.strokeStyle = this.toggle ? invertColor(this.ss) : this.ss;
      ctxGameArea.lineWidth = this.lw;
      ctxGameArea.beginPath();
      ctxGameArea.moveTo(this.x, this.y + this.f);

      if(this.ch) ctxGameArea.lineTo(this.x + this.f, this.y);
      else ctxGameArea.arcTo(this.x, this.y, this.x + this.f, this.y,
        this.f);

      ctxGameArea.lineTo(this.x + this.w - this.f, this.y);

      if(this.ch) ctxGameArea.lineTo(this.x + this.w,this.y + this.f);
      else ctxGameArea.arcTo(this.x + this.w, this.y,this.x + this.w,
        this.y + this.f, this.f);

      ctxGameArea.lineTo(this.x + this.w,this.y + this.h - this.f);

      if(this.ch) ctxGameArea.lineTo(this.x + this.w - this.f,
        this.y + this.h);
      else ctxGameArea.arcTo(this.x + this.w,this.y + this.h,
        this.x + this.w - this.f,this.y + this.h, this.f);

      ctxGameArea.lineTo(this.x + this.f, this.y + this.h);

      if(this.ch) ctxGameArea.lineTo(this.x, this.y + this.h - this.f);
      else ctxGameArea.arcTo(this.x, this.y + this.h, this.x,
        this.y - this.f, this.f);

      ctxGameArea.lineTo(this.x, this.y + this.f);

      if(this.fl) {
        //ctxGameArea.globalAlpha = 0.5;
        ctxGameArea.fill();
        ctxGameArea.globalAlpha = 1.0;
      }
      if(this.s) ctxGameArea.stroke();
      ctxGameArea.fillStyle = this.toggle ? invertColor(this.tfs) : this.tfs;
      ctxGameArea.font = this.fontSize + 'px apple2';
      const o = ctxGameArea.measureText(this.t);
      ctxGameArea.fillText(this.t,this.x + this.w / 2 - o.width / 2,
        this.y + this.h / 2 + o.actualBoundingBoxAscent / 2);
    }
  }

  clickCheck(x, y) {
    let returnVal = false;
    if(!this.skip) {
      if(x > this.x && x < this.x + this.w && y > this.y &&
        y < this.y + this.h) {
        this.callback();
        returnVal = true;
      }
    }
    return returnVal;
  }
}

const go = function() {
  // change the skip status of various buttons
  getButton('go').skip = true;
  getButton('stop').skip = false;
  getButton('pause').skip = false;
  for (let j = 0; j < MAZE_TYPES.length; j++) {
    getButton(MAZE_TYPES[j]).skip = true;
  }
  // The sentry buttons
  for (let j = 1; j < 11; j++) { getButton('S' + j).skip = false; }

  getButton('up').skip = false;
  getButton('repair').skip = false;
  getButton('behavior').skip = false;
  getButton('nuke!').skip = false;
  getButton('splash').skip = true;
  getButton('panUp').ss = '#808080';
  getButton('panDown').ss = '#808080';
  getButton('panLeft').ss = '#808080';
  getButton('panRight').ss = '#808080';

  seconds = 0;
  playBackgroundMusicLoop();

  const fontSize = 10;
  const rowInc = fontSize * 1.5;
  const column = 10;

  let row = 80;
  const indicateTime = function() {
    return `elapsed time:${toHHMMSS(Math.round(seconds))}`;
  };
  aces.push(new Ace(['text', indicateTime, column,
    row, fontSize, true, false, 0, 255, 0, 1, null, null, null, null,
    ['elapsedTime']]));

  row += rowInc * 2;
  numberOfColonists = INITIAL_COLONISTS;
  const indicateNumberOfColonists = function() {
    return `col:${Math.round(numberOfColonists)}/${INITIAL_COLONISTS}`;
  };
  aces.push(new Ace(['text', indicateNumberOfColonists, column, row,
    fontSize, true, false, 0, 255, 0, 1, null, null, null, null,
    ['goodColonists']]));

  row += rowInc;
  aces.push(new Ace(['text', 'aliens:', column, row, fontSize,
    true, false, 0, 255, 0, 1, null, null, null, null, ['aliensMurdered']]));
  row += rowInc;
  aliensMurdered = 0;
  const indicateAliensMurdered = function() {
    return `Xed in maze:${aliensMurdered}`;
  };
  aces.push(new Ace(['text', indicateAliensMurdered, column + 10, row,
    fontSize, true, false, 0, 255, 0, 1, null, null, null, null,
    ['aliensMurdered']]));

  row += rowInc;
  aliensEscaped = 0; // initial number of colonists
  const indicateAliensEscaped = function() {
    return `escaped:${aliensEscaped}`;
  };
  aces.push(new Ace(['text', indicateAliensEscaped, column + 10, row,
    fontSize, true, false, 0, 255, 0, 1, null, null, null, null,
    ['aliensEscaped']]));

  row += rowInc;
  aliensMurderedByColonists = 0;
  const indicateAliensMurderedByColonists = function() {
    return `Xed in colony:${Math.round(aliensMurderedByColonists)}`;
  };
  aces.push(new Ace(['text', indicateAliensMurderedByColonists, column + 10,
    row, fontSize, true, false, 0, 255, 0, 1, null, null, null, null,
    ['aliensMurdered']]));

  row += rowInc;
  sentriesDestroyed = 0;
  const indicateSentriesDestroyed = function() {
    return `sentries destroyed:${sentriesDestroyed}`;
  };
  aces.push(new Ace(['text', indicateSentriesDestroyed, column, row, fontSize,
    true, false, 0, 255, 0, 1, null, null, null, null, ['sentriesDestroyed']]));

  row += rowInc * 2;
  points = 0;
  const indicatePoints = function() { return `points:${Math.round(points)}`; };
  aces.push(new Ace(['text', indicatePoints, column, row, fontSize, true,
    false, 0, 255, 0, 1, null, null, null, null, ['points']]));

  resize();
  spawned = 0;
  spawnTimerHandle = setInterval(spawn, 1000);
};

const stop = function() {
  // stop spawning aliens
  clearInterval(spawnTimerHandle);
  for(let i = 0; i < alienTypes.length; i++) {
    clearInterval(alienTypes[i].intervalHandle);
  }

  // destroy all aliens now!
  for(let i = 0; i < aliens.length; i++) { aliens[i].destructor(); }
  aliens.splice(0, aliens.length);

  // destroy all sentries now!
  for(let i = 0; i < sentries.length; i++) { sentries[i].destructor(); }
  sentries.splice(0, sentries.length);

  // change the skip status of various buttons
  getButton('go').skip = false;
  getButton('stop').skip = true;
  getButton('pause').skip = true;
  const mazeTypes = ['ortho', 'sigma', 'delta', 'tri', 'hex'];
  for (let j = 0; j < mazeTypes.length; j++) {
    const b = getButton(mazeTypes[j]);
    b.skip = false;
    b.ss = '#00FF00';
  }
  for (let j = 1; j < 11; j++) { getButton('S' + j).skip = true; }
  getButton('up').skip = true;
  getButton('repair').skip = true;
  getButton('behavior').skip = true;
  getButton('nuke!').skip = true;
  getButton('splash').skip = false;

  ctxBloodCanvas.clearRect(0, 0, bloodCanvas.width, bloodCanvas.height);

  aces.splice(getAces('elapsedTime', true)[0], 1);
  aces.splice(getAces('goodColonists', true)[0], 1);
  aces.splice(getAces('colonistsGone', true)[0], 1);
  aces.splice(getAces('aliensEscaped', true)[0], 1);
  aces.splice(getAces('aliensMurdered', true)[0], 1);
  aces.splice(getAces('sentriesDestroyed', true)[0], 1);
  aces.splice(getAces('points', true)[0], 1);
  aces.splice(getAces('initialColonists', true)[0], 1);
  aces.splice(getAces('aliensMurdered', true)[0], 1);
};

// TBD
const pause = function() {
  const o = getButton('pause');
  o.toggle = !o.toggle;
  paused = o.toggle;
};

// pan buttons
const panInc = 50;
const panLeft =  function() { xOffset += panInc; positionBloodCanvas(); };
const panRight = function() { xOffset -= panInc; positionBloodCanvas(); };
const panUp =    function() { yOffset += panInc; positionBloodCanvas(); };
const panDown =  function() { yOffset -= panInc; positionBloodCanvas(); };

const positionBloodCanvas = function() {
  bloodCanvas.style.left = bloodXOffset + xOffset + 'px';
  bloodCanvas.style.top = bloodYOffset + yOffset + 'px';
};

const sentry = function(o) {
  sentries.push(new Sentry([o.id, o.tfs]));
};

// editing button functions
let firstVertexForEdge = -1;
const addEdge = function() {
  if(editVertexIndex > -1) firstVertexForEdge = editVertexIndex;
};

let editEdgeIndex = -1;
const delEdge = function() {
  if(editEdgeIndex > -1) {
    edges.splice(editEdgeIndex, 1);
    editEdgeIndex = -1;
    saveJSON();
  }
};

const vertexY = function(i) {
  if(editVertexIndex > -1) {
    vertices[editVertexIndex].y += i * (1 / METERS_TO_PIXELS);
    saveJSON();
  }
};

const vertexX = function(i) {
  if(editVertexIndex > -1) {
    vertices[editVertexIndex].x += i * (1 / METERS_TO_PIXELS);
    saveJSON();
  }
};

// When in "add vertex" mode everywhere that is clicked adds a vertex
const addVertex = function(o) {
  getButton('delVertex').toggle = false;
  o.toggle = !o.toggle;
};

const delVertex = function(o) {
  getButton('addVertex').toggle = false;
  o.toggle = !o.toggle;
};

const entranceVertex = function() {
  if(editVertexIndex > -1) {
    const v = vertices[editVertexIndex];
    v.entrance = !v.entrance;
    saveJSON();
  }
};

const exitVertex = function() {
  if(editVertexIndex > -1) {
    const v = vertices[editVertexIndex];
    v.exit = !v.exit;
    saveJSON();
  }
};

const upgrade = function() { alert('repair, upgrade and reload a sentry'); };
const repair = function() { alert('repair and reload a sentry'); };
const nuke = function() { alert('Nuke the colony!  It\'s the only way to make sure.'); };
const behavior = function() { alert('change the behavior of a sentry'); };

let edit = false;
const toggleEdit = function() {
  edit = !edit;
  getButton('addEdge').skip = !edit;
  getButton('delEdge').skip = !edit;
  getButton('vertexUp').skip = !edit;
  getButton('vertexDown').skip = !edit;
  getButton('vertexLeft').skip = !edit;
  getButton('vertexRight').skip = !edit;
  getButton('vertexBigUp').skip = !edit;
  getButton('vertexBigDown').skip = !edit;
  getButton('vertexBigLeft').skip = !edit;
  getButton('vertexBigRight').skip = !edit;
  getButton('addVertex').skip = !edit;
  getButton('delVertex').skip = !edit;
  getButton('exitVertex').skip = !edit;
  getButton('entranceVertex').skip = !edit;
};

const buttonsM = [
  //  x    y   w   h   f lw     s         ss   fill         fs      text     textFS  font  callback   skip             id chamfered
  [1293,  11, 60, 60, 10, 1,  true, '#00FF00', false, '#000000',     'OR', '#808080', '25', mazeMenu, false,      'ortho', true],
  [1293,  83, 60, 60, 10, 1,  true, '#00FF00', false, '#000000',     'SG', '#808080', '25', mazeMenu, false,      'sigma', true],
  [1293, 155, 60, 60, 10, 1,  true, '#00FF00', false, '#000000',     'DT', '#808080', '25', mazeMenu, false,      'delta', true],
  [1293, 227, 60, 60, 10, 1,  true, '#00FF00', false, '#000000',     'TR', '#808080', '25', mazeMenu, false,        'tri', true],
  [1293, 299, 60, 60, 10, 1,  true, '#00FF00', false, '#000000',     'HX', '#808080', '25', mazeMenu, false,        'hex', true],

  [1221,  11, 60, 60, 10, 1,  true, '#808080', false, '#000000',  'S1',  WHITE_BELT_COLOR, '25', function() { sentry(this) }, true,  'S1', true],
  [1293,  11, 60, 60, 10, 1,  true, '#808080', false, '#000000',  'S2', YELLOW_BELT_COLOR, '25', function() { sentry(this) }, true,  'S2', true],
  [1221,  82, 60, 60, 10, 1,  true, '#808080', false, '#000000',  'S3', ORANGE_BELT_COLOR, '25', function() { sentry(this) }, true,  'S3', true],
  [1293,  82, 60, 60, 10, 1,  true, '#808080', false, '#000000',  'S4',  GREEN_BELT_COLOR, '25', function() { sentry(this) }, true,  'S4', true],
  [1221, 154, 60, 60, 10, 1,  true, '#808080', false, '#000000',  'S5',   BLUE_BELT_COLOR, '25', function() { sentry(this) }, true,  'S5', true],
  [1293, 154, 60, 60, 10, 1,  true, '#808080', false, '#000000',  'S6', PURPLE_BELT_COLOR, '25', function() { sentry(this) }, true,  'S6', true],
  [1221, 226, 60, 60, 10, 1,  true, '#808080', false, '#000000',  'S7',  BROWN_BELT_COLOR, '25', function() { sentry(this) }, true,  'S7', true],
  [1293, 226, 60, 60, 10, 1,  true, '#808080', false, '#000000',  'S8',    RED_BELT_COLOR, '25', function() { sentry(this) }, true,  'S8', true],
  [1221, 298, 60, 60, 10, 1,  true, '#FFFFFF',  true, '#FFFFFF',  'S9',  BLACK_BELT_COLOR, '25', function() { sentry(this) }, true,  'S9', true],
  [1293, 298, 60, 60, 10, 1,  true, '#808080', false, '#000000', 'S10',   PINK_BELT_COLOR, '20', function() { sentry(this) }, true, 'S10', true],

  [1221, 380, 60, 60, 10, 1,  true, '#808080', false, '#000000',     'UP', '#808080', '25',   upgrade,  true,         'up', true],
  [1293, 380, 60, 60, 10, 1,  true, '#808080', false, '#000000',     'RE', '#808080', '25',   repair,  true,     'repair', true],
  [1221, 452, 60, 60, 10, 1,  true, '#808080', false, '#000000',     'BH', '#808080', '25',  behavior,  true,   'behavior', true],
  [1293, 452, 60, 60, 30, 1,  true, '#FF0000',  true, '#FF0000',   'NUKE', '#000000', '15',   nuke,  true,      'nuke!',false],

  [1272, 520, 30, 30,  5, 1,  true, '#00FF00', false, '#000000',      'U', '#808080', '15',    panUp,  true,      'panUp', true],
  [1272, 580, 30, 30,  5, 1,  true, '#00FF00', false, '#000000',      'D', '#808080', '15',  panDown,  true,    'panDown', true],
  [1242, 550, 30, 30,  5, 1,  true, '#00FF00', false, '#000000',      'L', '#808080', '15',  panLeft,  true,    'panLeft', true],
  [1302, 550, 30, 30,  5, 1,  true, '#00FF00', false, '#000000',      'R', '#808080', '15', panRight,  true,   'panRight', true],

  [1293, 628, 60, 60, 30, 1,  true, '#00FF00', false, '#000000',     'GO', '#00FF00', '25',       go,  true,         'go',false],
  [1293, 628, 60, 60, 16, 1,  true, '#FF0000', false, '#000000',   'STOP', '#FF0000', '14',     stop,  true,       'stop', true],
  [1221, 628, 60, 60, 10, 1,  true, '#ff8080', false, '#000000',  'Pause', '#ff8080', '13',    pause,  true,      'pause', true],

  [1293, 730, 60, 30,  5, 1,  true, '#808080', false, '#000000',  'SOUND', '#808080', '10',  soundOn, false,    'soundOn', true],
  [1293, 730, 60, 30,  5, 1, false, '#808080',  true, '#FFFFFF',  'SOUND', '#000000', '10', soundOff,  true,   'soundOff', true],
  [1293, 700, 30, 30,  5, 1,  true, '#808080', false, '#000000',     'V-', '#808080', '10',  volDown,  true, 'volumeDown', true],
  [1323, 700, 30, 30,  5, 1,  true, '#808080', false, '#000000',     'V+', '#808080', '10',    volUp,  true,   'volumeUp', true],

  [1233, 730, 60, 30,  5, 1,  true, '#8080FF', false, '#000000', 'SFX', '#8080FF', '10',      sfxOn,  true,         'sfxOn', true],
  [1233, 730, 60, 30,  5, 1, false, '#8080FF',  true, '#8080FF', 'SFX', '#000000', '10',     sfxOff,  true,        'sfxOff', true],
  [1233, 700, 30, 30,  5, 1,  true, '#8080FF', false, '#000000',  'V-', '#8080FF', '10', sfxVolDown,  true, 'sfxVolumeDown', true],
  [1263, 700, 30, 30,  5, 1,  true, '#8080FF', false, '#000000',  'V+', '#8080FF', '10',   sfxVolUp,  true,   'sfxVolumeUp', true],

  [1173, 730, 60, 30,  5, 1,  true, '#80FF80', false, '#000000', 'MUSIC', '#80FF80', '10',      musicOn,  true,         'musicOn', true],
  [1173, 730, 60, 30,  5, 1, false, '#80FF80',  true, '#80FF80', 'MUSIC', '#000000', '10',     musicOff,  true,        'musicOff', true],
  [1173, 700, 30, 30,  5, 1,  true, '#80FF80', false, '#000000',    'V-', '#80FF80', '10', musicVolDown,  true, 'musicVolumeDown', true],
  [1203, 700, 30, 30,  5, 1,  true, '#80FF80', false, '#000000',    'V+', '#80FF80', '10',   musicVolUp,  true,   'musicVolumeUp', true],
  [1143, 700, 30, 30,  5, 1,  true, '#80FF80', false, '#000000',    'S-', '#80FF80', '10',       songUp,  true,          'songUp', true],
  [1143, 730, 30, 30,  5, 1,  true, '#80FF80', false, '#000000',    'S+', '#80FF80', '10',     songDown,  true,        'songDown', true],

  [5, 700, 60, 30,  5, 1, true, '#FFFFFF', false, '#FFFFFF',   'edit', '#FFFFFF', '10', toggleEdit, false,   'edit', true],
  [5, 730, 60, 30,  5, 1, true, '#FFFFFF', false, '#FFFFFF',  'reset', '#FFFFFF', '10',     splash, false, 'splash', true],


  // edit buttons
  [1142, 520, 30, 30, 5, 1, true, '#808080', false, '#000000', 'vu', '#808080', '15', function() {    vertexY(-1); }, true,       'vertexUp', true],
  [1142, 580, 30, 30, 5, 1, true, '#808080', false, '#000000', 'vd', '#808080', '15', function() {     vertexY(1); }, true,     'vertexDown', true],
  [1112, 550, 30, 30, 5, 1, true, '#808080', false, '#000000', 'vl', '#808080', '15', function() {    vertexX(-1); }, true,     'vertexLeft', true],
  [1172, 550, 30, 30, 5, 1, true, '#808080', false, '#000000', 'vr', '#808080', '15', function() {     vertexX(1); }, true,    'vertexRight', true],
  [1142, 420, 30, 30, 5, 1, true, '#808080', false, '#000000', 'VU', '#808080', '15', function() {   vertexY(-20); }, true,    'vertexBigUp', true],
  [1142, 480, 30, 30, 5, 1, true, '#808080', false, '#000000', 'VD', '#808080', '15', function() {    vertexY(20); }, true,  'vertexBigDown', true],
  [1112, 450, 30, 30, 5, 1, true, '#808080', false, '#000000', 'VL', '#808080', '15', function() {   vertexX(-20); }, true,  'vertexBigLeft', true],
  [1172, 450, 30, 30, 5, 1, true, '#808080', false, '#000000', 'VR', '#808080', '15', function() {    vertexX(20); }, true, 'vertexBigRight', true],
  [1122, 620, 30, 30, 5, 1, true, '#FFFFFF',  true, '#000000',  '+', '#FFFFFF', '15', function() {  addVertex(this); }, true,      'addVertex', true],
  [1162, 620, 30, 30, 5, 1, true, '#FFFFFF',  true, '#000000',  '-', '#FFFFFF', '15', function() {  delVertex(this); }, true,      'delVertex', true],
  [1162, 660, 30, 30, 5, 1, true, '#FF0000', false, '#000000', 'EX', '#FF0000', '15', function() {     exitVertex(); }, true,     'exitVertex', true],
  [1122, 660, 30, 30, 5, 1, true, '#00FF00', false, '#000000', 'EN', '#00FF00', '15', function() { entranceVertex(); }, true, 'entranceVertex', true],
  [1122, 380, 30, 30, 5, 1, true, '#8080FF', false, '#000000',  '+', '#8080FF', '15', function() {        addEdge(); }, true,        'addEdge', true],
  [1162, 380, 30, 30, 5, 1, true, '#8080FF', false, '#000000',  '-', '#8080FF', '15', function() {        delEdge(); }, true,        'delEdge', true],
];

const getButton = function(id, model, index) {
  // since undefined is falsy if model is not provided it still works as designed
  if(model) {
    for(let b = 0; b < buttonsM.length; b++) {
      if(buttonsM[b][15] === id) return buttonsM[b];
    }
  } else {
    for(let b = 0; b < buttons.length; b++) {
      if(buttons[b].id === id) {
        if(!index) return buttons[b];
        else return b;
      }
    }
  }
  return null;
};

const invertColor = function(color) {
  const red = color.substr(1, 2);
  const green = color.substr(3, 2);
  const blue = color.substr(5, 2);
  color = '#' +
    (255 - parseInt(red, 16)).toString(16).padStart(2, '0') +
    (255 - parseInt(green, 16)).toString(16).padStart(2, '0') +
    (255 - parseInt(blue, 16)).toString(16).padStart(2, '0');
  return color;
};
