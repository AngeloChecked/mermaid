import * as d3 from 'd3';

import { Configuration, ContextMap, ContextMapLink, ContextMapNode } from './drawSvg.js';
import { describe, test, expect } from 'vitest';

describe('graph construction', () => {
  const fakeFont = { fontSize: 0, fontFamily: 'any', fontWeight: 0 };

  test('svg size', () => {
    const svg = d3.create('svg');
    const config = new Configuration(
      500,
      500,
      fakeFont,
      () => 0,
      () => 0,
      { rx: 0, ry: 0 },
      { horizontal: 0, vertical: 0 }
    );
    const contextMap = new ContextMap(config);

    contextMap.create(svg, [], []);

    expect(svg.attr('viewBox')).toBe('-250,-250,500,500');
  });

  test('node size', () => {
    const svg = d3.create('svg');
    const nodeId = 'CustomerSelfServiceContext';
    const nodes = [{ id: nodeId }];
    const calculateTextWidth = (text?: string): number => text?.length ?? 0;
    const textHeight = 15;
    const fontSize = 10;
    const fontFamily = 'arial';
    const fontWeight = 8;
    const ellipseSize = { rx: 50, ry: 10 };
    const config = new Configuration(
      500,
      500,
      { fontSize, fontFamily, fontWeight },
      calculateTextWidth,
      (_) => textHeight,
      ellipseSize,
      { horizontal: 0, vertical: 0 }
    );

    const contextMap = new ContextMap(config);

    contextMap.create(svg, [], nodes);

    const d3Nodes = svg.selectAll('g').nodes();
    expect(d3.select(d3Nodes[0]).attr('transform')).toBe('translate(0,0)');

    const ellipses = svg.selectAll('ellipse').nodes();
    expect(d3.select(ellipses[0]).attr('rx')).toBe(
      ((ellipseSize.rx + calculateTextWidth(nodeId)) / 2).toString()
    );
    expect(d3.select(ellipses[0]).attr('ry')).toBe(((ellipseSize.ry + textHeight) / 2).toString());

    const texts = svg.selectAll('text').nodes();
    expect(d3.select(texts[0]).text()).toBe('CustomerSelfServiceContext');
    expect(d3.select(texts[0]).attr('font-size')).toBe(fontSize.toString());
    expect(d3.select(texts[0]).attr('font-weight')).toBe(fontWeight.toString());
    expect(d3.select(texts[0]).attr('font-family')).toBe(fontFamily);
    expect(d3.select(texts[0]).attr('x')).toBe((-calculateTextWidth(nodeId) / 2).toString());
    expect(d3.select(texts[0]).attr('y')).toBe((textHeight / 4).toString());
  });

  // const textWidth = configuration.calculateTextWidth(node.id)
  // const textHeight = configuration.calculateTextHeight(node.id)
  // const width =  configuration.ellipseSize.rx+textWidth
  // const height =  configuration.ellipseSize.ry+textHeight
  // const textX = -(textWidth/2)
  // const textY = textHeight/4

  test('distribute nodes in the plane', () => {
    const svg = d3.create('svg');
    const nodes = [
      { id: 'CustomerSelfServiceContext' },
      { id: 'CustomerSelfServiceContext' },
      { id: 'CustomerManagementContext' },
      { id: 'PrintingContext' },
    ];

    const config = new Configuration(
      500,
      500,
      fakeFont,
      (text?: string): number => 0,
      (_) => 15,
      { rx: 50, ry: 10 },
      { horizontal: 0, vertical: 0 }
    );

    const contextMap = new ContextMap(config);

    contextMap.create(svg, [], nodes);

    const d3Nodes = svg.selectAll('g').nodes();
    const [topLeftNodeX, topLeftNodeY] = pickD3TransformTranslatePos(d3Nodes[0]);
    const [topRightNodeX, topRightNodeY] = pickD3TransformTranslatePos(d3Nodes[1]);
    const [botLeftNodeX, botLeftNodeY] = pickD3TransformTranslatePos(d3Nodes[2]);
    const [botRightNodeX, botRightNodeY] = pickD3TransformTranslatePos(d3Nodes[3]);

    expect(topLeftNodeX + topRightNodeX).toBe(0);
    expect(topLeftNodeY).toBe(topRightNodeY);
    expect(botLeftNodeX + botRightNodeX).toBe(0);
    expect(botLeftNodeY).toBe(botRightNodeY);
  });

  test('position a link in the plane', () => {
    const svg = d3.create('svg');
    const links = [
      {
        source: { id: 'CustomerSelfServiceContext', boxText: undefined, bodyText: undefined },
        target: { id: 'PrintingContext', boxText: undefined, bodyText: undefined },
        middleText: 'Shared Kernel',
      },
    ];
    const nodes = [{ id: 'CustomerSelfServiceContext' }, { id: 'PrintingContext' }];

    const config = new Configuration(
      500,
      500,
      fakeFont,
      (text?: string): number => text?.length ?? 0,
      (_) => 15,
      { rx: 50, ry: 10 },
      { horizontal: 0, vertical: 0 }
    );

    const contextMap = new ContextMap(config);

    contextMap.create(svg, links, nodes);

    const d3Nodes = svg.selectAll('g').nodes();
    // expect(d3.select(d3Nodes[0]).attr("transform")).toBe("translate(-57.5,0)")
    // expect(d3.select(d3Nodes[1]).attr("transform")).toBe("translate(63,0)")

    // const paths = svg.selectAll("path").nodes()
    // expect(d3.select(paths[0]).attr("d")).toBe("M-57.5,0A0,0 0 0,1 63,0")
  });

  test('distribute 2 nodes in the plane', () => {
    const nodes = [
      new ContextMapNode(100, 20, 0, 0, fakeFont, 'any'),
      new ContextMapNode(100, 20, 0, 0, fakeFont, 'any'),
    ];

    ContextMapNode.disposeNodesInThePlane(nodes, { width: 500, height: 500 });

    expect(nodes[0].position).toStrictEqual({ x: -50, y: 0 });
    expect(nodes[1].position).toStrictEqual({ x: 50, y: 0 });
  });

  test('distribute 4 nodes in the plane', () => {
    const nodes = [
      new ContextMapNode(100, 20, 0, 0, fakeFont, 'any'),
      new ContextMapNode(100, 20, 0, 0, fakeFont, 'any'),
      new ContextMapNode(100, 20, 0, 0, fakeFont, 'any'),
      new ContextMapNode(100, 20, 0, 0, fakeFont, 'any'),
    ];

    ContextMapNode.disposeNodesInThePlane(nodes, { width: 500, height: 500 });

    expect(nodes[0].position).toStrictEqual({ x: -50, y: +10 });

    expect(nodes[1].position).toStrictEqual({ x: +50, y: 10 });

    expect(nodes[2].position).toStrictEqual({ x: -50, y: -10 });

    expect(nodes[3].position).toStrictEqual({ x: +50, y: -10 });
  });

  test('distribute 4 nodes in the plane with little width', () => {
    const nodes = [
      new ContextMapNode(100, 20, 0, 0, fakeFont, 'any'),
      new ContextMapNode(100, 20, 0, 0, fakeFont, 'any'),
      new ContextMapNode(100, 20, 0, 0, fakeFont, 'any'),
      new ContextMapNode(100, 20, 0, 0, fakeFont, 'any'),
    ];

    ContextMapNode.disposeNodesInThePlane(nodes, { width: 120, height: 800 });

    expect(nodes[0].position).toStrictEqual({ x: 0, y: 30 });

    expect(nodes[1].position).toStrictEqual({ x: 0, y: 10 });

    expect(nodes[2].position).toStrictEqual({ x: 0, y: -10 });

    expect(nodes[3].position).toStrictEqual({ x: 0, y: -30 });
  });

  test('distribute 4 nodes in the plane considering margins', () => {
    const nodes = [
      new ContextMapNode(100, 20, 0, 0, fakeFont, 'any'),
      new ContextMapNode(100, 20, 0, 0, fakeFont, 'any'),
      new ContextMapNode(100, 20, 0, 0, fakeFont, 'any'),
      new ContextMapNode(100, 20, 0, 0, fakeFont, 'any'),
    ];

    ContextMapNode.disposeNodesInThePlane(
      nodes,
      { width: 400, height: 800 },
      { horizontal: 10, vertical: 10 }
    );

    expect(nodes[0].position).toStrictEqual({ x: -60, y: 20 });

    expect(nodes[1].position).toStrictEqual({ x: +60, y: 20 });

    expect(nodes[2].position).toStrictEqual({ x: -60, y: -20 });

    expect(nodes[3].position).toStrictEqual({ x: +60, y: -20 });
  });

  test('crete link between two nodes', () => {
    const config = new Configuration(
      500,
      500,
      fakeFont,
      (text?: string): number => text?.length ?? 0,
      (_) => 15,
      { rx: 50, ry: 10 },
      { horizontal: 0, vertical: 0 }
    );

    const nodes = [
      new ContextMapNode(100, 20, 0, 0, fakeFont, 'A', { x: -100, y: 0 }),
      new ContextMapNode(100, 20, 0, 0, fakeFont, 'B', { x: 100, y: 0 }),
      new ContextMapNode(100, 20, 0, 0, fakeFont, 'C', { x: 200, y: 200 }),
    ];
    const links = [
      {
        source: { id: 'A', boxText: undefined, bodyText: undefined },
        target: { id: 'B', boxText: undefined, bodyText: undefined },
        middleText: undefined,
      },
      {
        source: { id: 'A', boxText: undefined, bodyText: undefined },
        target: { id: 'C', boxText: undefined, bodyText: undefined },
        middleText: undefined,
      },
    ];

    const contextMapLinks = ContextMapLink.createContextMapLinksFromNodes(nodes, links, config);

    expect(contextMapLinks[0].link.source.id).toBe('A');
    expect(contextMapLinks[0].link.target.id).toBe('B');

    expect(contextMapLinks[1].link.source.id).toBe('A');
    expect(contextMapLinks[1].link.target.id).toBe('C');
  });

  function parseTranslate(translate: string): [number, number] {
    const [_text, x, y] = translate.split(/[(),]/);
    return [parseInt(x), parseInt(y)];
  }

  function pickD3TransformTranslatePos(d3Node: d3.BaseType): [number, number] {
    return parseTranslate(d3.select(d3Node).attr('transform'));
  }
});
