import fs from 'node:fs';
import {blankPlan,makeObject,makeCircuit,validatePlan} from '../src/floor/model.js';

// Traçado manual em coordenadas da imagem: 50 px/m, confirmado pelas cotas
// 4,00 m (Quarto 4) e 11,40 m (Garagem). Não há reconhecimento automático.
const p=blankPlan();
Object.assign(p,{name:'Residência — réplica da imagem',author:'Reconstrução da referência fornecida',width:2800,height:1600,mainRating:null});
p.reference={file:'reference/planta-original.png',imageWidth:1357,imageHeight:765,pixelsPerMeter:50,
 notice:'Réplica visual aproximada. Geometria calibrada pelas cotas 4,00 m e 11,40 m. Dados elétricos ilegíveis permanecem a confirmar; percursos não equivalem a condutores identificados.',
 limitations:['Cores, bitolas, quantidade e funções dos fios não são distinguíveis na captura; não foram inventadas.','Potências foram transcritas somente quando legíveis. Valores em branco significam a confirmar, não zero.','A posição de algumas portas e símbolos é aproximada. Tipos ambíguos são identificados nas notas de cada elemento.','QGBT, DG e quadro inferior são uma interpretação dos símbolos de distribuição; a identificação original deve ser conferida.','Linhas diagonais foram reproduzidas como vistas, inclusive passagens externas. Não foram substituídas por roteamento ortogonal.','Não foram acrescentados ramais automaticamente para completar pontos cuja ligação não é visível.']};
let serial=0;const nodes=new Map(),circuits=new Map();
const xy=(x,y)=>({x:x*2,y:y*2});
function obj(type,x,y,extra={}){const o=makeObject(type,x*2,y*2,{id:'ref-o-'+(++serial),power:0,height:null,...extra});p.objects.push(o);return o;}
function room(label,x,y,x2,y2,openArea=false){return obj('room',x,y,{x2:x2*2,y2:y2*2,width:openArea?2:10,label,tag:'',openArea});}
function text(label,x,y,extra={}){return obj('text',x,y,{label,...extra});}
function device(key,type,x,y,{power=null,circuit=null,label='',note='',rotation=0}={}){const o=obj(type,x,y,{tag:key,power,circuitId:circuits.get(circuit)?.id||'',label,referenceNote:note,rotation});nodes.set(key,o);return o;}
function circuit(number,name,voltage=null){const c=makeCircuit('',number);Object.assign(c,{id:'ref-c-'+number,name,phase:'?',voltage,breaker:null,section:null,conductors:null,color:'#303943',referenceNote:'Proteção, seção, condutores e fase não legíveis na imagem.'});p.circuits.push(c);circuits.set(number,c);return c;}

// Cômodos fechados, nas posições e proporções da referência.
room('Área',52,82,166,153);room('Cozinha',52,153,166,328);
room('Sala Jantar',166,82,282,328);room('Sala de estar',52,328,282,599);
room('Comedor',282,82,908,153);room('Quarto 4',282,153,482,295);
room('Banheiro 2',484,153,582,240);room('Banheiro 3',484,240,582,295);
room('Quarto 3',582,153,748,295);room('Quarto 2',748,153,908,295);
room('Quarto 1',908,153,1120,295);room('Corredor',908,82,978,153);
room('Banheiro 1',978,82,1120,153);
room('Lavanderia',475,375,1010,475);room('',475,375,635,412);
room('Banheiro 4',315,475,470,528);room('Quarto 5',315,528,470,684);
room('Garagem',725,585,1295,720);room('Piscina',1287,441,1307,600);
room('Carga',225,663,285,720);
room('Varanda 1',52,599,282,658,true);room('Varanda 2',908,295,1120,357,true);
text('Entulhos',513,358);

// Portas com vão aproximado observado, em centímetros.
for(const [x,y,width,rotation]of[[328,153,82,90],[630,153,84,90],[795,153,80,90],[953,153,84,90],[978,107,80,0],[908,107,80,0],[484,167,65,0],[484,251,65,0],[470,476,80,90],[315,640,84,0],[52,511,90,0]])obj('door',x,y,{width,rotation,referenceNote:'Vão e sentido aproximados pela imagem; revisar.'});
for(const [x,y,x2,y2]of[[282,281,482,281],[725,685,1295,685],[282,142,908,142],[52,590,282,590],[491,427,1010,427]])obj('dimension',x,y,{x2:x2*2,y2:y2*2});

