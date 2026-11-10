import {pathToFileURL} from 'node:url';

export function syncPullRequest(repository,runNumber='1'){
 if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository||'')||repository.split('/').some(part=>['.','..'].includes(part)))throw Error('Repositório inválido.');
 const owner=repository.split('/')[0],identifier=String(runNumber).replace(/\D/g,'').padStart(3,'0');
 return {owner,head:'chore/sync-main-to-dev',base:'dev',title:`(Chore: ${identifier}) Sincroniza main em dev`,body:'Atualiza dev com a main por merge, preservando o histórico e sem push direto ou force push nas branches protegidas. O merge deste PR deve ser autorizado por @leoalmeida.'};
}
export async function openSyncPullRequest({repository,token,runNumber,request=fetch}){
 if(!token)throw Error('Token do workflow ausente.');
 const spec=syncPullRequest(repository,runNumber),url=`https://api.github.com/repos/${repository}/pulls`;
 const headers={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
 const response=await request(url+'?'+new URLSearchParams({state:'open',base:spec.base,head:spec.owner+':'+spec.head}),{headers});
 if(!response.ok)throw Error(`Não foi possível consultar os PRs (${response.status}).`);
 const existing=await response.json();if(existing.length){console.log('PR de sincronização existente: '+existing[0].html_url);return existing[0];}
 const created=await request(url,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({head:spec.head,base:spec.base,title:spec.title,body:spec.body})});
 if(!created.ok)throw Error(`Não foi possível criar o PR (${created.status}). Verifique a permissão de criação de PRs pelo GitHub Actions.`);
 const pr=await created.json();console.log('PR de sincronização criado: '+pr.html_url);return pr;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 await openSyncPullRequest({repository:process.env.GITHUB_REPOSITORY,token:process.env.GH_TOKEN,runNumber:process.env.GITHUB_RUN_NUMBER});
}
