# Planta elétrica — versão 0.5

O novo modo fica na aba **Planta elétrica**, ao lado de **Comandos e simulação**. Cada modo tem seus próprios arquivos e recuperação automática. O editor de comandos e sua biblioteca de 65 símbolos foram preservados.

## Tela inicial e edição atual

A tela Projetos reúne plantas locais com busca, favoritos, duplicação e exclusão. Use Abrir arquivo para importar JSON. No editor, Projetos retorna à lista; Salvar e Salvar como exportam o arquivo. A biblioteca separa Ambiente de Arquitetura, oferece janela redonda e mantém acesso por ícones quando recolhida. Quina / Canto, ao lado de Mão, edita vértices e paredes inclinadas. As alças no meio das paredes redimensionam cômodos. Ctrl+C/Ctrl+V copiam componentes entre pavimentos; Ctrl+Z desfaz.

O dimensionamento é preliminar: veja [SIZING.md](../SIZING.md). Builds e releases estão em [BUILDING.md](../BUILDING.md). O catálogo das concessionárias está em [CONCESSIONARIAS.md](../CONCESSIONARIAS.md).

## Desenhar do zero

1. Na tela inicial, clique em **Novo projeto**. Se necessário, ajuste a largura e a altura da área no painel direito (4 a 100 metros por eixo).
2. Escolha **Ambiente retangular** e clique em dois cantos opostos. Ou use **Parede** para desenhar segmentos com dois cliques. Espessura, posição dos extremos e nome do ambiente podem ser alterados no painel direito.
3. Insira **Porta** sobre a parede e ajuste o vão e a rotação (0/90/180/270°). A representação da porta abre um vão visual; ela não recorta nem une permanentemente as paredes. **Quina / canto** adiciona um encontro em L.
4. Use **Cota / medida** com dois cliques; o valor em metros é calculado pela geometria. Use **Texto** para anotações e nomes de ambientes.
5. Insira medidor, disjuntor geral, quadro geral e quadros secundários. Há luminária, arandela, tomadas, tomadas duplas e de uso específico, interruptores simples/paralelo/intermediário, campainha, pulsador, telefone, rede e caixa de passagem.
6. Em **Circuitos**, crie circuitos e atribua quadro de origem, descrição, fase(s), tensão, proteção, seção, número de condutores e cor. Os valores são informados pelo projetista, sem seleção automática.
7. Escolha o circuito ativo antes de inserir cargas, ou atribua-o depois pelo painel de propriedades. Informe a potência aparente em VA de cada luminária, tomada ou carga.
8. Para o trecho medidor → disjuntor geral → quadro geral → quadro secundário, escolha **Alimentador geral** e use **Conduíte / eletroduto** ou **Eletrocalha**. Clique na origem, depois nos pontos de mudança de direção e, por último, no destino.
9. Para os ramais, selecione o circuito ativo e conecte seu quadro às caixas e cargas. É possível atribuir vários circuitos ao mesmo percurso no painel direito. Um percurso sem circuito marcado representa um alimentador compartilhado.
10. Use **Verificar ligações**. A conferência detecta ausência/multiplicidade de disjuntor geral, quadros sem alimentador, circuitos sem quadro e cargas sem circuito ou sem percurso até o quadro do circuito.

Os percursos têm referências explícitas aos componentes. Ao mover um símbolo, as extremidades das rotas acompanham a posição; as curvas intermediárias permanecem onde foram desenhadas. Cruzamentos visuais não criam uma junção. Use uma caixa de passagem como nó compartilhado quando necessário.

Arraste elementos com **Selecionar**, use Del para excluir e Ctrl+Z para desfazer e Ctrl+Y para refazer (Ctrl+Shift+Z também refaz). Esc cancela o desenho em andamento. O controle **Grid**, à esquerda de **Salvar planta**, mostra ou oculta a grade, inclusive dentro dos ambientes. A ferramenta **Mão**, ao lado de **Selecionar**, permite arrastar para movimentar a rolagem horizontal e vertical da planta sem deslocar os componentes. Os botões **Desfazer** e **Refazer** ficam ao lado de **Excluir**. A grade tem passo de 10 cm; sem grade, o posicionamento usa centímetros. Ambientes e paredes podem ser redimensionados pelas coordenadas finais no painel.

