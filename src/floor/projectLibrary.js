import {validatePlan,id} from './model.js';
export function projectRecord(plan,previous=null,fileName=null){const copy=validatePlan(structuredClone(plan)),now=new Date().toISOString();return {id:previous?.id||id(),name:copy.name,createdAt:previous?.createdAt||now,updatedAt:now,favorite:previous?.favorite||false,fileName:fileName??previous?.fileName??null,plan:copy};}
export function filterProjects(records,query='',favorites=false){const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();return records.filter(r=>(!favorites||r.favorite)&&normalize(r.name).includes(normalize(query.trim()))).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));}
let database;
function openDB(){return database??=new Promise((resolve,reject)=>{const request=indexedDB.open('eletric-studio-projects',1);request.onupgradeneeded=()=>request.result.createObjectStore('projects',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>{database=null;reject(request.error);};});}
async function transaction(mode,operation){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction('projects',mode),request=operation(tx.objectStore('projects'));tx.oncomplete=()=>resolve(request.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Não foi possível salvar a biblioteca.'));});}
export const listProjects=()=>transaction('readonly',store=>store.getAll());
export const saveProject=record=>transaction('readwrite',store=>store.put(record));
export const deleteProject=id=>transaction('readwrite',store=>store.delete(id));
