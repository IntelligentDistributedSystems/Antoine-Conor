package guardianPatrol;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import helpers.Helpers;

/**
 * This class is used to store the user input configuration
 * @author ConorRyan
 *
 */
public class Config {
	// Guardian Configuration
	private int numberPossiblePatrols;
	/* After meeting with C. Badica, it has been decided to have probabilityResolution (K) equal
	 * to the number of possible patrols. This way, we get a least one full mixed strategy 
	 * as [1,1,... 1,1] */
	private int probabilityResolution;
	private int guardianIterations;
	
	private int numberOfStrategies;
	
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
    	this.probabilityResolution = n;
    }
    
    public int getNumberPossiblePatrols(){
    	return this.numberPossiblePatrols;
    }
    
	public int getProbabilityResolution() {
		return this.probabilityResolution;
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
