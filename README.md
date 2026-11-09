# Personal Architecture Studio

Prévia 0.5 independente em Electron, React e Node.js para desenhar e simular lógica de comandos elétricos.

**Arquitetura e pavimentos:** selecione a borda de um ambiente para editar nome, categoria e dimensões em metros. A biblioteca inclui portas de abrir, portas de correr e janelas com encaixe nas paredes. O FAB **Pavimentos** permite criar, renomear e navegar entre andares; todos são salvos no mesmo arquivo. Em um ambiente ou parede, **Visualizar parede** abre a elevação em perspectiva com portas, janelas, alturas dos pontos e representação ilustrativa dos percursos.

## Novo: planta baixa elétrica

O módulo **Elétrica**, dentro de **Planta Residencial**, permite criar paredes, portas, ambientes, cotas e anotações, inserir pontos elétricos e ligar circuitos ao disjuntor geral pelos quadros. Inclui biblioteca com 55 ferramentas/símbolos de instalação, propriedades, quadro de cargas, quantitativo de eletrodutos/eletrocalhas, unifilar e exportação PDF A3/A4 com escala, legenda e carimbo. O modo **Comandos e simulação** continua disponível.

**Fios em eletrocalhas e conduítes:** selecione um percurso para definir função, circuito, bitola, quantidade e cor de cada condutor (incluindo bicolor), ou use a aba **Fios e cabos** para passar fios em vários trechos. Há representação colorida na planta e quantitativo de fios no PDF.

Consulte [o manual de planta elétrica](docs/PLANTA.md). Abra `examples/residencia.planta.json` para testar, ou use o exemplo carregado no editor. São 175 testes automáticos entre os módulos de comandos, catálogo, planta, arquitetura, pavimentos e interações.

Na planta, **Ctrl + rolagem do mouse** ajusta o zoom de 15% a 300%, mantendo o ponto sob o cursor quando os limites da rolagem permitem. Em **Selecionar**, use **Ctrl+clique** para adicionar/remover componentes ou arraste uma área livre para selecionar os elementos inteiramente contidos nela. Dentro de ambientes, comece a seleção longe das paredes; para selecionar um ambiente, clique em sua borda. **Ctrl+A** seleciona todos os elementos. Arraste um item selecionado para mover o grupo; curvas dos percursos entre dois componentes selecionados acompanham o movimento, preservando os fios. **Ctrl+Z** desfaz a movimentação inteira e **Ctrl+Y** a refaz. **Esc** limpa a seleção.

**Quadro de cargas:** o botão no cabeçalho abre ramal de entrada, circuitos editáveis, fatores de demanda, totais por fase e exportação Excel (.xlsx). Os campos desconhecidos continuam a confirmar. O Grid agora fica ao lado da Mão.

**Disjuntores:** a nova aba mostra os quadros do pavimento como caixas com trilhos, dispositivos e módulos livres. Inclui disjuntores uni/bi/tripolares, DR, DDR, IDR e DPS, associação às cargas e edição das posições. Use **Preencher a partir dos circuitos** para gerar os disjuntores com base nos dados já cadastrados; complete os equipamentos adicionais manualmente.

**Orçamento:** botão ao lado de Quadro de cargas, com levantamento automático de materiais, inclusão de complementos, preços e mão de obra, reserva para metragens, desconto, frete e exportação Excel. Preços não preenchidos permanecem pendentes; o orçamento fica salvo no JSON do projeto.

## Réplica da imagem enviada

Na tela inicial, use **Abrir arquivo** para importar a planta de referência. O projeto `examples/replica-imagem.planta.json` também pode ser aberto manualmente: contém 176 elementos e 81 percursos editáveis, reconstruídos pelas proporções da captura. Veja `docs/REPLICA-IMAGEM.md` para as incertezas da reconstrução.

Campos ilegíveis permanecem vazios/a confirmar. Os trajetos visíveis não foram convertidos em condutores com bitola ou cor inventadas. Alguns símbolos de distribuição, portas e identificações são aproximações a revisar.

## Build e publicação

Veja [BUILDING.md](BUILDING.md) para gerar binários Windows, Linux e macOS. PRs de `release/vX.X.X` para `main` passam pelos três builds; a tag e a release com os binários só são publicadas após o merge e o sucesso de todos os builds.

## Executar no Windows

Requer Node.js 22.12+ (validado com Node 24).

```powershell
cd '.\EletricStudio'
npm install
npm run desktop
```

As dependências já foram instaladas nesta máquina. `npm run desktop` compila o projeto e abre a janela Electron. Os pacotes nativos podem ser gerados com `npm run dist`; consulte [Build e releases](BUILDING.md).

Para desenvolvimento no navegador: `npm run dev`, depois abra o endereço informado. Para compilar: `npm run build`. Para validar o motor: `npm test`.

Se o npm bloquear o script oficial de instalação do Electron, execute `node node_modules/electron/install.js` após revisar a dependência. O runtime foi baixado e instalado neste ambiente.

