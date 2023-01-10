'use strict'

class Change {
  constructor(p) {
    this.property = p[0]; // a property of that changeable object
    this.rate = p[1];     // per second change in the property of an object
    this.start = p[2];    // in seconds from the start of an animation
    this.stop = p[3];     // when to stop making the change in seconds or null to set the value directly
    this.groups = p[4];   // array of group names
    this.type = p[5];     // linear, set, bounce, flip
    this.val1 = p[6];     // values for switching
    this.val2 = p[7];     // ditto
    this.skip = p[8];     // to enable or disable a change
    this.id = p[9];
  }
}
