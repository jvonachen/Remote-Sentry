'use strict'

let editVertexIndex;

const init = function() {
  backStage = document.getElementById('backStage');
  ctxBackStage = backStage.getContext('2d');
  ctxBackStage.fillStyle = '#000000';
  ctxBackStage.fillRect(0.0, 0.0, backStage.width, backStage.height);

  bloodCanvas = document.getElementById('bloodCanvas');
  ctxBloodCanvas = bloodCanvas.getContext('2d');

  gameArea = document.getElementById('stage');
  ctxGameArea = gameArea.getContext('2d');
  xOffset = yOffset = shake = xShake = yShake = seconds = 0;
  resize();

  addClickEventListenerToGameArea();
  addWheelEventListenerToGameArea();

  passcode();

  // load all the buttons and then just set them to skip true or false
  for(let n = 0; n < buttonsM.length; n++) {
    buttons.push(new Button(buttonsM[n]));
  }

  // start the main loop
  loop();

  splash();
};

const addWheelEventListenerToGameArea = function() {
  gameArea.addEventListener('wheel', function(e) {
    e.preventDefault();
    if(e.deltaY > 0) panDown(); else panUp();
  });
};

// This checks various game objects that are clickable
const addClickEventListenerToGameArea = function() {
  editVertexIndex = -1;

  gameArea.addEventListener('click', function(e) {
    const rect = gameArea.getBoundingClientRect();
    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;

    // clicking a virtual button, the order of how the buttons are piled up matters
    for (let n = 0; n < buttons.length; n++) {
      const callbackCalled = buttons[n].clickCheck(x, y);
      if (callbackCalled) return;
    }

    // clicking anywhere except a button while not in play state plays.  It's
    // like inserting a coin and pressing 1 player
    if(state !== PLAY) play();

    // if the addVertex button is toggle true, in add vertex mode, then wherever
    //  you click should add a vertex
    if(getButton('addVertex').toggle) {
      vertices.push({
        x:(x - xOffset) * (1 / METERS_TO_PIXELS),
        y:(y - yOffset) * (1 / METERS_TO_PIXELS)
      });
      // this sets the just created vertex to the selected one so you can move it
      editVertexIndex = vertices.length - 1;
      saveJSON();
    }

    if(edit) {
      // Selecting a vertex to delete, move, or make an edge
      let atLeastOneFound = false;
      for(let i = 0; i < vertices.length; i++) {
        const v = vertices[i];
        // if the distance from this vertex to the mouse click is smaller than a
        //  range then you clicked a vertex
        if(Vec2.distance(Vec2(
          v.x * METERS_TO_PIXELS + xOffset,
          v.y * METERS_TO_PIXELS + yOffset
        ), Vec2(x, y)) < vertexVisitRange * METERS_TO_PIXELS
        ) {
          // firstVertexForEdge is set when the designer presses the blue +
          //  button while a vertex is selected, saving the index.
          if(firstVertexForEdge > -1) {
            edges.push({v1:firstVertexForEdge, v2:i});
            saveJSON();
            editVertexIndex = -1;
            firstVertexForEdge = -1;
          }
          // else if the delete vertex button is 'on' then delete the vertex
          else if(getButton('delVertex').toggle) {
            vertices.splice(i, 1);
            for(let j = edges.length - 1; j > -1; j--) {
              const e = edges[j];
              if(e.v1 === i || e.v2 === i) {
                edges.splice(j, 1);
                continue;
              }
              if(e.v1 > i) edges[j].v1 -= 1;
              if(e.v2 > i) edges[j].v2 -= 1;
            }
            editVertexIndex = -1;
            saveJSON();
          } else {
            editVertexIndex = i;
          }
          atLeastOneFound = true;
          break;
        }
      }

      // empty space was clicked escaping any operation
      if(!atLeastOneFound) {
        editVertexIndex = -1;
        firstVertexForEdge = -1;
      }

      // allow the user to select an edge to delete
      atLeastOneFound = false;
      for(let i = 0; i < edges.length; i++) {
        const e = edges[i];
        const v1 = vertices[e.v1];
        const v2 = vertices[e.v2];
        if(Vec2.distance(Vec2(
          (v1.x + v2.x) / 2 * METERS_TO_PIXELS + xOffset,
          (v1.y + v2.y) / 2 * METERS_TO_PIXELS + yOffset
        ), Vec2(x, y)) < vertexVisitRange / 2 * METERS_TO_PIXELS
        ) {
          editEdgeIndex = i;
          atLeastOneFound = true;
          break;
        }
      }
      if(!atLeastOneFound) editEdgeIndex = -1;
    }

    // if nothing handled a click then at least make maze buttons skip
    clearMazeMenuButtons();
  });
};

// Handle collisions
const damageSentry = function(s) {
  s.currentHealth -= 10;
  s.damaged = true;
  const si = getSentryIndexFromId(s.body.sentryId);
  if(s.currentHealth < 0 && si > -1) {
    sentriesDestroyed++;
    s.dead = true;
  }
};

