import FinishesWorkspace from './FinishesWorkspace.jsx';
import ConstructionWorkspace from './ConstructionWorkspace.jsx';
import CoordinationWorkspace from './CoordinationWorkspace.jsx';
import React,{useRef,useState} from 'react';
import FloorEditor from './FloorEditor.jsx';
import ModuleIcon from './ModuleIcon.jsx';
import HydraulicWorkspace from './HydraulicWorkspace.jsx';
import LayoutWorkspace from './LayoutWorkspace.jsx';
import {residentialModules,moduleOf} from './residentialModules.js';
export default function ResidentialWorkspace({moduleId='architecture',onModuleChange,...props}){
 const module=moduleOf(moduleId),snapshot=useRef(props.initialPlan),source=useRef(props.initialPlan),[architectureView,setArchitectureView]=useState('decor');
 if(source.current!==props.initialPlan){source.current=props.initialPlan;snapshot.current=props.initialPlan;}
 const shared={...props,initialPlan:snapshot.current,onPlanChange:plan=>{snapshot.current=plan;props.onPlanChange?.(plan);}};
 const editBase=()=>{setArchitectureView('base');if(module.id!=='architecture')onModuleChange('architecture');};
 return <div className="residential-workspace"><nav className="residential-module-nav" aria-label="Módulos da planta residencial"><span>Planta Residencial</span><div>{residentialModules.map(m=><button key={m.id} type="button" className={'module-'+m.id} aria-pressed={module.id===m.id} onClick={()=>onModuleChange(m.id)}><ModuleIcon module={m.id} size={20}/>{m.label}</button>)}</div></nav>
 {module.id==='architecture'&&<nav className="residential-architecture-tabs" aria-label="Visões da arquitetura"><button aria-pressed={architectureView==='decor'} onClick={()=>setArchitectureView('decor')}>Decoração e móveis</button><button aria-pressed={architectureView==='base'} onClick={()=>setArchitectureView('base')}>Ambientes e medidas</button></nav>}
 {module.id==='finishes'?<FinishesWorkspace key="finishes" {...shared}/>:module.id==='budget'?<ConstructionWorkspace key="construction" {...shared}/>:['hvac','systems'].includes(module.id)?<HydraulicWorkspace key={module.id} kind={module.id} {...shared}/>:module.id==='coordination'?<CoordinationWorkspace key="coordination" {...shared}/>:['terrain','structure','roof'].includes(module.id)?<LayoutWorkspace key={module.id} {...shared} kind={module.id} onEditArchitecture={editBase}/>:module.id==='hydraulic'?<HydraulicWorkspace key="hydraulic" {...shared}/>:module.id==='landscape'?<LayoutWorkspace key="landscape" {...shared} kind="landscape" onEditArchitecture={editBase}/>:module.id==='architecture'&&architectureView==='decor'?<LayoutWorkspace key="interior" {...shared} kind="interior" onEditArchitecture={editBase}/>:<FloorEditor key={module.id} {...shared} moduleId={module.id}/>}</div>;
}
