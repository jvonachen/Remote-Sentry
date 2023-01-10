'use strict'

/*
Potential behaviors

Sentry Behaviors
*1. sentryAttractReg - Attracted to sentry, regressive (meaning the closer it is
to the sentry the less attracted).  This slows the alien's progress but damages
the sentry relatively slowly.
2. sentryAttractProg - Attracted to sentry, progressive, which would do faster
damage to the sentry.
3. sentryAttractOOA - only when sentry is out of ammo, this could be combined
with either 1, 2, 5, or 6.
4. notAttracted - Indifferent to sentry, make more progress toward exit but does
not damage the sentry.
5. avoidReg - avoids sentry, regressive. May protect the alien more.
6. avoidProg - avoids sentry, progressive.  Might protect the alien but impede
it's progress.
7. alienBlocksRay - Sight of sentry blocked by other aliens
8. alienNotBlock - Sight of sentry not blocked by other aliens
9. ignoreVertex - when attracted to sentry the alien should always ignore
vertices and suspend stuck timer otherwise they will float between a vertex and
a the sentry uselessly, at least with regressive.  I don't know if this is true
with the progressive
10. armed - aliens, that's scary.

Maze Behaviors - all these behaviors ar combinable with the previously
described behaviors.
*11. mazeDumb - Each alien solves the maze on their own
*12. recogExit - Recognition of exit on sight
13. cmwContact - Come my way, don't bother going that way, on contact.
14. cmwLimitRange - Come my way, don't bother going that way, on sight and
limited range.
15. cmwUnlimitRange - Come my way, don't bother going that way, on sight and
unlimited range.
16. mapContact - walk map communicated to each other on contact, mind meld
17. mapLimitRange - walk map communicated within limited range and sight, short
range psionic
18. mapUnlimitRange - walk communicated at sight unlimited range, longer range
psionic
19. mapLimitRangeNoSight - walk communicated limited range without sight, super
psionic
20. mapUnlimitRangeNoSight - walk communicated unlimited range without sight,
super psionic
21. precog - correct path known ahead of time, precognition

Health Behaviors - all these behaviors are also combinable with all the
behaviors described above
*22. bleeding - if health is less than 100 health gets worse due to bleeding,
rate varies
23. noBleeding - health remains constant
24. healSelf - ability, just self, the opposite of bleeding, varies
25. healContact - can heal other aliens on contact, varies, laying on of hands
26. healLimitRange - can heal other aliens within limited range and sight,
varies
27. healUnlimitRange - can heal other aliens on sight unlimited range, varies
28. healLimitRangeNoSight - can heal other aliens within limited range without
sight, varies
29. healUnlimitRangeNoSight - can heal other aliens within unlimited range
without sight, varies.
This would be devastating and probably only available for the queen.

Moving Behaviors - all these behaviors are combinable with the behaviors listed
above
*- moves faster/slower although they get stuck more if they go too fast
30. avoidBullets - Tough to implement.

Make pink just one, the boss lady, the queen and make all other aliens surround
the queen to protect her.  Give her more density and more force in order to not
be impeded by other aliens surrounding.
*/

class Alien {
  constructor(p, alienId) {
    // There will be a laundry list of properties associated with alien types so
    //  just keep one reference to it and dereference the property where you
    //  need it.
    this.type = p; // parameter list which is an object with properties
    // default behaviors
    if(this.type.recogExit === undefined) this.type.recogExit = true;
    if(this.type.randomRange === undefined) this.type.randomRange = 20;
    if(this.type.sentryAttractReg === undefined) this.type.sentryAttractReg = 0.5;
    if(this.type.linearDamping === undefined) this.type.linearDamping = 1.0;

    const w3p = walls[3].body.getPosition();
    const w4p = walls[4].body.getPosition();

    this.initXm = w4p.x; // in meters
    this.initYm = w3p.y; // in meters

    // make a dynamic body
    const bd = {}; // body definition
    bd.position = Vec2(this.initXm, this.initYm);
    bd.userData = 'alien'; // for ray collision filtering
    this.body = world.createDynamicBody(bd);
    this.circleShapeSizeM = Math.random() * 0.3 + 0.4; // radius in meters
    this.body.createFixture({
      shape: planck.Circle(this.circleShapeSizeM),
      density: ALIEN_DENSITY,
      friction: 1.0
    });
    this.body.alienId = alienId;
    this.body.setLinearDamping(this.type.linearDamping);

    this.currentHealth = this.type.fullHealth;
    this.damaged = false;

    // set the initial nextVertex to the entrance one
    for(let i = 0; i < vertices.length; i++) {
      if(vertices[i].entrance) {
        this.nextVertex = i;
        break;
      }
    }
    this.lastVertex = this.nextVertex;

    // Keep track of this alien's edge marks. Part of Trémaux's algorithm
    this.edgeMarks = []; // edgeMarks has the same indexes as edges
    for(let i = 0; i < edges.length; i++) this.edgeMarks.push(0);

    this.stuckTimer = 0;
  }