## Passagem de fios em eletrocalhas e conduítes

Cada trecho possui uma lista própria de fios. Selecione o percurso na planta e use **Fios deste trecho → + Fio**, no painel direito. Para cada item, configure:

- Função: fase, neutro, proteção/terra, retorno, dados/sinal ou outro.
- Identificação (F, N, PE, R, L1 etc.), bitola em mm² e quantidade.
- Circuito ou alimentador, cor principal e, opcionalmente, cor secundária para fio bicolor/listrado.

A **dimensão da infraestrutura** é a dimensão da eletrocalha ou conduíte; a **bitola do fio** é configurada individualmente. A cor do fio é independente da cor de identificação do circuito. Alterar a seção nominal do circuito não altera silenciosamente os fios já cadastrados.

Na aba **Fios e cabos**, marque os trechos desejados, configure um condutor e use **Passar fio em N trechos**. Essa ação acrescenta o fio a cada trecho selecionado, preservando os existentes. É possível, por exemplo, repetir a passagem de fase, neutro e proteção nos trechos consecutivos de uma rota. A seleção dos trechos é manual; não há roteamento automático por menor caminho. O seletor **Editar fios de um trecho** permite revisar ou remover os fios individualmente.

Na planta, os condutores aparecem como linhas coloridas acompanhando o percurso, com identificações e bitolas nos trechos longos. Para preservar a leitura, são mostradas até oito linhas e quatro identificações por trecho; os demais registros continuam no editor e no quantitativo. Uma linha representa um tipo de condutor cadastrado; a quantidade é informada em seu rótulo. A espessura gráfica das linhas não representa o diâmetro real do fio. O controle **Fios** permite ocultar/exibir a representação.

O quantitativo agrupa os fios por circuito, função, identificação, bitola e cores, e soma **comprimento do trecho × quantidade**. Inclui eletrocalhas e conduítes, sem subidas/descidas, reserva ou perdas. A exportação permite ligar/desligar **Fios coloridos na planta** e **Quantitativo de fios**; este último é uma folha adicional do PDF.

As cores e bitolas são informadas pelo usuário. As cores iniciais são exemplos editáveis. Não são calculadas ocupação da infraestrutura, capacidade de condução, continuidade física de cada fio, conformidade das cores ou dimensionamento elétrico.

Projetos antigos abrem com a lista de fios vazia em cada trecho, sem alterar os percursos nem inventar condutores. O exemplo residencial atualizado já possui fios de demonstração.

## Salvar e abrir

**Salvar planta** exporta `.planta.json`, formato independente dos projetos de comando `.cade.json`. **Abrir** valida o documento antes de carregá-lo. Existe recuperação automática local. **Carregar exemplo residencial** abre uma planta de demonstração com três ambientes, três circuitos e quadro secundário; a troca pode ser desfeita.

O arquivo `examples/residencia.planta.json` contém esse exemplo para abertura manual.

## Relatórios

- **Quadro de cargas**: pontos, potência aparente somada, corrente estimada, quadro, fases, tensão, disjuntor e seção de cada circuito. Para circuitos A/B/C/AB/BC/CA, Ib = VA/V. Para ABC, considera-se carga trifásica equilibrada e Ib = VA/(√3 × V). Demanda, fator de potência, desbalanceamento e queda de tensão não são calculados.
- **Quadro de calhas**: trechos e resumo de eletrodutos/eletrocalhas agrupados pela dimensão informada. O comprimento soma os segmentos desenhados e é convertido em metros. Não inclui subidas, descidas, sobras ou perdas.
- **Unifilar**: disjuntor geral, hierarquia dos quadros identificada nos alimentadores e circuitos de cada quadro. Alimentadores ausentes aparecem tracejados. O desenho é documental, sem cálculo ou simulação da instalação.

## Impressão e PDF

Em **Impressão / PDF**, escolha A3 ou A4, paisagem/retrato, escala, moldura, centralização, rótulos, legenda e relatórios desejados. A aplicação verifica se a área da planta cabe na folha na escala selecionada. Caso contrário, sugere uma escala menor. Não há redução silenciosa que invalide a escala.

