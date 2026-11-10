export const residentialModules=[
 {id:'plans',label:'Plantas e pavimentos',description:'Cômodos, paredes e edificação 3D',color:'#476d87'},
 {id:'electrical',label:'Elétrica',description:'Pontos, circuitos e instalações',color:'#a66c14'},
 {id:'hydraulic',label:'Hidráulica',description:'Água e esgoto',color:'#287fa2'},
 {id:'architecture',label:'Arquitetura',description:'Ambientes, decoração e móveis',color:'#247b70'},
 {id:'landscape',label:'Paisagismo',description:'Jardins e áreas verdes',color:'#628042'},
 {id:'terrain',label:'Terreno',description:'Lote, implantação e níveis',color:'#876e46'},
 {id:'structure',label:'Estrutura',description:'Fundações, pilares, vigas e lajes',color:'#60788d'},
 {id:'roof',label:'Cobertura',description:'Telhado, calhas e águas pluviais',color:'#a27158'},
 {id:'coordination',label:'Compatibilização',description:'Sobreposição e interferências',color:'#78648c'},
 {id:'finishes',label:'Acabamentos',description:'Revestimentos e impermeabilização',color:'#8d7761'},
 {id:'hvac',label:'Climatização',description:'Ar-condicionado e ventilação',color:'#588b93'},
 {id:'systems',label:'Redes especiais',description:'Gás, telecomunicações e segurança',color:'#768297'},
 {id:'budget',label:'Orçamento e obra',description:'Quantitativos, custos e etapas',color:'#857443'}
];
export const architectureTypes=['room','wall','door','slidingDoor','slidingDoorSingle','window','opening','stairs','corner','dimension','text'];
export const moduleOf=id=>residentialModules.find(module=>module.id===id)||residentialModules.find(module=>module.id==='architecture');
export function architecturePlan(plan){return {...plan,objects:plan.objects.filter(o=>architectureTypes.includes(o.type)),routes:[],circuits:[],...(plan.floors?{floors:plan.floors.map(f=>({...f,data:f.data?architecturePlan(f.data):null}))}:{})};}
