package guardianPatrol;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import jason.asSyntax.Literal;

/**
 * This class is used to store the user inputed configuration
 * @author ConorRyan
 *
 */
public class PatrolConfig {
	// Guardian Configuration
	private int numberPossiblePatrols;
	private int probabilityResolution;
	
	// Robber Configuration
	
	// General Configuration
	/**
	 * Contructor for PatrolConfig class.
	 * Private, must use method PatrolConfig.create() to get instance.
	 */
	private PatrolConfig(){
		super();
	}
	
	private static PatrolConfig singleton = null;
	/**
	 * Method to instanciate a singleton of PatrolConfig class
	 * @return PatrolConfig instance
	 */
    public static PatrolConfig create() {
        if (singleton == null)
            singleton = new PatrolConfig();
        return singleton;
    }
    
    /* TODO : Currently, n = k (number of patrols and proba resolution : see with CB) */
    public void setNumberPossiblePatrols(int n){
    	this.numberPossiblePatrols = n;
    	this.setProbabilityResolution(n);
    }
    
    public int getProbabilityResolution() {
		return probabilityResolution;
	}

    /* TODO : Currently, n = k (number of patrols and proba resolution : see with CB) */
	public void setProbabilityResolution(int probabilityResolution) {
		this.probabilityResolution = probabilityResolution;
	}

	public int getNumberPossiblePatrols(){
    	return this.numberPossiblePatrols;
    }
    
    public List<Literal> getBeliefLiterals(){
    	List<Literal> result = new ArrayList<>();
    	result.add(Literal.parseLiteral("number_possible_patrols(" + numberPossiblePatrols +")"));
    	result.add(Literal.parseLiteral("probability_resolution(" + probabilityResolution +")"));
    	return result;
    }

}
