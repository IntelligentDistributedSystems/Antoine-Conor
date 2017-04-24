package guardianPatrol;

import org.json.simple.JSONObject;

import helpers.Helpers;

/**
 * This class is used to store the user inputed configuration
 * @author ConorRyan
 *
 */
public class Config {
	// Guardian Configuration
	/* TODO : ask C. Badica what to set as probability resultion (= N for all strats ?) */
	private int numberPossiblePatrols;
	private int probabilityResolution = 3;
	private int guardianIterations;
	
	// Robber Configuration
	private int numberPossibleAttacks;
	
	// General Configuration
	/**
	 * Contructor for PatrolConfig class.
	 * Private, must use method PatrolConfig.create() to get instance.
	 */
	private Config(){
		super();
	}
	
	private static Config singleton = null;
	/**
	 * Method to instanciate a singleton of PatrolConfig class
	 * @return PatrolConfig instance
	 */
    public static Config create() {
        if (singleton == null)
            singleton = new Config();
        return singleton;
    }
    
    public static Config create(JSONObject json) {
        if (singleton == null){
            singleton = new Config();
        }
        singleton.loadJason(json);
        return singleton;
    }
    
    private void loadJason(JSONObject json){
		JSONObject general = (JSONObject) json.get("general");
		this.guardianIterations = ((Number) general.get("numberOfIterations")).intValue();
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

	
	public void setNumberPossibleAttacks(int numberPossibleAttacks) {
		this.numberPossibleAttacks = numberPossibleAttacks;
	}

	/* For each possible strategy (N total), the guardian does I iterations.
	 * Thus, the robber does N*I iterations
	 */
	public int getRobberIterations(){
		return this.getGuardianIterations() * this.getNumberOfStrategies();
	}


	@Override
	public String toString() {
		return "Config [numberPossiblePatrols=" + numberPossiblePatrols + ", probabilityResolution="
				+ probabilityResolution + ", guardianIterations=" + guardianIterations + ", numberPossibleAttacks="
				+ numberPossibleAttacks + "]";
	}
}