A planta ocupa a primeira folha, com legenda e carimbo de nome, autor, data, escala e número da folha. Tabelas e unifilar são incluídos em folhas próprias e paginados. Nas folhas de relatório, o carimbo indica **Sem escala**.

No Electron, **Gerar PDF** abre o diálogo de destino e gera um PDF vetorial pelo motor de impressão do aplicativo. No navegador, usa o diálogo de impressão: escolha **Salvar como PDF**, impressão a 100% e sem cabeçalhos/rodapés do navegador para preservar o layout e a escala.

`output/pdf/planta-exemplo.pdf` é uma amostra de exportação criada e conferida durante o desenvolvimento. O PDF de referência e as imagens fornecidas orientaram a organização; não foram importados ou copiados como uma planta editável.

## Limites atuais

O módulo permite desenho e documentação de instalação, mas não simula liga/desliga dos interruptores na planta nem faz dimensionamento normativo. DR/DPS, diagramas de condutores detalhados, importação DWG/DXF/PDF, símbolos personalizados, carimbo em imagem, rastreamento automático de paredes, navegação livre em um edifício 3D e prumadas entre pavimentos ainda não foram implementados. A rede e o telefone são símbolos documentais, sem simulação de sinal. A altura dos pontos é armazenada, mas não é somada ao comprimento em planta.

## Arquivos e validação

- `src/floor/model.js`: documento, biblioteca, conexões, verificação, quantitativos e exemplo.
- `src/floor/FloorEditor.jsx`: editor, propriedades, circuitos e exportação.
- `src/floor/PlanDrawing.jsx`: símbolos e representação vetorial da planta.
- `src/floor/conductors.js`: propriedades, passagem em lote, validação e quantitativos de fios.
- `src/floor/WireEditor.jsx`: edição de fios por trecho e passagem em vários trechos.
- `src/floor/Reports.jsx`: quadros, unifilar e folhas de impressão.
- `electron/preload.cjs` e `electron/main.cjs`: ponte restrita para exportação PDF com diálogo de destino.
- `tests/floor.test.js`: persistência, quantitativos, conectividade, hierarquia e validação.
- `scripts/prepare-floor-preview.mjs` e `scripts/render-floor-pdf.cjs`: geração reprodutível do exemplo e da amostra PDF.

## Planta de referência

A biblioteca inclui **Planta da imagem enviada**, uma reconstrução editável da captura enviada pelo usuário, também disponível em `examples/replica-imagem.planta.json`. Ao carregá-la, o editor ajusta o zoom e mantém um aviso de reconstrução aproximada. Consulte `docs/REPLICA-IMAGEM.md`. Potência, altura, proteção, fase, seção e número de condutores podem permanecer a confirmar quando não legíveis; preencher esses campos depois não exige refazer o desenho.


## Ambientes, aberturas e pavimentos

Clique no interior ou na borda de um ambiente para selecioná-lo e abrir o painel lateral. Nele é possível configurar seu nome, visibilidade do nome, categoria, largura e comprimento em metros, espessura da parede em centímetros e pé-direito. Clique em **Atualizar ambiente** para aplicar tudo em uma única ação de desfazer. O redimensionamento mantém as posições dos pontos elétricos e das aberturas; revise-os após a alteração.

Na biblioteca, use **Porta de abrir**, **Porta de correr** ou **Janela**. Ao inserir ou arrastar uma abertura individual perto de uma parede, ela se alinha ao trecho, respeitando a espessura e o espaço disponível. As propriedades permitem ajustar vão, altura, peitoril de janela, rotação e sentido de abertura da porta. **Encaixar na parede** reaplica o alinhamento.

O segundo FAB, **Pavimentos**, mostra o andar ativo e permite adicionar um andar vazio ou copiar apenas a arquitetura do atual. Informe nome e nível em metros. A exclusão tem confirmação e pode ser desfeita com Ctrl+Z. Desenhos, pontos, circuitos e fios são independentes em cada pavimento; não há ligações elétricas automáticas entre andares. Salvar/abrir e a recuperação automática conservam todos os pavimentos. Os relatórios e o PDF exibem o pavimento atual, identificado no título da planta.

