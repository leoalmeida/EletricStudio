import {createServer} from 'vite';
import {renderToStaticMarkup} from 'react-dom/server';
import React from 'react';
import fs from 'node:fs';
import {validatePlan} from '../src/floor/model.js';
const plan=validatePlan(JSON.parse(fs.readFileSync('examples/replica-imagem.planta.json','utf8')));
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 const {PrintSheets}=await server.ssrLoadModule('/src/floor/Reports.jsx');
 const settings={paper:'A3',landscape:true,scale:75,legend:false,labels:true,border:true,center:true,loads:false,singleLine:false,trays:false,wires:true,wireTable:false};
 const html=renderToStaticMarkup(React.createElement(PrintSheets,{plan,settings}));
 const css=fs.readFileSync('src/floor/style.css','utf8')+fs.readFileSync('src/floor/wires.css','utf8');
 fs.mkdirSync('tmp/reference-preview',{recursive:true});
 fs.writeFileSync('tmp/reference-preview/index.html','<!doctype html><html lang="pt-BR"><meta charset="utf-8"><style>body{margin:0;font-family:Arial}'+css+'</style><body><div class="floor-app"><div class="floor-print-output">'+html+'</div></div></body></html>');
 console.log('Prévia da réplica preparada.');
}finally{await server.close();}
