export const hydraulicSystems=[{id:'cold',label:'Água fria',color:'#2987b2'},{id:'hot',label:'Água quente',color:'#c9644f'},{id:'sewer',label:'Esgoto',color:'#826241'}];
export const hydraulicTools=[{type:'coldWater',label:'Ponto de água fria',symbol:'AF',systems:['cold']},{type:'hotWater',label:'Ponto de água quente',symbol:'AQ',systems:['hot']},{type:'sewer',label:'Ponto de esgoto',symbol:'ES',systems:['sewer']},{type:'valve',label:'Registro',symbol:'RG',systems:['cold','hot']},{type:'drain',label:'Ralo',symbol:'R',systems:['sewer']},{type:'sink',label:'Lavatório / pia',symbol:'LV',systems:['cold','hot','sewer']},{type:'toilet',label:'Vaso sanitário',symbol:'VS',systems:['cold','sewer']},{type:'shower',label:'Chuveiro',symbol:'CH',systems:['cold','hot','sewer']}];
export const emptyHydraulics=()=>({version:1,nodes:[],pipes:[]});
export const hydraulicTool=type=>hydraulicTools.find(t=>t.type===type);
export const pipePoints=(h,pipe)=>{const a=h.nodes.find(n=>n.id===pipe.from),b=h.nodes.find(n=>n.id===pipe.to);return a&&b?[a,...pipe.points,b]:[];};
export const pipeLength=(h,pipe)=>pipePoints(h,pipe).reduce((sum,p,i,a)=>i?sum+Math.hypot(p.x-a[i-1].x,p.y-a[i-1].y)/100:sum,0);
export function validHydraulics(h,width,height){
 if(!h||h.version!==1||!Array.isArray(h.nodes)||!Array.isArray(h.pipes)||h.nodes.length>5000||h.pipes.length>10000)return false;
 const ids=new Set(),point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.y>=0&&p.x<=width&&p.y<=height,id=x=>typeof x==='string'&&x.length>0&&x.length<=120;
 for(const n of h.nodes){if(!id(n.id)||ids.has(n.id)||!hydraulicTool(n.type)||!point(n)||typeof n.label!=='string'||n.label.length>120||n.height!==null&&(!Number.isFinite(n.height)||n.height<0||n.height>20))return false;ids.add(n.id);}
 for(const p of h.pipes){const a=h.nodes.find(n=>n.id===p.from),b=h.nodes.find(n=>n.id===p.to);if(!id(p.id)||ids.has(p.id)||!a||!b||a.id===b.id||!hydraulicSystems.some(s=>s.id===p.system)||!hydraulicTool(a.type).systems.includes(p.system)||!hydraulicTool(b.type).systems.includes(p.system)||!Number.isFinite(p.diameter)||p.diameter<10||p.diameter>500||p.slope!==null&&(!Number.isFinite(p.slope)||p.slope<0||p.slope>100)||!Array.isArray(p.points)||p.points.length>1000||p.points.some(pt=>!point(pt)))return false;ids.add(p.id);}
 return true;
}
export function addHydraulicNode(h,type,point){if(!hydraulicTool(type))throw Error('Ponto hidráulico desconhecido.');return {...h,nodes:[...h.nodes,{id:crypto.randomUUID(),type,x:point.x,y:point.y,label:hydraulicTool(type).symbol+(h.nodes.filter(n=>n.type===type).length+1),height:null}]};}
export function addHydraulicPipe(h,from,to,{system='cold',diameter=25,slope=null,points=[]}={}){const next={...h,pipes:[...h.pipes,{id:crypto.randomUUID(),from,to,system,diameter,slope,points:points.map(p=>({...p}))}]};if(!validHydraulics(next,10000,10000))throw Error('Selecione dois pontos diferentes compatíveis com o sistema da tubulação.');return next;}
export function removeHydraulicItem(h,id){return {...h,nodes:h.nodes.filter(n=>n.id!==id),pipes:h.pipes.filter(p=>p.id!==id&&p.from!==id&&p.to!==id)};}
