package beliefbases;

import guardianPatrol.Config;

public class RobberBeliefBase extends PatrolBeliefBase {
    
	/* List of tags to use in agents */
	private static final String NUMBER_POSSIBLE_ATTACKS = "number_possible_attacks";
	private static final String NUMBER_ITERATIONS = "iterations";
	
	public RobberBeliefBase() {
		Config config = Config.create();
		this.addLiteral(NUMBER_POSSIBLE_ATTACKS, config.getNumberPossibleAttacks());
		this.addLiteral(NUMBER_ITERATIONS, config.getRobberIterations());
	}
}
