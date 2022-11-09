# XadrezSuíço Emparceirador

Seja bem-vindo ao XadrezSuíço Emparceirador - o primeiro software open-source e gratuito emparceirador de Eventos/Torneios de Xadrez.

### O que é o XadrezSuíço
O projeto XadrezSuíço é um conjunto de soluções para facilitar o gerenciamento de eventos de Xadrez. Com o que é fornecido no projeto é possível gerenciar circuitos e eventos de Xadrez. Para saber melhor sobre o projeto, [acesse o site do projeto](http://xadrezsuico.github.io).

## O Emparceirador
O XadrezSuíço Emparceirador é um software de emparceiramento para uso em eventos de Xadrez, onde auxilia os árbitros ou professores a gerenciar o emparceiramento e classificação de eventos da modalidade.

O objetivo do projeto era permitir aos árbitros e professores que não possuem condição para adquirir o Swiss-Manager (software de gerenciamento homologado pela CBX (Confederação Brasileira de Xadrez) e FIDE (Federação Internacional de Xadrez)) possuam um software atual e legal (visto que muitos usam de forma ilegal o software Swiss Perfect 98, ou seja, sem licença adquirida) para gerenciamento de torneios de Xadrez.

Para conhecer um pouco melhor o software, você pode assistir os seguintes vídeos:
- Apresentação e Tutorial do Software: [https://www.youtube.com/watch?v=0kKUva1GTaA](https://www.youtube.com/watch?v=0kKUva1GTaA).
- Palestra de Lançamento durante o 19º Congresso Latino-americano de Software Livre e Tecnologias Abertas - A palestra começa no tempo de 5h17m56s, o link leva até este tempo: [https://youtu.be/IZBkEWjwDQE](https://youtu.be/IZBkEWjwDQE?t=19075).

### Desenvolvimento
O projeto foi desenvolvido em uma mescla de Web com Desktop, utilizando-se de Angular com Bootstrap para desenvolvimento da Interface Gráfica e da biblioteca Electron.js para empacotamento e também para funcionar como um "backend".

Para facilitar o início do projeto, foi utilizado um _boilerplate_ para início do desenvolvimento, o [maximegris/angular-electron](https://github.com/maximegris/angular-electron), onde já forneceu o angular e o electron já devidamente configurados para início do projeto.

Então, caso deseja baixar o código e executar em sua máquina, é possível seguir o tutorial de início do _angular-electron_ ou então seguir os seguintes comandos abaixo:

    git clone git@github.com:XadrezSuico/Emparceirador.git
    cd Emparceirador
    npm install
    cd app
    npm install
    cd ..

Estando na pasta raiz do projeto, é possível então rodar o software localmente através do código. Vale constar que, há uma integração do electron através do _ipcMain_ e do _ipcRenderer_ com a emissão de eventos onde ocorre a operação do sistema. É possível ter mais informações sobre essa intercomunicação [através deste link](https://www.electronjs.org/docs/latest/tutorial/ipc).
Então, para que o software rode corretamente é necessário executar tanto o angular quanto o electron, e o seguinte comando faz isto:

    npm run electron:local

Este comando efetua o _build_ do código-fonte do Angular e gera um empacotamento para rodar em teste do Electron junto com o código do _front-end_ compilado, digamos assim.

Há outros comandos existentes do projeto do _angular-electron_, porém, não recomendo muito a utilização. Segue a lista:

| Comando                  | Descrição                                                                                           |
|--------------------------|-------------------------------------------------------------------------------------------------------|
| `npm run ng:serve`       | Executa o front-end no navegador (Modo desenvolvedor)                                                         |
| `npm run web:build`      | Efetua o _build_ do código-fonte do Front-end Angular para ser possível o uso diretamente no navegador. Os arquivos compilados estarão disponíveis na pasta /dist. |
| `npm run electron:local` | Efetua o _build_ do código-fonte do Front-end Angular e inicia o Electron localmente. (RECOMANDADO)                                                    |
| `npm run electron:build` | fetua o _build_ do código-fonte do Front-end Angular e compila um aplicativo de acordo com o seu sistema operacional.                  |

Para mais informações sobre o "core" do _angular-electron_ é possível obter no repositório do mesmo, acessível através [deste link](https://github.com/maximegris/angular-electron).

#### Ideia básica de funcionamento do software
O XadrezSuíço Emparceirador quando executado possui um banco de dados `sqlite` que é salvo dentro da pasta de dados do usuário do software. Neste banco de dados é onde fica armazenado os dados do software. 

O sistema possui um arquivo que é identificado com a extensão `.xadrezsuico-json`, porém, ele serve apenas para ter uma cópia do torneio salva. É como se fosse um arquivo de exportação que toda vez que ocorre uma Transação no Banco de Dados (INSERT, UPDATE ou DELETE) ele salva a estrutura do evento com todos os seus dados dentro deste arquivo. Os momentos que é executado essa exportação são gerenciados pelo próprio código através de eventos, onde sempre chega ao evento dentro do Controller do Evento onde efetua de fato a chamada da função que executa a exportação.

Com este mesmo arquivo é possível importar o evento para outra instância do XadrezSuíço Emparceirador e quando importado, o software registra que o arquivo de exportação é exatamente este para armazenar as alterações quando necessário.

O arquivo de exportação, além das infomações do evento ele possui um hash de conferência dos dados, onde ele consegue identificar se o arquivo teve algum tipo de alteração. O Hash é gerado em SHA1.

O sistema se baseia na ideia de eventos de xadrez, e não torneios como os outros softwares trabalham. Geralmente é necessário possuir um arquivo criado para cada torneio que é operado e quando necessita-se trabalhar com um evento com mais do que um torneio, é necessário possuir mais do que um torneio aberto para operação. Com isso a ideia é que em um evento possua de 1 a mais torneios, onde não necessite a abertura de mais do que um "arquivo" por vez.

Para o emparceiramento Suíço, atualmente é utilizado um pequeno algoritmo criado por mim, porém, que estarei alterando em breve, para uma biblioteca já existente ou então para algo mais robusto, visto que este ainda não atende os requisitos de evitar que um enxadrista jogue duas vezes com a mesma pessoa e também sobre evitar que jogue mais de duas vezes seguidas com a mesma cor.

Quanto ao emparceiramento Todos-contra-todos, também conhecido como Round-robin ou Scüring, é utilizada a biblioteca [`robin.js`](https://github.com/pensierinmusica/robin-js), onde gera o emparceiramento do torneio como um todo para o sistema.

Há a ideia de implementar mais funcionalidades, dentre elas:
- Mais critérios de desempate;
- Possibilidade de permitir um resultado maior que um (para turno e returno, por exemplo);
- Possibilidade de emparceiramento de torneios por equipes;
- Dentre outras que irei atualizar por aqui de acordo com o que visualizar que necessitar ou das _issues_ criadas.

Se quiser trabalhar no desenvolvimento, fique a vontade, efetue um _fork_ e pode colocar a mão na massa. :)

Qualquer dúvida, pode contactar-me no telegram como [arroba]jppcel.

Em breve devo criar um grupo para divulgar as novidades do XadrezSuíço Emparceirador.
