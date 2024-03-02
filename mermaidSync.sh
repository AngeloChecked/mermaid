cp -r `ls | grep -vE "glue.ts|package.json|package-lock.json|node_modules|mermaidCalcUtils.ts|index.html|main.ts|vite.config.js|mermaidSync.sh"` ../mermaid/packages/mermaid/src/diagrams/context-map
