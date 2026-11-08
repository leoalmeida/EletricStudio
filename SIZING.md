# Dimensionamento da instalação

O botão **Dimensionar instalação**, ao lado de Quadro de cargas, reúne todos os pavimentos e calcula conjuntamente seções dos condutores, correntes nominais dos disjuntores, alimentadores, entrada e ocupação dos eletrodutos cadastrados.

## Utilização

1. Confira potências, tensões, fases e vínculos dos circuitos aos quadros.
2. Informe método de instalação, temperatura, agrupamento, comprimentos e limites de queda de tensão. Confirme as condições consideradas. Comprimentos automáticos exigem percursos conectados e alturas identificadas.
3. Para entrada e alimentadores, informe fases, tensões, comprimento, quadro de origem e seção mínima exigida pela concessionária.
4. Para verificar curto-circuito, informe corrente presumida, capacidade de interrupção do disjuntor e energia passante I²t. Valores ausentes permanecem pendentes.
5. Para eletrodutos, cadastre diâmetros externos reais dos cabos isolados e diâmetros internos úteis dos tubos.
6. Exporte o memorial e aplique os resultados calculados. Ctrl+Z desfaz. Circuitos pendentes são preservados.

## Modelo de cálculo

Base consultada: ABNT NBR 5410:2004, tabelas 36, 40, 42, 47 e 58; itens 5.3.4, 6.2.6, 6.2.7 e 6.2.11.1. [Cópia disponibilizada pelo IPAAM](https://www.ipaam.am.gov.br/wp-content/uploads/2021/01/NBR-05410-05-Instala%C3%A7%C3%B5es-El%C3%A9tricas-de-baixa-Tens%C3%A3o.pdf).

O escopo é cobre com isolação PVC 70 °C, métodos A1/A2/B1/B2/C, dois ou três condutores carregados e agrupamentos homogêneos. Circuitos trifásicos são considerados equilibrados. A proteção de sobrecarga verifica Ib ≤ In ≤ Iz e I2 ≤ 1,45 Iz, considerando disjuntores IEC 60898-1. O neutro não é reduzido. A entrada considera o maior somatório de correntes por fase, sem presumir balanceamento das cargas monofásicas.

A queda usa o comprimento real, a corrente integral do circuito e o módulo da impedância. Resistividade inicial de 0,025 Ω mm²/m e reatância de 0,1 Ω/km são hipóteses editáveis do modelo, e não valores atribuídos às tabelas da norma. A queda acumulada depende da identificação de todos os alimentadores anteriores. A ocupação usa o número de condutores existentes e seus diâmetros externos.

## Limites

Os resultados são **pré-dimensionamento**, sem certificação integral de conformidade. Corrente de curto-circuito, energia passante, curvas, seletividade, aterramento, proteção contra choques, DR, DPS, harmônicas, influências externas, limites de percurso/curvas dos eletrodutos e ensaios finais exigem verificação específica. Não são inferidos dispositivos, condutores, retornos ou quantidades ausentes. Cabos em paralelo, alumínio, instalação subterrânea e circuitos bipolares com neutro ficam fora deste modelo.

Disjuntores desenhados recebem a corrente calculada apenas quando associados a um único circuito e com polos compatíveis. O cálculo não escolhe automaticamente DR, DDR, IDR ou DPS. Resultados de relatório anterior a alterações da planta não podem ser aplicados.
