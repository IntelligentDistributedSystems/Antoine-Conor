package guardianPatrol;

import java.util.List;

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
	
	// Robber Configuration
	private int numberPossibleAttacks;
	private String robberStrategy;
	
	// General Configuration
	private double distanceWeight;
	
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
		this.distanceWeight = ((Number) general.get("distanceWeight")).doubleValue();
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


	public double getDistanceWeight() {
		return distanceWeight;
	}
	
	/**
	 * This method sets the robbers strategy (chance to attack each location)
	 * based on it's interest in each location.
	 * @param robbersInterests the list of robber interest per point
	 */
	public void setRobberStrategy(List<Integer> robbersInterests) {
		double totalInterest = 0.0;
		for(int n : robbersInterests){
			totalInterest += n;
		}
		
		String[] strat = new String[numberPossibleAttacks];
		for(int i = 0; i < strat.length; i ++){
			strat[i] = String.valueOf( (double)(robbersInterests.get(i)) / totalInterest);
		}
		this.robberStrategy = "[" + String.join(",", strat) + "]";
	}

	public String getRobberStrategy() {
		return robberStrategy;
	}

	@Override
	public String toString() {
		return "Config [numberPossiblePatrols=" + numberPossiblePatrols + ", probabilityResolution="
				+ probabilityResolution + ", guardianIterations=" + guardianIterations + ", numberPossibleAttacks="
				+ numberPossibleAttacks + "]";
	}
}
