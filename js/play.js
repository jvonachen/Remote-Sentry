'use strict'

const play = function() {
  unloadEverything();

  // if the splash audio is still play then stop it
  if(splashAudioElement !== undefined) {
    splashAudioElement.pause();
    splashAudioElement.currentTime = 0;
  }

  unskipSoundButtons()

  getButton('ortho').skip = false;
  getButton('sigma').skip = false;
  getButton('delta').skip = false;
  getButton('tri').skip = false;
  getButton('hex').skip = false;

  state = PLAY;
  seconds = 0;
  aces.push(new Ace(['text', 'REMOTE SENTRY', 10, 10, 15, true, false, 127,
    127, 127, 1, null, null, null, null, ['title']]));
  aces.push(new Ace(['rect', 7, 6, 176, 24, 1, false, true, null, null, null,
    null, 127, 127, 127, 1, []]));
  changes.push(new Change(['fillA', -0.25, 0, null, ['title'], 'bounce', null,
    null, false, 1]));
};
