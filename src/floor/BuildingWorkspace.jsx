import React,{useRef,useState} from 'react';
import FloorEditor from './FloorEditor.jsx';
import LayoutWorkspace from './LayoutWorkspace.jsx';
import {architecturePlan} from './residentialModules.js';
const Plan3D=React.lazy(()=>import('./Plan3D.jsx'));

export default function BuildingWorkspace(props){
 const snapshot=useRef(props.initialPlan),[view,setView]=useState('plans');
 const shared={...props,initialPlan:snapshot.current,onPlanChange:plan=>{snapshot.current=plan;props.onPlanChange?.(plan);}};
 return <div className="building-workspace"><nav className="residential-architecture-tabs building-tabs" aria-label="Visões de plantas e pavimentos">
  {[['plans','Plantas dos pavimentos'],['roof','Desenhar cobertura'],['building','Edificação 3D']].map(([id,label])=><button key={id} type="button" aria-pressed={view===id} onClick={()=>setView(id)}>{label}</button>)}
 </nav>{view==='plans'?<FloorEditor {...shared} moduleId="plans"/>:view==='roof'?<LayoutWorkspace {...shared} kind="roof" onEditArchitecture={()=>setView('plans')}/>:<React.Suspense fallback={<p role="status">Carregando edificação 3D…</p>}><Plan3D plan={architecturePlan(snapshot.current)} initialBuilding architecturalOnly initialLayers={{roof:true,structure:false,furniture:false,devices:false,routes:false,labels:true}} onBack={()=>setView('plans')}/></React.Suspense>}</div>;
}
