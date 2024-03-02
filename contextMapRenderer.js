import * as d3 from 'd3';
import { log } from '../../logger.js';
import { getConfig } from '../../diagram-api/diagramAPI.js';
import * as db from './contextMapDb.js';
import { configureSvgSize } from '../../setupGraphViewbox.js';
import { buildGraph, Configuration } from './drawSvg.js';
import { mapEdgeLabels } from './contextMap.js';
import { calculateTextHeight, calculateTextWidth } from '../../utils.js';

export const draw = async (text, id, version, diagObj) => {
  const conf = getConfig().contextMap;

  log.debug('things', conf.font);
  log.debug('Rendering cml\n' + text, diagObj.parser);

  const securityLevel = getConfig().securityLevel;
  // Handle root and Document for when rendering in sandbox mode
  let sandboxElement;
  if (securityLevel === 'sandbox') {
    sandboxElement = d3.select('#i' + id);
  }
  const root =
    securityLevel === 'sandbox'
      ? d3.select(sandboxElement.nodes()[0].contentDocument.body)
      : d3.select('body');
  // Parse the graph definition

  var svg = root.select('#' + id);

  const graph = db.getGraph();

  const nodes = graph.nodes.map((node) => ({ id: node.id, name: node.id }));
  const links = graph.edges.map((edge) => {
    return mapEdgeLabels(edge);
  });

  const width = conf.width;
  const height = conf.height;
  const fontConfig = conf.font;
  const config = new Configuration(
    height,
    width,
    fontConfig,
    (text) => calculateTextWidth(text, fontConfig),
    (text) => calculateTextHeight(text, fontConfig),
    { rx: conf.nodePadding.horizontal, ry: conf.nodePadding.vertical },
    { horizontal: conf.nodeMargin.horizontal, vertical: conf.nodeMargin.vertical }
  );

  buildGraph(svg, { nodes, links }, config);

  configureSvgSize(svg, width, height, true);
};

export default {
  draw,
};
