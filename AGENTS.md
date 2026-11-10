# Fluxo de branches

- Novas branches de features, correções, manutenção e testes devem partir de `dev` atualizada, nunca diretamente de `main`.
- Use os prefixos `feat/`, `fix/`, `chore/` e `test/`.
- O destino dos PRs dessas branches é uma release ativa no formato `release/vX.X.X`.
- Somente branches `release/vX.X.X` abrem PR para `main`. Não integre features diretamente em `main` ou `dev`.
- As versões de `package.json` e `package-lock.json` devem coincidir com a branch de release.
- O workflow abre um PR de `chore/sync-main-to-dev` para `dev` após atualizações de `main`, sem push direto ou force push nas branches protegidas. Apenas `leoalmeida` autoriza o merge; conflitos exigem resolução e preservação do histórico de `dev`.
- A publicação da tag e dos binários ocorre após integrar a release em `main` e concluir os builds de Windows, Linux e macOS.
- Ao abrir uma nova release, atualize `target-branch` em `.github/dependabot.yml` para a release ativa. Os PRs automáticos do Dependabot são calculados pelo GitHub a partir da própria branch de destino.
- Execute `npm test`, `npm run build` e `git diff --check` antes de publicar alterações.

- Títulos de PR devem seguir `(Tipo: ID) Descrição`, por exemplo `(Chore: 002) Protege o fluxo de branches`.
- `main`, `dev` e `release/*` exigem PR. Somente `leoalmeida` pode criar releases e efetuar merges nessas branches. Não contorne essas regras usando a sessão do proprietário para autorizar o próprio trabalho.
- Branches `dependabot/*` são reservadas ao bot autenticado do Dependabot e têm como destino a release ativa.