## Vista da parede

Selecione um ambiente ou parede e clique em **Visualizar parede**. Para ambientes, escolha Superior, Direita, Inferior ou Esquerda. A janela permite vista frontal ou perspectiva, arraste para ajustar o ângulo, zoom, enquadramento e ligar/desligar instalações. Mostra as aberturas e os pontos próximos ao trecho nas alturas cadastradas. Pontos com altura desconhecida ficam identificados como a confirmar.

O pé-direito vem das propriedades arquitetônicas. A **Altura do percurso (m)** pode ser definida selecionando o conduto. Na ausência dela, a representação usa 25 cm abaixo do teto. As subidas e as projeções de fios são ilustrativas e não alteram os quantitativos em planta; não se trata de um modelo executivo nem de navegação livre em um edifício 3D.


## Quadro de cargas interativo

O botão **Quadro de cargas**, no cabeçalho ao lado de Salvar planta, abre uma janela ampla. A aba de mesmo nome também permite a edição. O Grid fica na barra de ferramentas, ao lado de Mão.

O quadro mostra ramal de entrada (concessionária, nível de tensão, fases, seções de fase/neutro/terra, disjuntores do medidor e geral), circuitos e corrente demandada por fase. Use **Editar ramal** para informar os dados. Potências e quantidades de pontos vêm dos componentes associados a cada circuito. É possível editar descrição, quadro, seção, disjuntor, tensão, fases e demanda percentual diretamente nas células; confirme com Enter ou saindo do campo. Alterações ficam no projeto e podem ser desfeitas com Ctrl+Z após fechar a janela.

O filtro seleciona um quadro para a lista, os totais por fase e a exportação de circuitos. O ramal continua sendo o do pavimento completo. Os botões de seta deslocam a tabela horizontalmente. **Exportar planilha** gera um arquivo Excel .xlsx com ramal, circuitos e totais; **PDF** abre a preparação de impressão com o quadro de cargas habilitado.

O fator de demanda é informado por circuito, começando em 100% quando ausente. Ib = VA/V; para ABC equilibrado, VA/(√3·V); Id = Ib × fator informado. AB/BC/CA participam das duas fases. Fase desconhecida é sinalizada fora do total por fase; potência ou tensão desconhecida não vira zero. O programa não escolhe fatores normativos, seções ou proteções automaticamente. Dados e ramal são independentes por pavimento.


## Disjuntores e montagem dos quadros

A aba **Disjuntores** apresenta as caixas de Quadro geral e Quadro parcial/secundário existentes no pavimento. Selecione o pavimento e depois o quadro. Projetos antigos iniciam com dois trilhos de oito módulos livres; nenhum dispositivo é inferido silenciosamente.

Configure de 1 a 8 trilhos e de 4 a 36 módulos por trilho. Clique em um módulo livre ou em **Dispositivo** para inserir disjuntor unipolar, bipolar, tripolar, DR, DDR, IDR ou DPS. Cada item possui identificação, polos, módulos ocupados, posição e circuitos associados. Conforme o tipo, informe corrente nominal, curva, sensibilidade diferencial, tensão Uc e corrente de surto. Valores não informados continuam a confirmar.

**Preencher a partir dos circuitos** acrescenta disjuntores aos circuitos ainda não representados, usando a quantidade de fases para os polos e a corrente nominal já informada. Circuitos com fase desconhecida ficam sinalizados para revisão. Espaço insuficiente é informado sem sobrepor módulos nem atravessar trilhos. Essa ação não inclui automaticamente o geral, DR, DDR, IDR ou DPS.

A caixa mostra bornes, alavancas, indicadores, espaços livres e barramentos ilustrativos. A tabela abaixo relaciona as cargas aos dispositivos e às suas posições. Clique em um dispositivo para editar, reposicionar ou remover. Todas as alterações entram no histórico de desfazer/refazer, na recuperação automática e no arquivo JSON do pavimento.

