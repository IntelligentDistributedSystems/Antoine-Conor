package beliefbases;

import guardianPatrol.PatrolConfig;

/**
 * This class determines the belief base for the guardian agent,
 * with all the dynamic configuration needed;
 * @author ConorRyan
 *
 */
public class GuardianBeliefBase extends PatrolBeliefBase {
    
	/* List of tags to use in agents */
	private static final String NUMBER_POSSIBLE_PATROLS = "number_possible_patrols";
	private static final String PROBABILITY_RESOLUTION = "probability_resolution";
	private static final String NUMBER_ITERATIONS = "iterations";
	
	public GuardianBeliefBase() {
		PatrolConfig config = PatrolConfig.create();
		this.addLiteral(NUMBER_POSSIBLE_PATROLS, config.getNumberPossiblePatrols());
		this.addLiteral(PROBABILITY_RESOLUTION, config.getProbabilityResolution());
		this.addLiteral(NUMBER_ITERATIONS, config.getGuardianIterations());
	}
}
