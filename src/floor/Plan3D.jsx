import React,{useEffect,useMemo,useRef,useState} from 'react';
import {buildPlanScene} from './scene3d.js';
import {createPlanRenderer} from './plan3dRenderer.js';
import {switchFloor} from './floors.js';
import './plan3d.css';

export default function Plan3D({plan,onBack,initialLayers={}}){
 const host=useRef(),viewer=useRef();
 const [floorId,setFloorId]=useState(plan.activeFloorId),[projection,setProjection]=useState('perspective'),[defaults,setDefaults]=useState(false);
 const [layers,setLayers]=useState({walls:true,transparent:false,devices:true,routes:true,labels:false,furniture:true,structure:true,roof:false,terrain:false,...initialLayers});
 const [error,setError]=useState(''),[status,setStatus]=useState(''),[ready,setReady]=useState(false);
 const current=useMemo(()=>switchFloor(plan,floorId),[plan,floorId]);
 const data=useMemo(()=>buildPlanScene(current,{defaults}),[current,defaults]);
 useEffect(()=>{
  setError('');setReady(false);let instance;
  try{instance=createPlanRenderer(host.current,data,setError);viewer.current=instance;setReady(true);}
  catch(e){host.current.replaceChildren();setError('Não foi possível iniciar o 3D. Verifique se a aceleração gráfica / WebGL está disponível. '+e.message);}
  return()=>{instance?.dispose();viewer.current=null;};
 },[data]);
 useEffect(()=>{viewer.current?.projection(projection);},[projection,data]);
 useEffect(()=>{viewer.current?.layers(layers);},[layers,data]);
 async function save(){try{const blob=await viewer.current.save(),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='planta-3d.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus('Imagem 3D salva.');}catch(e){setStatus('Não foi possível salvar a imagem: '+e.message);}}
 function key(e){
  if(!viewer.current||e.ctrlKey||e.metaKey||e.altKey)return;
  const k=e.key.toLowerCase();if(!['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','shift','+','=','-','p','escape','home'].includes(k))return;
  e.preventDefault();e.stopPropagation();
  if(k==='escape'){host.current.querySelector('canvas')?.blur();setStatus('Navegação por teclado encerrada. Clique na planta para retomar.');return;}
  if(['a','arrowleft'].includes(k))viewer.current.move(-1,0);
  if(['d','arrowright'].includes(k))viewer.current.move(1,0);
  if(['w','arrowup'].includes(k))viewer.current.move(0,1);
  if(['s','arrowdown'].includes(k))viewer.current.move(0,-1);
  if(k===' ')viewer.current.view('top');if(k==='shift')viewer.current.view('bottom');
  if(k==='+'||k==='=')viewer.current.zoom(1.15);if(k==='-')viewer.current.zoom(1/1.15);
  if(k==='home')viewer.current.fit();if(k==='p')save();
 }
 const toggle=(key,label)=><label htmlFor={'plan3d-'+key}><input id={'plan3d-'+key} type="checkbox" checked={layers[key]} onChange={e=>setLayers(v=>({...v,[key]:e.target.checked}))}/>{label}</label>;
 return <div className="plan3d-workspace">
  <div className="plan3d-heading"><div><h2>Navegação 3D</h2><p>{plan.name} · {plan.floors?.find(f=>f.id===current.activeFloorId)?.name||'Pavimento atual'}</p></div><div><button onClick={onBack}>Voltar à planta</button><button className="plan3d-save" onClick={save} disabled={!ready||!!error}>Salvar imagem 3D</button></div></div>
  <div className="plan3d-toolbar">
   <label htmlFor="plan3d-floor">Pavimento</label><select id="plan3d-floor" value={floorId} onChange={e=>setFloorId(e.target.value)}>{(plan.floors||[{id:plan.activeFloorId,name:'Atual'}]).map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select>
   <div className="plan3d-projection" role="group" aria-label="Projeção">{[['perspective','Perspectiva'],['orthographic','Ortográfica']].map(([value,label])=><button key={value} aria-pressed={projection===value} onClick={()=>setProjection(value)}>{label}</button>)}</div>
   <button disabled={!ready} onClick={()=>viewer.current.view('top')}>Superior</button><button disabled={!ready} onClick={()=>viewer.current.view('front')}>Frontal</button><button disabled={!ready} onClick={()=>viewer.current.view('bottom')}>Inferior</button>
   <button disabled={!ready} aria-label="Diminuir zoom 3D" onClick={()=>viewer.current.zoom(1/1.2)}>−</button><button disabled={!ready} aria-label="Aumentar zoom 3D" onClick={()=>viewer.current.zoom(1.2)}>＋</button><button disabled={!ready} onClick={()=>viewer.current.fit()}>Enquadrar</button>
  </div>
  <div className="plan3d-layers">{toggle('walls','Paredes')}{toggle('transparent','Paredes transparentes')}{toggle('devices','Pontos elétricos')}{toggle('routes','Percursos e fios')}{toggle('labels','Identificações')}{toggle('furniture','Móveis e jardins')}{toggle('structure','Estrutura')}{toggle('roof','Cobertura')}{toggle('terrain','Terreno')}<label htmlFor="plan3d-defaults"><input id="plan3d-defaults" type="checkbox" checked={defaults} onChange={e=>setDefaults(e.target.checked)}/>Prévia com alturas padrão</label></div>
  <div className="plan3d-stage" onKeyDown={key}><div className="plan3d-canvas" ref={host}/>{error?<div className="plan3d-message" role="alert"><strong>Visualização 3D indisponível</strong><p>{error}</p><button onClick={onBack}>Voltar à planta baixa</button></div>:data.empty?<div className="plan3d-message"><strong>Este pavimento ainda está vazio</strong><p>Desenhe ambientes e insira pontos elétricos na planta baixa para visualizá-los em 3D.</p><button onClick={onBack}>Desenhar planta</button></div>:<div className="plan3d-badge">{data.walls.length} paredes · {data.devices.filter(d=>d.position).length} pontos · {data.routes.length} percursos</div>}</div>
  <div className="plan3d-help" id="plan3d-help"><p><strong>Controles:</strong> clique na planta e arraste para girar; botão direito para deslocar; rolagem ou gesto de pinça para zoom. Setas / WASD: mover · Espaço: superior · Shift: inferior · Home: enquadrar · P: salvar · Esc: sair da navegação.</p><p>Visualização ilustrativa dos elementos cadastrados. Percursos usam a altura cadastrada ou, na falta dela, 25 cm abaixo do maior pé-direito do pavimento. Subidas e descidas são ilustrativas.</p>{data.unknown>0&&<p>{data.unknown} ponto(s) com altura a confirmar. {defaults?'Exibidos em laranja com alturas de prévia.':'Ative a prévia com alturas padrão para exibi-los.'} A prévia não altera o projeto.</p>}<p role="status">{status}</p></div>
 </div>;
}
