'use strict'

// Animatable Canvas Element
class Ace {
  constructor(p) {
    this.type = p[0];
    switch(this.type) {
      case 'rect':
        this.x = p[1]; this.y = p[2]; this.w = p[3]; this.h = p[4];
        this.lineWidth = p[5]; this.fill = p[6]; this.stroke = p[7];
        this.fillR = p[8]; this.fillG = p[9]; this.fillB = p[10];
        this.fillA = p[11]; this.strokeR = p[12]; this.strokeG = p[13];
        this.strokeB = p[14]; this.strokeA = p[15]; this.groups = p[16];
        this.panable = p[17];
        break;
      case 'text':
        this.text = p[1]; this.x = p[2]; this.y = p[3]; this.fontSize = p[4];
        this.fill = p[5]; this.stroke = p[6]; this.fillR = p[7];
        this.fillG = p[8]; this.fillB = p[9]; this.fillA = p[10];
        this.strokeR = p[11]; this.strokeG = p[12]; this.strokeB = p[13];
        this.strokeA = p[14]; this.groups = p[15];
        break;
      case 'path':
        // need to do a deep copy of this array, keep an eye on that kind of
        //  thing in the future
        const path = [];
        let tempArray;
        for(let i = 0; i < p[1].length; i++) {
          tempArray = [];
          tempArray[0] = p[1][i][0];
          tempArray[1] = p[1][i][1];
          path.push(tempArray);
        }
        this.path = path;

        this.lineWidth = p[2]; this.fill = p[3];
        this.stroke = p[4]; this.fillR = p[5]; this.fillG = p[6];
        this.fillB = p[7]; this.fillA = p[8]; this.strokeR = p[9];
        this.strokeG = p[10]; this.strokeB = p[11]; this.strokeA = p[12];
        this.groups = p[13];
        break;
      default:
        alert('constructor: unsupported type of animatable canvas element "' +
          this.type + '"');
        break;
    }
    this.flipTimer = 0;
  };

  // this function called every iteration
  draw() {
    switch(this.type) {
      case 'rect':
        let panX = 0;
        let panY = 0;
        if(this.panable !== undefined) {
          panX = xOffset;
          panY = yOffset;
        }
        if(this.stroke) {
          ctxGameArea.globalAlpha = this.strokeA;
          ctxGameArea.strokeStyle = `rgb(${this.strokeR}, ${this.strokeG},
            ${this.strokeB})`;
          ctxGameArea.lineWidth = this.lineWidth;
          ctxGameArea.strokeRect(this.x, this.y, this.w, this.h);
        }
        if(this.fill) {
          ctxGameArea.globalAlpha = this.fillA;
          ctxGameArea.fillStyle = `rgb(${this.fillR}, ${this.fillG},
            ${this.fillB})`;
          ctxGameArea.fillRect(this.x + panX, this.y + panY, this.w, this.h);
        }
        break;
      case 'text':
        // polymorphism in javascript!
        let displayedText;
        switch(typeof this.text) {
          case 'object':
            alert('Ace.js: draw(): unhandled type: object');
            return;
          case 'string': displayedText = this.text; break;
          case 'number': displayedText = Math.round(this.text); break;
          case 'boolean': displayedText = this.text ? 'true' : 'false'; break;
          case 'function': displayedText = this.text(); break;
          case 'undefined': displayedText = 'undefined'; break;
          default:
            alert('Ace.js: draw(): unknown type: ' + typeof this.text); break;
        }
        ctxGameArea.font = this.fontSize + 'px apple2';
        if(this.stroke) {
          ctxGameArea.globalAlpha = this.strokeA;
          ctxGameArea.strokeStyle = `rgb(${this.strokeR}, ${this.strokeG},
            ${this.strokeB})`;
          ctxGameArea.strokeText(displayedText, this.x,this.y +
            this.fontSize);
        }
        if(this.fill) {
          ctxGameArea.globalAlpha = this.fillA;
          ctxGameArea.fillStyle = `rgb(${this.fillR}, ${this.fillG},
            ${this.fillB})`;
          ctxGameArea.fillText(displayedText, this.x,this.y +
            this.fontSize);
        }
        break;
      case 'path':
        if(this.stroke) {
          ctxGameArea.globalAlpha = this.strokeA;
          ctxGameArea.strokeStyle = `rgb(${this.strokeR}, ${this.strokeG},
            ${this.strokeB})`;
          ctxGameArea.beginPath();
          ctxGameArea.moveTo(this.path[0][0], this.path[0][1]);
          for(let i = 1; i < this.path.length; i++) {
            ctxGameArea.lineTo(this.path[i][0], this.path[i][1]);
          }
          ctxGameArea.closePath();
          ctxGameArea.stroke();
        }
        if(this.fill) {
          ctxGameArea.globalAlpha = this.fillA;
          ctxGameArea.fillStyle = `rgb(${this.fillR}, ${this.fillG},
            ${this.fillB})`;
          ctxGameArea.beginPath();
          ctxGameArea.moveTo(this.path[0][0], this.path[0][1]);
          for(let i = 1; i < this.path.length; i++) {
            ctxGameArea.lineTo(this.path[i][0], this.path[i][1]);
          }
          ctxGameArea.closePath();
          ctxGameArea.fill();
        }
        break;
      default:
        alert('draw: unsupported type of animatable canvas element "' +
          this.type + '"');
        break;
    }
  };

