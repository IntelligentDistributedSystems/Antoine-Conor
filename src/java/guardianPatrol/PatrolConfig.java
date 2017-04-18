package guardianPatrol;

import java.util.ArrayList;
import java.util.List;

import helpers.Helpers;
import jason.asSyntax.Literal;

/**
 * This class is used to store the user inputed configuration
 * @author ConorRyan
 *
 */
public class PatrolConfig {
	// Guardian Configuration
	/* TODO : remove default values, when properly calculated from graph and user input */
	private int numberPossiblePatrols;
	private int probabilityResolution = 3;
	private int guardianIterations = 20;
	
	// Robber Configuration
	private int numberPossibleAttacks;
	
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
    
    
    //GUARDIAN CONFIGURATION
    public void setNumberPossiblePatrols(int n){
    	this.numberPossiblePatrols = n;
    }
    
    public int getNumberPossiblePatrols(){
    	return this.numberPossiblePatrols;
    }
    
    public int getProbabilityResolution() {
		return probabilityResolution;
	}

	public void setProbabilityResolution(int probabilityResolution) {
		this.probabilityResolution = probabilityResolution;
	}
	
	public int getNumberOfStrategies(){
		return Helpers.choose(numberPossiblePatrols + probabilityResolution -1 , numberPossiblePatrols - 1);
	}
	
	public int getGuardianIterations(){
		return guardianIterations;
	}
	
	//ROBBER CONFIGURATION
	public int getNumberPossibleAttacks() {
		return numberPossibleAttacks;
	}

	/**
	 * This method sets the number of possible attack points for the robber.
	 * Attacks = Vertices - 1 , because the robber cannot attack the base
	 * @param numberOfVertices Number of vertices of the graph
	 */
	public void setNumberPossibleAttacks(int numberOfVertices) {
		this.numberPossibleAttacks = numberOfVertices - 1;
	}

	/* For each possible strategy (N total), the guardian does I iterations.
	 * Thus, the robber does N*I iterations
	 */
	public int getRobberIterations(){
		return this.getGuardianIterations() * this.getNumberOfStrategies();
	}
}
