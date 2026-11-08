import fs from 'node:fs';
import {makeObject,validatePlan} from '../src/floor/model.js';
import {snapDevice} from '../src/floor/devicePlacement.js';
const source=process.argv[2]||'output/revisao/original-2026-10-21.planta.json';
const plan=validatePlan(JSON.parse(fs.readFileSync(source,'utf8'))),old=structuredClone(plan);
const px=(x,y)=>({x:Math.round((x-13.776)/.566*100)/100,y:Math.round((y+15.824)/.566*100)/100});
const original=new Map(plan.objects.map(o=>[o.tag,o]));
const note='Revisão visual da captura de 21/10/2026. Valores não legíveis permanecem a confirmar.';
const replaced=new Set();let serial=0;
function point(tag,type,x,y,{rotation=0,power=null,circuit=null,control='',height=null,label='',commands,extra={}}={}){
 const previous=original.get(tag),pos=px(x,y),o=makeObject(type,pos.x,pos.y,{id:previous?.id||'review-o-'+(++serial),x2:pos.x,y2:pos.y,tag,type,power,height,label,rotation,circuitId:circuit?plan.circuits.find(c=>c.number===circuit)?.id||'':'',referenceNote:note,presentation:{name:!!label,power:true,circuit:true,control:true,height:false,voltage:false},...extra});
 if(control)o.control=control;if(commands)o.commands=commands.map(name=>({name,visible:true}));
 if(/220/.test(label))o.voltage=220;
 replaced.add(tag);return o;
}
const points=[];const add=(...args)=>{const o=point(...args);points.push(o);return o;};
// Ceiling lamps: positions are measured in pixels in the supplied capture.
for(const [tag,x,y,power,circuit,control] of [['L-AREA',138,110,20,1,'s'],['L-COZ',134,249,100,1,'c'],['L-B3',617,271,100,1,'B3'],['L-B1',1200,115,18,1,'b1'],['L-Q5A',429,671,20,20,'SH1'],['L-Q5B',483,671,20,20,'SH1'],['L-G1',660,788,100,40,'G3'],['L-G2',771,788,100,40,'G3'],['L-VARANDA',203,687,100,1,'d'],['L-LAV',637,423,100,1,'e']])add(tag,'light',x,y,{power,circuit,control});
// Semicircular wall lights were previously confused with switches and outlets.
const sconces=[['AR-AREA-EXT',121,70,180,1],['AR-AREA',65,177,90,1],['AR-COZ1',173,191,270,1],['AR-COZ2',173,246,270,1],['AR-COZ3',173,282,270,1],['AR-SJ1',326,215,270,1],['AR-SJ2',326,260,270,1],['AR-Q4-1',340,215,90,1],['AR-Q4-2',340,260,90,1],['AR-C1',387,84,0,1],['AR-C2',676,70,180,1],['AR-C3',904,84,0,1],['AR-C4',1088,70,180,1],['AR-C5',1088,86,0,1],['AR-B2',565,172,90,1],['AR-B3',565,244,90,1],['AR-Q3-1',847,208,270,1],['AR-Q3-2',847,279,270,1],['AR-Q2-1',866,208,90,1],['AR-Q2-2',866,279,90,1],['AR-Q1-1',1268,194,270,1],['AR-Q1-2',1268,248,270,1],['AR-Q1-3',1125,321,180,1],['AR-Q1-4',1238,321,180,1],['AR-B1',1151,148,0,1],['AR-SE1',78,424,90,1],['AR01',78,591,90,1],['AR-SE2',325,414,270,1],['AR-SE3',339,451,90,1],['AR-LAV1',555,456,90,20],['AR-LAV2',731,513,0,20],['AR-LAV3',862,513,0,20],['AR-LAV4',987,513,0,20],['AR-B4-1',401,527,180,20],['AR-B4-2',453,527,180,20],['AR-B4-3',506,527,180,20],['AR-G1',942,782,0,40],['AR-G2',1033,782,0,40],['AR-G3',1120,782,0,40],['AR-G4',1351,782,0,40]];
for(const [tag,x,y,rotation,circuit] of sconces)add(tag,'wallLight',x,y,{rotation,circuit,power:20});
const switches=[['S01',319,180,'switch','SJ'],['S02',87,136,'switch','s'],['S03',119,160,'switch','c'],['S04',346,292,'switch2','Q4'],['S05',549,176,'switch2','B2'],['S06',940,168,'switch','Q2'],['S07',684,244,'switch','Q3'],['S08',1095,301,'switch','V'],['S09',1110,146,'switch','b1'],['S10',562,478,'switch','L'],['S11',719,422,'switch','e'],['S12',428,571,'switch','BS2'],['S13',399,738,'switch','SH1'],['S14',79,669,'switch','d'],['S15',319,488,'switch','SE E'],['S-AREA2',144,160,'switch','c'],['S-AREA3',159,160,'switch','c'],['S-AREA4',174,160,'switchDouble',''],['S-C1',420,91,'switch','c1'],['S-C2',929,91,'switch','c2'],['S-VAR2',1223,328,'switch','V'],['S-BS1',544,528,'switch','BS1'],['S-G1',902,775,'switch','G3']];
for(const [tag,x,y,type,command] of switches)add(tag,type,x,y,{commands:type==='switchDouble'?['c1','c2']:[command],power:0});
// Visible triangular points, with the graphic low/medium/high convention.
const sockets=[['T02',183,111,'socketDouble',270,.3,14],['T03',183,153,'socketDouble',270,.3,14],['T08',85,243,'socketDouble',90,2.2,3],['T09',85,267,'socketDouble',90,2.2,3],['T10',85,283,'socket',90,2.2,3],['T11',85,312,'socketDouble',90,.3,3],['T12',85,327,'socketDouble',90,2.2,3],['T13',131,343,'socketDouble',0,.3,3],['T14',176,344,'socketDouble',0,.3,3],['T18',319,170,'socket',270,.3,6],['T19',346,249,'socketDouble',90,.3,6],['T20',346,281,'socketDouble',90,.3,6],['T21',319,293,'socketDouble',270,.3,6],['T22',205,343,'socketTriple',90,.3,6],['T23',548,275,'socketDouble',270,.3,6],['T27',573,203,'socket',90,.3,null],['T29',640,248,'socket',180,.3,null],['T30',684,256,'socket',90,.3,7],['T33',845,170,'socket',270,.3,7],['T36',845,302,'socket',270,.3,7],['T37',871,170,'socket',90,.3,7],['T39',871,302,'socket',90,.3,7],['T40',915,144,'socket',0,2.2,10],['T45',1090,260,'socketDouble',90,.3,5],['T46',1090,280,'socket',90,2.2,5],['T48',1260,169,'socketDouble',270,.3,null],['T50',1260,287,'socketDouble',270,.3,5],['T51',1089,328,'socket',180,.3,2],['T53',1131,130,'socket',90,.3,12],['T54',1131,143,'socket',90,.3,12],['T57',720,65,'socket',0,.3,14],['T60',85,386,'socketDouble',90,.3,15],['T61',85,403,'socketDouble',90,.3,15],['T63',564,499,'socket',90,2.2,21],['T65',412,594,'socket',180,2.2,21],['T66',449,594,'socket',180,2.2,21],['T67',498,594,'socket',180,2.2,21],['T68',382,614,'socketDouble',90,.3,21],['T70',382,667,'socketDouble',90,.3,21],['T71',382,702,'socketDouble',90,.3,21],['T72',532,614,'socketDouble',270,.3,21],['T75',532,717,'socketDouble',270,.3,21],['T76',859,779,'socket',0,2.2,41],['T77',887,779,'socketDouble',0,.3,41],['T79',1317,779,'socket',0,2.2,42],['T80',1455,672,'socketDouble',270,.3,44]];
for(const [tag,x,y,type,rotation,height,circuit]of sockets)add(tag,type,x,y,{rotation,height,circuit});
for(const [tag,x,y,label,power,circuit,rotation] of [['AQ01',149,64,'Aquecedor',null,14,180],['AQ02',631,65,'Aquecedor',null,14,180],['AQ03',1090,238,'Aquecedor',3500,11,90],['CH01',655,304,'Chuveiro 220 V',5400,18,270],['CH02',1265,143,'Chuveiro 220 V',5400,18,270],['CH03',378,571,'Chuveiro 220 V',5400,24,90],['BH01',512,571,'Banheira 220 V',5400,23,270],['SEC',1167,443,'Secadora 220 V',1087,19,90],['LAV',1167,476,'Máquina de lavar 220 V',1087,19,90],['PISC',1457,650,'Piscina',null,50,270],['CARGA',329,709,'Carga — confirmar',null,null,0]])add(tag,'dedicated',x,y,{label,power,circuit,rotation,height:2.2});
add('CAM','camera',1057,64,{label:'Câmera',power:0});