Para abrir sem terminal, execute `Iniciar.cmd`. A biblioteca distingue **Simulação lógica** e **Somente desenho**. Os dispositivos de desenho continuam podendo ser conectados, editados, salvos e impressos.

## Primeiro circuito

1. O editor inicia com uma partida direta didática com selo. A biblioteca permite recarregar esse exemplo.
2. Clique em **Simular circuito**. Pressione e segure **S1** na folha. K1, H1 e M1 energizam; solte S1 e observe o selo.
3. Pressione **S0** para parar. Clique em **F1** para alternar o disparo térmico e bloquear a partida até rearmá-lo.
4. Pare a simulação para editar. Escolha um símbolo na biblioteca e clique em uma área vazia da folha para inserir.
5. Escolha **Conectar**, clique no terminal de origem e depois no terminal de destino. Várias ligações no mesmo terminal formam uma derivação. Cruzamentos gráficos de fios não criam conexões.
6. Use **Selecionar** para arrastar componentes. Duplo clique abre suas propriedades. Bobina e contatos auxiliares são associados pela mesma TAG, por exemplo `K1`.
7. Selecione um componente ou fio e pressione Del para excluir. Ctrl+Z desfaz; Ctrl+Shift+Z refaz; Esc cancela a ferramenta/conexão.
8. **Salvar projeto** exporta `.cade.json`. **Abrir** carrega esse formato. Há recuperação automática neste computador e biblioteca local de diagramas. A biblioteca local não substitui um backup em arquivo.
9. **Imprimir** abre a impressão do sistema em folha A3 horizontal, permitindo também salvar PDF pelo diálogo de impressão.

## Implementado

- Folha SVG com grade, zoom, conexões ortogonais, seleção, movimentação, exclusão e desfazer/refazer.
- 65 símbolos em 13 categorias, cobrindo as 27 famílias do guia fornecido: 50 com modelo lógico e 15 somente desenho. Busca sem acentos e filtros por categoria e disponibilidade. Veja `docs/CATALOGO.md` para a lista completa e referências por página.
- TAG, função, referências de conexão e opções de visualização por terminal; nove campos com os não aplicáveis desabilitados, ampliados para dispositivos com 10 ou 12 terminais.
- Cor de sinalizador, tempo do temporizador, sensor 2/3 fios, metadados PNP/NPN e apresentação lateral.
- Motor independente da interface: conectividade, continuidade fase/neutro, propagação por contatos, bobinas por TAG, TON/TOF, contatos reversíveis e multipolares, contatos térmicos associados, selo, detecção de curto e de lógica não convergente.
- Persistência em JSON versionado, validação de importação, impressão e modelos locais.

## Limites desta versão

O motor resolve continuidade lógica ideal, sem tensão, corrente, impedância, frequência ou mecânica. Cargas não propagam corrente para outras cargas em série: use cargas em paralelo na lógica de comando. O motor tem dois terminais lógicos; não é uma representação de potência trifásica. Proteção térmica e sensor são acionados manualmente. PNP/NPN são configurações armazenadas, sem comportamento eletrônico distinto. Há bobinas TON e TOF e contatos temporizados NA, NF e reversíveis. Proteções multipolares simulam continuidade ideal e têm disparo manual; não calculam corrente, fuga ou curvas de atuação.

Potência trifásica, estrela-triângulo, reversão validada, sensores eletrônicos completos, CLP, comunicação Siemens, pneumática e importação/exportação `.cad` ainda não foram implementados. Motores especiais, transformadores, inversor, soft starter, conversor CC, SSR e relé de fase estão disponíveis para desenho e documentação, mas seus modelos de simulação ainda não foram implementados. A presença de um símbolo somente desenho bloqueia a simulação com identificação dos componentes envolvidos. Os seis exemplos legados foram analisados, mas não são convertidos pelo editor.

O projeto é uma prévia funcional. Acessibilidade completa do desenho, roteamento manual, rotação, múltiplas folhas também ficam para evolução.

## Estrutura

- `src/catalog.js`: catálogo, categorias, capacidades e referências dos PDFs.
- `src/Symbol.jsx`: desenhos SVG dos símbolos.
- `src/model.js`: documento versionado e motor lógico.
- `src/main.jsx`: editor e propriedades.
- `src/style.css`: interface e impressão.
- `electron/main.cjs`: janela desktop isolada, sem Node no renderer.
- `tests/simulation.test.js` e `tests/catalog.test.js`: 14 testes do motor e catálogo.
- `docs/CATALOGO.md`: símbolos e disponibilidade por categoria, com referências às fontes.
- `scripts/document-catalog.mjs`: regenera a documentação do catálogo.
- `docs/ANALISE.md`: evidências e hipóteses da engenharia reversa.
- `docs/inventario-legado.json`: inventário reprodutível dos exemplos.
- `scripts/analyze-legacy.mjs`: análise estática do formato, sem executar o programa original.

Não foi definida uma licença para distribuição deste novo código. Dependências têm suas próprias licenças. A análise não altera permissões de redistribuição dos arquivos originais.

