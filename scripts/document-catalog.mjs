import {library,categories} from '../src/catalog.js';
import fs from 'node:fs';
let text=`# Catálogo de símbolos — revisão 0.2

Referências fornecidas pelo usuário: Guia_simbolos_eletricos.pdf (32 páginas) e COMANDOS E CADE SIMU.pdf (57 páginas). As páginas abaixo são posições físicas no PDF, iniciando em 1.

Foram incorporadas as 27 famílias do guia (páginas 4–30) e dispositivos identificados nas páginas 19–38 do segundo documento. Diagramas das páginas 39–53 orientam a evolução dos exemplos; não foram convertidos automaticamente. As ilustrações foram redesenhadas em SVG e textos extensos não foram copiados para o produto. As capturas de barras de ferramentas não constituem uma lista completa de todos os ícones do software original.

## Disponibilidade

${library.length} símbolos em ${categories.length} categorias; ${library.filter(s=>s.available==='logic').length} com simulação lógica ideal e ${library.filter(s=>s.available==='drawing').length} somente desenho. Todos permitem inserir, editar terminais e rótulos, conectar, salvar e imprimir.

A simulação é bloqueada quando existe um componente somente desenho no documento, inclusive desconectado. Contatores multipolares simulam continuidade por polo; não simulam fases, tensões ou correntes. Proteções têm disparo manual. O sinalizador acústico só apresenta indicação visual.

`;
for(const cat of categories){const items=library.filter(s=>s.category===cat);text+=`## ${cat} (${items.length})

| Componente | Disponibilidade | Guia — página | Comandos — página |
|---|---|---|---|
`;for(const s of items)text+=`| ${s.label} | ${s.available==='logic'?'Lógica ideal':'Somente desenho'} | ${s.guide.join(', ')||'—'} | ${s.commands.join(', ')||'—'} |
`;text+='\n';}
text+=`## Observações sobre as fontes

A seção 2.1.4 do segundo documento usa o título “Contadores e comutadores”; a imagem apresenta contatos de manobra. A interface adota “Contatores e comutadores”. O guia possui imprecisões textuais e diferentes convenções de letras. A biblioteca usa K para contatores, T para temporizadores/transformadores e Q para disjuntores, mantendo a família explícita no catálogo; TAGs são editáveis. Isso não constitui certificação de conformidade a uma norma.

As descrições de off delay nas páginas 18–19 do guia podem ser lidas como pulso temporizado. O modelo implementado é TOF: energiza imediatamente e retarda a desativação após retirar a alimentação. O contato reversível segue a saída TON/TOF da bobina associada pela TAG. Essa interpretação e o comportamento são cobertos por teste.

O contator auxiliar completo requer 10 terminais e o de potência, 12. Por isso o editor mantém nove linhas para símbolos comuns e amplia o formulário quando há mais conexões. As dimensões do símbolo, a seleção e os terminais acompanham cada variante.

## Evolução pendente

Modelos de potência dos motores trifásicos e especiais, transformação elétrica, inversor, soft starter, conversor CC, SSR e monitor de fase continuam pendentes. Os parâmetros de rampa, frequência e corrente só devem ser apresentados como funcionais após implementar e testar os respectivos modelos. Reversão e estrela-triângulo completos dependem desses modelos e de validação de intertravamento.

PNP/NPN não tem comportamento eletrônico distinto nesta versão. Sensores, pressostatos, vacuostatos, termostatos e nível são acionados manualmente. Os modelos de motores com PE não o tratam como neutro.
`;
fs.writeFileSync(new URL('../docs/CATALOGO.md',import.meta.url),text);
console.log(`${library.length} símbolos; ${categories.length} categorias; documentação atualizada.`);
