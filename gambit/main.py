import gambit

g = gambit.Game.new_table([2, 2])

g.title = "A prisoner's dilemma game"

g.players[0].label = "Guardian"
g.players[1].label = "Robber"