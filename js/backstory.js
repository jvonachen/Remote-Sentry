'use strict'

const backstory = function() {
  unloadEverything();
  unskipSoundButtons()

  state = BACKSTORY;
  seconds = 0;

  // Animatable Canvas Element (ACE)
  //                    type    text                    x   y    font fill stroke fr fg   fb fa sr    sg    sb    sa     groups
  //                                                                                                                                  |
  aces.push(new Ace(['text', '[A message from the ministry of colonial defense to prospective colonial defenders]', 10, 770, 15, true, false, 0, 255, 0, 1, null, null, null, null, ['move']]));

  aces.push(new Ace(['text', 'In this year of 2179, as you already know, colonies on and off world are protected by maze complexes.', 10, 804, 15, true, false, 0, 255, 0, 1, null, null, null, null, ['move']]));
  aces.push(new Ace(['text', 'They serve as the only entrances and exits to these facilities.  The citizens grow up knowing the path', 10, 821, 15, true, false, 0, 255, 0, 1, null, null, null, null, ['move']]));
  aces.push(new Ace(['text', 'so this presents no challenge to them.  However any non-colonists, who might intend harm, do not.', 10, 838, 15, true, false, 0, 255, 0, 1, null, null, null, null, ['move']]));
  aces.push(new Ace(['text', 'These were put in place to provide compact bottlenecks where remote sentries can be deployed from the', 10, 855, 15, true, false, 0, 255, 0, 1, null, null, null, null, ['move']]));
  aces.push(new Ace(['text', 'space above.  Upgrade, repair, disposable kits, and sentries are stocked with limited supplies.', 10, 872, 15, true, false, 0, 255, 0, 1, null, null, null, null, ['move']]));

  aces.push(new Ace(['text', 'As a colonial defender it is your task to be strategic about where, when, and which sentries to deploy.', 10, 906, 15, true, false, 0, 255, 0, 1, null, null, null, null, ['move']]));
  aces.push(new Ace(['text', 'There are many different kinds of aliens with a great variety of behaviors.  If you fail, colonists', 10, 923, 15, true, false, 0, 255, 0, 1, null, null, null, null, ['move']]));
  aces.push(new Ace(['text', 'will be injured, killed, or enslaved to serve their purposes.  They can then escape in order to ', 10, 940, 15, true, false, 0, 255, 0, 1, null, null, null, null, ['move']]));
  aces.push(new Ace(['text', 'do the same with other colonies.  If the colony is lost you are authorized, in fact ordered,', 10, 957, 15, true, false, 0, 255, 0, 1, null, null, null, null, ['move']]));
  aces.push(new Ace(['text', 'to destroy all.  It\'s the only way to make sure.  You of course will sadly meet your own demise in', 10, 974, 15, true, false, 0, 255, 0, 1, null, null, null, null, ['move']]));
  aces.push(new Ace(['text', 'such an unlikely and unfortunate scenario, but your sacrifice will not be forgotten.', 10, 991, 15, true, false, 0, 255, 0, 1, null, null, null, null, ['move']]));

  aces.push(new Ace(['text', 'We have provided you with this simulation as a training and assessment tool to practice the', 10, 1025, 15, true, false, 0, 255, 0, 1, null, null, null, null, ['move']]));
  aces.push(new Ace(['text', 'management of these costly defence resources.  If you show skill in this we will gladly employ you as', 10, 1042, 15, true, false, 0, 255, 0, 1, null, null, null, null, ['move']]));
  aces.push(new Ace(['text', 'a colonial defender, a highly esteemed and lucrative position in colonial governments.', 10, 1059, 15, true, false, 0, 255, 0, 1, null, null, null, null, ['move']]));

  aces.push(new Ace(['text', 'Good luck.', 10, 1093, 15, true, false, 0, 255, 0, 1, null, null, null, null, ['move']]));

  // changes
  //                          property rate start stop  groups    type      val1  val2  skip   id
  changes.push(new Change(['y',     -10, 0,    null, ['move'], 'linear', null, null, false, 1]));
};
