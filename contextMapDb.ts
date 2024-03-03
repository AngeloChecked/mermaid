import { type RawLink } from './contextMap';

let contextMap: string | undefined = undefined;
let nodes: { id: string }[] = [];
let edges: RawLink[] = [];

export function setContextMapName(name: string) {
  contextMap = name;
}

export function addNode(name: string) {
  nodes.push({ id: name });
}

export function addEdge(obj: RawLink) {
  edges.push(obj);
}

export function getGraph() {
  return { contextMap, nodes, edges };
}

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