A posição da alavanca e o indicador do DPS são apenas visuais. A montagem não simula disparos, não cria ligações elétricas e não altera automaticamente as proteções cadastradas nos circuitos. A representação não está incluída nas folhas de PDF nesta versão; o PDF continua contendo os relatórios e diagramas já existentes.


## Orçamento

No cabeçalho, à direita de **Quadro de cargas**, abra **Orçamento**. O fluxo tem três etapas: **Levantamento**, **Preços e serviços** e **Resumo**. A abrangência pode ser o pavimento atual ou todos os pavimentos. Materiais iguais são consolidados, mantendo separados os condutores por bitola e cores e os dispositivos por suas especificações.

As quantidades são extraídas dos pontos, caixas de quadros, metragens dos percursos, fios efetivamente cadastrados e proteções montadas na aba Disjuntores. O símbolo DG da planta não gera uma segunda proteção no orçamento. Circuitos sem disjuntor representado e percursos sem fios são sinalizados. A arquitetura não é quantificada como obra civil.

Na primeira etapa, desmarque itens que não deseja incluir ou adicione materiais/serviços complementares com quantidade e unidade. A reserva percentual aplica-se apenas aos metros automáticos de condutos e fios. Na segunda, informe preço unitário e, opcionalmente, mão de obra por unidade. Valores são informados pelo usuário, sem consulta automática a fornecedores. Zero é um valor explícito; campo vazio mantém o preço pendente.

O resumo separa materiais conhecidos, mão de obra, desconto sobre ambos e frete. Havendo preço pendente, o valor aparece como **Subtotal conhecido**, com indicação de orçamento incompleto. Especificações desconhecidas também são destacadas. O botão de exportação gera Excel .xlsx com os itens, valores, abrangência, critérios e observações.

O orçamento é único por projeto e conserva os preços ao alternar pavimentos. Quantidades automáticas acompanham a planta; preços e complementos ficam salvos no JSON e na recuperação automática. Subidas, descidas e materiais acessórios não cadastrados não são presumidos: use a reserva e os itens adicionais conforme necessário.


## Indicação de subida e descida

Na biblioteca, em Infraestrutura, use **Conduíte sobe** ou **Conduíte desce** para inserir um marcador de prumada. O desenho usa seta vermelha e eixo verde. Conecte o eletroduto ao marcador como a um ponto elétrico. Com duplo clique, edite a TAG, o rótulo, o sentido e o pavimento de destino; o pavimento de origem é o atual. O sentido e o nome do destino aparecem na planta e na impressão quando os rótulos estão ativos.

Os marcadores são documentais: não criam automaticamente o símbolo correspondente no outro pavimento, nem acrescentam comprimento vertical, fios ou um material extra ao orçamento. O destino é preservado no arquivo; se o pavimento for excluído, o painel solicita selecionar outro destino.


## Complementos de arquitetura

A biblioteca reúne Porta de abrir, Janela, Abertura (vão sem folha), Porta de correr de uma folha, Porta de correr de duas folhas e Escada. O tipo antigo de porta de correr foi mantido como duas folhas, preservando seu desenho em projetos existentes. As aberturas encaixam em paredes e permitem editar a largura, altura e rotação.

A escada é uma representação em planta de lance reto, com largura, comprimento, número de degraus, rotação e sentido de subida/descida editáveis. Estes elementos acompanham a cópia de arquitetura entre pavimentos, a gravação JSON e a impressão. Não são contabilizados como materiais elétricos no orçamento.


## Ambientes em L

Arquitetura inclui o retangular e quatro ambientes em L, definidos pelo canto removido: inferior direito/esquerdo e superior direito/esquerdo. A inserção usa dois cliques nos limites externos, como no retângulo; o recorte inicial ocupa metade da largura e metade do comprimento.

Com duplo clique, escolha o formato nas miniaturas e informe as medidas externas e a largura/profundidade do recorte interno. O recorte deve ser menor que as duas dimensões externas. A área mostrada desconta o recorte. Portas e janelas encaixam nos seis trechos do contorno, incluindo as paredes internas. A vista da parede oferece os seis trechos.

O contorno acompanha movimentação, cópia de pavimentos, gravação JSON e impressão. Ambientes retangulares já salvos conservam seu formato.


