'use strict'

// splash page
const splash = function() {
  unloadEverything();
  getButton('ortho').skip = true;
  getButton('sigma').skip = true;
  getButton('delta').skip = true;
  getButton('tri').skip = true;
  getButton('hex').skip = true;
  getButton('panUp').skip = true;
  getButton('panDown').skip = true;
  getButton('panLeft').skip = true;
  getButton('panRight').skip = true;
  getButton('go').skip = true;

  // load the graphical elements
  for(let n = 0; n < acesM.length; n++) { aces.push(new Ace(acesM[n])); }
  for(let n = 0; n < changesM.length; n++) { changes.push(new Change(changesM[n])); }
  edit = false;

  if(sound) {
    getButton('soundOff').skip = false;
    getButton('soundOn').skip = true;
    getButton('volumeDown').skip = false;
    getButton('volumeUp').skip = false;
  } else {
    getButton('soundOff').skip = true;
    getButton('soundOn').skip = false;
    getButton('volumeDown').skip = true;
    getButton('volumeUp').skip = true;
  }
  getButton('sfxOn').skip = true;
  getButton('sfxOff').skip = true;
  getButton('musicOn').skip = true;
  getButton('musicOff').skip = true;
  getButton('sfxVolumeUp').skip = true;
  getButton('sfxVolumeDown').skip = true;
  getButton('musicVolumeUp').skip = true;
  getButton('musicVolumeDown').skip = true;
  getButton('songUp').skip = true;
  getButton('songDown').skip = true;

  seconds = 0;
  state = SPLASH;
  did50Change = false;
  did0Change = false;
  splashAmmo = 500;
  playSplash(); // the sound track
};

// these things only need to happen once each
let did50Change;
let did0Change;
let splashAmmo;
const ammoCounter = function() {
  splashAmmo -= 20 * lapsed;
  if(splashAmmo < 0) splashAmmo = 0;
  if(splashAmmo <= 50 && splashAmmo > 0 && !did50Change) {
    changeSkipList.push([8, false], [9, false], [10, false], [11, false]);
    did50Change = true;
  }
  if(splashAmmo === 0 && !did0Change) {
    changeSkipList.push([8, true], [9, true], [10, true], [11, true],
      [12, false], [13, false], [14, false], [15, false]);
    did0Change = true;
  }
  return Math.round(splashAmmo).toString().padStart(3, '0');
};

// an array of arrays of parameters for the initial state of animatable canvas
//   elements, M stands for model
const acesM = [ // model, the order is important one gets drawn on top of the other
  // type      text      x    y font  fill stroke fr   fg fb fa    sr    sg    sb    sa             groups
  ['text', 'REMOTE',   100, 200, 100, true, false, 0, 254, 0, 0, null, null, null, null, ['fade', 'move']],
  // type    x    y    w    h lw  fill stroke fr   fg fb fa    sr    sg    sb    sa             groups
  ['rect', 100, 300, 525, 100, 1, true, false, 0, 254, 0, 0, null, null, null, null, ['fade', 'move']],
  // type         text    x    y font  fill stroke fr   fg fb fa    sr    sg    sb    sa             groups
  ['text',    'SENTRY', 100, 300, 100, true, false, 0,   0, 0, 1, null, null, null, null,         ['move']],
  ['text',    'Rounds', 700, 225,  20, true, false, 0, 254, 0, 0, null, null, null, null, ['fade', 'move']],
  ['text', 'Remaining', 675, 255,  20, true, false, 0, 254, 0, 0, null, null, null, null, ['fade', 'move']],
  // type    x    y    w    h    lw   fill  stroke   fr    fg    fb    fa    sr    sg    sb    sa                       groups
  ['rect', 643, 300, 222, 100,    1, false,  true, null, null, null, null,    0,    0,    0,    1, ['move', 'crit1st', 'fade']],
  ['rect', 663, 318, 182,  63,    1, false,  true, null, null, null, null,    0,    0,    0,    1, ['move', 'crit2nd', 'fade']],
  ['rect', 682, 338, 142,  23, null,  true, false,    0,    0,    0,    1, null, null, null, null, ['move', 'crit3rd', 'fade']],
  // type           text    x    y font fill stroke   fr   fg   fb fa    sr    sg    sb    sa                 groups
  ['text',    'CRITICAL', 682, 338, 20, true, false,   0,   0,   0, 1, null, null, null, null, ['critical', 'move', 'fade']],
  ['text',   ammoCounter, 922, 225, 50, true, false,   0, 254,   0, 0, null, null, null, null, ['rounds remaining', 'move', 'fade']],
  ['text', 'Insert Coin', 583, 700, 20, true, false, 127, 127, 127, 1, null, null, null, null, ['insert coin']],
  // type    x    y     w    h  lw   fill stroke    fr    fg    fb    fa sr   sg sb sa             groups
  ['rect',  80, 180, 1015, 240, 10, false,  true, null, null, null, null, 0, 254, 0, 0, ['fade', 'move']],
  ['rect', 899, 200,  177, 105,  5, false,  true, null, null, null, null, 0, 254, 0, 0, ['fade', 'move']],
  // type                                        path lw  fill stroke fr   fg fb fa    sr    sg    sb    sa             groups
  ['path', [[849, 232.5], [889, 252.5], [849, 272.5]], 1, true, false, 0, 254, 0, 0, null, null, null, null, ['fade', 'move']],
  // type                                                           text    x    y font fill stroke   fr   fg   fb fa    sr    sg    sb    sa          groups
  ['text', 'Copyright 2022 Kaleb Productions LLC.  All rights reserved.', 429, 748, 10, true, false, 127, 127, 127, 1, null, null, null, null, ['copyright']]
];

// parameter list and order for animation changes
const changesM = [ // model
  // property rate start stop                groups      type  val1  val2   skip   id
  [      'x',  -800,  0, null,             ['move'],    'set', null, null, false,  0], // move everything over once
  [      'x',    50,  0, null,             ['move'], 'linear', null, null, false,  1], // move slowly through time
  [  'fillA',   0.1,  0,   10,             ['fade'], 'linear', null, null, false,  2], // fade in
  ['strokeA',   0.1,  0,   10,             ['fade'], 'linear', null, null, false,  3], // fade in
  [  'fillA',  -0.1, 20, null,             ['fade'], 'linear', null, null, false,  4], // fade out
  ['strokeA',  -0.1, 20, null,             ['fade'], 'linear', null, null, false,  5], // fade out
  [  'fillA',    -1,  0, null,      ['insert coin'], 'bounce', null, null, false,  6], // fade in and out the insert coin
  [  'fillG', 0.125,  0, null,         ['critical'],   'flip',  254,    0,  true,  8], // When the counter reaches 50
  [  'fillG', 0.125,  0, null,          ['crit3st'],   'flip',    0,  254,  true,  9], //  flash or flip
  ['strokeG', 0.125,  0, null,          ['crit2nd'],   'flip',    0,  254,  true, 10],
  ['strokeG', 0.125,  0, null,          ['crit1rd'],   'flip',  254,    0,  true, 11],
  [  'fillG',   254,  0, null,         ['critical'],    'set', null, null,  true, 12], // When the counter reaches 0
  [  'fillG',     0,  0, null,          ['crit3st'],    'set', null, null,  true, 13], //  keep it steady
  ['strokeG',   254,  0, null,          ['crit2nd'],    'set', null, null,  true, 14],
  ['strokeG',     0,  0, null,          ['crit1rd'],    'set', null, null,  true, 15],
];

