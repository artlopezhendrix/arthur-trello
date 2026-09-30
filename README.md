# Arthur Trello

Um kanban pessoal que roda no Google Apps Script. Os dados ficam numa planilha do Sheets e o quadro abre direto no navegador.

## Demo

[arthur-silva.github.io/arthur-trello](https://SEU-USUARIO.github.io/arthur-trello/)

A demo roda toda no navegador, salvando em localStorage. Dá pra testar sem precisar de conta Google.

## Como funciona

São três colunas — A fazer, Fazendo e Feito — com cards que você arrasta entre elas. Tem paginação por coluna (8 cards por página), modal de criar e editar, e uma home com contador, progresso e últimas atividades.

Quando você arrasta um card perto do topo ou do fundo da tela, a página rola sozinha. Isso evita o problema clássico de não conseguir soltar um card numa coluna que está fora da área visível.

A home usa tema escuro e o quadro usa tema claro.

## Stack

Frontend em HTML, CSS e JavaScript puro. Backend em Google Apps Script com persistência no Google Sheets.

## Como rodar

1. Cria uma planilha em sheets.new
2. Copia o ID da URL — o trecho entre /d/ e /edit
3. Na planilha, abre Extensões → Apps Script
4. Cola src/Code.gs no arquivo de código
5. Cria um arquivo HTML chamado Index e cola src/Index.html
6. Substitui SEU_SPREADSHEET_ID_AQUI pelo ID da sua planilha
7. Vai em Implantar → Nova implantação e escolhe Aplicativo da Web

A aba Trello é criada automaticamente na primeira execução.

## Estrutura

    src/
      Code.gs        backend do Apps Script
      Index.html     frontend que roda dentro do Apps Script
    demo/
      index.html     versão de demonstração para GitHub Pages

O src/Index.html chama funções do Apps Script e grava na planilha. O demo/index.html é uma adaptação que troca essas chamadas por localStorage, para que a demo funcione sem backend.

## Licença

MIT.