world.on('begin-contact', function(contact) {
  const bodyA = contact.getFixtureA().m_body;
  const bodyB = contact.getFixtureB().m_body;
  let a, b, s;

  if(bodyA.alienId !== undefined) a = getAlienFromId(bodyA.alienId);
  else if(bodyB.alienId !== undefined) a = getAlienFromId(bodyB.alienId);
  if(a !== undefined && a.dead) a = undefined;
  if(bodyA.bulletId !== undefined)      b = getBulletFromId(bodyA.bulletId);
  else if(bodyB.bulletId !== undefined) b = getBulletFromId(bodyB.bulletId);
  if(b !== undefined && b.dead) b = undefined;
  if(bodyA.sentryId !== undefined)      s = getSentryFromId(bodyA.sentryId);
  else if(bodyB.sentryId !== undefined) s = getSentryFromId(bodyB.sentryId);
  if(s !== undefined && s.dead) s = undefined;

  if(a === undefined && b === undefined && s === undefined) return;

  if(a !== undefined) {
    if(b !== undefined) { // a bullet damaged an alien
      if(!b.used) {
        damageAlien(a, b);
        b.used = true;
      }
    }
    else if(s !== undefined) damageSentry(s); // an alien damaged a sentry
  }
  // another sentry damaged a sentry
  if(b !== undefined && s !== undefined && !b.used) {
    damageSentry(s);
    b.used = true;
  }
});

