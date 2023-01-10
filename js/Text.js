'use strict'

class Text {
  constructor(p) {
    // text, x, y, font size in pixels, text color, background color
    this.text = p[0]; this.x = p[1]; this.y = p[2]; this.fontSize = p[3];
    this.textR = p[4]; this.textG = p[5]; this.textB = p[6]; this.textA = p[7];
    this.backR = p[8]; this.backG = p[9]; this.backB = p[10];
    this.backA = p[11];
  }

  // this function called every frame
  draw() {
    ctxGameArea.font = this.fontSize + 'px apple2';
    const o = ctxGameArea.measureText(this.text);

    // background
    ctxGameArea.beginPath();
    ctxGameArea.fillStyle = `rgba(${this.backR}, ${this.backG}, ${this.backB},
      ${this.backA})`;
    ctxGameArea.rect(this.x, this.y, o.width, this.fontSize);
    ctxGameArea.fill();

    // text
    ctxGameArea.fillStyle = `rgba(${this.textR}, ${this.textG}, ${this.textB},
      ${this.textA})`;
    ctxGameArea.fillText(this.text, this.x, this.y + this.fontSize);
  }

  // this function called every frame also
  update() {
    const seconds = frame / framesPerSecond;
    for(let i = 0; i < changes.length; i++) {
      const c = changes[i];
      if(
        c.class === 'Text' &&
        c.object === this.text &&
        seconds > c.start &&
        (seconds < c.stop || c.stop === null)
      ) {
        this[c.property] += c.rate / framesPerSecond;
      }
    }
  }
}
