'use strict'

const Vec2 = planck.Vec2;
const world = planck.World();
const METERS_TO_PIXELS = 8.5;
const ALIEN_STUCK_TIMEOUT = 20; // seconds
const MAZE_TYPES = ['ortho', 'sigma', 'delta', 'tri', 'hex'];
const INITIAL_COLONISTS = 1000;
const ALIEN_BLOOD_COLOR = '#FF0000';
const ALIEN_DENSITY = 2;
const BULLET_RADIUS = 5;
const MAX_ALIENS_IN_MAZE = 50;
const ALIEN_BATCHES = 100;

const WHITE_BELT_COLOR  = '#FFFFFF';
const YELLOW_BELT_COLOR = '#FFFF00';
const ORANGE_BELT_COLOR = '#FF7B00';
const GREEN_BELT_COLOR  = '#00FF00';
const BLUE_BELT_COLOR   = '#8080FF';
const PURPLE_BELT_COLOR = '#7300FF';
const BROWN_BELT_COLOR  = '#806040';
const RED_BELT_COLOR    = '#FF0000';
const BLACK_BELT_COLOR  = '#404040';
const PINK_BELT_COLOR   = '#FF00FF';

let graph, backStage, ctxBackStage, bloodCanvas, ctxBloodCanvas, gameArea,
  ctxGameArea, xOffset, yOffset, lapsed, shake, xShake, yShake, seconds, oldNow,
  bloodXOffset, bloodYOffset, numberOfColonists, colonistsGone, aliensEscaped,
  points, aliensMurdered, sentriesDestroyed, aliensMurderedByColonists,
  spawnTimerHandle, xmlHttp, paused = false;

// arrays of game objects
const aliens = [];
const aces = [];
const changes = [];
const changeSkipList = [];
const sentries = [];
const bullets = [];
const buttons = [];
const walls = [];
let vertices = [];
let edges = [];

let sound = false;
// states: splash, examplePlay, instructions, highScores, play
const SPLASH = 'splash';
const BACKSTORY = 'back story';
const EXAMPLE_PLAY = 'example play';
const INSTR_ALIENS = 'instr aliens';
const INSTR_MAZES = 'instr mazes';
const INSTR_SENTRIES = 'instr sentries';
const INSTR_UPGRADES = 'instr upgrades';
const HIGH_SCORES = 'highScores';
const CREDITS = 'credits';
const PSA = 'psa';
const PLAY = 'play';
let state;

/*
State is initially splash.  While in splash state if you press sound it will
restart the splash cinematic with sound.  About 40 seconds.
After splash it will transition to example play, instructions, and high scores,
each 30 seconds long.  In each of these other states the player can choose a map
and it will transition to play mode.  Also in all these states the words insert
coin will flash.  If in splash state if you click on the screen anywhere it will
stop the cinematic and go to example play where you can choose a map.
Instructions will animate with text and other animations.  High scores will
scroll with credits on the tail end.
*/

// I found that clicking in a canvas makes it select it creating an ugly blue
//  outline.  This prevents that.
const clearSelection = function() {
  if(document.selection && document.selection.empty) {
    document.selection.empty();
  } else if(window.getSelection) {
    window.getSelection().removeAllRanges();
  }
};

const unloadEverything = function() {
  // Each of these arrays that contain objects with planck elements need to be
  //   destructed before their arrays are cleared
  for(let i = 0; i < aliens.length; i++) { aliens[i].destructor(); }
  aliens.splice(0, aliens.length);
  for(let i = 0; i < walls.length; i++) { walls[i].destructor(); }
  walls.splice(0, walls.length);
  for(let i = 0; i < sentries.length; i++) { sentries[i].destructor(); }
  walls.splice(0, sentries.length);
  for(let i = 0; i < bullets.length; i++) { bullets[i].destructor(); }
  walls.splice(0, bullets.length);

  // these objects don't have planck elements
  changes.splice(0, changes.length);
  aces.splice(0, aces.length);
  changeSkipList.splice(0, changeSkipList.length);
};

const tau = Math.PI * 2;

const RayCastClosest = (function() {
  const def = {};
  def.reset = function() {
    def.hit = false;
    def.point = null;
    def.normal = null;
  };
  def.callback = function(fixture, point, normal, fraction) {
    def.hit = true;
    def.point = point;
    def.normal = normal;
    return fraction;
  };
  return def;
})();

const paintBlood = function(x, y, r) {
  ctxBloodCanvas.globalAlpha = 0.2;
  ctxBloodCanvas.fillStyle = ALIEN_BLOOD_COLOR;
  ctxBloodCanvas.beginPath();
  const newX = x * METERS_TO_PIXELS;
  const newY = y * METERS_TO_PIXELS;
  const radius = r * METERS_TO_PIXELS;
  ctxBloodCanvas.arc(newX , newY, radius, 0, tau);
  ctxBloodCanvas.fill();
};

const toHHMMSS = function (secondsElapsed) {
  secondsElapsed = Math.round(secondsElapsed);
  let hours   = Math.floor(secondsElapsed / 3600);
  let minutes = Math.floor((secondsElapsed - (hours * 3600)) / 60);
  let seconds = secondsElapsed - (hours * 3600) - (minutes * 60);

  if(hours   < 10) { hours = "0" + hours; }
  if(minutes < 10) { minutes = "0" + minutes; }
  if(seconds < 10) { seconds = "0" + seconds; }
  return `${hours}:${minutes}:${seconds}`;
};

// if sound is on then make sure the rest of the sound buttons are not skipping
const unskipSoundButtons = function() {
  if(!sound) return;
  const buttonList = [['sfxOff', false], ['sfxOn', true], ['musicOff', false],
    ['musicOn', true], ['sfxVolumeUp', false], ['sfxVolumeDown', false],
    ['musicVolumeUp', false], ['musicVolumeDown', false], ['songUp', false],
    ['songDown', false]];
  buttonList.forEach(b => getButton(b[0]).skip = b[1])
}

// used by everything send a get message to the server
function get(nameValuePairs, host, port, callback) {
  let message = '?';
  let count = 0;
  for(let prop in nameValuePairs) {
    if(nameValuePairs.hasOwnProperty(prop)) {
      if(count > 0) message += '&';
      message += encodeURI(`${prop}=${nameValuePairs[prop].replace(/\+/, '%2B')}`);
    }
    count++;
  }
  xmlHttp = new XMLHttpRequest();
  xmlHttp.onerror = function() { alert('Server not up') };
  xmlHttp.onreadystatechange = callback;
  const URL = `http://localhost/${message}`;
  xmlHttp.open('GET', URL, true);
  xmlHttp.send();
}
