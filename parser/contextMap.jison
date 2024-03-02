
%{
  function edgeType(text){
    return text.includes(",") ? text.split(",") : [text]
  }  
%}

%lex

%x comment
%s context

%%

\s+                                { /* skip */ }
"/*"                               { this.pushState("comment"); }
<comment>"*/"                      { this.popState(); }
<comment>[^"*"]|[^"/"]             { /* skip */ }

"ContextMap"                       { this.pushState("context"); return "ContextMap"; }
<context>"contains"                { return "contains"; }

(\w|",")+                          { return "WORD"; }

<context>"{"                       { return "{"; }
<context>"}"                       { this.popState(); return "}"; }
<context>"["                       { return "["; }
<context>"]"                       { return "]"; }
<context>"<->"                     { return "<->"; }
<context>"<-"                      { return "<-"; }
<context>"->"                      { return "->"; }

<<EOF>>	                           { return "EOF"; }

/lex


%start e

%% 

arrow 
  : "<-"   {$$ = ["left"]}
  | "->"   {$$ = ["right"]}
  | "<->"  {$$ = ["left", "right"]}
  ;    

edge 
  : "WORD" "[" "WORD" "]" arrow "[" "WORD" "]" "WORD" { yy.addEdge({  source: { id: $1, type: edgeType($3) }, target: { id: $9, type: edgeType($7) }, arrow: $5 })  }
  | "WORD" arrow "WORD" { yy.addEdge({  source: { id: $1, type: [] }, target: { id: $3, type: [] }, arrow: $2 })  }
  ;

node 
  :  "contains" "WORD" { yy.addNode($2) }
  ;

contextMap 
  : "ContextMap" "WORD" { yy.setContextMapName($2) }
  ;

w 
  : contextMap
  | node
  | edge
  | "{"
  | "}" 
  ;

e 
  : w
  | e w 
  | EOF { return yy.getGraph() }   
  | e EOF { return yy.getGraph() }   
  ;
