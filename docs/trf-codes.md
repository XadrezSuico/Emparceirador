## Códigos TRF16
O JaVaFo trabalha com o arquivo TRF16 para o emparceiramento Suíço. 
**Observação Importante:** Há outros itens que existem no Handbook referente ao TRF16 da FIDE. Vou focar nos que são utilizados amplamente
___

Quando se é citado "coluna" neste arquivo se refere a posição do caractere a partir do início da linha.

Exemplo: 

1 2 3 4 5

O 2 está na coluna 3, o 3 está na coluna 5, o 4 na coluna 7 e assim vai.

___

Aqui listo os códigos referentes a cada um dos itens, em ordem:

| Código (coluna 1 a 3) | Descrição (coluna a partir do 5) | Informação Adicional |
|-|-|-|
| 012 | Nome do Torneio ||
| 022 | Cidade ||
| 032 | Federação (País) ||
| 042 | Data de início ||
| 052 | Data de finalização ||
| 062 | Número de Jogadores ||
| 072 | Número de Jogadores com Rating ||
| 082 | Número de Times (no caso de torneio de times) | No momento não vou tratar sobre torneio de times. |
| 092 | Tipo de Torneio ||
| 102 | Árbitro-Chefe / Árbitro Principal ||
| 112 | Árbitro Adjunto (Um árbitro por linha) ||
| 122 | Tempo de Reflexão ||
| 132 | Datas das Rodadas | Ver formato de datas de rodadas |
| 001 | Jogadores | Ver formato de jogadores |

____
### Formato de Datas de Rodadas
O formato é simples, mas as colunas da linha que devem ser consideradas.

Formato de Data do Arquivo: YY/MM/DD.

As datas seguem a partir da coluna 92 e para separação entre colunas deve-se manter duas colunas em branco. 

Segue exemplo:

- Data Rodada 1: 92-99
- Data Rodada 2: 102-109
- Data Rodada 3: 112-119
- Data Rodada **n**: **Sn**-**Fn**

Sn = **(92 + ((n - 1) \* 8) + ((n - 1) \* 2))**
Fn = **(99 + ((n - 1) \* 8) + ((n - 1) \* 2))**

A fórmula apresentada para Sn e Fn considera que **n > 0**. Sei que o objetivo aqui não é falar de fórmulas matemáticas, mas isso ajuda a entender como funciona o conceito.

Vale constar que, Sn é a coluna/posição do primeiro caractere da data e Fn a coluna/posição do último caractere da data da rodada.

___

### Formato de jogadores
Em cada linha deve-se informar um jogador. Em cada dado de jogador deverá possuir as informações de emparceiramento destes jogadores.

| Colunas | Descrição | Conteúdo | Importância para Rating | Importância para Emparceiramento |
|-|-|-|-|-|
| 1-3 | Código referente a inserção de jogador | Sempre será **001** para dados de jogador | Obrigatório | Obrigatório
| 5-8 | Número Inicial | Número do Ranking Inicial do Torneio (Vale constar que para certas colunas este número vai ser utilizado) | Obrigatório | Obrigatório |
| 10 | Sexo | m = Masculino / w = Feminino | Obrigatório |
| 11-13 | Título | Referente ao Código de Título do Enxadrista | Gera Aviso caso Errado
| 15-47 | Nome do Enxadrista | Para seguir o padrão do regulamento da FIDE, deve-se informar Sobrenome, Nome. Lembrando que há um limite de caracteres como é possível observar - 32 Caracteres | Gera Aviso caso Errado
| 49-52 | Rating FIDE | Gera Aviso caso Errado
| 54-56 | Federação | Código de Federação da FIDE | Gera Aviso caso Errado
| 58-68 | ID FIDE | | Obrigatório
| 70-79 | Data de Nascimento | Formato: YYYY/MM/DD | Gera Aviso caso Errado
| 81-84 | Pontos | Ver formato de Pontos | | Obrigatório
| 86-89 | Posição | A posição do jogador no torneio naquele momento | Obrigatório
| 92-... | Rodadas | Ver formato de Rodadas

#### Formato de Rodadas
Dentro das informações dos jogadores possuem colunas para informar os resultados e emparceiramentos de cada rodada, com as informações dos emparceiramentos do enxadrista em questão.

As colunas a partir da 92 servem para tal, mas existe, da mesma forma das informações da rodada, um padrão para preenchimento.

- Rodada 1: 92-99
- Rodada 2: 102-109
- Rodada 3: 112-119
- Rodada **n**: **Sn**-**Fn**

Sn = **(92 + ((n - 1) \* 8) + ((n - 1) \* 2))**
Fn = **(99 + ((n - 1) \* 8) + ((n - 1) \* 2))**

A regra serve da mesma forma da data das rodadas referente as definições de colunas, porém, as informações a serem apresentadas são diferentes.

Vou considerar o número 1 para a primeira coluna neste caso (exemplos: Rodada 1: 92; Rodada 2: 99; Rodada 3: 112; Rodada n: Sn) e segue-se a partir daí para as próximas.

| Colunas | Descrição | Conteúdo | Importância para Rating | Importância para Emparceiramento |
|-|-|-|-|-|
| 1-4 | Jogador ou Identificação de Bye | Para Jogador emparceirado, deve-se informar o número de Ranking Inicial do Jogador; Caso o jogador esteja em bye, informar 0000 | Obrigatório | Obrigatório |
| 6 | Cor emparceirada | w = Brancas, b = Negras, - (menos/hífen) = Caso o jogador não foi emparceirado ou bye. | Obrigatório | Obrigatório |
| 8 | Resultado do Emparceiramento | Ver resultado do emparceiramento |

##### Resultado do Emparceiramento

Em um jogo normal, o resultado é bem simples:
| Resultado | Descrição | Conteúdo |
|-|-|-|
| 1 | Jogador venceu |
| = | Jogador empatou |
| 0 | Jogador perdeu | 

Quando ocorre um W.O.:
| Resultado | Descrição | Conteúdo |
|-|-|-|
| - | Jogador perdeu por W.O. |
| + | Jogador venceu por W.O. |

Quando ocorre um bye:
| Resultado | Descrição | Conteúdo |
|-|-|-|
| F | _full-point-bye_ | No caso o jogador recebe 1 ponto de bye |
| H | _half-point-bye_ | Jogador recebe 0.5 ponto de bye |
| U | _pairing-allocated bye_ | Bye gerado pelo sistema. |
| Z | _zero-point-bye_ | Jogador não emparceirado para a rodada. |

#### Formato de Pontos
Tudo depende da configuração de pontos do torneio. 
Se o torneio trabalha com o formato de "match-points", então deve-se considerar o formato 3/1/0, ou seja, 3 para vitória, 1 para empate e 0 para derrotas. Exemplo neste caso: se há 5 vitórias, 2 empates e 2 derrotas, o valor de pontuação para esse jogador deve ser de 17.0.
Caso seja pontuação normal, soma-se os pontos obtidos pelo jogador.
**Importante!** Deve-se atentar a pontuação de bye, onde o _pairing-bye_ geralmente recebe 1 ponto, mas depende da configuração do torneio.