  draw() {
    const ap = this.body.getPosition();
    ctxGameArea.lineWidth = 2;
    const xo = xOffset + xShake;
    const yo = yOffset + yShake;

    // Draw scary round aliens
    ctxGameArea.strokeStyle = this.type.belt;
    ctxGameArea.globalAlpha = 1;
    ctxGameArea.beginPath();
    ctxGameArea.arc(
      ap.x * METERS_TO_PIXELS + xo,
      ap.y * METERS_TO_PIXELS + yo,
      this.circleShapeSizeM * METERS_TO_PIXELS,
      0,
      tau
    );
    ctxGameArea.stroke();

    // draw damage indication
    const left =   (ap.x - this.circleShapeSizeM) * METERS_TO_PIXELS + xo;
    const right =  (ap.x + this.circleShapeSizeM) * METERS_TO_PIXELS + xo;
    const top =    (ap.y - this.circleShapeSizeM) * METERS_TO_PIXELS + yo;
    const bottom = (ap.y + this.circleShapeSizeM) * METERS_TO_PIXELS + yo;
    ctxGameArea.strokeStyle = '#FF0000';
    ctxGameArea.globalAlpha = 1 - this.currentHealth / this.type.fullHealth;
    ctxGameArea.beginPath();
    ctxGameArea.moveTo(left, top);
    ctxGameArea.lineTo(right, bottom);
    ctxGameArea.moveTo(right, top);
    ctxGameArea.lineTo(left, bottom);
    ctxGameArea.stroke();

    if(edit) {
      // Draw the vertex index
      ctxGameArea.fillStyle = '#FFFFFF';
      ctxGameArea.font = '15px apple2';
      ctxGameArea.fillText(this.nextVertex.toString(),
        ap.x * METERS_TO_PIXELS + xo,
        ap.y * METERS_TO_PIXELS + yo
      );
    }
  }

  update() {
    const body = this.body;
    const ap = body.getPosition(); // alien position vector

    // the more damaged an alien is the faster they get worse until they die
    this.currentHealth -= (this.type.fullHealth - this.currentHealth) *
      this.type.bleeding;
    if(this.currentHealth < 0) {
      paintBlood(ap.x, ap.y, this.circleShapeSizeM);
      this.dead = true;
    }

    // handle being stuck
    this.stuckTimer += lapsed;
    if(this.stuckTimer > ALIEN_STUCK_TIMEOUT) {
      // clear all the marks
      this.edgeMarks.forEach((e, i) => { this.edgeMarks[i] = 0; });
      // find any vertex within sight, doesn't have to be the closest one
      for(let i = 0; i < vertices.length; i++) {
        const v = vertices[i]; // this vertex
        const vp = Vec2(v.x, v.y); // the position
        RayCastClosestOnlyWall.reset();
        world.rayCast(ap, vp, RayCastClosestOnlyWall.callback);
        if(!RayCastClosestOnlyWall.hit) {
          this.nextVertex = i;
          this.stuckTimer = 0;
          break;
        }
      }
    }

    // if the alien was damaged it should only show for 1 loop
    if(this.damaged) this.damaged = false;

    // apply a simple random behavior
    const forceRange = this.type.randomRange;
    let force = Vec2(
      Math.random() * forceRange - forceRange / 2,
      Math.random() * forceRange - forceRange / 2
    );
    body.applyForce(force, body.getWorldCenter(), true);

    // Aliens should attack a sentry if they see it
    let foundASentry = false;
    if(this.type.belt !== YELLOW_BELT_COLOR) {
      let closestDistance = 1000;
      let closest = undefined; // closest is a sentry object
      for (let i = 0; i < sentries.length; i++) {
        const s = sentries[i];
        // they should only be attracted to a sentry that is placed
        if (s.place) break;
        const distance = Vec2.distance(s.body.getPosition(), ap);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = s;
        }
      }
      // There is a closest and within range but is the alien's vision obscured
      //  by a wall, an alien, a bullet?
      if (closest !== undefined) {
        RayCastClosest.reset();
        const sp = closest.body.getPosition();
        world.rayCast(ap, sp, RayCastClosest.callback);
        if (RayCastClosest.hit) {
          this.sentryRayPoint = RayCastClosest.point;
          if (
            Vec2.distance(this.sentryRayPoint, ap) >= closestDistance -
            closest.circleShapeSizeM - 1
          ) {
            let force = Vec2.sub(this.sentryRayPoint, ap).
              mul(this.type.sentryAttractReg);
            //force.mul(this.currentHealth / this.maxHealth);
            body.applyForce(force, body.getWorldCenter(), true);
            foundASentry = true;
            this.stuckTimer = 0;
          }
        }
      }
    }

