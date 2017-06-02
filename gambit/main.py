import gambit

numRobbers = 2
numTargets = 3
numPatrols = 4

GUARDIAN = 0
ROBBER = 1

g = gambit.Game.new_table([numPatrols, numTargets*numRobbers])

g.title = "Patrolling game"

g.players[GUARDIAN].label = "Guardian"
g.players[ROBBER].label = "Robber"

for i in range(numPatrols):
	g.players[GUARDIAN].strategies[i].label = 'Patrol ' + str(i)

for i in range(numRobbers):
	for j in range(numTargets):
		g.players[ROBBER].strategies[numTargets*i+j].label = 'Robber type '+ str(i)+' attacking '+ str(j)

for i in range(numTargets*numRobbers*numPatrols):
	g[i/(numTargets*numRobbers),i%(numTargets*numRobbers)][0] = i/2
	g[i/(numTargets*numRobbers),i%(numTargets*numRobbers)][1] = i

with open('test.txt', 'w') as f:
	f.write(g.write())

# solver = gambit.nash.ExternalLogitSolver()
solver = gambit.nash.ExternalEnumMixedSolver()
print(solver.solve(g))