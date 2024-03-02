let contextMap = undefined;
let nodes = [];
let edges = [];

/**
 *
 * @param name
 */
export function setContextMapName(name) {
  contextMap = name;
}
/**
 *
 * @param name
 */
export function addNode(name) {
  nodes.push({ id: name });
}
/**
 *
 * @param obj
 */
export function addEdge(obj) {
  edges.push(obj);
}
/**
 *
 */
export function getGraph() {
  return { contextMap, nodes, edges };
}
/**
 *
 */
export function clear() {
  nodes = [];
  edges = [];
  contextMap = undefined;
}

export default {
  setContextMapName,
  addNode,
  addEdge,
  getGraph,
  clear,
};
