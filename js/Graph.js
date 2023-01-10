'use strict'

// create a graph class
class Graph {
  // defining vertex array and adjacent list
  constructor(noOfVertices) {
    this.noOfVertices = noOfVertices !== undefined ? noOfVertices : 0;
    this.adjList = new Map();
    this.walk = [];
  }

  // add vertex to the graph
  addVertex(v) {
    this.noOfVertices++;
    this.adjList.set(v, []); // initialize the adjacent list with a null array
  }

  // add edge to the graph
  addEdge(v, w) {
    // get the list for vertex v and put the vertex w denoting edge between v
    //  and w
    this.adjList.get(v).push(w);
    // Since graph is undirected, add an edge from w to v also
    this.adjList.get(w).push(v);
  }

  // Print the vertex and adjacency list
  printGraph() {
    const getKeys = this.adjList.keys(); // get all the vertices
    for(let i of getKeys) { // iterate over the vertices
      // great the corresponding adjacency list for the vertex

      /*
      // iterate over the adjacency list concatenate the values into a string
      const getValues = this.adjList.get(i);
      let adjListString = '';
      for(let j of getValues) adjListString += j + ' ';
      console.log(i + ' -> ' + adjListString); // print the vertex and its adjacency list
      */
    }
  }

  // function to performs BFS
  bfs(startingNode) {
    const visited = []; // create a visited array
    for(let i = 0; i < this.noOfVertices; i++) visited[i] = false;
    const q = new Queue(); // Create an object for queue
    visited[startingNode] = true; // add the starting node to the queue
    q.enqueue(startingNode);
    while(!q.isEmpty()) { // loop until queue is element
      const getQueueElement = q.dequeue(); // get the element from the queue
      // passing the current vertex to callback function
      this.walk += getQueueElement + ', ';
      // get the adjacent list for current vertex
      const get_List = this.adjList.get(getQueueElement);
      // loop through the list and add the element to the queue if it is not
      //  processed yet
      for(let i in get_List) {
        const neigh = get_List[i];
        if(!visited[neigh]) {
          visited[neigh] = true;
          q.enqueue(neigh);
        }
      }
    }
  }

  // Main DFS method
  dfs(startingNode) {
    const visited = [];
    this.walk = [];
    for (let i = 0; i < this.noOfVertices; i++) visited[i] = false;
    this.DFSUtil(startingNode, visited);
  }

  // Recursive function which process and explore all the adjacent vertex of the
  //  vertex with which it is called
  DFSUtil(vert, visited) {
    visited[vert] = true;
    const get_neighbours = this.adjList.get(vert);
    for(let i in get_neighbours) {
      const get_elem = get_neighbours[i];
      if(!visited[get_elem]) this.DFSUtil(get_elem, visited);
    }
  }
}
