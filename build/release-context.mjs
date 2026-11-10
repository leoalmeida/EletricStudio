export function releaseBranchForEvent(eventName,event,repository,ref){
 if(eventName==='workflow_dispatch')return null;
 const pr=event?.pull_request;
 if(eventName!=='pull_request'||!pr||pr.head?.repo?.full_name!==repository)throw Error('Use um PR do mesmo repositório.');
 if(pr.base?.ref==='main'&&/^release\/v\d+\.\d+\.\d+$/.test(pr.head?.ref||''))return pr.head.ref;
 if(/^release\/v\d+\.\d+\.\d+$/.test(pr.base?.ref||'')&&(/^(feat|fix|chore|test)\/.+/.test(pr.head?.ref||'')||pr.user?.login==='dependabot[bot]'&&pr.user?.type==='Bot'&&/^dependabot\/.+/.test(pr.head?.ref||'')))return pr.base.ref;
 throw Error('Fluxo obrigatório: dev → feat/*, fix/*, chore/* ou test/* → release/vX.X.X → main.');
}
