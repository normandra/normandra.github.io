(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.parseJson = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports.degree = require('./src/degree.js');
module.exports.betweenness = require('./src/betweenness.js');
module.exports.closeness = require('./src/closeness.js');
module.exports.eccentricity = require('./src/eccentricity.js');

},{"./src/betweenness.js":2,"./src/closeness.js":3,"./src/degree.js":4,"./src/eccentricity.js":5}],2:[function(require,module,exports){
module.exports = betweennes;

/**
 * I'm using http://www.inf.uni-konstanz.de/algo/publications/b-vspbc-08.pdf
 * as a reference for this implementation
 */
function betweennes(graph, oriented) {
  var Q = [],
    S = []; // Queue and Stack
  // list of predcessors on shorteest paths from source
  var pred = Object.create(null);
  // distance from source
  var dist = Object.create(null);
  // number of shortest paths from source to key
  var sigma = Object.create(null);
  // dependency of source on key
  var delta = Object.create(null);

  var currentNode;
  var centrality = Object.create(null);

  graph.forEachNode(setCentralityToZero);
  graph.forEachNode(calculateCentrality);

  if (!oriented) {
    // The centrality scores need to be divided by two if the graph is not oriented,
    // since all shortest paths are considered twice
    Object.keys(centrality).forEach(divideByTwo);
  }

  return centrality;

  function divideByTwo(key) {
    centrality[key] /= 2;
  }

  function setCentralityToZero(node) {
    centrality[node.id] = 0;
  }

  function calculateCentrality(node) {
    currentNode = node.id;
    singleSourceShortestPath(currentNode);
    accumulate();
  }

  function accumulate() {
    graph.forEachNode(setDeltaToZero);
    while (S.length) {
      var w = S.pop();
      var coeff = (1 + delta[w])/sigma[w];
      var predcessors = pred[w];
      for (var idx = 0; idx < predcessors.length; ++idx) {
        var v = predcessors[idx];
        delta[v] += sigma[v] * coeff;
      }
      if (w !== currentNode) {
        centrality[w] += delta[w];
      }
    }
  }

  function setDeltaToZero(node) {
    delta[node.id] = 0;
  }

  function singleSourceShortestPath(source) {
    graph.forEachNode(initNode);
    dist[source] = 0;
    sigma[source] = 1;
    Q.push(source);

    while (Q.length) {
      var v = Q.shift();
      S.push(v);
      graph.forEachLinkedNode(v, toId, oriented);
    }

    function toId(otherNode) {
      // NOTE: This code will also consider multi-edges, which are often
      // ignored by popular software (Gephi/NetworkX). Depending on your use
      // case this may not be desired and deduping needs to be performed. To
      // save memory I'm not deduping here...
      processNode(otherNode.id);
    }

    function initNode(node) {
      var nodeId = node.id;
      pred[nodeId] = []; // empty list
      dist[nodeId] = -1;
      sigma[nodeId] = 0;
    }

    function processNode(w) {
      // path discovery
      if (dist[w] === -1) {
        // Node w is found for the first time
        dist[w] = dist[v] + 1;
        Q.push(w);
      }
      // path counting
      if (dist[w] === dist[v] + 1) {
        // edge (v, w) on a shortest path
        sigma[w] += sigma[v];
        pred[w].push(v);
      }
    }
  }
}

},{}],3:[function(require,module,exports){
module.exports = closeness;

/**
 * In a connected graph, the normalized closeness centrality of a node is the average
 * length of the shortest path between the node and all other nodes in the
 * graph. Thus the more central a node is, the closer it is to all other nodes.
 */
function closeness(graph, oriented) {
  var Q = [];
  // list of predcessors on shortest paths from source
  // distance from source
  var dist = Object.create(null);

  var currentNode;
  var centrality = Object.create(null);

  graph.forEachNode(setCentralityToZero);
  graph.forEachNode(calculateCentrality);

  return centrality;

  function setCentralityToZero(node) {
    centrality[node.id] = 0;
  }

  function calculateCentrality(node) {
    currentNode = node.id;
    singleSourceShortestPath(currentNode);
    accumulate();
  }

  function accumulate() {
    // Add all distances for node to array, excluding -1s
    var distances = Object.keys(dist).map(function(key) {return dist[key]}).filter(function(val){return val !== -1});
    // Set number of reachable nodes
    var reachableNodesTotal = distances.length;
    // Compute sum of all distances for node
    var totalDistance = distances.reduce(function(a,b) { return a + b });
    if (totalDistance > 0) {
      centrality[currentNode] = ((reachableNodesTotal - 1) / totalDistance); 
    } else {
      centrality[currentNode] = 0;
    }
  }

  function singleSourceShortestPath(source) {
    graph.forEachNode(initNode);
    dist[source] = 0;
    Q.push(source);

    while (Q.length) {
      var v = Q.shift();
      graph.forEachLinkedNode(v, processNode, oriented);
    }

    function initNode(node) {
      var nodeId = node.id;
      dist[nodeId] = -1;
    }

    function processNode(otherNode) {
      var w = otherNode.id
      if (dist[w] === -1) {
        // Node w is found for the first time
        dist[w] = dist[v] + 1;
        Q.push(w);
      }
    }
  }
}

},{}],4:[function(require,module,exports){
module.exports = degree;

/**
 * Calculates graph nodes degree centrality (in/out or both).
 *
 * @see http://en.wikipedia.org/wiki/Centrality#Degree_centrality
 *
 * @param {ngraph.graph} graph object for which we are calculating centrality.
 * @param {string} [kind=both] What kind of degree centrality needs to be calculated:
 *   'in'    - calculate in-degree centrality
 *   'out'   - calculate out-degree centrality
 *   'inout' - (default) generic degree centrality is calculated
 */
function degree(graph, kind) {
  var getNodeDegree;
  var result = Object.create(null);

  kind = (kind || 'both').toLowerCase();
  if (kind === 'both' || kind === 'inout') {
    getNodeDegree = inoutDegreeCalculator;
  } else if (kind === 'in') {
    getNodeDegree = inDegreeCalculator;
  } else if (kind === 'out') {
    getNodeDegree = outDegreeCalculator;
  } else {
    throw new Error('Expected centrality degree kind is: in, out or both');
  }

  graph.forEachNode(calculateNodeDegree);

  return result;

  function calculateNodeDegree(node) {
    var links = graph.getLinks(node.id);
    result[node.id] = getNodeDegree(links, node.id);
  }
}

function inDegreeCalculator(links, nodeId) {
  var total = 0;
  if (!links) return total;

  for (var i = 0; i < links.length; i += 1) {
    total += (links[i].toId === nodeId) ? 1 : 0;
  }
  return total;
}

function outDegreeCalculator(links, nodeId) {
  var total = 0;
  if (!links) return total;

  for (var i = 0; i < links.length; i += 1) {
    total += (links[i].fromId === nodeId) ? 1 : 0;
  }
  return total;
}

function inoutDegreeCalculator(links) {
  if (!links) return 0;

  return links.length;
}

},{}],5:[function(require,module,exports){
module.exports = eccentricity;

/**
 * The eccentricity centrality of a node is the greatest distance between that node and
 * any other node in the network. 
 */
function eccentricity(graph, oriented) {
  var Q = [];
  // distance from source
  var dist = Object.create(null);

  var currentNode;
  var centrality = Object.create(null);

  graph.forEachNode(setCentralityToZero);
  graph.forEachNode(calculateCentrality);

  return centrality;

  function setCentralityToZero(node) {
    centrality[node.id] = 0;
  }

  function calculateCentrality(node) {
    currentNode = node.id;
    singleSourceShortestPath(currentNode);
    accumulate();
  }

  function accumulate() {
    var maxDist = 0;
    Object.keys(dist).forEach(function (key) {
      var val = dist[key];
      if (maxDist < val) maxDist = val;
    });

    centrality[currentNode] = maxDist;
  }

  function singleSourceShortestPath(source) {
    graph.forEachNode(initNode);
    dist[source] = 0;
    Q.push(source);

    while (Q.length) {
      var v = Q.shift();
      graph.forEachLinkedNode(v, processNode, oriented);
    }

    function initNode(node) {
      var nodeId = node.id;
      dist[nodeId] = -1;
    }

    function processNode(otherNode) {
      var w = otherNode.id
      if (dist[w] === -1) {
        // Node w is found for the first time
        dist[w] = dist[v] + 1;
        Q.push(w);
      }
    }
  }
}

},{}],6:[function(require,module,exports){
module.exports = function(subject) {
  validateSubject(subject);

  var eventsStorage = createEventsStorage(subject);
  subject.on = eventsStorage.on;
  subject.off = eventsStorage.off;
  subject.fire = eventsStorage.fire;
  return subject;
};

function createEventsStorage(subject) {
  // Store all event listeners to this hash. Key is event name, value is array
  // of callback records.
  //
  // A callback record consists of callback function and its optional context:
  // { 'eventName' => [{callback: function, ctx: object}] }
  var registeredEvents = Object.create(null);

  return {
    on: function (eventName, callback, ctx) {
      if (typeof callback !== 'function') {
        throw new Error('callback is expected to be a function');
      }
      var handlers = registeredEvents[eventName];
      if (!handlers) {
        handlers = registeredEvents[eventName] = [];
      }
      handlers.push({callback: callback, ctx: ctx});

      return subject;
    },

    off: function (eventName, callback) {
      var wantToRemoveAll = (typeof eventName === 'undefined');
      if (wantToRemoveAll) {
        // Killing old events storage should be enough in this case:
        registeredEvents = Object.create(null);
        return subject;
      }

      if (registeredEvents[eventName]) {
        var deleteAllCallbacksForEvent = (typeof callback !== 'function');
        if (deleteAllCallbacksForEvent) {
          delete registeredEvents[eventName];
        } else {
          var callbacks = registeredEvents[eventName];
          for (var i = 0; i < callbacks.length; ++i) {
            if (callbacks[i].callback === callback) {
              callbacks.splice(i, 1);
            }
          }
        }
      }

      return subject;
    },

    fire: function (eventName) {
      var callbacks = registeredEvents[eventName];
      if (!callbacks) {
        return subject;
      }

      var fireArguments;
      if (arguments.length > 1) {
        fireArguments = Array.prototype.splice.call(arguments, 1);
      }
      for(var i = 0; i < callbacks.length; ++i) {
        var callbackInfo = callbacks[i];
        callbackInfo.callback.apply(callbackInfo.ctx, fireArguments);
      }

      return subject;
    }
  };
}

function validateSubject(subject) {
  if (!subject) {
    throw new Error('Eventify cannot use falsy object as events subject');
  }
  var reservedWords = ['on', 'fire', 'off'];
  for (var i = 0; i < reservedWords.length; ++i) {
    if (subject.hasOwnProperty(reservedWords[i])) {
      throw new Error("Subject cannot be eventified, since it already has property '" + reservedWords[i] + "'");
    }
  }
}

},{}],7:[function(require,module,exports){
/**
 * @fileOverview Contains definition of the core graph object.
 */

// TODO: need to change storage layer:
// 1. Be able to get all nodes O(1)
// 2. Be able to get number of links O(1)

/**
 * @example
 *  var graph = require('ngraph.graph')();
 *  graph.addNode(1);     // graph has one node.
 *  graph.addLink(2, 3);  // now graph contains three nodes and one link.
 *
 */
module.exports = createGraph;

var eventify = require('ngraph.events');

/**
 * Creates a new graph
 */
function createGraph(options) {
  // Graph structure is maintained as dictionary of nodes
  // and array of links. Each node has 'links' property which
  // hold all links related to that node. And general links
  // array is used to speed up all links enumeration. This is inefficient
  // in terms of memory, but simplifies coding.
  options = options || {};
  if ('uniqueLinkId' in options) {
    console.warn(
      'ngraph.graph: Starting from version 0.14 `uniqueLinkId` is deprecated.\n' +
      'Use `multigraph` option instead\n',
      '\n',
      'Note: there is also change in default behavior: From now on each graph\n'+
      'is considered to be not a multigraph by default (each edge is unique).'
    );

    options.multigraph = options.uniqueLinkId;
  }

  // Dear reader, the non-multigraphs do not guarantee that there is only
  // one link for a given pair of node. When this option is set to false
  // we can save some memory and CPU (18% faster for non-multigraph);
  if (options.multigraph === undefined) options.multigraph = false;

  var nodes = typeof Object.create === 'function' ? Object.create(null) : {},
    links = [],
    // Hash of multi-edges. Used to track ids of edges between same nodes
    multiEdges = {},
    nodesCount = 0,
    suspendEvents = 0,

    forEachNode = createNodeIterator(),
    createLink = options.multigraph ? createUniqueLink : createSingleLink,

    // Our graph API provides means to listen to graph changes. Users can subscribe
    // to be notified about changes in the graph by using `on` method. However
    // in some cases they don't use it. To avoid unnecessary memory consumption
    // we will not record graph changes until we have at least one subscriber.
    // Code below supports this optimization.
    //
    // Accumulates all changes made during graph updates.
    // Each change element contains:
    //  changeType - one of the strings: 'add', 'remove' or 'update';
    //  node - if change is related to node this property is set to changed graph's node;
    //  link - if change is related to link this property is set to changed graph's link;
    changes = [],
    recordLinkChange = noop,
    recordNodeChange = noop,
    enterModification = noop,
    exitModification = noop;

  // this is our public API:
  var graphPart = {
    /**
     * Adds node to the graph. If node with given id already exists in the graph
     * its data is extended with whatever comes in 'data' argument.
     *
     * @param nodeId the node's identifier. A string or number is preferred.
     * @param [data] additional data for the node being added. If node already
     *   exists its data object is augmented with the new one.
     *
     * @return {node} The newly added node or node with given id if it already exists.
     */
    addNode: addNode,

    /**
     * Adds a link to the graph. The function always create a new
     * link between two nodes. If one of the nodes does not exists
     * a new node is created.
     *
     * @param fromId link start node id;
     * @param toId link end node id;
     * @param [data] additional data to be set on the new link;
     *
     * @return {link} The newly created link
     */
    addLink: addLink,

    /**
     * Removes link from the graph. If link does not exist does nothing.
     *
     * @param link - object returned by addLink() or getLinks() methods.
     *
     * @returns true if link was removed; false otherwise.
     */
    removeLink: removeLink,

    /**
     * Removes node with given id from the graph. If node does not exist in the graph
     * does nothing.
     *
     * @param nodeId node's identifier passed to addNode() function.
     *
     * @returns true if node was removed; false otherwise.
     */
    removeNode: removeNode,

    /**
     * Gets node with given identifier. If node does not exist undefined value is returned.
     *
     * @param nodeId requested node identifier;
     *
     * @return {node} in with requested identifier or undefined if no such node exists.
     */
    getNode: getNode,

    /**
     * Gets number of nodes in this graph.
     *
     * @return number of nodes in the graph.
     */
    getNodesCount: function () {
      return nodesCount;
    },

    /**
     * Gets total number of links in the graph.
     */
    getLinksCount: function () {
      return links.length;
    },

    /**
     * Gets all links (inbound and outbound) from the node with given id.
     * If node with given id is not found null is returned.
     *
     * @param nodeId requested node identifier.
     *
     * @return Array of links from and to requested node if such node exists;
     *   otherwise null is returned.
     */
    getLinks: getLinks,

    /**
     * Invokes callback on each node of the graph.
     *
     * @param {Function(node)} callback Function to be invoked. The function
     *   is passed one argument: visited node.
     */
    forEachNode: forEachNode,

    /**
     * Invokes callback on every linked (adjacent) node to the given one.
     *
     * @param nodeId Identifier of the requested node.
     * @param {Function(node, link)} callback Function to be called on all linked nodes.
     *   The function is passed two parameters: adjacent node and link object itself.
     * @param oriented if true graph treated as oriented.
     */
    forEachLinkedNode: forEachLinkedNode,

    /**
     * Enumerates all links in the graph
     *
     * @param {Function(link)} callback Function to be called on all links in the graph.
     *   The function is passed one parameter: graph's link object.
     *
     * Link object contains at least the following fields:
     *  fromId - node id where link starts;
     *  toId - node id where link ends,
     *  data - additional data passed to graph.addLink() method.
     */
    forEachLink: forEachLink,

    /**
     * Suspend all notifications about graph changes until
     * endUpdate is called.
     */
    beginUpdate: enterModification,

    /**
     * Resumes all notifications about graph changes and fires
     * graph 'changed' event in case there are any pending changes.
     */
    endUpdate: exitModification,

    /**
     * Removes all nodes and links from the graph.
     */
    clear: clear,

    /**
     * Detects whether there is a link between two nodes.
     * Operation complexity is O(n) where n - number of links of a node.
     * NOTE: this function is synonim for getLink()
     *
     * @returns link if there is one. null otherwise.
     */
    hasLink: getLink,

    /**
     * Detects whether there is a node with given id
     * 
     * Operation complexity is O(1)
     * NOTE: this function is synonim for getNode()
     *
     * @returns node if there is one; Falsy value otherwise.
     */
    hasNode: getNode,

    /**
     * Gets an edge between two nodes.
     * Operation complexity is O(n) where n - number of links of a node.
     *
     * @param {string} fromId link start identifier
     * @param {string} toId link end identifier
     *
     * @returns link if there is one. null otherwise.
     */
    getLink: getLink
  };

  // this will add `on()` and `fire()` methods.
  eventify(graphPart);

  monitorSubscribers();

  return graphPart;

  function monitorSubscribers() {
    var realOn = graphPart.on;

    // replace real `on` with our temporary on, which will trigger change
    // modification monitoring:
    graphPart.on = on;

    function on() {
      // now it's time to start tracking stuff:
      graphPart.beginUpdate = enterModification = enterModificationReal;
      graphPart.endUpdate = exitModification = exitModificationReal;
      recordLinkChange = recordLinkChangeReal;
      recordNodeChange = recordNodeChangeReal;

      // this will replace current `on` method with real pub/sub from `eventify`.
      graphPart.on = realOn;
      // delegate to real `on` handler:
      return realOn.apply(graphPart, arguments);
    }
  }

  function recordLinkChangeReal(link, changeType) {
    changes.push({
      link: link,
      changeType: changeType
    });
  }

  function recordNodeChangeReal(node, changeType) {
    changes.push({
      node: node,
      changeType: changeType
    });
  }

  function addNode(nodeId, data) {
    if (nodeId === undefined) {
      throw new Error('Invalid node identifier');
    }

    enterModification();

    var node = getNode(nodeId);
    if (!node) {
      node = new Node(nodeId, data);
      nodesCount++;
      recordNodeChange(node, 'add');
    } else {
      node.data = data;
      recordNodeChange(node, 'update');
    }

    nodes[nodeId] = node;

    exitModification();
    return node;
  }

  function getNode(nodeId) {
    return nodes[nodeId];
  }

  function removeNode(nodeId) {
    var node = getNode(nodeId);
    if (!node) {
      return false;
    }

    enterModification();

    var prevLinks = node.links;
    if (prevLinks) {
      node.links = null;
      for(var i = 0; i < prevLinks.length; ++i) {
        removeLink(prevLinks[i]);
      }
    }

    delete nodes[nodeId];
    nodesCount--;

    recordNodeChange(node, 'remove');

    exitModification();

    return true;
  }


  function addLink(fromId, toId, data) {
    enterModification();

    var fromNode = getNode(fromId) || addNode(fromId);
    var toNode = getNode(toId) || addNode(toId);

    var link = createLink(fromId, toId, data);

    links.push(link);

    // TODO: this is not cool. On large graphs potentially would consume more memory.
    addLinkToNode(fromNode, link);
    if (fromId !== toId) {
      // make sure we are not duplicating links for self-loops
      addLinkToNode(toNode, link);
    }

    recordLinkChange(link, 'add');

    exitModification();

    return link;
  }

  function createSingleLink(fromId, toId, data) {
    var linkId = makeLinkId(fromId, toId);
    return new Link(fromId, toId, data, linkId);
  }

  function createUniqueLink(fromId, toId, data) {
    // TODO: Get rid of this method.
    var linkId = makeLinkId(fromId, toId);
    var isMultiEdge = multiEdges.hasOwnProperty(linkId);
    if (isMultiEdge || getLink(fromId, toId)) {
      if (!isMultiEdge) {
        multiEdges[linkId] = 0;
      }
      var suffix = '@' + (++multiEdges[linkId]);
      linkId = makeLinkId(fromId + suffix, toId + suffix);
    }

    return new Link(fromId, toId, data, linkId);
  }

  function getLinks(nodeId) {
    var node = getNode(nodeId);
    return node ? node.links : null;
  }

  function removeLink(link) {
    if (!link) {
      return false;
    }
    var idx = indexOfElementInArray(link, links);
    if (idx < 0) {
      return false;
    }

    enterModification();

    links.splice(idx, 1);

    var fromNode = getNode(link.fromId);
    var toNode = getNode(link.toId);

    if (fromNode) {
      idx = indexOfElementInArray(link, fromNode.links);
      if (idx >= 0) {
        fromNode.links.splice(idx, 1);
      }
    }

    if (toNode) {
      idx = indexOfElementInArray(link, toNode.links);
      if (idx >= 0) {
        toNode.links.splice(idx, 1);
      }
    }

    recordLinkChange(link, 'remove');

    exitModification();

    return true;
  }

  function getLink(fromNodeId, toNodeId) {
    // TODO: Use sorted links to speed this up
    var node = getNode(fromNodeId),
      i;
    if (!node || !node.links) {
      return null;
    }

    for (i = 0; i < node.links.length; ++i) {
      var link = node.links[i];
      if (link.fromId === fromNodeId && link.toId === toNodeId) {
        return link;
      }
    }

    return null; // no link.
  }

  function clear() {
    enterModification();
    forEachNode(function(node) {
      removeNode(node.id);
    });
    exitModification();
  }

  function forEachLink(callback) {
    var i, length;
    if (typeof callback === 'function') {
      for (i = 0, length = links.length; i < length; ++i) {
        callback(links[i]);
      }
    }
  }

  function forEachLinkedNode(nodeId, callback, oriented) {
    var node = getNode(nodeId);

    if (node && node.links && typeof callback === 'function') {
      if (oriented) {
        return forEachOrientedLink(node.links, nodeId, callback);
      } else {
        return forEachNonOrientedLink(node.links, nodeId, callback);
      }
    }
  }

  function forEachNonOrientedLink(links, nodeId, callback) {
    var quitFast;
    for (var i = 0; i < links.length; ++i) {
      var link = links[i];
      var linkedNodeId = link.fromId === nodeId ? link.toId : link.fromId;

      quitFast = callback(nodes[linkedNodeId], link);
      if (quitFast) {
        return true; // Client does not need more iterations. Break now.
      }
    }
  }

  function forEachOrientedLink(links, nodeId, callback) {
    var quitFast;
    for (var i = 0; i < links.length; ++i) {
      var link = links[i];
      if (link.fromId === nodeId) {
        quitFast = callback(nodes[link.toId], link);
        if (quitFast) {
          return true; // Client does not need more iterations. Break now.
        }
      }
    }
  }

  // we will not fire anything until users of this library explicitly call `on()`
  // method.
  function noop() {}

  // Enter, Exit modification allows bulk graph updates without firing events.
  function enterModificationReal() {
    suspendEvents += 1;
  }

  function exitModificationReal() {
    suspendEvents -= 1;
    if (suspendEvents === 0 && changes.length > 0) {
      graphPart.fire('changed', changes);
      changes.length = 0;
    }
  }

  function createNodeIterator() {
    // Object.keys iterator is 1.3x faster than `for in` loop.
    // See `https://github.com/anvaka/ngraph.graph/tree/bench-for-in-vs-obj-keys`
    // branch for perf test
    return Object.keys ? objectKeysIterator : forInIterator;
  }

  function objectKeysIterator(callback) {
    if (typeof callback !== 'function') {
      return;
    }

    var keys = Object.keys(nodes);
    for (var i = 0; i < keys.length; ++i) {
      if (callback(nodes[keys[i]])) {
        return true; // client doesn't want to proceed. Return.
      }
    }
  }

  function forInIterator(callback) {
    if (typeof callback !== 'function') {
      return;
    }
    var node;

    for (node in nodes) {
      if (callback(nodes[node])) {
        return true; // client doesn't want to proceed. Return.
      }
    }
  }
}

// need this for old browsers. Should this be a separate module?
function indexOfElementInArray(element, array) {
  if (!array) return -1;

  if (array.indexOf) {
    return array.indexOf(element);
  }

  var len = array.length,
    i;

  for (i = 0; i < len; i += 1) {
    if (array[i] === element) {
      return i;
    }
  }

  return -1;
}

/**
 * Internal structure to represent node;
 */
function Node(id, data) {
  this.id = id;
  this.links = null;
  this.data = data;
}

function addLinkToNode(node, link) {
  if (node.links) {
    node.links.push(link);
  } else {
    node.links = [link];
  }
}

/**
 * Internal structure to represent links;
 */
function Link(fromId, toId, data, id) {
  this.fromId = fromId;
  this.toId = toId;
  this.data = data;
  this.id = id;
}

function hashCode(str) {
  var hash = 0, i, chr, len;
  if (str.length == 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function makeLinkId(fromId, toId) {
  return fromId.toString() + '👉 ' + toId.toString();
}

},{"ngraph.events":6}],8:[function(require,module,exports){
var centrality = require('ngraph.centrality');
var g = require('ngraph.graph')();

//generate nodes
var nodes = new vis.DataSet()
var edges = new vis.DataSet()
var completeEdges = new vis.DataSet()
var network


var dict = {
    "exogene-anforderung": 1,
    "endogene-anforderung": 2,
    "funktion": 3,
    "nutzungszweck": 4,
    "exogene-anforderung-negativ": 5,
    "endogene-anforderung-negativ": 6,
    "funktion-negativ": 7,
    "nutzungszweck-negativ": 8,
}

module.exports.showGraph = function () {
    var container = document.getElementById('mynetwork');

    // provide the data in the vis format
    var data = {
        nodes: nodes,
        edges: completeEdges
    };
    var options = {
        nodes: {
            shape: 'dot',
        },
        physics: {
            forceAtlas2Based: {
                gravitationalConstant: -26,
                centralGravity: 0.005,
                springLength: 230,
                springConstant: 0.18
            },
            maxVelocity: 146,
            solver: 'forceAtlas2Based',
            timestep: 0.35,
            stabilization: {iterations: 150}
        }
    };


    network = new vis.Network(container, data, options)
}

module.exports.showComplete = function () {
    // create a network
    completeEdges.forEach(edge => {
        completeEdges.update([{ id: edge.id}])
    })

}

module.exports.showConflicts = function () {
    // create a network
    completeEdges.forEach(edge => {
        if(!edge.actual){
            completeEdges.update([{ id: edge.id, color: "#ccc"}])
        }
    })

}

module.exports.cenBetween = function () {
    //recalculate for centrality
    a = centrality.betweenness(g)
    nodes.forEach(node => {
        edgeSize = network.getConnectedEdges(node.id).length
        if (edgeSize > 0) {
            nodes.update({ id: node.id, boolAns: a[node.label] })
        } else {
            nodes.remove(node.id)
        }
        // network.clustering.updateClusteredNode(node.id, {size: edgeSize * edgeSize * 10000})
    });
}

//group 1: zweck der sl ; 2: infrak vor. ; 3 norm ; 4+ : unused
module.exports.visjs = function (jsonObject) {
    jsonObject = JSON.parse(jsonObject)

    // convert to ngraph notation
    for (let i = 0; i < jsonObject.length; i++) {
        var obj = jsonObject[i];

        if(obj.cluster == null){
            continue;
        }

        var answer = obj.answers[0].booleanAnswer
        if(obj.cluster.negative){
            answer = !answer
        }

        nodes.add({ id: i, name: obj.name, label: obj.label, group: dict[obj.cluster.name], boolAns: answer,value: 3 })

    }

    counter = 0

    for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
            if (i != j) {
                counter++
                var cluster = nodes.get(i)
                var clusterOther = nodes.get(j)

                if (cluster == null || clusterOther == null || cluster.group == null || clusterOther.group == null) {
                    continue;
                }
                switch (cluster.group) {
                    case 4:
                        if (clusterOther.group == 4) {
                            // if (cluster.boolAns == false && clusterOther.boolAns == true) {
                            //     edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                            //     g.addLink(cluster.label, clusterOther.label)
                            // }
                        }else if (clusterOther.group == 3) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })
                        }else if (clusterOther.group == 2 || clusterOther.group == 1) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })
                        }
                        break;
                    case 3:
                        if (clusterOther.group == 4) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })

                        }else if (clusterOther.group == 3) {
                            // if (cluster.boolAns == true && clusterOther.boolAns == false) {
                            //     edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                            //     g.addLink(cluster.label, clusterOther.label)
                            // }
                        }else if (clusterOther.group == 2 || clusterOther.group == 1) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })

                        }
                        break;
                    case 1:
                        if (clusterOther.group == 4) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })

                        }else if (clusterOther.group == 3) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })

                        }else if (clusterOther.group == 2) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })

                        }
                        break;
                    case 2:
                        if (clusterOther.group == 4) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })

                        }else if (clusterOther.group == 3) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })

                        }else if (clusterOther.group == 1) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })

                        }else if (clusterOther.group == 2) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })

                        }
                        break;
                    default:

                }
            }
        }
    }
    console.log(edges.length)
}



// console.log(network.getConnectedNodes(2).length)
},{"ngraph.centrality":1,"ngraph.graph":7}]},{},[8])(8)
});
