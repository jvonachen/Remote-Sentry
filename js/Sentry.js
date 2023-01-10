'use strict'

/*
upgrades and behaviors
- Sentries should take some time to be deployed.  The idea is that there is a
limited supply of them either in the ceiling or the floor and has to be
delivered to the location you click on.   It should be not the exact same amount
of time but vary.  Or it should take longer the more of them you deploy.
- An upgrade is something that requires the sentry to be retrieved probably
first repaired, if it's repairable, upgraded and reloaded with limited
ammunition.  So RE stands for repair, reload so I might combine repair/reload/upgrade.
- Upgrades are also limited in supply so make it count.
- Behavior is a something you can do remotely with just reprogramming it.  It
may have to be rebooted which will take exactly the same amount of time but be
inoperable while rebooting.  Behavior changes are of course unlimited in supply.
- Some upgrades are available for some sentries.  Every upgrade can be done to
more than one kind of sentry.  The same is true of behaviors.
*/

let placingSentry;
let bulletId = 0;
let sentryId = 0;
class Sentry {
  constructor(p) {
    this.type = p[0];
    this.color = p[1];
    this.place = true; // initially the sentry needs to be placed

    const bd = {};
    bd.position = Vec2(0, 0);
    bd.userData = 'sentry';

    this.body = world.createDynamicBody(bd);
    this.body.setLinearDamping(10.0);
    this.circleShapeSizeM = 0.5; // radius in meters
    this.body.createFixture({
      shape: planck.Circle(this.circleShapeSizeM),
      density: 8.0, // the density of iron
      friction: 0.0,
      restitution: 1.0
    });
    placingSentry = this;
    document.addEventListener('mousemove', this.placeSentryBegin);
    this.ignoreFirstClick = true;
    document.addEventListener('click', this.placeSentryEnd);
    this.x = this.y = -10;
    this.range = 5; // radius in meters
    this.rateOfFire = 1 / 20; // every 1/20th of a second
    this.seconds = 0;
    this.maxRounds = 500;
    this.currentRounds = this.maxRounds;
    this.maxHealth = 500;
    this.currentHealth = this.maxHealth;
    //this.rayPoints = [];
    this.normal = Vec2();
    this.place = true; // initially the player is placing the sentry
    this.body.sentryId = ++sentryId;
    this.damaged = false;
  }

  placeSentryBegin(event) {
    const rect = gameArea.getBoundingClientRect();
    placingSentry.x = event.clientX - rect.left;
    placingSentry.y = event.clientY - rect.top;
  }

  placeSentryEnd(event) {
    if(placingSentry.ignoreFirstClick) {
      placingSentry.ignoreFirstClick = false;
      return;
    }
    const rect = gameArea.getBoundingClientRect();
    const p2ms = 1 / METERS_TO_PIXELS;
    placingSentry.body.setPosition(Vec2(
      (event.clientX - xOffset - rect.left) * p2ms,
      (event.clientY - yOffset - rect.top) * p2ms
    ));
    document.removeEventListener('mousemove', placingSentry.placeSentryBegin);
    document.removeEventListener('click', placingSentry.placeSentryEnd);
    placingSentry.place = false;
  }

  draw() {
    ctxGameArea.lineWidth = 2;
    if(this.damaged) ctxGameArea.strokeStyle = '#FF0000';
    else ctxGameArea.strokeStyle = this.color;
    ctxGameArea.beginPath();
    const body = this.body;
    const shape = body.getFixtureList().getShape();
    const sp = body.getPosition();
    const radius = shape.m_radius * METERS_TO_PIXELS;
    const x = (sp.x + shape.m_p.x) * METERS_TO_PIXELS + xOffset + xShake;
    const y = (sp.y + shape.m_p.y) * METERS_TO_PIXELS + yOffset + yShake;
    if(this.place) {
      ctxGameArea.moveTo(this.x - radius, this.y - radius);
      ctxGameArea.lineTo(this.x + radius, this.y - radius);
      ctxGameArea.lineTo(this.x + radius, this.y + radius);
      ctxGameArea.lineTo(this.x - radius, this.y + radius);
      ctxGameArea.lineTo(this.x - radius, this.y - radius);
    } else {
      ctxGameArea.moveTo(x - radius, y - radius);
      ctxGameArea.lineTo(x + radius, y - radius);
      ctxGameArea.lineTo(x + radius, y + radius);
      ctxGameArea.lineTo(x - radius, y + radius);
      ctxGameArea.lineTo(x - radius, y - radius);
    }
    ctxGameArea.stroke();

    // draw the range
    if(!this.place) {
      ctxGameArea.lineWidth = 0.5;
      ctxGameArea.beginPath();
      ctxGameArea.arc(x, y, this.range  * METERS_TO_PIXELS,
        0, Math.PI * 2);
      ctxGameArea.stroke();
    }
  }

  update() {
    if(this.place) return; // don't update unless it's placed
    if(this.damaged) this.damaged = false;
    this.seconds += lapsed;
    const sp = this.body.getPosition();
    //this.rayPoints.splice(0, this.rayPoints.length);
    for(let i = 0; i < aliens.length; i++) {
      const ap = aliens[i].body.getPosition();
      const distance = Vec2.distance(ap, sp);
      RayCastClosest.reset();
      world.rayCast(sp, ap, RayCastClosest.callback);
      //if(RayCastClosest.hit) { this.rayPoints.push(RayCastClosest.point); }
      if(
        distance < this.range &&
        this.seconds > this.rateOfFire &&
        Vec2.distance(RayCastClosest.point, sp) >= distance - aliens[i].circleShapeSizeM &&
        --this.currentRounds > 0
      ) {
        const d = ap.sub(sp);       // the direction from sentry to alien
        d.normalize();              // the unit magnitude

        // position for the bullet
        const start = Vec2(sp.x, sp.y); // a new starting point for the bullet
        start.add(d);               // add the unit direction

        // make a bullet
        bullets.push(new Bullet(start.x, start.y, this.color));
        const b = bullets[bullets.length - 1].body;
        b.bulletId = bulletId++;    // bullets get used up

        d.mul(20);               // This is the vector of the bullet
        b.setLinearVelocity(d);
        this.seconds = 0;
        // only shoot at one alien and only at the rate of fire
        break;
      }
    }
  }

  destructor() {
    world.destroyBody(this.body);
  }

  clickCheck() {
  }
}

const getSentryFromId = function(id) {
  let returnVal = null;
  for(let i = 0; i < sentries.length; i++) {
    if(sentries[i].body.sentryId === id) returnVal = sentries[i];
  }
  return returnVal;
};

const getSentryIndexFromId = function(id) {
  let returnVal = -1;
  for(let i = 0; i < sentries.length; i++) {
    if(sentries[i].body.sentryId === id) returnVal = i;
  }
  return returnVal;
};
