import * as d3 from 'd3'
import { Configuration, buildGraph } from './drawSvg'
import { calculateTextHeight, calculateTextWidth } from './mermaidCalcUtils'
import { RawLink, mapEdgeLabels } from './contextMap'
import mcmlDb from './contextMapDb'
// @ts-ignore
import parser from './parser/contextMap.jison'

let initialGrammar = `---
height: 550
width: 550
font:
  fontFamily: Arial
  fontSize: 12  
  fontWeight: 400
nodePadding:  
  horizontal: 100 
  vertical: 40 
nodeMargin:   
  horizontal: 20 
  vertical: 30 
---
ContextMap

InsuranceContextMap {
  contains CustomerManagementContext 
  contains CustomerSelfServiceContext 
  contains PrintingContext
  contains PolicyManagementContext 
  contains RiskManagementContext 
  contains DebtCollection

  CustomerSelfServiceContext [D,C]<-[U,S] CustomerManagementContext 
  CustomerManagementContext [D,ACL]<-[U,OHS,PL] PrintingContext 
  PrintingContext [U,OHS,PL]->[D,ACL] PolicyManagementContext 
  RiskManagementContext [P]<->[P] PolicyManagementContext 
  PolicyManagementContext [D,CF]<-[U,OHS,PL] CustomerManagementContext 
  DebtCollection [D,ACL]<-[U,OHS,PL] PrintingContext 
  PolicyManagementContext [SK]<->[SK] DebtCollection
}
 
 `
const app = document.querySelector('#app')
if (app) app.innerHTML = `
<style>
.row {
  display: flex;
  flex-direction: row;
}
</style>

<div class="row">  
  <div id="container"></div>
  <textarea id="textarea" cols="70" >
${initialGrammar}
  </textarea>
</div>
`
const textarea = document.querySelector('#textarea')
if (textarea) {
  textarea.addEventListener("change", (event) => {
    const container = document.querySelector('#container')
    if (container) container.replaceChildren()
    const newGrammar = (event.target as HTMLTextAreaElement).value
    initialGrammar = newGrammar
    draw()
    console.info("new grammar loaded", newGrammar)
  })
}

function glueDomAndParse() {
  const splitted = initialGrammar.split('---')
  const findField = (fieldName: string, text: string, preText?: string) => new RegExp((preText ? `${preText}(?:.|\\n)*?` : "") + `${fieldName}: ?(\\w+)`).exec(text)?.[1] ?? "0"

  const config = {
    height: parseInt(findField("height", splitted[1])),
    width: parseInt(findField("width", splitted[1])),
    font: {
      fontFamily: findField("fontFamily", splitted[1]),
      fontSize: parseInt(findField("fontSize", splitted[1])),
      fontWeight: parseInt(findField("fontWeight", splitted[1])),
    },
    nodePadding: {
      horizontal: parseInt(findField("horizontal", splitted[1], "nodePadding")),
      vertical: parseInt(findField("vertical", splitted[1], "nodePadding")),
    },
    nodeMargin: {
      horizontal: parseInt(findField("horizontal", splitted[1], "nodeMargin")),
      vertical: parseInt(findField("vertical", splitted[1], "nodeMargin")),
    }
  }

  console.log("config:" , JSON.stringify(config, null, 4))
  const container = d3.select("#container")
  container.selectAll("svg").remove()
  const svg = container
    .append("svg")
    .attr("style", `width:${config.width}px;height:${config.height}px;`)

  mcmlDb.clear()
  parser.parser.yy = mcmlDb
  parser.parser.parse(splitted[2])
  return { mcmlDb, svg, config }
}

type ContextMap = {
  contextMap: string,
  nodes: [{ id: string }],
  edges: RawLink[]
}
export function draw() {
  const { mcmlDb, svg, config } = glueDomAndParse()

  const graph = mcmlDb.getGraph() as ContextMap
  const nodes = graph.nodes.map(node => ({ id: node.id, name: node.id }))
  const links = graph.edges
    .map(edge => {
      return mapEdgeLabels(edge as RawLink)
    })

  const configuration = new Configuration(
    config.height,
    config.width,
    config.font,
    (text) => {
      if (!text) return 0
      return calculateTextWidth(text, config.font)
    },
    (text) => {
      if (!text) return 0
      return calculateTextHeight(text, config.font)
    },
    { rx: config.nodePadding.horizontal, ry: config.nodePadding.vertical },
    { horizontal: config.nodeMargin.horizontal, vertical: config.nodeMargin.vertical }
  )

  buildGraph(svg, { nodes, links }, configuration)
}