    // if an alien sees a sentry it should ignore vertices and not get stuck in
    //  the process
    if(!foundASentry) {
      // Aliens should be attracted to whatever their next vertex is but only if
      //  they can see it which should not be blocked by other aliens, bullets,
      //  or sentries, just walls.
      if(this.nextVertex === undefined) {
        this.stuckTimer = ALIEN_STUCK_TIMEOUT;
        return;
      }
      const v = vertices[this.nextVertex]; // this vertex
      const vp = Vec2(v.x, v.y); // the position
      const distance = Vec2.distance(vp, ap);
      RayCastClosestOnlyWall.reset();
      world.rayCast(ap, vp, RayCastClosestOnlyWall.callback);
      if (!RayCastClosestOnlyWall.hit) { // sight not obstructed by any bodies
        let force = Vec2.sub(vp, ap).mul(1.0);
        //force.mul(this.currentHealth / this.maxHealth);
        body.applyForce(force, body.getWorldCenter(), true);
      }
      // find out what the next vertex is if the current one has successfully
      //  been visited using Trémaux's algorithm
      if (distance < vertexVisitRange) {
        this.stuckTimer = 0;
        // What edge did this alien just traverse?
        for (let i = 0; i < edges.length; i++) {
          const e = edges[i];
          if (
            e.v1 === this.lastVertex && e.v2 === this.nextVertex ||
            e.v2 === this.lastVertex && e.v1 === this.nextVertex
            // the index of the edges is borrowed by this.edgeMarks
          ) this.edgeMarks[i]++;
        }
        this.lastVertex = this.nextVertex;

        // shallow clone the array
        const neighbors = graph.adjList.get(this.nextVertex).slice();

        // eliminate neighbors who are vertices of edges that have more than 1
        //  mark anytime you splice an array in a loop based on the length of
        //  the array it should loop backwards.  Also keep track if there are
        //  any 0 mark edges.
        let atLeastOneZeroCountEdge = false;
        for (let i = neighbors.length - 1; i > -1; i--) {
          const v = neighbors[i]; // an array of vertex indexes
          if(this.type.recogExit && vertices[v].exit) {
            this.nextVertex = v;
            return;
          }
          for (let j = 0; j < this.edgeMarks.length; j++) {
            const e = edges[j];
            if (
              e.v1 === this.nextVertex && e.v2 === v ||
              e.v2 === this.nextVertex && e.v1 === v
            ) {
              switch (this.edgeMarks[j]) {
                case 0:
                  atLeastOneZeroCountEdge = true;
                  break;
                // don't go if you've already been here twice
                case 2:
                  neighbors.splice(i, 1);
                  break;
                default:
                  break;
              }
            }
          }
        }
        // if there are any edges with 0 marks then remove any neighbors that
        //  have one mark
        if (atLeastOneZeroCountEdge) {
          for (let i = neighbors.length - 1; i > -1; i--) {
            const v = neighbors[i]; // an array of vertex indexes
            for (let j = 0; j < this.edgeMarks.length; j++) {
              const e = edges[j];
              if (
                (
                  e.v1 === this.nextVertex && e.v2 === v ||
                  e.v2 === this.nextVertex && e.v1 === v
                ) &&
                this.edgeMarks[j] === 1
              ) {
                neighbors.splice(i, 1);
              }
            }
          }
        }
        // randomly choose from the remaining neighbors.  They could be 0 marks
        //  or 1 marks.
        this.nextVertex = neighbors[Math.floor(Math.random() * neighbors.length)];
      }
    }

