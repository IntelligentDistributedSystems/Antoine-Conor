package beliefbases;

import guardianPatrol.PatrolConfig;
import jason.asSyntax.Literal;
import jason.bb.DefaultBeliefBase;

public class GuardianBeliefBase extends DefaultBeliefBase {
    
	/* List of tags to use in agents */
	private static final String NUMBER_POSSIBLE_PATROLS = "number_possible_patrols";
	private static final String PROBABILITY_RESOLUTION = "probability_resolution";
	
	public GuardianBeliefBase() {
		PatrolConfig config = PatrolConfig.create();
		this.addLiteral(NUMBER_POSSIBLE_PATROLS, config.getNumberPossiblePatrols());
		this.addLiteral(PROBABILITY_RESOLUTION, config.getProbabilityResolution());
	}
	
	private void addLiteral(String tag, String value){
		this.add(Literal.parseLiteral(tag + "(" + value +")"));
	}
	
	private void addLiteral(String tag, int value){
		this.addLiteral(tag, String.valueOf(value));
	}
}