for(const [n,name,v]of[[1,'Iluminação superior',null],[2,'Circuito 2',null],[3,'Circuito 3',null],[4,'Circuito 4',null],[5,'Circuito 5',null],[6,'Pontos Quarto 4',null],[7,'Pontos cozinha',null],[8,'Pontos cozinha',null],[9,'Pontos cozinha',null],[10,'Pontos cozinha',null],[11,'Circuito 11',null],[12,'Circuito 12',null],[13,'Circuito 13',null],[14,'Aquecedores / pontos superiores',null],[15,'Sala de estar / lavanderia',null],[16,'Circuito 16',null],[17,'Circuito 17',null],[18,'Chuveiro superior',220],[19,'Circuito 19',null],[20,'Iluminação inferior',null],[21,'Pontos inferiores',null],[22,'Circuito 22',null],[23,'Banheira inferior — confirmar circuito',220],[24,'Chuveiro inferior — confirmar circuito',220],[50,'Piscina',null]])circuit(n,name,v);

// Distribuição: interpretação a conferir, preservando os pontos da captura.
device('MED','meter',1105,730,{power:0,note:'Símbolo M visível próximo à garagem; interpretado como medidor.'});
device('DG','mainBreaker',1125,715,{power:0,note:'Origem de alimentação interpretada; corrente nominal ilegível.'});
const qg=device('QGBT','board',52,185,{power:0,note:'Símbolo escuro na parede esquerda interpretado como quadro geral; confirmar.'});
const qd=device('QD-INF','subBoard',340,676,{power:0,note:'Ponto de convergência inferior interpretado como quadro secundário; confirmar tipo original.'});
for(const c of p.circuits)c.panelId=c.number>=20&&c.number!==50?qd.id:qg.id;

// Junções visíveis nos grandes percursos diagonais e externos.
for(const [tag,x,y]of[['J01',140,26],['J02',756,32],['J03',300,66],['J04',1112,60],['J05',1110,144],['J06',633,381],['J07',1009,473],['J08',479,438],['J09',255,653],['J10',708,585],['J11',1286,580],['J12',744,717],['J13',150,321],['J14',378,526],['J15',68,397],['J16',270,452]])device(tag,'junction',x,y,{power:0,note:'Ponto de encontro traçado na imagem; tipo físico da caixa a confirmar.'});

// Luminárias circulares que se distinguem na captura.
for(const [key,x,y,power,circuit,label]of[['L-AREA',112,114,20,1,'1A'],['L-COZ',108,240,100,1,'1C'],['L-B3',524,264,100,1,'1B'],['L-B1',1052,121,null,1,'BT — potência a confirmar'],['L-Q5A',368,612,20,20,'20S1'],['L-Q5B',412,612,20,20,'20S1'],['L-G1',572,713,100,20,'20S'],['L-G2',672,713,100,20,'20S']])device(key,'light',x,y,{power,circuit,label});

// Interruptores/acionamentos circulares ao longo das paredes.
for(const [key,x,y,circuit]of[['S01',269,176,1],['S02',269,208,1],['S03',269,244,1],['S04',269,270,1],['S05',593,230,1],['S06',753,202,1],['S07',753,247,1],['S08',978,283,1],['S09',970,148,1],['S10',490,440,20],['S11',634,470,20],['S12',753,470,20],['S13',879,470,20],['S14',270,384,20],['S15',270,421,20]])device(key,'switch',x,y,{power:0,circuit,note:'Posição observada; função simples/paralela/intermediária a confirmar.'});

