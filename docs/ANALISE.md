# Análise estática e plano de reimplementação

Data: 20/10/2026. Escopo: arquivos locais de `CADe_SIMU 4.2A`, exemplos e referências visuais fornecidas pelo usuário. Nenhuma instrução embutida em documento foi tratada como autorização de execução.

## Evidências

A distribuição contém `CADe_SIMU_V4.2.exe` (40.394.805 bytes), `config.cfg`, `libnodave.dll`, `MFC42D.DLL`, `MFCO42D.DLL`, `MSVCRTD.DLL` e um pacote Nettoplcsim. Não foram encontrados fontes nessa distribuição. Os nomes das DLLs sugerem uma aplicação Windows nativa baseada em MFC e integração Siemens via libnodave/Nettoplcsim; isso é uma inferência, não uma comprovação do código interno.

Há seis exemplos em `Archivos de CADe_SIMU`; três não têm extensão. Todos começam pelo marcador ASCII `CADe_SIMU`. Acentos nos textos são compatíveis com leitura Windows-1252. O formato contém sequências `*índice*tipo#...` e campos numéricos delimitados por `*`. Portanto, os exemplos analisados não são arquivos binários opacos.

Exemplo observado, abreviado:

```text
*3*9000#-KM1##A1#A2######*1*1*0*0*0*0*0*0*156*270*...
```

O código `9000` aparece associado a TAGs KM e terminais A1/A2. `8000` aparece com 13/14; `8001`, com 11/12. `4000` aparece em registros sem TAG, contendo pares como 300/102 e 300/120, compatíveis com segmentos de fio. `4001` frequentemente repete coordenadas de início/fim, sugerindo junções. Essas associações são hipóteses fortes de análise estática, ainda sem comparação por edição controlada no programa original.

## Estrutura candidata

| Bloco | Interpretação | Confiança |
|---|---|---|
| `CADe_SIMU` | Assinatura do documento | Confirmada nas seis amostras |
| `*índice*tipo#` | Início de registro de objeto | Alta, parser heurístico |
| TAG, campo vazio, referências após `#` | Identificação e terminais | Alta por A1/A2, 13/14, 11/12 |
| Primeiros valores numéricos 0/1 | Opções de visualização / flags | Hipótese |
| Valores numéricos nas posições 8–11 | Coordenadas e pontos auxiliares | Hipótese consistente com segmentos |
| `9000` | Bobina | Alta |
| `8000`, `8001` | Contatos NA/NF | Alta; categoria física ainda incerta |
| `4000`, `4009`, `4010` | Famílias de condutor | Parcial |
| `4001` | Ponto de junção | Hipótese |
| `1001` | Motor com U1/V1/W1 e demais terminais | Alta |
| `10202` | Bloco LOGO | Alta |

O script de inventário preserva registros brutos e conta códigos; não os converte em componentes simuláveis. Não se assume que todos os campos ou todos os delimitadores estejam decodificados. Texto livre contendo padrões parecidos pode confundir o parser heurístico. Não há mapeamento validado de rotação, unidades de desenho, variantes, parâmetros ou redes completas.

## Decisão de arquitetura

Implementação independente: Electron hospeda uma interface React/SVG. O documento contém componentes com identificadores, propriedades e posição; fios referenciam terminal e componente explicitamente. A posição gráfica não determina conectividade. É possível mover símbolos sem desfazer suas ligações. Componentes associados usam a mesma TAG; não há execução do programa original ou dependência das DLLs.

O simulador constrói um grafo por passo de 50 ms. Fios e contatos fechados propagam continuidade; cargas exigem um terminal ligado à fase e outro ao neutro. Bobinas alimentadas alteram contatos da mesma TAG até convergir, limitando a 40 iterações. Temporizadores acumulam tempo uma vez por passo; contatos temporizados seguem a saída após o retardo. Curto fase/neutro e oscilação interrompem a simulação. O tempo é discreto e pode atrasar sob carga da interface; não é tempo real industrial.

Electron usa `contextIsolation`, sandbox e `nodeIntegration: false`, sem ponte IPC nesta primeira versão. Abrir/salvar usa APIs de arquivos do navegador; não há execução de arquivos importados.

## Compatibilidade futura

1. Criar arquivos mínimos no software original: um símbolo por arquivo, cada orientação e opção; comparar antes/depois.
2. Validar tabela de códigos e geometria de terminais contra essas amostras.
3. Identificar ligações, junções, cruzamentos e redes; testar perdas na importação com relatório de símbolos não suportados.
4. Importar inicialmente apenas o subconjunto validado; manter objetos desconhecidos e bloquear simulação de circuitos incompletos.
5. Acrescentar contatos de potência trifásicos, relés térmicos associados e intertravamento antes de reversão/estrela-triângulo.
6. Modelar inversores, conversores CC, sensores PNP/NPN e circuitos pneumáticos com testes próprios; adicionar CLP depois.

Não foram realizadas descompilação do executável, inspeção dinâmica da aplicação original ou engenharia reversa de comunicação PLC. Esta entrega cobre descoberta estática do formato e reimplementação funcional inicial, com limites explícitos.
