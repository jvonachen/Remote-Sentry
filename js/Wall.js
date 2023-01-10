'use strict'

class Wall {
  // from SVG means they are in SVG units else from JSON they are already Meters
  constructor(w) {
    const p1x = w[0];
    const p1y = w[1];
    const p2x = w[2];
    const p2y = w[3];

    const bd = {};
    bd.position = Vec2((p1x + p2x) / 2, (p1y + p2y) / 2);
    bd.userData = 'wall';

    this.body = world.createBody(bd);
    this.body.createFixture(planck.Edge(
      Vec2((p1x - p2x) / 2, (p1y - p2y) / 2),
      Vec2((p2x - p1x) / 2, (p2y - p1y) / 2)
    ));

    // default values
    this.strokeStyle = (w[4] === undefined) ? '#808080' : w[4];
    this.lineWidth = (w[5] === undefined) ? 1 : w[5];
    this.exit = this.spawn = false;
  }

  draw() {
    const body = this.body;
    const positionX = body.getPosition().x;
    const positionY = body.getPosition().y;
    const shape = body.getFixtureList().getShape();
    const v1 = shape.m_vertex1;
    const v2 = shape.m_vertex2;
    const offsetX = xOffset + xShake;
    const offsetY = yOffset + yShake;
    ctxGameArea.strokeStyle = this.strokeStyle;
    ctxGameArea.lineWidth = this.lineWidth;
    ctxGameArea.beginPath();
    if(!this.spawn || !this.exit) {
      ctxGameArea.moveTo(
        (positionX + v1.x) * METERS_TO_PIXELS + offsetX,
        (positionY + v1.y) * METERS_TO_PIXELS + offsetY
      );
      ctxGameArea.lineTo(
        (positionX + v2.x) * METERS_TO_PIXELS + offsetX,
        (positionY + v2.y) * METERS_TO_PIXELS + offsetY
      );
    }
    ctxGameArea.stroke();
  }

  update() {}

  destructor() {
    world.destroyBody(this.body);
  }
}