// Remove only the old traced electrical points, retaining architecture and personal additions.
plan.objects=plan.objects.filter(o=>!/^ref-o-/.test(o.id)||Number(o.id.slice(6))<60);
plan.objects.push(...points);
const byTag=tag=>plan.objects.find(o=>o.tag===tag);
const at=(id,x,y,values={})=>{const o=plan.objects.find(o=>o.id===id);Object.assign(o,px(x,y),values);return o;};
// Existing rooms preserve their measured dimensions.
plan.objects.find(o=>o.id==='ref-o-5').label='Corredor';
plan.objects.find(o=>o.id==='ref-o-17').label='Quarto 5 / Sandra';
// The five cabinets are confirmed by the user's second image and clarification.
at('ref-o-42',85,188,{type:'subBoard',tag:'QD-COZ',label:'Cozinha',referenceNote:'Quadro secundário confirmado na segunda imagem.'});
at('ref-o-43',399,747,{type:'subBoard',tag:'QD-SANDRA',label:'Quarto Sandra (Quarto 5)',referenceNote:'Local confirmado pelo usuário: Quarto 5.'});
const qg=add('QGBT','board',1269,786,{label:'Garagem — quadro geral',power:0,extra:{id:'review-board-garage',referenceNote:'Quadro geral confirmado pelo usuário na garagem; posição no ponto de convergência da captura.'}});plan.objects.push(qg);
const qs=add('QD-SERV','subBoard',57,188,{label:'Porta Serviço — exterior',power:0,extra:{referenceNote:'Posição confirmada pelo usuário: atrás do quadro Cozinha, na face externa da mesma parede.'}});plan.objects.push(qs);
const qp=add('QD-PISC','subBoard',1467,668,{label:'Piscina',power:0,extra:{referenceNote:'Quadro secundário da piscina confirmado na segunda imagem; na parede junto à piscina.'}});plan.objects.push(qp);
// No protective-device ratings or types can be read from the cabinet illustration.
for(const b of plan.objects.filter(o=>['board','subBoard'].includes(o.type)))b.referenceNote+=' Dispositivos e correntes internas a confirmar; não foram presumidos DR/DPS ou amperagens.';
at('ref-o-40',1254,806,{tag:'MED',label:'Medidor'});at('ref-o-41',1280,803,{tag:'DG',label:'Disjuntor geral'});
// Roof junction boxes now sit at the corresponding top wall.
for(const [id,x,y]of [[44,170,77],[45,866,77],[46,354,77],[47,1268,77],[48,1268,154],[49,728,413],[50,1153,515],[52,300,722],[53,811,642],[54,1464,632],[55,834,790]])at('ref-o-'+id,x,y,{referenceNote:note+' Caixas superiores ajustadas à parede conforme solicitado.'});
// Four previously guessed junctions are not squares in this capture.
plan.objects=plan.objects.filter(o=>!['ref-o-51','ref-o-56','ref-o-57','ref-o-58','ref-o-59'].includes(o.id));
// Door leaf geometry uses local +Y along its opening; horizontal doors extend left.
const doorRows=[[24,379,158,82,90],[25,713,158,82,90],[26,1015,158,82,90],[27,1090,86,80,90],[28,1165,81,80,90],[29,1038,111,80,0],[30,560,180,65,0],[31,560,250,65,0],[32,541,520,80,90],[33,368,706,84,0],[34,333,547,80,0]];
for(const [n,x,y,width,rotation]of doorRows)at('ref-o-'+n,x,y,{width,rotation,leaves:1,wallThickness:10,referenceNote:note+' Vão aproximado pela captura.'});
plan.objects.push(point('PORTA-SERVICO','door',72,92,{extra:{width:75,rotation:0,leaves:1,wallThickness:10,referenceNote:'Local confirmado pelo usuário: parede esquerda do cômodo acima da cozinha. Largura aproximada; conferir em campo.'}}));
for(const [tag,x,y,width,rotation] of [['JANELA-AREA',114,82,64,90],['JANELA-SJ',275,77,80,90],['JANELA-C1',466,77,135,90],['JANELA-C2',626,77,160,90],['JANELA-C3',950,77,155,90],['JANELA-B1',1230,77,190,90],['JANELA-Q4',523,314,245,90],['JANELA-Q3',795,314,145,90],['JANELA-Q2',982,314,150,90],['JANELA-Q1',1170,314,130,90],['JANELA-SE',260,656,145,90]])plan.objects.push(point(tag,'window',x,y,{extra:{width,rotation,wallThickness:10,referenceNote:note+' Janela identificada pelas linhas paralelas; dimensão e peitoril aproximados.'}}));
// Original circuit numbers remain editable. Add only numbers legible on the new lower wing.
for(const n of [40,41,42,44])if(!plan.circuits.some(c=>c.number===n))plan.circuits.push({id:'review-c-'+n,number:n,name:n===40?'Iluminação da garagem':'Circuito '+n+' — garagem',panelId:qg.id,voltage:null,phase:'?',breaker:null,section:null,conductors:null,demandFactor:1,color:'#303943',referenceNote:'Número transcrito da imagem; proteções, fase e condutores a confirmar.'});
for(const o of plan.objects){if(['L-G1','L-G2','AR-G1','AR-G2','AR-G3','AR-G4'].includes(o.tag))o.circuitId='review-c-40';if(o.tag==='T76'||o.tag==='T77')o.circuitId='review-c-41';if(o.tag==='T79')o.circuitId='review-c-42';if(o.tag==='T80')o.circuitId='review-c-44';}
for(const c of plan.circuits){if(c.number===7)c.name='Tomadas Quartos 2 e 3';c.panelId=c.number===50?qp.id:c.number>=40?qg.id:c.number>=20?'ref-o-43':'ref-o-42';c.referenceNote=(c.referenceNote||'')+' Origem do circuito a conferir; localização dos quadros corrigida pela segunda imagem.';}
// Keep only the observed old paths whose endpoints survive, then correct the feeder origin.
const ids=new Set(plan.objects.map(o=>o.id));plan.routes=plan.routes.filter(r=>ids.has(r.from)&&ids.has(r.to));
const removeRoutes=new Set(['ref-r-2','ref-r-3','ref-r-4','ref-r-5','ref-r-6','ref-r-8','ref-r-9','ref-r-23','ref-r-24','ref-r-25','ref-r-26','ref-r-27']);plan.routes=plan.routes.filter(r=>!removeRoutes.has(r.id));
let routeSerial=0;const route=(from,to,points=[],reason='Trecho visível na captura.')=>{const a=byTag(from),b=byTag(to);if(!a||!b)throw Error('Ponto inexistente: '+from+' / '+to);if(plan.routes.some(r=>(r.from===a.id&&r.to===b.id)||(r.from===b.id&&r.to===a.id)))return;plan.routes.push({id:'review-r-'+(++routeSerial),from:a.id,to:b.id,kind:'conduit',size:'A confirmar',points:points.map(([x,y])=>px(x,y)),circuitIds:[],wires:[],sourceObserved:true,annotation:'',referenceNote:reason+' Bitola, cores e quantidade de fios não legíveis.'});};
// Supply, wall routing to the confirmed opposite-face service board, and external diagonals.
route('DG','QGBT');route('QGBT','J10',[[834,790]]);route('QGBT','J11');route('J10','QD-SANDRA');route('J10','J11');route('J11','QD-PISC');
route('QD-SANDRA','J09');route('J09','QD-COZ');route('J09','S15');route('J06','AR-LAV2');route('J06','L-LAV');route('J06','S11');route('AR-LAV1','S10');route('L-LAV','AR-LAV1');route('AR-LAV1','QD-SANDRA');route('L-LAV','T63');
for(const tag of ['T02','T03','S02','S03','S-AREA2','S-AREA3','S-AREA4'])route('L-AREA',tag);
for(const tag of ['T08','T09','T10','T11','T12','T13','T14','AR-COZ1','AR-COZ2','AR-COZ3'])route('L-COZ',tag);
for(const tag of ['S05','S07','AR-Q4-1','AR-Q4-2','AR-Q3-1','AR-Q3-2','AR-Q2-1','AR-Q2-2'])route('L-B3',tag);
for(const tag of ['S09','T53','T54','AR-B1'])route('L-B1',tag);
route('QD-SANDRA','S13');route('L-Q5A','T65');route('L-Q5A','T66');route('L-Q5B','T67');
route('L-G2','J12');route('L-G1','L-G2');route('QGBT','AR-G4');route('J12','AR-G1');route('AR-G1','AR-G2');route('AR-G2','AR-G3');
// Replace old notes that called the kitchen cabinet the main panel.
plan.reference={...plan.reference,file:'reference/planta-revisada-2026-10-21.png',imageWidth:1532,imageHeight:831,pixelsPerMeter:56.6,notice:'Revisão visual da captura de 21/10/2026. Quadro geral na garagem; secundários: Cozinha, Porta Serviço, Quarto Sandra (Quarto 5) e Piscina. Dados ilegíveis e associação dos circuitos aos dispositivos permanecem a conferir.',limitations:['Posições e larguras de vãos aproximadas pela imagem; manter as medidas conferidas em campo.','Alturas de tomadas classificadas pela convenção gráfica baixa/média/alta; valores de montagem são os presets do editor e devem ser conferidos.','Correntes, DR/DDR/IDR/DPS, bitolas, cores e quantidade dos fios internos não são identificáveis nesta captura.','A alimentação dos quadros foi corrigida visualmente; circuitos individuais e sua distribuição interna requerem conferência.'],review:{date:'2026-10-21',panelsConfirmed:true,serviceDoor:'Parede esquerda da Área, acima da cozinha',servicePanel:'Face externa da parede do quadro Cozinha',sandraRoom:'Quarto 5'}};
// Snap symbols close to real walls; preserve the measured source position when it is not near one.
plan.objects=plan.objects.map(o=>['socket','socketDouble','socketTriple','dedicated','switch','switch2','switchDouble','wallLight'].includes(o.type)?snapDevice(plan,o,28):o);
for(const o of plan.objects){if(['AR-C1','AR-B1'].includes(o.tag))o.power=10;const command=o.tag.startsWith('AR-SJ')?'SJ':o.tag.startsWith('AR-Q4')?'Q4':o.tag==='AR-B2'?'B2':o.tag==='AR-B3'?'B3':o.tag.startsWith('AR-Q3')?'Q3':o.tag.startsWith('AR-Q2')?'Q2':'';if(command)o.control=command;}
for(const o of plan.objects)if(o.presentation){o.presentation.power=o.power!==null;o.presentation.circuit=!!o.circuitId;}
validatePlan(plan);
fs.mkdirSync('output/revisao',{recursive:true});fs.writeFileSync('output/revisao/imagem.planta.json',JSON.stringify(plan,null,2));
const example={...plan,name:'Residência — referência revisada',author:'Reconstrução das referências fornecidas'};delete example.floors;delete example.activeFloorId;fs.writeFileSync('examples/replica-imagem.planta.json',JSON.stringify(example,null,2));
fs.writeFileSync('output/revisao/resumo.json',JSON.stringify({antes:{objetos:old.objects.length,conduites:old.routes.length},depois:{objetos:plan.objects.length,conduites:plan.routes.length},quadros:plan.objects.filter(o=>['board','subBoard'].includes(o.type)).map(o=>({id:o.id,tipo:o.type,nome:o.label,tag:o.tag,x:o.x,y:o.y})),tipos:Object.fromEntries([...new Set(plan.objects.map(o=>o.type))].map(t=>[t,plan.objects.filter(o=>o.type===t).length]))},null,2));
console.log(fs.readFileSync('output/revisao/resumo.json','utf8'));
