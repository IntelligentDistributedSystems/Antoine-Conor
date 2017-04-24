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
		this.addLiteral(NUMBER_POSSIBLE_ATTACKS, config.getNumberPossibleAttacks() - 1);
		this.addLiteral(STRATEGY, getStrategy(config.getNumberPossibleAttacks() - 1));
		this.addLiteral(NUMBER_ITERATIONS, config.getRobberIterations());
		this.addLiteral(NUMBER_ROBBER_TYPES, Robber.getNumberOfRobbers());
	}
	
	/**
	 * Currently, only robber strategy is equal chance for each location
	 * @param numberPossibleAttacks
	 * @return a string containing the wanted strategy
	 */
	private String getStrategy(int numberPossibleAttacks){
		String[] strat = new String[numberPossibleAttacks];
		for(int i = 0; i < strat.length; i ++){
			strat[i] = String.valueOf(1.0/(double)numberPossibleAttacks);
		}
		return "[" + String.join(",", strat) + "]";
	}
}
