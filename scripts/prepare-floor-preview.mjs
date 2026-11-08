import {createServer} from 'vite';
import {renderToStaticMarkup} from 'react-dom/server';
import React from 'react';
import fs from 'node:fs';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 const {PrintSheets}=await server.ssrLoadModule('/src/floor/Reports.jsx');
 const {examplePlan}=await import('../src/floor/model.js');
 const settings={paper:'A3',landscape:true,scale:75,legend:true,labels:true,border:true,center:true,loads:true,singleLine:true,trays:true,wires:true,wireTable:true};
 const html=renderToStaticMarkup(React.createElement(PrintSheets,{plan:examplePlan(),settings}));
 const css=fs.readFileSync('src/floor/style.css','utf8')+fs.readFileSync('src/floor/wires.css','utf8');
 fs.mkdirSync('tmp/floor-preview',{recursive:true});
 fs.writeFileSync('tmp/floor-preview/index.html','<!doctype html><html lang="pt-BR"><meta charset="utf-8"><style>body{margin:0;font-family:Arial}'+css+'</style><body><div class="floor-app"><div class="floor-print-output">'+html+'</div></div></body></html>');
 fs.mkdirSync('examples',{recursive:true});fs.writeFileSync('examples/residencia.planta.json',JSON.stringify(examplePlan(),null,2));
 console.log('Prévia de impressão e exemplo preparados.');
}finally{await server.close();}
