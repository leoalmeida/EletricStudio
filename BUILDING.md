# Build e releases do Personal Architecture Studio

Requer Node.js 24 e npm. Cada sistema produz seu próprio aplicativo Electron; o usuário final não precisa instalar Node.js.

## Build local

```sh
npm ci
npm run dist:win
npm run dist:linux
npm run dist:mac
```

Execute somente o comando correspondente ao sistema atual. `npm run dist` detecta o sistema automaticamente. Os resultados ficam em `release/win`, `release/linux` ou `release/mac`:

| Sistema | Arquitetura | Arquivos |
| --- | --- | --- |
| Windows | x64 | instalador `*-setup.exe` e portátil `*-portable.exe` |
| Linux | x64 | `.AppImage` e `.deb` |
| macOS | Intel x64 e Apple Silicon arm64 | `.dmg` e `.zip` por arquitetura |

`npm run pack` gera apenas a pasta do aplicativo para teste. No Windows, `npm run test:packaged` verifica `release/win-unpacked/Personal Architecture Studio.exe` com um perfil temporário isolado. Para outra pasta, execute `node build/smoke-desktop.mjs "caminho/do/executável"`.

O ícone editável está em `build/resources/icon.svg`. `npm run icons` regenera PNG, ICO e ICNS. O build inclui apenas a interface compilada, o processo Electron, o modelo JSON usado na abertura/gravação e os recursos necessários; projetos pessoais, testes, documentação e caches não são distribuídos.

## GitHub Actions

O workflow `.github/workflows/desktop-release.yml` aceita execução manual (somente build), PRs de trabalho para `release/vX.X.X` e PRs de `release/vX.X.X` para `main`. As branches de trabalho (`feat/*`, `fix/*`, `chore/*` e `test/*`) devem ser criadas a partir de `dev`.

1. Na branch de release, atualize a versão: `npm version X.X.X --no-git-tag-version`. Inclua `package.json` e `package-lock.json` no PR.
2. Ao abrir ou atualizar o PR, os testes e builds rodam em Windows, Ubuntu e macOS. Os pacotes ficam nos artefatos do workflow por 14 dias. Não há publicação nessa etapa.
3. Depois do merge, os três builds rodam novamente no commit exato integrado à `main`.
4. Somente se todos passarem e os oito binários estiverem presentes, o job de publicação cria a tag `vX.X.X` nesse commit e uma release inicialmente em rascunho.
5. O workflow envia os binários e `SHA256SUMS.txt` antes de tornar a release pública. Falha de upload mantém o rascunho para permitir nova execução.

Uma tag existente em outro commit não é movida. Releases já publicadas e completas são preservadas em novas execuções. PRs fechados sem merge, branches fora do padrão e forks não publicam. Apenas o job final recebe `contents: write`; os builds usam permissão de leitura, sem certificados ou tokens de publicação.

O repositório precisa permitir GitHub Actions e o token de Actions com permissão para criar releases. O workflow deve existir no repositório antes do evento que o dispara. Nenhum workflow foi executado no GitHub por esta configuração local.

## Assinatura dos pacotes

Os pacotes atuais são de teste: Windows sem assinatura de editor e macOS com assinatura ad hoc, sem notarização. Para distribuição pública com identidade verificada, configure seus certificados e a notarização Apple; o projeto não inclui chaves privadas nem altera as proteções dos sistemas operacionais. A configuração do Debian usa o nome do projeto como mantenedor; preencha seu contato real antes de uma distribuição pública.

Referências: [electron-builder v26](https://www.electron.build/v26/docs/), [build multiplataforma](https://www.electron.build/v26/docs/features/multi-platform-build/) e [eventos de PR do GitHub](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request).

Em ambientes com Controle de Aplicativo do Windows, a política local pode bloquear binários sem assinatura reconhecida antes de iniciar o Electron. Nessa situação o teste nativo não comprova a inicialização: use a distribuição assinada e aprovada para o ambiente; o processo de build não altera políticas de segurança.


## Desenvolvimento e dependências

Fluxo obrigatório: `dev → feat/*, fix/*, chore/* ou test/* → release/vX.X.X → main`. A versão vem da branch de destino nos PRs de trabalho e da origem nos PRs de release para main. PRs para release geram os pacotes para validação, sem publicar.

`sync-dev.yml` faz merge de main em dev a cada push na main; conflitos interrompem a execução sem reescrever commits. O workflow passa a operar após ser integrado à main.

O Dependabot verifica npm e GitHub Actions às segundas-feiras, às 09h de São Paulo, agrupando dependências de produção, desenvolvimento e actions. Os PRs são dirigidos à release ativa; atualize `target-branch` ao criar a próxima release. O GitHub calcula os PRs automáticos a partir da branch de destino. Alertas de segurança da branch padrão são um mecanismo separado das atualizações de versão.


## Proteção e autorização de branches

As regras do GitHub exigem PRs para main, dev e release/*, bloqueiam force push/exclusão dessas branches e limitam o merge ao usuário leoalmeida. A autorização de merge é distinta de uma revisão: nenhuma aprovação de outra pessoa é obrigatória, pois o GitHub não permite aprovar o próprio PR.

Branches de trabalho usam feat/, fix/, chore/ e test/. A criação de release/* é reservada a leoalmeida. Branches dependabot/* são reservadas à automação autenticada e seus PRs devem apontar à release ativa. Os modelos de rulesets ficam em docs/github-rulesets/; alterações nesses arquivos não aplicam configurações no GitHub automaticamente.

O fluxo main → dev abre ou reutiliza um PR da branch chore/sync-main-to-dev. O proprietário efetua o merge; o workflow não altera dev diretamente e não aprova ou integra PRs. A criação automática do PR requer a permissão de criação de pull requests para GitHub Actions nas configurações do repositório. Essa configuração não concede permissão de merge nas branches protegidas.