  // this function also called every iteration
  update() {
    for(let i = 0; i < changes.length; i++) {
      const c = changes[i];
      if(c.skip) continue;
      for(let j = 0; j < c.groups.length; j++) {
        for(let k = 0; k < this.groups.length; k++) {
          if(seconds > c.start && (seconds < c.stop || c.stop === null) &&
            c.groups[j] === this.groups[k]
          ) {
            if(c.type === 'set') {
              if(this.type === 'path') {
                if(c.property === 'x') {
                  for(let l = 0; l < this.path.length; l++) {
                    this.path[l][0] += c.rate;
                  }
                } else if (c.property === 'y') {
                  for (let l = 0; l < this.path.length; l++) {
                    this.path[l][1] += c.rate;
                  }
                } else { // any property other than x or y for a path ace
                  this[c.property] += c.rate;
                }
              } else {
                this[c.property] += c.rate;
              }
              changeSkipList.push([changes[i].id, true]);
              // element removals happen after all objects have be updated.
            } else if(c.type === 'flip') {
              if(this.flipTimer > c.rate) {
                if(this[c.property] !== c.val1) this[c.property] = c.val1;
                else this[c.property] = c.val2;
                this.flipTimer = 0;
              }
            } else { // change type is linear or bounce
              // path does not have a single x or y property so increment each
              //  path element
              if(this.type === 'path') {
                if(c.property === 'x') {
                  for(let l = 0; l < this.path.length; l++) {
                    this.path[l][0] += c.rate * lapsed;
                  }
                } else if(c.property === 'y') {
                  for(let l = 0; l < this.path.length; l++) {
                    this.path[l][1] += c.rate * lapsed;
                  }
                } else { // any property other than x or y for a path ace
                  this[c.property] += c.rate * lapsed;
                }
              } else {
                if(this[c.property] !== null) {
                  this[c.property] += c.rate * lapsed;
                  let limitHit = false;
                  if(c.property === 'fillA' || c.property === 'strokeA') {
                    if(this[c.property] < 0) {
                      this[c.property] = 0;
                      limitHit = true;
                    } else if(this[c.property] > 1) {
                      this[c.property] = 1;
                      limitHit = true;
                    }
                  }
                  if(
                    c.property === 'fillR' || c.property === 'strokeR' ||
                    c.property === 'fillG' || c.property === 'strokeG' ||
                    c.property === 'fillB' || c.property === 'strokeB'
                  ) {
                    if(this[c.property] < 0) {
                      this[c.property] = 0;
                      limitHit = true;
                    } else if(this[c.property] > 254) {
                      this[c.property] = 254;
                      limitHit = true;
                    }
                  }
                  if(limitHit && c.type === 'bounce') c.rate = -c.rate;
                }
              }
            }
          }
        }
      }
    }
  };
}

const getAces = function(group, index) {
  const aoa = [];
  for(let b = 0; b < aces.length; b++) {
    for(let a = 0; a < aces[b].groups.length; a++) {
      if(aces[b].groups[a] === group) {
        if(!index) aoa.push(aces[b]);
        else aoa.push(b);
      }
    }
  }
  return aoa;
};