Um clique no interior do ambiente abre suas propriedades, inclusive nos ambientes em L. A região removida do L continua sendo área livre. Para selecionar vários elementos por área começando dentro de um ambiente, use **Alt+arraste**; em uma área livre da planta, basta arrastar normalmente.


## Biblioteca de iluminação

Iluminação reúne Lâmpada, Arandela, Spot de LED, Lâmpada halógena, Lâmpada tubular, LED Driver e Fita de LED. Todos aceitam TAG, circuito, potência aparente e conexão a percursos. Os cinco novos tipos iniciam com potência a confirmar.

A Fita de LED tem comprimento em metros para o orçamento e um campo de potência total do trecho para o quadro de cargas. O símbolo é esquemático; sua dimensão no desenho não define a metragem. Para drivers, evite repetir a potência das cargas já cadastradas; quando apropriado, registre apenas suas perdas. As propriedades são abertas por duplo clique e acompanham o JSON, os relatórios e a impressão.


## Tomadas e conjuntos conjugados

Tomadas inclui Tomada, Tomada de piso, Tomada dupla, Tomada tripla, Interruptor conjugado com tomada, Interruptor duplo conjugado com tomada, Interruptor conjugado com tomada dupla, Interruptor paralelo conjugado com tomada e Ponto de força trifásico. A altura baixa, média, alta ou personalizada é escolhida nas configurações da tomada. As três opções de altura foram removidas da biblioteca; plantas antigas continuam compatíveis. A tomada de uso específico continua disponível.

Um conjunto múltiplo ou conjugado é um único ponto e uma unidade de orçamento. Informe a potência total do conjunto; ela não é multiplicada automaticamente pela quantidade de tomadas do símbolo. As novas opções começam com potência a confirmar. A tomada de piso inicia com altura zero e permite edição.

O ponto trifásico possui símbolo próprio; configure tensão e fases ABC no circuito associado e cadastre seus condutores. O símbolo não muda automaticamente os dados do circuito ou os fios. Os conjuntos conjugados são representações em planta com um vínculo de circuito, sem simulação independente das teclas.


## Interruptores

A categoria inclui Interruptor, Interruptor three way, Interruptor four way, Interruptor duplo, Interruptor triplo, Sensor de presença, Interruptor bipolar e Three way bipolar. Os tipos antigos simples/paralelo/intermediário preservam seus identificadores de arquivo. Campainha e pulsador continuam disponíveis.

Cada conjunto é um ponto documental de conexão e uma unidade no orçamento. Duplo/triplo e bipolar têm símbolos distintos, mas não possuem terminais independentes ou simulação de teclas na planta. O sensor permite registrar alcance, tempo e potência própria; dados desconhecidos permanecem a confirmar. Alcance e temporização são documentais e não geram detecção automática.


## Telecomunicações

A categoria contém Tomada de telefone, Campainha, Botão de campainha, RJ45 e Câmera. Campainha e botão foram reorganizados sem mudar seus identificadores; telefone e rede mantêm compatibilidade com arquivos anteriores. A câmera tem símbolo próprio. Todos aceitam TAG, rótulo, altura, rotação e ligação a percursos, além de constarem no orçamento e na impressão.

Telefone, RJ45 e câmera são pontos documentais de sinal, sem simulação de telefonia, rede, vídeo ou alimentação PoE. Pontos antigos de rede rotulados como câmera não são convertidos automaticamente.

### Configurações dos pontos

Selecione um ponto para editar seus dados e clique em Atualizar. Os botões de olho controlam quais informações aparecem na planta. Tomadas múltiplas possuem potência, tensão, altura e circuito individuais. Em conjuntos antigos, a potência total é distribuída entre as tomadas ao abrir o formulário, preservando o total. Comandos de interruptores podem ser associados às letras das lâmpadas; os circuitos exibidos acompanham essas lâmpadas. A tomada de telefone permite altura em milímetros.

