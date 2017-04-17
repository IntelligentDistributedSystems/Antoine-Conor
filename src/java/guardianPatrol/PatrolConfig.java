package guardianPatrol;

/**
 * This class is used to 
 * @author ConorRyan
 *
 */
public class PatrolConfig {
	private int n = 0;
	
	private static PatrolConfig singleton = null;
    public static PatrolConfig create() {
        if (singleton == null)
            singleton = new PatrolConfig();
        return singleton;
    }
    
    public void setN(int n){
    	this.n = n;
    }
    
    public int getN(){
    	return this.n;
    }
}