// Tomadas e pontos triangulares. Identificações não legíveis permanecem abertas.
const outlets=[
 ['T01',64,136,null,270],['T02',153,111,14,90],['T03',153,142,14,90],['T04',103,156,null,180],['T05',116,156,null,180],['T06',130,156,null,180],['T07',145,156,null,180],
 ['T08',64,214,7,270],['T09',64,237,8,270],['T10',64,259,9,270],['T11',64,278,10,270],['T12',64,296,null,270],['T13',79,321,null,0],['T14',116,321,null,0],['T15',154,283,null,90],['T16',154,269,null,90],['T17',154,215,null,90],
 ['T18',269,168,6,90],['T19',269,198,6,90],['T20',269,235,6,90],['T21',269,278,6,90],['T22',294,289,6,0],['T23',472,169,6,90],['T24',472,196,6,90],['T25',472,228,6,90],['T26',472,280,6,90],
 ['T27',494,166,null,270],['T28',494,194,null,270],['T29',568,225,null,90],['T30',592,175,null,270],['T31',592,203,null,270],['T32',592,270,null,270],['T33',736,170,null,90],['T34',736,204,null,90],['T35',736,247,null,90],['T36',736,279,null,90],
 ['T37',766,175,null,270],['T38',766,203,null,270],['T39',766,274,null,270],['T40',897,166,null,90],['T41',897,199,null,90],['T42',897,241,null,90],['T43',897,282,null,90],
 ['T44',940,166,null,270],['T45',940,195,null,270],['T46',940,225,null,270],['T47',940,266,null,270],['T48',1108,197,null,90],['T49',1108,230,null,90],['T50',1108,270,null,90],['T51',1000,292,null,0],['T52',1057,292,null,0],
 ['T53',1000,136,null,270],['T54',1032,148,null,0],['T55',1065,148,null,0],['T56',927,76,5,180],['T57',630,76,null,180],['T58',500,76,null,180],['T59',1108,60,null,180],
 ['T60',65,354,15,270],['T61',65,375,15,270],['T62',66,396,15,270],['T63',488,418,21,270],['T64',488,458,21,270],
 ['T65',326,488,21,270],['T66',374,488,21,180],['T67',412,488,21,180],['T68',326,560,21,270],['T69',326,577,21,270],['T70',326,610,21,270],['T71',326,633,21,270],['T72',462,560,21,90],['T73',462,577,21,90],['T74',462,610,21,90],['T75',462,649,21,90],
 ['T76',772,708,null,0],['T77',834,708,null,0],['T78',980,708,null,0],['T79',1152,708,null,0],['T80',1186,708,null,0]
];
for(const [key,x,y,circuit,rotation]of outlets)device(key,'socketLow',x,y,{circuit,rotation,note:'Símbolo e posição traçados; potência, altura e eventual variante da tomada a confirmar.'});

for(const [key,x,y,label,power,circuit,rotation]of[['AQ01',153,77,'Aquecedor',null,14,180],['AQ02',550,76,'Aquecedor',null,14,180],['AQ03',940,225,'Aquecedor',null,null,270],['CH01',568,279,'Chuveiro 220 V',5400,18,90],['CH02',1110,144,'Chuveiro 220 V',5400,null,90],['CH03',326,523,'Chuveiro 220 V',5400,24,270],['BH01',445,522,'Banheira 220 V',5400,23,90],['SEC',1018,407,'Secadora 220 V',1087,15,90],['LAV',1018,438,'Máquina de lavar 220 V',1087,15,90],['PISC',1286,592,'Piscina',null,50,90],['CARGA',238,706,'Carga — confirmar',null,null,0]])device(key,'dedicated',x,y,{label,power,circuit,rotation,note:'Transcrição parcial da legenda; circuito e características devem ser conferidos.'});
device('CAM','data',944,76,{power:0,label:'Câmera',note:'Legenda Câmera na imagem; representada por um ponto de sinal.'});
device('TV-Q5','data',462,667,{power:0,label:'Ponto de sinal',note:'Símbolo ambíguo; confirmar se TV/rede/telefone.'});
device('AR01','wallLight',64,540,{power:20,circuit:20,label:'20 VA'});

