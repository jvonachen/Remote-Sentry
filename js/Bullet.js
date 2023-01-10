'use strict'

/*
bullet behaviors and sentry upgrades
- bullets that explode into 2 bullets recursively if they hit an alien
- bullets that explode pushing everything away from the center of where they hit
an alien, like a grenade
- bullets that make a wall dynamic temporarily and push it sideways or destroy
it, could be very problematic.  A new edge would have to be made between two
vertices within sight of each other and make the aliens get confused and stuck.
- laser directed at first alien but slices through everything until it hit a
wall.  Could sweep.  Could be stopped by aliens but sweeps.
- bullets that go through everything until it hits a wall and then moves the wall.
- self destruct for sentry, area effect causing damage in inverse square from
location
- lightning - Slow rate of fire.  It has to charge the capacitor, but powerful
and not fully controllable and lasts one iteration, crack.
- plasma - slow rate of fire but a wide linear area of effect
- rail gun cuts through every alien including walls all the way out of the maze.
- the storm trooper star wars style blaster with original sound, looks like a
laser but you can see it move and it never hits an alien, a joke ammunition.
- anti-alien flying bugs
- napalm flame thrower.  Some aliens like it.
- chemical/gas spewer or tear gas - make the aliens in range, which expands and
dissipates, stop and just move randomly and not attack the sentry and then move
slower.
- mind control, makes the alien that gets hit attack other aliens.  Does not
work on all aliens. vampire variant, every other alien it touches does the same
thing, too powerful?  It's possible the alien will attack the one closest alien
making the other alien also attack it and they will kill each other.
- mind control, makes the alien forget the maze.  Does not work on all aliens.
- bullets that embed in the alien and a little later, a range of random time,
explode causing a lot of damage and damage to other aliens in proximity.
 */
class Bullet{
  constructor(x, y, color) {
    this.x = x;
    this.y = y;

    const bd = {};
    bd.position = Vec2(this.x, this.y);
    bd.userData = 'bullet';

    this.body = world.createDynamicBody(bd);
    this.body.setBullet(true);
    this.circleShapeSizeM = 0.1; // radius in meters
    this.body.createFixture({
      shape: planck.Circle(this.circleShapeSizeM),
      density: 8.0 // The density of iron
    });
    this.color = color;
    this.seconds = 0;
    this.ttl = 1; // bullets only live one second
    this.used = false;
  }

  draw() {
    const body = this.body;
    const p = body.getPosition();
    ctxGameArea.fillStyle = this.color;
    if(this.used) ctxGameArea.fillStyle = ALIEN_BLOOD_COLOR;
    ctxGameArea.beginPath();
    ctxGameArea.arc(
      p.x * METERS_TO_PIXELS + xOffset + xShake,
      p.y * METERS_TO_PIXELS + yOffset + yShake,
      BULLET_RADIUS,
      0,
      tau
    );
    ctxGameArea.fill();
  }

  update() {
    this.seconds += lapsed;
    // figure out if this bullet has collided with an alien and then destruct
  }

  destructor() {
    world.destroyBody(this.body);
  }
}

const getBulletFromId = function(id) {
  let returnVal = null;
  for(let i = 0; i < bullets.length; i++) {
    if(bullets[i].body.bulletId === id) returnVal = bullets[i];
  }
  return returnVal;
};