O ícone do aplicativo está em `build/resources/`; a barra do projeto substitui a barra de título padrão. O painel Pavimentos permite reordenar os itens com setas, sem alterar seus níveis. Notas da reconstrução ficam recolhidas em Observações da planta de referência e não indicam erro de execução.

O pré-dimensionamento de cabos, disjuntores, entrada, alimentadores e eletrodutos está descrito em [SIZING.md](SIZING.md).


**Navegação 3D:** em Planta Residencial → Elétrica, abra **Navegação 3D**. A vista usa a arquitetura e as instalações do pavimento escolhido, com modos perspectiva e ortográfico, rotação por arraste, deslocamento com botão direito e zoom por rolagem ou pinça. Clique na vista para usar WASD / setas (mover), Espaço (superior), Shift (inferior), Home (enquadrar), P (salvar PNG) e Esc (sair da navegação). Também há botões para vistas e zoom. As camadas permitem ocultar paredes, pontos, percursos e identificações ou tornar as paredes transparentes. Alturas desconhecidas só aparecem ao ativar a prévia com alturas padrão, em laranja, sem modificar os dados. Percursos e subidas são ilustrativos; sem altura cadastrada, são exibidos 25 cm abaixo do maior pé-direito do pavimento. A cobertura possui camada opcional no 3D, que requer WebGL; a planta baixa permanece disponível quando a aceleração gráfica falha.

Na planta baixa, selecione um ou vários componentes, pressione Ctrl+C, troque o pavimento e pressione Ctrl+V. A cópia inclui percursos e fios entre os componentes selecionados; selecionar um percurso também copia suas extremidades. Ctrl+Z desfaz a colagem. Nos campos de texto, os atalhos mantêm a edição normal.

A tela inicial reúne projetos locais com prévias, busca, favoritos, duplicação e exclusão da biblioteca. Novo projeto e Abrir arquivo ficam nessa tela; no editor use Projetos para voltar. O botão Documentação abre o catálogo das concessionárias listado em [CONCESSIONARIAS.md](CONCESSIONARIAS.md).

A biblioteca distingue Ambiente (formatos de cômodos) e Arquitetura (paredes, portas, janelas, aberturas e escadas). Quina / Canto, ao lado de Mão, permite selecionar um ambiente ou parede e arrastar seus vértices, inclusive para formar paredes inclinadas. Ctrl+Z desfaz. Os contornos personalizados são preservados nos arquivos JSON, na cópia e na navegação entre pavimentos.

Para abrir um lado do cômodo, selecione o ambiente e use Remover em Paredes do ambiente no painel lateral. Restaurar recupera o lado removido; Ctrl+Z desfaz. A área e o nome do cômodo são preservados, e as paredes removidas deixam de aparecer no desenho, na impressão e na navegação 3D.


## Planta Residencial e módulos

Personal Architecture Studio reúne Arquitetura, Elétrica, Hidráulica e Paisagismo no mesmo projeto residencial. Nos cartões da tela inicial, passe o mouse, use Tab ou toque para escolher o módulo. A arquitetura é compartilhada e a hidráulica possui pontos e tubulações próprios em cada pavimento. Projetos antigos e a biblioteca local continuam compatíveis.

O módulo hidráulico básico permite pontos de água fria/quente, esgoto, registros, ralos, lavatórios, vasos e chuveiros; conexão com curvas, edição de diâmetros e declividades, movimentação, exclusão, desfazer/refazer e levantamento de comprimentos em planta. Salve o projeto em JSON para guardar todos os módulos. Os desenhos não calculam vazão, pressão nem dimensionamento hidráulico automático.

Arquitetura inclui uma visão de decoração com sofá, camas, luminárias, mesa, cadeiras, televisão, geladeira, freezer e móveis planejados. Largura, profundidade, altura, rotação e acabamento são editáveis; a representação 3D usa essas dimensões. A visão Ambientes e medidas edita a base única compartilhada. Paisagismo acrescenta árvores, arbustos, canteiros, gramado, caminhos, bancos, jardineiras e lago ornamental dentro dos ambientes Jardim. Se uma alteração da arquitetura deixar itens fora do jardim, eles são preservados e sinalizados para revisão.


Terreno, Estrutura, Cobertura e Compatibilização possuem ferramentas básicas na mesma planta. O terreno mantém lote, faixas de recuo, acessos e cotas compartilhados entre os pavimentos. Estrutura e cobertura possuem elementos por pavimento, dimensões, rotação e cotas editáveis; águas do telhado também têm inclinação. Compatibilização sobrepõe as disciplinas e lista possíveis interferências bidimensionais para revisão, sem alterar os desenhos. Acabamentos define materiais, reservas e preços por piso, parede e teto; suas áreas acompanham os ambientes. Climatização desenha equipamentos, dutos, linhas frigorígenas e drenos. Redes especiais desenha pontos e redes de gás, dados, automação e segurança. Orçamento e obra reúne os quantitativos dos módulos, preços pendentes, exportação CSV e etapas com datas e progresso. Nenhum desses módulos executa cálculo estrutural, validação legal de recuos ou dimensionamento de drenagem.
