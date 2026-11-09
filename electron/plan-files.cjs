const path=require('node:path');
const {randomUUID}=require('node:crypto');
const defaultFilters=[{name:'Planta Residencial',extensions:['planta.json','json']}];
module.exports=function createPlanFiles({dialog,fs,win,validate,label='planta',extension='planta.json',filters=defaultFilters}){
 const files=new Map();
 return {
  async open(){
   const result=await dialog.showOpenDialog(win,{title:'Abrir '+label,properties:['openFile'],filters});
   if(result.canceled||!result.filePaths?.[0])return {canceled:true};
   const file=result.filePaths[0];if((await fs.stat(file)).size>15_000_000)throw Error('Arquivo grande demais. Limite: 15 MB.');
   const plan=validate(JSON.parse(await fs.readFile(file,'utf8'))),token=randomUUID();files.set(token,file);
   return {canceled:false,plan,token,name:path.basename(file)};
  },
  async save(options){
   if(!options||typeof options.saveAs!=='boolean')throw Error('Opções de gravação inválidas.');
   const plan=validate(options.plan),content=JSON.stringify(plan,null,2);if(Buffer.byteLength(content)>15_000_000)throw Error('Arquivo grande demais. Limite: 15 MB.');
   const current=typeof options.token==='string'?files.get(options.token):null;
   if(options.token&&!current)throw Error('Arquivo atual indisponível. Use Salvar como.');
   let file=current;
   if(options.saveAs||!file){const name=(plan.name||'planta').replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').slice(0,100);const result=await dialog.showSaveDialog(win,{title:'Salvar '+label+' como',defaultPath:current||name+'.'+extension,filters});if(result.canceled||!result.filePath)return {canceled:true};file=result.filePath;}
   // Finish writing before replacing the destination, preserving the old file on write failure.
   const temporary=path.join(path.dirname(file),'.'+path.basename(file)+'.'+randomUUID()+'.tmp');
   try{await fs.writeFile(temporary,content,{flag:'wx'});await fs.rename(temporary,file);}catch(error){await fs.unlink(temporary).catch(()=>{});throw error;}
   const token=options.saveAs||!current?randomUUID():options.token;files.set(token,file);
   return {canceled:false,token,name:path.basename(file)};
  }
 };
};
