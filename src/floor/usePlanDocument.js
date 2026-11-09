import {useRef,useState} from 'react';
import {validatePlan} from './model.js';
import {withFloors} from './floors.js';
export default function usePlanDocument({initialPlan,initialFile,onPlanChange,onFileChange}){
 const [plan,setPlan]=useState(()=>withFloors(validatePlan(structuredClone(initialPlan)))),[file,setFile]=useState(initialFile),[saving,setSaving]=useState(false),[status,setStatus]=useState('');
 const latest=useRef(plan),history=useRef([]),future=useRef([]),handle=useRef(),busy=useRef(false);latest.current=plan;
 function remember(before){history.current.push(structuredClone(before));history.current=history.current.slice(-60);future.current=[];}
 function commit(next,record=true){const valid=validatePlan(next);if(record)remember(latest.current);latest.current=valid;setPlan(valid);onPlanChange?.(valid);return valid;}
 function preview(next){latest.current=next;setPlan(next);}
 function settle(before){validatePlan(latest.current);remember(before);onPlanChange?.(latest.current);setPlan({...latest.current});}
 function undo(redo=false){const source=redo?future:history,target=redo?history:future;if(!source.current.length)return;target.current.push(structuredClone(latest.current));commit(source.current.pop(),false);}
 async function save(saveAs=false){if(busy.current)return;busy.current=true;setSaving(true);try{
  const current=validatePlan(latest.current);let nextFile;
  if(window.cadeDesktop?.savePlan){const result=await window.cadeDesktop.savePlan({plan:current,token:file?.token,saveAs});if(result.canceled)return;nextFile={name:result.name,token:result.token};}
  else if(window.showSaveFilePicker){const nextHandle=saveAs||!handle.current?await window.showSaveFilePicker({suggestedName:file?.name||current.name+'.planta.json',types:[{description:'Planta Residencial',accept:{'application/json':['.json']}}]}):handle.current,stream=await nextHandle.createWritable();await stream.write(JSON.stringify(current,null,2));await stream.close();handle.current=nextHandle;nextFile={name:nextHandle.name};}
  else{const url=URL.createObjectURL(new Blob([JSON.stringify(current,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=current.name+'.planta.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);nextFile={name:a.download};}
  setFile(nextFile);onFileChange?.(nextFile);setStatus('Planta residencial salva.');
 }catch(e){if(e.name!=='AbortError')setStatus('Falha ao salvar: '+e.message);}finally{busy.current=false;setSaving(false);}}
 return {plan,latest,commit,preview,settle,undo,save,saving,status,setStatus,canUndo:history.current.length>0,canRedo:future.current.length>0};
}
