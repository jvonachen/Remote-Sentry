'use strict'

// maze
const vertexVisitRange = 2;

// This creates a string of buttons for selecting maps or mazes
const mazeMenu = function() {
  // get rid of any extra buttons hanging out
  clearMazeMenuButtons();
  // make new buttons
  for(let i = 0; i < 10; i++) {
    const n = i + 1;
    buttons.push(new Button([1293 - 72 * n, this.y, 60, 60, 10, 1, true,
      '#00FF00', false, '#000000', n.toString(), '#808080', '25',
      function() { loadMaze(this) }, false, this.id +
      n.toString().padStart(2, '0'), true]));
  }
  for(let i = 0; i < MAZE_TYPES.length; i++) {
    getButton(MAZE_TYPES[i]).ss = '#00FF00';
  }
};

// this clears those map or maze selecting buttons
const clearMazeMenuButtons = function() {
  for (let j = 0; j < MAZE_TYPES.length; j++) {
    for(let i = 0; i < 10; i++) {
      const n = i + 1;
      const index = getButton(MAZE_TYPES[j] + n.toString().padStart(2, '0'),
        false, true);
      if(index !== null) buttons.splice(index, 1);
    }
  }
};

// the name of the file being loaded dynamically from the server
let mazeFile;

// this needs this scope because it needs to be written to the JSON file if or
//  when it's written
let mapName;

const loadMaze = function(o, resetOffsets) {
  if(resetOffsets === undefined) resetOffsets = true;
  mazeFile = o.id;
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.open('get', 'mazes/' + mazeFile + '.json', true);
  xmlhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      const gameMap = JSON.parse(this.responseText);

      // display the name of this map on the left hand side
      mapName = gameMap.name;
      // remove the old map name from the aces array if one exists
      const getAcesReturn = getAces('mapName', true);
      if (getAcesReturn.length > 0) aces.splice(getAcesReturn[0], 1);
      // push a new one
      aces.push(new Ace(['text', mapName, 10, 50, 10, true, false, 0, 255,
        0, 1, null, null, null, null, ['mapName']]));

      // save the vertices and edges
      vertices = gameMap.vertices === undefined ? [] : gameMap.vertices;
      edges = gameMap.edges === undefined ? [] : gameMap.edges;
      graph = new Graph();
      // load vertices into the common graph
      for(let i = 0; i < vertices.length; i++) graph.addVertex(i);
      // load edges into the common graph
      for(let i = 0; i < edges.length; i++) graph.addEdge(edges[i].v1, edges[i].v2);

      // figure out what the minX and minY are
      let maxX = -10000, maxY = -10000, minX = 10000, minY = 10000;
      for(let i = 0; i < gameMap.walls.length; i++) {
        const w = gameMap.walls[i];
        if (w.p1x > maxX) maxX = w.p1x;
        if (w.p1x < minX) minX = w.p1x;
        if (w.p1y > maxY) maxY = w.p1y;
        if (w.p1y < minY) minY = w.p1y;
        if (w.p2x > maxX) maxX = w.p2x;
        if (w.p2x < minX) minX = w.p2x;
        if (w.p2y > maxY) maxY = w.p2y;
        if (w.p2y < minY) minY = w.p2y;
      }

      // before loading the walls array clear it out
      for(let i = 0; i < walls.length; i++) { walls[i].destructor(); }
      walls.splice(0, walls.length);

      // if either minX or minY were not 0 then adjust every coordinate so they
      //  will be.
      let adjusted = false;
      for (let i = 0; i < gameMap.walls.length; i++) {
        const w = gameMap.walls[i];
        if(minX !== 0 || minY !== 0) {
          w.p1x -= minX;
          w.p1y -= minY;
          w.p2x -= minX;
          w.p2y -= minY;
          adjusted = true;
        }
        walls.push(new Wall([w.p1x, w.p1y, w.p2x, w.p2y]));
      }

      // if the walls were adjusted then adjust the vertices the same
      if(adjusted) {
        for(let i = 0; i < vertices.length; i++) {
          const v = vertices[i];
          v.x -= minX;
          v.y -= minY;
        }
      }

      const widthOfMazeInMeters = maxX - minX;
      const heightOfMazeInMeters = maxY - minY;
      const widthOfMazeInPixels = widthOfMazeInMeters * METERS_TO_PIXELS;
      const heightOfMazeInPixels = heightOfMazeInMeters * METERS_TO_PIXELS;
      if (resetOffsets) {
        xOffset = (gameArea.width / 2) - (widthOfMazeInPixels / 2);
        yOffset = (gameArea.height / 2) - (heightOfMazeInPixels / 2);
      }
      bloodCanvas.width = widthOfMazeInPixels;
      bloodCanvas.height = heightOfMazeInPixels;

      // enable go and pan buttons
      getButton('go').skip = false;
      getButton('panUp').skip = false;
      getButton('panDown').skip = false;
      getButton('panLeft').skip = false;
      getButton('panRight').skip = false;
      getButton('edit').skip = false;
      clearMazeMenuButtons();

      if(adjusted) saveJSON();
    }
  };
  xmlhttp.send(null);
};

// After using the game designer features this saves the maze (everything) file
const saveJSON = function() {
  let gameMap = {};
  gameMap.name = mapName;
  gameMap.walls = [];
  for(let i = 0; i < walls.length; i++) {
    const b = walls[i].body;
    const p = b.getPosition();
    const s = b.getFixtureList().getShape();
    const v1 = s.m_vertex1;
    const v2 = s.m_vertex2;
    gameMap.walls.push({p1x:p.x + v1.x, p1y:p.y + v1.y, p2x:p.x + v2.x,
      p2y:p.y + v2.y});
  }
  gameMap.vertices = [];
  for(let i = 0; i < vertices.length; i++) gameMap.vertices.push(vertices[i]);
  gameMap.edges = [];
  for(let i = 0; i < edges.length; i++) gameMap.edges.push(edges[i]);

  const xmlHTTP = new XMLHttpRequest();
  xmlHTTP.open('POST', 'mazes/' + mazeFile + '.json', true);
  xmlHTTP.setRequestHeader('Content-Type', 'application/json');
  xmlHTTP.onreadystatechange = function() {
    if(this.readyState === 4 && this.status === 200) {
      //alert(this.responseText);
      loadMaze({id:mazeFile}, false); // don't reset the offsets
    }
  };
  xmlHTTP.send(JSON.stringify(gameMap));
};
