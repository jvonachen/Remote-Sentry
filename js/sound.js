'use strict'

let splashAudioElement;
let backgroundAudioElement;
let gainNode;
let gain = 0.5; // default gain
const gainIncrements = 0.05;
let audioContext;

const initAudio = function() {
  audioContext = new window.AudioContext();
  splashAudioElement = document.getElementById('splashSound');
  const splashPageSoundTrack = audioContext.createMediaElementSource(splashAudioElement);
  backgroundAudioElement = document.getElementById('backgroundLoop');
  const backgroundMusicLoop = audioContext.createMediaElementSource(backgroundAudioElement);
  gainNode = audioContext.createGain();
  splashPageSoundTrack.connect(gainNode);
  backgroundMusicLoop.connect(gainNode);
  gainNode.connect(audioContext.destination);
};

const playSplash = function() {
  if(musicSound) splashAudioElement.play();
};

const playBackgroundMusicLoop = function() {
  if(musicSound) backgroundAudioElement.play();
};

let sfxSound = false;
let musicSound = false;
const soundOn = function() {
  let start = false;
  if(audioContext === undefined) {
    initAudio();
    start = true;
  }
  sound = true;
  sfxSound = true;
  musicSound = true;
  gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
  getButton('soundOn').skip = true;
  getButton('soundOff').skip = false;
  getButton('volumeDown').skip = false;
  getButton('volumeUp').skip = false;
  if(state !== SPLASH) {
    getButton('sfxOff').skip = false;
    getButton('sfxOn').skip = true;
    getButton('musicOff').skip = false;
    getButton('musicOn').skip = true;
    getButton('sfxVolumeUp').skip = false;
    getButton('sfxVolumeDown').skip = false;
    getButton('musicVolumeUp').skip = false;
    getButton('musicVolumeDown').skip = false;
    getButton('songUp').skip = false;
    getButton('songDown').skip = false;
  }

  if(start && state === SPLASH) splash();
};

const soundOff = function() {
  sound = false;
  sfxSound = false;
  musicSound = false;
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  getButton('soundOn').skip = false;
  getButton('soundOff').skip = true;
  getButton('volumeDown').skip = true;
  getButton('volumeUp').skip = true;
  getButton('sfxOff').skip = true;
  getButton('sfxOn').skip = true;
  getButton('musicOff').skip = true;
  getButton('musicOn').skip = true;
  getButton('sfxVolumeUp').skip = true;
  getButton('sfxVolumeDown').skip = true;
  getButton('musicVolumeUp').skip = true;
  getButton('musicVolumeDown').skip = true;
  getButton('songUp').skip = true;
  getButton('songDown').skip = true;
};

const volUp = function() {
  gain += gainIncrements;
  if(gain > 2) gain = 2;
  gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
};

const volDown = function() {
  gain -= gainIncrements;
  if(gain < 0) gain = 0;
  gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
};

const sfxOn = function() {
  sfxSound = true;
  getButton('sfxOff').skip = false;
  getButton('sfxOn').skip = true;
  getButton('sfxVolumeUp').skip = false;
  getButton('sfxVolumeDown').skip = false;
};

const sfxOff = function() {
  sfxSound = false;
  if(!musicSound) {
    soundOff();
    return;
  }
  getButton('sfxOff').skip = true;
  getButton('sfxOn').skip = false;
  getButton('sfxVolumeUp').skip = true;
  getButton('sfxVolumeDown').skip = true;
};

const sfxVolDown = function() { alert('turn sound effects volume down'); };
const sfxVolUp = function() { alert('turn sound effects volume up'); };

const musicOn = function() {
  musicSound = true;
  getButton('musicOff').skip = false;
  getButton('musicOn').skip = true;
  getButton('musicVolumeUp').skip = false;
  getButton('musicVolumeDown').skip = false;
  getButton('songUp').skip = false;
  getButton('songDown').skip = false;
};

const musicOff = function() {
  musicSound = false;
  if(!sfxSound) {
    soundOff();
    return;
  }
  getButton('musicOff').skip = true;
  getButton('musicOn').skip = false;
  getButton('musicVolumeUp').skip = true;
  getButton('musicVolumeDown').skip = true;
  getButton('songUp').skip = true;
  getButton('songDown').skip = true;
};

const musicVolDown = function() { alert('turn music volume down'); };
const musicVolUp = function() { alert('turn music volume up'); };
const songUp = function() { alert('load the song next higher up in a song list listed in ascending order'); };
const songDown = function() { alert('load the song next lower down in a song list listed in ascending order'); };
