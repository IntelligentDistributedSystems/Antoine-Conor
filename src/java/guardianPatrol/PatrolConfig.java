package guardianPatrol;

/**
 * This class is used to store the user inputed configuration
 * @author ConorRyan
 *
 */
public class PatrolConfig {
	// Guardian Configuration
	private int numberPossiblePatrols = 0;
	
	// Robber Configuration
	
	// General Configuration
	
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
    
    public void setNumberPossiblePatrols(int n){
    	this.numberPossiblePatrols = n;
    }
    
    public int getNumberPossiblePatrols(){
    	return this.numberPossiblePatrols;
    }
}