let routeSerial=0;const pairs=new Set();
function route(from,to,numbers=[],annotation=''){if(!nodes.has(from)||!nodes.has(to))throw Error(`Ponto ausente: ${from}/${to}`);const pair=[from,to].sort().join('|');if(pairs.has(pair))return;pairs.add(pair);p.routes.push({id:'ref-r-'+(++routeSerial),kind:'conduit',from:nodes.get(from).id,to:nodes.get(to).id,points:[],circuitIds:numbers.map(n=>circuits.get(n).id),size:'A confirmar',wires:[],annotation,referenceNote:'Percurso traçado da linha visível. Quantidade, função, bitola e cor dos condutores não legíveis; não foram preenchidas.',sourceObserved:true});}
// Esqueleto de passagens, preservando as diagonais e encontros da captura.
for(const [a,b]of[['MED','DG'],['DG','J12'],['DG','J11'],['J12','J10'],['J10','J11'],['J10','QD-INF'],['QD-INF','J09'],['J09','J13'],['J13','QGBT'],['QGBT','J01'],['J01','J02'],['J01','J03'],['J01','J04'],['J02','J05'],['J03','J04'],['J03','QGBT'],['J04','J05'],['J03','L-B3'],['L-B3','J05'],['J05','J07'],['J07','J06'],['J06','J08'],['J08','QD-INF'],['QD-INF','J14'],['QGBT','J15'],['J15','J16'],['J16','J08'],['J11','PISC']])route(a,b,[],['J01','J02','J03','J04'].includes(a)?'φ 1¼″ — leitura parcial':'');
for(const [a,b]of[['QGBT','L-AREA'],['QGBT','L-COZ'],['QGBT','L-B3'],['L-B3','L-B1'],['L-B1','J05'],['L-B1','S09'],['L-AREA','T01'],['L-AREA','T02'],['L-AREA','T03'],['L-AREA','T04'],['L-AREA','T05'],['L-AREA','T06'],['L-AREA','T07'],['L-COZ','T08'],['L-COZ','T09'],['L-COZ','T10'],['L-COZ','T11'],['L-COZ','T12'],['L-COZ','T13'],['L-COZ','T14'],['L-COZ','T15'],['L-COZ','T16'],['L-COZ','T17'],['L-COZ','J13']])route(a,b);
for(const [a,b]of[['QD-INF','L-Q5A'],['QD-INF','L-Q5B'],['L-Q5A','J14'],['L-Q5B','J14'],['QD-INF','T68'],['QD-INF','T69'],['QD-INF','T70'],['QD-INF','T71'],['QD-INF','T72'],['QD-INF','T73'],['QD-INF','T74'],['QD-INF','T75'],['J14','CH03'],['J14','BH01'],['L-Q5A','T65'],['L-Q5B','T67'],['J08','S10'],['J06','S11'],['J07','SEC'],['J07','LAV'],['J05','CH02'],['L-B3','CH01'],['J01','AQ01'],['J03','AQ02'],['J12','T76'],['J12','T77'],['J12','T78'],['DG','T79'],['DG','T80']])route(a,b);

p.reference.objectCount=p.objects.length;p.reference.routeCount=p.routes.length;
validatePlan(p);
fs.mkdirSync('examples/reference',{recursive:true});
fs.copyFileSync('C:/Users/leo_a/AppData/Local/Temp/codex-clipboard-110d40b9-d409-4f52-afe3-1bab490a1e23.png','examples/reference/planta-original.png');
fs.writeFileSync('examples/replica-imagem.planta.json',JSON.stringify(p,null,2));
fs.writeFileSync('docs/REPLICA-IMAGEM.md',`# Réplica da planta fornecida\n\nArquivo editável: examples/replica-imagem.planta.json.\n\n${p.objects.length} elementos e ${p.routes.length} trechos traçados manualmente. Área de trabalho: 28 × 16 m. Escala geométrica da captura: aproximadamente 50 px/m, corroborada pelas cotas 4,00 m e 11,40 m. Não é um levantamento métrico ou reprodução com precisão de CAD original.\n\n## O que foi recriado\n\n${p.objects.filter(o=>o.type==='room'&&o.label).map(o=>'- '+o.label).join('\n')}\n\nInclui também portas aproximadas, cotas, pontos de iluminação, tomadas, interruptores, cargas específicas, pontos de distribuição e percursos diagonais/externos reconhecíveis. As linhas são conexões editáveis, não uma imagem de fundo.\n\n## Informações a confirmar\n\n${p.reference.limitations.map(t=>'- '+t).join('\n')}\n\nCircuitos 1–24 e 50 organizam referências numéricas vistas ou parcialmente identificadas. A associação de alguns pontos é provisória e consta das notas. Demais campos elétricos ilegíveis são nulos (a confirmar). Muitos pontos permanecem sem circuito/ramal para evitar completar a imagem por suposição.\n\nAs passagens visíveis foram registradas como percursos sem fios individualizados, pois não há leitura confiável da bitola, cor, função e quantidade dos condutores. Use Fios e cabos para preencher esses dados após conferência. O relatório não deve ser usado como quantitativo de fiação concluído.\n\nA imagem original foi preservada em examples/reference/planta-original.png para comparação.\n`);
console.log(`${p.objects.length} elementos; ${p.routes.length} percursos; ${p.circuits.length} referências de circuitos.`);
