export function namedWallHeight(name=''){
 const key=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
 if(key==='casa')return 3;if(key==='lavanderia')return 2;if(['quarto sandra','piscina','area da piscina','garagem'].includes(key))return 4;return 2.8;
}
export function floorWallHeight(plan){const floor=plan.floors?.find(f=>f.id===plan.activeFloorId);return floor?.wallHeight??namedWallHeight(floor?.name);}
export function applyNamedWallHeights(project){const next=structuredClone(project);for(const f of next.floors||[]){f.wallHeight=namedWallHeight(f.name);const data=f.id===next.activeFloorId?next:f.data;if(data)data.objects=data.objects.map(o=>['room','wall'].includes(o.type)?{...o,wallHeight:f.wallHeight}:o);}return next;}
