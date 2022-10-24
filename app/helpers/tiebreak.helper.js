module.exports.tiebreaks = () => {
  return [
    {
      id: "XZT_001",
      name: "Confronto Direto",
      description: "Caso os enxadristas empatados tenham jogado entre si, será somado os resultados dos confrontos entre eles para utilização neste critério.",
      is_swiss: true,
      is_schuring: true,
    },
    {
      id: "XZT_002",
      name: "Buchholz Totais",
      description: "Este critério soma todos os pontos dos adversários que este jogou. Ele utiliza o conceito que, os enxadristas que jogaram contra oponentes mais fortes (que conseguiram mais pontos) devem levar vantagem dos que jogaram com oponentes com menor pontuação.",
      is_swiss: true,
      is_schuring: false,
    },
    {
      id: "XZT_003",
      name: "Buchholz com corte do melhor resultado",
      description: "Utiliza do mesmo critério do Buchholz Totais, porém, desconsidera a maior pontuação do critério para a soma.",
      is_swiss: true,
      is_schuring: false,
    },
    {
      id: "XZT_004",
      name: "Buchholz com corte do pior resultado",
      description: "Utiliza do mesmo critério do Buchholz Totais, porém, desconsidera a pior pontuação do critério para a soma.",
      is_swiss: true,
      is_schuring: false,
    },
    {
      id: "XZT_005",
      name: "Buchholz com corte do melhor e do pior resultado",
      description: "Utiliza do mesmo critério do Buchholz Totais, porém, desconsidera a melhor e a pior pontuação do critério para a soma.",
      is_swiss: true,
      is_schuring: false,
    },
    {
      id: "XZT_006",
      name: "Sonneborn-Berger",
      description: "Este critério efetua a soma da pontuação dos adversários de acordo com o resultado obtido pelo enxadrista na partida. \
                    Caso o enxadrista tenha ganho a partida, ele soma todos os pontos do seu adversário, caso houve empate, soma-se apenas a metade e \
                    caso perca a partida, não recebe pontuação nenhuma do adversário em questão.",
      is_swiss: true,
      is_schuring: true,
    },
    {
      id: "XZT_007",
      name: "Sistema Arranz",
      description: "Este critério gera uma nova pontuação para o enxadrista, tendo uma diferença apenas nos empates. Caso vença a partida recebe 1 ponto, \
                    caso perca recebe 0 ponto, porém, caso empate de Brancas, recebe 0.4 ponto e caso empate de Negras recebe 0.6 ponto. O critério utiliza o \
                    fato de estatisticamente as Brancas estão em vantagem por começar a jogar por primeiro, e considera então que caso empate, as negras \
                    tiveram mais trabalho para tal.",
      is_swiss: true,
      is_schuring: true,
    },
  ]
}

module.exports.defaultTiebreakObject = () => {
  return {
    order: 0,
    id: "",
    value: "",
    value_order: 0.0
  }
}