// The game loop
const loop = function() {
  /*
  shake += 0.025;
  if(shake > 50) shake = 50;
  xShake = Math.random() * shake - shake / 2;
  yShake = Math.random() * shake - shake / 2;
  */
  const now = Date.now();
  lapsed = (now - oldNow) / 1000;
  oldNow = now;
  seconds += lapsed;
  world.step(1 / 24);

  // every colonist can murder an alien every 50 minutes
  if(aliensEscaped - aliensMurderedByColonists > 0) {
    aliensMurderedByColonists += numberOfColonists * 0.00016 * lapsed;
  }
  // every alien that escapes can murder or cocoon a colonist every 5 minutes
  if(numberOfColonists > 0) {
    numberOfColonists -= (aliensEscaped - aliensMurderedByColonists) * 0.003 *
      lapsed;
    colonistsGone = INITIAL_COLONISTS - numberOfColonists;
  }
  points = aliensMurdered - colonistsGone - aliensEscaped - sentriesDestroyed;

  // clear game area before reloading
  if(ctxGameArea === undefined) return;
  ctxGameArea.clearRect(0.0, 0.0, gameArea.width, gameArea.height);

  // if any things died in the previous loop then remove them here
  for(let a = aliens.length - 1; a > -1; a--) {
    const ao = aliens[a];
    if(ao.dead) {
      ao.destructor();
      aliens.splice(a, 1);
    }
  }
  for(let n = 0; n < sentries.length; n++) {
    const s = sentries[n];
    if(s.dead) {
      s.destructor();
      sentries.splice(n, 1);
    }
  }

  // draw everything

  // don't draw the spawn and exit walls thus the w starting at 6 instead of 0
  //  the first 6 walls of every maze are spawn and exit walls
  const wallStart = edit ? 0 : 6;
  for(let w = wallStart; w < walls.length; w++) walls[w].draw();
  for(let a = 0; a < aliens.length; a++)       aliens[a].draw();
  for(let a = 0; a < aces.length; a++)           aces[a].draw();
  for(let n = 0; n < buttons.length; n++)     buttons[n].draw();
  for(let n = 0; n < sentries.length; n++)   sentries[n].draw();
  for(let n = 0; n < bullets.length; n++)     bullets[n].draw();

  if(edit) {
    // Draw the vertices
    for(let i = 0; i < vertices.length; i++) {
      const v = vertices[i];
      let av = v;
      const vx = v.x;
      const vy = v.y;
      let size = 5;
      let color = '#FFFFFF';
      let textColor = color;
      let visitColor = color;

      if(av.exit) { size = 20; color = '#FF0000'; }
      if(av.entrance) { size = 20; color = '#00FF00'; }
      if(av.seen) size = 10;
      if(av.visited) { size = 10; color = '#00FF00'; }
      if(i === editVertexIndex) color = '#FF8080';
      if(i === firstVertexForEdge) visitColor = '#8080FF';

      // Draw the vertex
      ctxGameArea.fillStyle = color;
      ctxGameArea.fillRect(
        vx * METERS_TO_PIXELS + xOffset - size / 2,
        vy * METERS_TO_PIXELS + yOffset - size / 2,
        size, size
      );

      // Draw the vertex index
      ctxGameArea.fillStyle = textColor;
      ctxGameArea.font = '15px apple2';
      ctxGameArea.fillText(i.toString(),
        vx * METERS_TO_PIXELS + xOffset + size / 2,
        vy * METERS_TO_PIXELS + yOffset - size / 2
      );

      // draw the visit range
      ctxGameArea.lineWidth = 0.2;
      ctxGameArea.strokeStyle = visitColor;
      ctxGameArea.beginPath();
      ctxGameArea.arc(
        vx * METERS_TO_PIXELS + xOffset,
        vy * METERS_TO_PIXELS + yOffset,
        vertexVisitRange * METERS_TO_PIXELS,
        0,
        tau
      );
      ctxGameArea.stroke();
    }

    // draw the edges
    for(let j = 0; j < edges.length; j++) {
      const e = edges[j];
      const v1 = vertices[e.v1];
      const v2 = vertices[e.v2];
      const v1x = v1.x;
      const v1y = v1.y;
      const v2x = v2.x;
      const v2y = v2.y;
      const midpointX = (v1x + v2x) / 2;
      const midpointY = (v1y + v2y) / 2;
      let edgeSelectColor = '#8080FF';
      if(editEdgeIndex === j) {
        edgeSelectColor = '#80FF80';
      }

      // Draw the edge
      ctxGameArea.lineWidth = 1;
      ctxGameArea.strokeStyle = edgeSelectColor;
      ctxGameArea.beginPath();
      ctxGameArea.moveTo(
        v1x * METERS_TO_PIXELS + xOffset,
        v1y * METERS_TO_PIXELS + yOffset
      );
      ctxGameArea.lineTo(
        v2x * METERS_TO_PIXELS + xOffset,
        v2y * METERS_TO_PIXELS + yOffset
      );
      ctxGameArea.stroke();

      // Draw the edge index
      ctxGameArea.fillStyle = edgeSelectColor;
      ctxGameArea.font = '10px apple2';
      ctxGameArea.fillText(`${j}:${e.v1},${e.v2}`,
        midpointX * METERS_TO_PIXELS + xOffset,
        midpointY * METERS_TO_PIXELS + yOffset
      );

      // Draw edge visit range (just to have something to click on)
      ctxGameArea.lineWidth = 1;
      ctxGameArea.strokeStyle = edgeSelectColor;
      ctxGameArea.beginPath();
      ctxGameArea.arc(
        midpointX * METERS_TO_PIXELS + xOffset,
        midpointY * METERS_TO_PIXELS + yOffset,
        vertexVisitRange / 2 * METERS_TO_PIXELS,
        0,
        tau
      );
      ctxGameArea.stroke();
    }
  }

  for(let i = 0; i < vertices.length; i++) {
    const v = vertices[i];
    v.seen = v.visited = false;
  }

  // update everything
  if(!paused) {
    // call updates for aliens
    for (let a = aliens.length - 1; a > -1; a--) {
      const ao = aliens[a];
      if (ao.update()) { // returns true if it has exited
        aliensEscaped++;
        ao.destructor();
        aliens.splice(a, 1);
      }
    }
  }

  // call updates for aces (animatable canvas elements)
  for (let a = 0; a < aces.length; a++) {
    aces[a].update();
    aces[a].flipTimer += lapsed;
  }

  // call updates for sentries
  for (let i = 0; i < sentries.length; i++) {
    sentries[i].update();
  }
  // only let bullets live for their ttl.  Since I splice elements from the array
  //  in the loop I do the loop backwards to prevent problems
  for (let i = bullets.length - 1; i > -1; i--) {
    const b = bullets[i];
    b.update();
    if (b.seconds > b.ttl) {
      b.destructor();
      bullets.splice(i, 1);
    }
  }

  // some animation change elements need to happen just once so they need to be
  //  removed after all the aces have been updated
  for(let a = 0; a < changes.length; a++) {
    for(let b = 0; b < changeSkipList.length; b++) {
      if(changeSkipList[b][0] === changes[a].id) {
        changes[a].skip = changeSkipList[b][1];
      }
    }
  }
  changeSkipList.splice(0, changeSkipList.length);

  // This gets rid of the ugly blue selection aura when clicking in a canvas
  clearSelection();

  // sound clip played with splash is 43 seconds long
  //if(state === SPLASH    && seconds > 44) backstory();
  if(state === SPLASH    && seconds > 10) backstory();
  if(state === BACKSTORY && seconds > 112) play();

  window.requestAnimationFrame(loop);
};

const resize = function() {
  // backstage is automatically centered through css so in case the window has
  //  been resized adjust the absolute positioning of the game area and the
  //  blood canvas
  let rect = backStage.getBoundingClientRect();
  gameArea.style.left = rect.x + 'px';
  gameArea.style.top = rect.y + 'px';
  bloodXOffset = rect.left;
  bloodYOffset = rect.top;
  positionBloodCanvas();
};

function whatsAPasscode() {
  alert('A passcode is a replacement for the the traditional system of ' +
    'usernames and passwords.  The system produces a random and unique ' +
    'string which you use as both a username and password.  This is more ' +
    'secure because it does not allow the user to choose a bad password.');
}

function passcodeInput() {
  alert('changed')
}

// initial state
window.addEventListener('load', init);
window.addEventListener('resize', resize);
