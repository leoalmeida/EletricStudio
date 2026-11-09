import React,{useState} from 'react';
import PlanDrawing from './PlanDrawing.jsx';
import ModuleIcon from './ModuleIcon.jsx';
import {residentialModules} from './residentialModules.js';

export default function ResidentialCard({record,busy,onOpen,onAction}){
 const [expanded,setExpanded]=useState(false);
 return <article className="project-card residential-card" data-modules-open={expanded} onMouseLeave={()=>setExpanded(false)} onKeyDown={e=>{if(e.key==='Escape'){setExpanded(false);e.currentTarget.querySelector('.project-module-trigger')?.focus();}}}>
  <div className="project-card-title"><h2>{record.name}</h2><time dateTime={record.updatedAt}>Modificado em {new Date(record.updatedAt).toLocaleString('pt-BR')}</time></div>
  <div className="project-module-preview">
   <button className="project-module-trigger" disabled={busy} onClick={()=>setExpanded(true)} aria-label={'Escolher módulo de '+record.name} aria-expanded={expanded}>
    <svg className="project-preview" viewBox={'0 0 '+record.plan.width+' '+record.plan.height} aria-hidden="true"><PlanDrawing plan={record.plan} showLabels={false} showWires={false} showDimensions={false}/></svg><span>Escolher módulo</span>
   </button>
   <div className="project-module-options" role="group" aria-label={'Módulos de '+record.name}>
    {residentialModules.map(module=><button key={module.id} className={'project-module-option module-'+module.id} disabled={busy} onClick={()=>onOpen(record,module.id)} aria-label={'Abrir '+module.label+' de '+record.name}><ModuleIcon module={module.id} size={34}/><strong>{module.label}</strong><span>{module.description}</span></button>)}
   </div>
  </div>
  <footer><span className="project-modules-caption">{residentialModules.length} módulos</span><div><button title="Duplicar projeto" aria-label={'Duplicar '+record.name} disabled={busy} onClick={()=>onAction(record,'duplicate')}>⧉</button><button title={record.favorite?'Remover dos favoritos':'Favoritar projeto'} aria-label={'Favoritar '+record.name} aria-pressed={record.favorite} disabled={busy} onClick={()=>onAction(record,'favorite')}>{record.favorite?'★':'☆'}</button><button title="Excluir da biblioteca" aria-label={'Excluir '+record.name} disabled={busy} onClick={()=>onAction(record,'delete')}>♲</button></div></footer>
 </article>;
}
