package beliefbases;

import guardianPatrol.Config;
import guardianPatrol.Robber;

public class RobberBeliefBase extends PatrolBeliefBase {
    
	/* List of tags to use in agents */
	private static final String NUMBER_POSSIBLE_ATTACKS = "number_possible_attacks";
	private static final String NUMBER_ITERATIONS = "iterations";
	private static final String NUMBER_ROBBER_TYPES = "robber_types";
	private static final String STRATEGY = "robber_strategy";
	
	public RobberBeliefBase() {
		Config config = Config.create();
		this.addLiteral(NUMBER_POSSIBLE_ATTACKS, config.getNumberPossibleAttacks());
		this.addLiteral(STRATEGY, config.getRobberStrategy());
		this.addLiteral(NUMBER_ITERATIONS, config.getRobberIterations());
		this.addLiteral(NUMBER_ROBBER_TYPES, Robber.getNumberOfRobbers());
	}
}