Novas tomadas começam com 127 V; a tensão pode ser alterada nas configurações. Pontos de força trifásicos mantêm tensão a confirmar. Ao inserir ou mover individualmente um ponto de parede próximo de uma parede, seu traço é alinhado à face dessa parede. O formulário também oferece Alinhar à parede mais próxima. Lâmpadas de teto e tomadas de piso mantêm posicionamento livre. O triângulo da tomada é branco em altura baixa, meio preenchido em altura média e preto em altura alta; alturas desconhecidas continuam a confirmar.

Portas de abrir: selecione a porta e escolha 1 folha ou 2 folhas em Folhas da porta. A largura informada é a largura total do vão; em duas folhas cada folha ocupa metade. Inverter abertura funciona nas duas opções. Plantas antigas usam uma folha.

### Salvar e Salvar como

No aplicativo desktop, Abrir vincula a planta ao arquivo escolhido. Salvar (Ctrl+S) atualiza esse arquivo mantendo seu nome e local. Salvar como (Ctrl+Shift+S) permite escolher outro nome ou pasta, que passa a ser o destino das próximas gravações. Uma planta nova ou recuperada automaticamente solicita um destino na primeira gravação. Cancelar mantém o arquivo atual. No navegador, a gravação direta depende do suporte à seleção de arquivos; sem esse recurso, o arquivo é baixado.

### Referência revisada em 21/10/2026

A nova referência contém 11 janelas, 12 portas (incluindo a porta de serviço), 10 luminárias centrais, 40 arandelas e caixas superiores ajustadas à parede. O quadro geral fica na garagem. Cozinha, Porta Serviço (face externa do quadro Cozinha), Quarto Sandra (Quarto 5) e Piscina são os quatro quadros secundários. Correntes e dispositivos internos não legíveis continuam a confirmar. A planta em uso só recebe essas alterações quando o JSON revisado é aberto.

### Transferência dos ambientes para seus pavimentos

A distribuição do projeto Fundão separa Lavanderia e a indicação Entulhos; Quarto Sandra e Banheiro 4; Piscina e Carga; e Garagem. Os componentes mantêm dimensões, posições, potências e IDs. Percursos que cruzam os grupos são divididos em duas continuações vinculadas, com marcadores de destino; a soma dos comprimentos não muda. Circuitos usados em outro pavimento conservam a referência ao quadro de origem, sem duplicar a caixa física. A conferência elétrica entre pavimentos permanece documental.

### Vista de parede por faixa de corte

Clique em Vista de parede na barra da planta e marque dois cantos opostos da faixa desejada. A faixa pode ser horizontal ou vertical e reúne aberturas e pontos elétricos na elevação. Para uma única parede, selecione o ambiente ou parede e use Visualizar parede nas configurações.

Arraste ou use setas/WASD para girar a perspectiva. Espaço mostra a vista superior, Shift a inferior, P salva uma imagem PNG e Esc fecha. Use os controles de zoom e Enquadrar para ajustar a vista. Tomadas múltiplas usam alturas individuais e portas de duas folhas aparecem divididas. Alturas desconhecidas ficam listadas; Prévia com alturas padrão permite visualizar esses pontos com um asterisco, sem modificar o projeto. O percurso vertical do conduíte é ilustrativo.

### Formatos das janelas e alturas por pavimento

Nas configurações da janela, escolha Retangular, Quadrada ou Redonda. Quadradas e redondas mantêm altura igual à largura/diâmetro; janelas antigas conservam suas dimensões retangulares. O formato também é usado na vista da parede.

Os padrões de altura das paredes são: Casa 3 m, Lavanderia 2 m, Quarto Sandra 4 m, Piscina/Área da piscina 4 m e Garagem 4 m. Outros nomes usam 2,8 m. O padrão pode ser editado no painel Pavimentos e é usado para novos ambientes, novas paredes e cortes. Alterar o padrão no painel não substitui alturas individuais já cadastradas. As paredes do JSON revisado receberam as alturas solicitadas, sem alterar o nível dos pavimentos.

Para arandelas, caixas de passagem, quadro geral e quadros secundários, habilite Indicar altura na planta nas configurações do ponto. A altura informada aparece ao lado do símbolo e acompanha a impressão/PDF quando os rótulos estão habilitados. Arandelas usam centímetros no formulário; os quadros e caixas usam metros. Valores desconhecidos aparecem como altura a confirmar.
