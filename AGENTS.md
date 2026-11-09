# Fluxo de branches

- Novas branches de features, correções, manutenção e testes devem partir de `dev` atualizada, nunca diretamente de `main`.
- Use os prefixos `feat/`, `fix/`, `chore/` e `test/`.
- O destino dos PRs dessas branches é uma release ativa no formato `release/vX.X.X`.
- Somente branches `release/vX.X.X` abrem PR para `main`. Não integre features diretamente em `main` ou `dev`.
- As versões de `package.json` e `package-lock.json` devem coincidir com a branch de release.
- O workflow sincroniza `main` em `dev` após atualizações de `main`, por merge sem force push. Conflitos exigem resolução; preserve os commits de `dev`.
- A publicação da tag e dos binários ocorre após integrar a release em `main` e concluir os builds de Windows, Linux e macOS.
- Ao abrir uma nova release, atualize `target-branch` em `.github/dependabot.yml` para a release ativa. Os PRs automáticos do Dependabot são calculados pelo GitHub a partir da própria branch de destino.
- Execute `npm test`, `npm run build` e `git diff --check` antes de publicar alterações.