    // Did the alien enter the exit?
    const ax = ap.x;
    const ay = ap.y;
    const w0p = walls[0].body.getPosition();
    const w2p = walls[2].body.getPosition();
    const w0v1 = walls[0].body.getFixtureList().getShape().m_vertex1;
    const w2v2 = walls[2].body.getFixtureList().getShape().m_vertex2;
    return (
      ax > w0p.x + w0v1.x && ax < w2p.x + w2v2.x &&
      ay > w0p.y + w0v1.y && ay < w2p.y + w2v2.y
    );
  }

  destructor() {
    world.destroyBody(this.body);
  }
}

const damageAlien = function(a, b) {
  switch (b.color) { // the bullet's color
    case WHITE_BELT_COLOR:  a.currentHealth -= 1; break;
    case YELLOW_BELT_COLOR: a.currentHealth -= 10; break;
    case ORANGE_BELT_COLOR: a.currentHealth -= 100; break;
    case GREEN_BELT_COLOR:  a.currentHealth -= 1000; break;
    case BLUE_BELT_COLOR:   a.currentHealth -= 10000; break;
    case PURPLE_BELT_COLOR: a.currentHealth -= 100000; break;
    case BROWN_BELT_COLOR:  a.currentHealth -= 1000000; break;
    case RED_BELT_COLOR:    a.currentHealth -= 10000000; break;
    case BLACK_BELT_COLOR:  a.currentHealth -= 100000000; break;
    case PINK_BELT_COLOR:   a.currentHealth -= 1000000000; break;
    default: break;
  }
  a.damaged = true;
  const ai = getAlienIndexFromId(a.body.alienId);
  if (a.currentHealth < 0 && ai > -1) {
    a.dead = true;
    aliensMurdered++;
    const p = a.body.getPosition();
    paintBlood(p.x, p.y, a.circleShapeSizeM);
  }
};

let spawned;
const spawn = function() {
  let at;
  if(aliens.length < MAX_ALIENS_IN_MAZE) {
    for(let i = 0; i < alienTypes.length; i++) {
      at = alienTypes[i];
      if(spawned >= i * ALIEN_BATCHES && spawned < (i + 1) * ALIEN_BATCHES) {
        aliens.push(new Alien(alienTypes[i], spawned));
        spawned++;
        return;
      }
    }
    clearInterval(spawnTimerHandle);
  }
};

const getAlienIndexFromId = function(id) {
  let returnVal = -1;
  for(let i = 0; i < aliens.length; i++) {
    if(aliens[i].body.alienId === id) returnVal = i;
  }
  return returnVal;
};

const getAlienFromId = function(id) {
  let returnVal = null;
  for(let i = 0; i < aliens.length; i++) {
    if(aliens[i].body.alienId === id) returnVal = aliens[i];
  }
  return returnVal;
};

const RayCastClosestOnlyWall = (function() {
  const def = {};
  def.reset = function() {
    def.hit = false;
    def.point = null;
    def.normal = null;
  };
  def.callback = function(fixture, point, normal, fraction) {
    const body = fixture.getBody();
    const userData = body.getUserData();
    //console.log(userData);
    if(userData) {
      if(userData !== 'wall') {
        // By returning -1, we instruct the calling code to ignore this fixture
        // and continue the ray-cast to the next fixture.
        return -1.0;
      }
    }

    def.hit = true;
    def.point = point;
    def.normal = normal;
    return fraction;
  };
  return def;
})();
