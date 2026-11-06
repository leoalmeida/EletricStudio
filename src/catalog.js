// Referências: páginas físicas dos PDFs fornecidos. Desenhos SVG próprios.
export const categories=['Alimentação','Fusíveis e seccionadores','Automáticos e disjuntores','Contatores e comutadores','Motores','Soft starters e inversores','Contatos auxiliares e temporizados','Botões de acionamento','Detectores','Bobinas e sinais','Relés eletrônicos','Transformadores','Bornes e conexões'];
const pairPorts=n=>[...Array.from({length:n},(_,i)=>[i*40,0]),...Array.from({length:n},(_,i)=>[i*40,80])];
const pairLinks=n=>Array.from({length:n},(_,i)=>[i,i+n]);
const entries=[];
function add(type,label,category,prefix,pins,options={}){
 const shape=options.shape||'contact';
 entries.push({type,label,category:categories[category],prefix,pins,shape,ports:[[0,0],[0,80]],behavior:'contact',normal:false,interaction:'none',available:'logic',guide:[],commands:[],description:'Continuidade lógica ideal; sem cálculo de corrente ou tensão.',...options});
}
function poles(type,label,category,prefix,n,options={}){add(type,label,category,prefix,[...Array.from({length:n},(_,i)=>String(2*i+1)),...Array.from({length:n},(_,i)=>String(2*i+2))],{ports:pairPorts(n),pairs:pairLinks(n),...options});}
add('source','Fase / positivo',0,'L',['L'],{shape:'source',behavior:'source',ports:[[0,40]],commands:[33]});
add('neutral','Neutro / negativo',0,'N',['N'],{shape:'source',behavior:'neutral',ports:[[0,40]],commands:[33]});
add('ground','Terra de proteção (PE)',0,'PE',['PE'],{shape:'ground',behavior:'passive',ports:[[0,0]],commands:[33],description:'Referência gráfica de proteção. Não equivale ao neutro no simulador.'});
add('source3','Alimentação trifásica + N + PE',0,'X',['L1','L2','L3','N','PE'],{shape:'supply3',ports:Array.from({length:5},(_,i)=>[i*40,80]),available:'drawing',commands:[33],description:'Alimentação multifásica; modelo elétrico trifásico pendente.'});
add('fuse','Fusível monopolar',1,'F',['1','2'],{shape:'fuse',normal:true,interaction:'toggle',guide:[7],commands:[19,34],description:'Clique para simular fusível interrompido/reposto; sem curva de fusão.'});
poles('fuse3','Fusíveis tripolares',1,'F',3,{shape:'fuse',normal:true,interaction:'toggle',guide:[7],commands:[34]});
add('isolator','Chave seccionadora',1,'Q',['1','2'],{shape:'switch',interaction:'toggle',commands:[27,34]});
poles('isolator3','Seccionadora tripolar',1,'Q',3,{shape:'switch',interaction:'toggle',commands:[27,34]});
add('breaker','Disjuntor monopolar',2,'Q',['1','2'],{shape:'breaker',normal:true,interaction:'toggle',commands:[23,24,34]});
poles('breaker2','Disjuntor bipolar',2,'Q',2,{shape:'breaker',normal:true,interaction:'toggle',guide:[9],commands:[23,34]});
poles('breaker3','Disjuntor tripolar',2,'Q',3,{shape:'breaker',normal:true,interaction:'toggle',guide:[10],commands:[23,34]});
poles('motorBreaker','Disjuntor-motor',2,'Q',3,{shape:'breaker',normal:true,interaction:'toggle',guide:[8],commands:[25,34],description:'Manobra lógica de três polos; disparo manual, sem ajuste de corrente.'});
add('magneticBreaker','Disjuntor magnético',2,'Q',['1','2'],{shape:'breaker',normal:true,interaction:'toggle',commands:[23,24,38],description:'Disparo manual; proteção magnética não calculada.'});
add('thermalMagneticBreaker','Disjuntor termomagnético',2,'Q',['1','2'],{shape:'breaker',normal:true,interaction:'toggle',commands:[23,25,38],description:'Disparo manual; curvas térmica e magnética não calculadas.'});
add('rcd2','DR bipolar',2,'F',['1','N','2','N'],{shape:'rcd',ports:pairPorts(2),pairs:pairLinks(2),normal:true,interaction:'toggle',guide:[22],description:'Dois polos acoplados; disparo manual, sem cálculo de fuga.'});
add('thermalRelay','Relé térmico de potência',2,'F',['1','3','5','2','4','6'],{shape:'thermal',ports:pairPorts(3),pairs:pairLinks(3),normal:true,interaction:'trip',behavior:'thermal',guide:[13],commands:[21],description:'Clique para disparar/rearmar; contatos térmicos da mesma TAG acompanham.'});
add('auxContactor','Contator auxiliar completo',3,'K',['A1','A2','11','12','21','22','33','34','43','44'],{shape:'assembly',ports:[[0,0],[0,80],...[40,80,120,160].flatMap(x=>[[x,0],[x,80]])],behavior:'assembly',pairs:[[2,3],[4,5],[6,7],[8,9]],normallyClosed:[0,1],guide:[20],commands:[28],description:'Bobina e contatos 2 NF + 2 NA integrados; associação pela TAG.'});
add('powerContactor','Contator de potência completo',3,'K',['A1','A2','1','2','3','4','5','6','11','12','23','24'],{shape:'assembly',ports:[[0,0],[0,80],...[40,80,120,160,200].flatMap(x=>[[x,0],[x,80]])],behavior:'assembly',pairs:[[2,3],[4,5],[6,7],[8,9],[10,11]],normallyClosed:[3],guide:[21],commands:[28],description:'Bobina, três contatos principais e auxiliares NF/NA; somente continuidade lógica.'});
poles('powerContact3','Contatos de potência tripolares NA',3,'K',3,{behavior:'linked',guide:[21],commands:[35,37]});
add('selector','Chave seletora / comutador',3,'S',['11','12','14'],{shape:'changeover',ports:[[0,0],[-20,80],[20,80]],behavior:'changeover',interaction:'toggle',commands:[27,35]});
add('motor','Motor (modelo lógico)',4,'M',['U','V'],{shape:'motor',behavior:'load',mark:'M',commands:[35],description:'Carga lógica de dois terminais; sem cálculo de potência ou rotação.'});
add('motor1','Motor monofásico',4,'M',['U1','V1','PE'],{shape:'motor',behavior:'load',ports:[[0,0],[0,80],[40,80]],mark:'1~',guide:[11],commands:[35],description:'U1/V1 são carga lógica; PE é apenas referência de proteção.'});
for(const [type,label,pins,guide,mark]of[
 ['motor3','Motor trifásico — gaiola de esquilo',['U1','V1','W1','PE'],12,'3~'],
 ['motorCap','Motor monofásico com capacitor',['U1','V1','U2','V2','PE'],23,'1~ C'],
 ['motor6','Motor trifásico — 6 terminais',['U1','V1','W1','U2','V2','W2','PE'],24,'3~'],
 ['dahlander','Motor Dahlander',['U1','V1','W1','U2','V2','W2','PE'],25,'Dah'],
 ['doubleWinding','Motor de duplo bobinado',['U1','V1','W1','U2','V2','W2','PE'],26,'I–II'],
 ['woundRotor','Motor de rotor bobinado',['U1','V1','W1','K','L','M','PE'],27,'3~ R']
]){let n=type==='motor3'?3:type==='motorCap'?2:3;add(type,label,4,'M',pins,{shape:'motorMulti',ports: pins.map((_,i)=>i===pins.length-1?[n*40,80]:[i%n*40,i<n?0:80]),available:'drawing',mark,guide:[guide],commands:[35],description:'Símbolo para documentação; simulação dos enrolamentos e potência pendente.'});}
for(const [type,label,mark] of [['softStarter','Soft starter','SS'],['inverter','Inversor de frequência','VFD'],['dcConverter','Conversor de corrente contínua','CC']])add(type,label,5,'U',type==='dcConverter'?['L','N','+','−']:['L1','L2','L3','U','V','W'],{shape:'drive',ports:type==='dcConverter'?pairPorts(2):pairPorts(3),available:'drawing',mark,commands:[35,47,48,49,50,51,52,53],description:'Bloco para desenho. Rampas, frequência, retificação e controle não simulados.'});
add('contact','Contato auxiliar NA',6,'K',['13','14'],{behavior:'linked',commands:[35,38]});
add('contactNC','Contato auxiliar NF',6,'K',['21','22'],{behavior:'linked',normal:true,commands:[35,38]});
add('overloadNA','Contato térmico NA',6,'F',['97','98'],{behavior:'thermal',interaction:'trip',guide:[14],commands:[21]});
add('overload','Contato térmico NF',6,'F',['95','96'],{behavior:'thermal',interaction:'trip',normal:true,guide:[15],commands:[21]});
add('thermalCombined','Contatos térmicos NF + NA',6,'F',['95','97','96','98'],{ports:pairPorts(2),pairs:pairLinks(2),normallyClosed:[0],behavior:'thermal',interaction:'trip',guide:[16],commands:[21]});
add('timerContact','Contato temporizado NA',6,'T',['15','18'],{behavior:'linked',mark:'t',guide:[17],commands:[35,38]});
add('timerContactNC','Contato temporizado NF',6,'T',['15','16'],{behavior:'linked',normal:true,mark:'t',guide:[17],commands:[35,38]});
add('timerChangeover','Contato reversível temporizado',6,'T',['15','16','18'],{shape:'changeover',ports:[[0,0],[-20,80],[20,80]],behavior:'changeover',mark:'t',guide:[19],commands:[35],description:'Comum 15 comuta entre NF 16 e NA 18, seguindo a bobina TON/TOF da mesma TAG.'});
add('no','Botoeira NA com retorno por mola',7,'S',['3','4'],{shape:'push',interaction:'hold',guide:[4],commands:[26,36,37]});
add('nc','Botoeira NF com retorno por mola',7,'S',['1','2'],{shape:'push',interaction:'hold',normal:true,guide:[4],commands:[26,36,37]});
add('maintainedNO','Botoeira NA com retenção',7,'S',['3','4'],{shape:'push',interaction:'toggle',guide:[4],commands:[26,37]});
add('maintainedNC','Botoeira NF com retenção',7,'S',['1','2'],{shape:'push',interaction:'toggle',normal:true,guide:[4],commands:[26,37]});
add('emergency','Botoeira de emergência NF',7,'S',['1','2'],{shape:'emergency',interaction:'toggle',normal:true,commands:[26]});
add('limitNO','Fim de curso NA',8,'S',['13','14'],{shape:'limit',interaction:'toggle',commands:[36]});
add('limitNC','Fim de curso NF',8,'S',['21','22'],{shape:'limit',interaction:'toggle',normal:true,commands:[36]});
add('sensor','Sensor de proximidade',8,'B',['+','−','Q'],{shape:'sensor',behavior:'sensor',interaction:'toggle',commands:[36],description:'Saída manual ideal; tecnologia PNP/NPN e montagem são metadados.'});
for(const [type,label,mark]of[['inductiveSensor','Sensor indutivo','L'],['capacitiveSensor','Sensor capacitivo','C'],['photoSensor','Sensor fotoelétrico','↗']])add(type,label,8,'B',['+','−','Q'],{shape:'sensor',behavior:'sensor',interaction:'toggle',mark,commands:[36],description:'Acionamento manual ideal; tecnologia e princípio de detecção não são calculados.'});
for(const [type,label,mark]of[['pressureSwitch','Pressostato NA','P'],['vacuumSwitch','Vacuostato NA','V'],['thermostat','Termostato NA','ϑ'],['levelSwitch','Chave de nível NA','L']])add(type,label,8,'S',['13','14'],{shape:'limit',interaction:'toggle',mark,commands:[36],description:'Contato lógico acionado manualmente; grandeza física não simulada.'});
add('coil','Bobina do contator',9,'K',['A1','A2'],{shape:'coil',behavior:'coil',guide:[6],commands:[37,38]});
add('timer','Bobina temporizada TON (on delay)',9,'T',['A1','A2'],{shape:'coil',behavior:'ton',mark:'TON',guide:[17],commands:[22,38]});
add('timerOff','Bobina temporizada TOF (off delay)',9,'T',['A1','A2'],{shape:'coil',behavior:'tof',mark:'TOF',guide:[18],commands:[22],description:'Saída liga imediatamente e desliga após o retardo contado da desenergização.'});
add('lamp','Sinalizador luminoso',9,'H',['X1','X2'],{shape:'lamp',behavior:'load',guide:[5],commands:[29,37,38]});
add('buzzer','Sinalizador acústico',9,'H',['X1','X2'],{shape:'buzzer',behavior:'load',commands:[29],description:'Indicação visual de acionamento; não reproduz áudio.'});
add('phaseRelay','Relé de falta de fase',10,'K',['L1','L2','L3','11','12','14'],{shape:'drive',ports:pairPorts(3),available:'drawing',mark:'L1 L2 L3',commands:[22,37],description:'Símbolo para desenho; monitoramento de falta, sequência e assimetria de fases pendente.'});
add('ssr','Relé de estado sólido',10,'K',['A1','A2','1','2'],{shape:'drive',ports:pairPorts(2),available:'drawing',mark:'SSR',commands:[37],description:'Bloco gráfico; comportamento eletrônico de chaveamento pendente.'});
add('autoTransformer','Autotransformador trifásico',11,'T',['1','2','3','4','5','6','7','8','9'],{shape:'autotrafo',ports:Array.from({length:9},(_,i)=>[Math.floor(i/3)*50+(i%3===1?20:0),i%3===0?0:i%3===1?40:80]),available:'drawing',guide:[28],description:'Três enrolamentos com derivações; sem transformação elétrica simulada.'});
add('transformer1','Transformador monofásico',11,'T',['1','2','3','4'],{shape:'transformer',ports:[[0,0],[40,0],[0,80],[40,80]],available:'drawing',guide:[29],description:'Símbolo de transformador monofásico para desenho; sem transformação elétrica simulada.'});
add('transformer3','Transformador trifásico',11,'T',['1','2','3','4','5','6'],{shape:'transformer',ports:pairPorts(3),available:'drawing',mark:'3~',guide:[30],commands:[38],description:'Símbolo de transformador trifásico para desenho; sem transformação elétrica simulada.'});
add('terminal','Borne de passagem',12,'X',['1','2'],{shape:'terminal',behavior:'passive',normal:true,commands:[30]});
export const library=entries;
export const spec=type=>library.find(s=>s.type===type);
export function ports(c){const s=spec(c.type);if(s.behavior==='sensor')return c.sensorWires===2?[[0,0],[0,80]]:[[0,0],[0,80],[40,c.lateral?40:80]];return s.ports;}
export function bounds(c){const ps=ports(c),right=Math.max(...ps.map(p=>p[0]),0)+30,left=Math.min(...ps.map(p=>p[0]),0)-34;return {left,right,width:right-left+65};}
export const symbolViewBox=c=>{let b=bounds(c);return `${b.left-4} -12 ${b.right-b.left+8} 108`;};
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function filterLibrary(query='',category='Todos',support='all'){const q=normalize(query.trim());return library.filter(s=>(category==='Todos'||s.category===category)&&(support==='all'||support===s.available)&&normalize([s.label,s.prefix,s.category,s.description,s.mark||''].join(' ')).includes(q));}
export function unsupportedComponents(project){return project.components.filter(c=>spec(c.type)?.available!=='logic');}
export function actuated(c,project,pressed,coils){const s=spec(c.type);if(s.behavior==='thermal')return project.components.some(other=>spec(other.type)?.behavior==='thermal'&&other.tag===c.tag&&pressed[other.id]);if(['linked','assembly'].includes(s.behavior)||(s.behavior==='changeover'&&s.interaction==='none'))return !!coils[c.tag];return !!pressed[c.id];}
