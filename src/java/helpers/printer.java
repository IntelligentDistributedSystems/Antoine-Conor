// Internal action code for project Antoine-Conor

package helpers;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import guardianPatrol.Config;
import guardianPatrol.PatrolGraph;
import guardianPatrol.SecurityEnvironment.EnvPercept;
import jason.asSemantics.*;
import jason.asSyntax.*;

/**
 * This class is used to print relevant data to be parsed by the GUI for
 * the creation of visuals for the user. All data is sent in JSON form.
 * 
 * It is also an InternalAction, to be able to be called from agents directly (for strategy)
 * @author ConorRyan
 *
 */
public class printer extends DefaultInternalAction {
	private static final long serialVersionUID = 4740178248861241577L;

    /**
     * Used to set the minimum number of arguments expected.
     * Postconditions : checkArguments needs to be called (i.e. super.checkArguments(args)) 
     */
    @Override public int getMinArgs() {
        return 1;
    }
    
    /**
     * Used to set the maximum number of arguments expected.
     * Postconditions : checkArguments needs to be called (i.e. super.checkArguments(args)) 
     */
    @Override public int getMaxArgs() {
        return 2;
    }
    
    /**
     * Method to print out all possible patrols (indexed correctly) to describe each patrol to the user
     * @param graph the generated PatrolGraph
     */
    public static void printStart(PatrolGraph graph){
    	JSONArray patrolJson = graph.getPatrolsJSONArray();
    	JSONObject main = new JSONObject();
    	main.put("patrols", patrolJson);
    	main.put("numberStrategies", Config.create().getNumberOfStrategies());
    	System.out.println("[start]" + main.toJSONString());
    }
    
    public static void printIteration(EnvPercept percept){
    	JSONObject iteration = new JSONObject();
    	iteration.put("iteration", percept.i);
    	iteration.put("guardianUtility", percept.ug);
    	iteration.put("robberUtility", percept.ur);
    	System.out.println("[iteration]" + iteration.toJSONString());
    }
    
    public static void printEnd(double averageGuardianUtility, double averageRobberUtility){
    	JSONObject end = new JSONObject();
    	end.put("averageGuardianUtility", averageGuardianUtility);
    	end.put("averageRobberUtility", averageRobberUtility);
    	System.out.println("[end]" + end.toJSONString());
    }
    
    @Override
    public Object execute(TransitionSystem ts, Unifier un, Term[] args) throws Exception {
    	super.checkArguments(args);

        
    	switch (args[0].toString()) {
    	case "strategy":
    		JSONObject strategy = new JSONObject();
    		strategy.put("strategy", args[1].toString());
    		System.out.println("[strategy]" + strategy.toJSONString());
    		break;
    	}
    	
    	return true;
    }
}