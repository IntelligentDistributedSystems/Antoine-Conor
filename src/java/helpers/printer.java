// Internal action code for project Antoine-Conor

package helpers;

import org.json.simple.JSONObject;

import guardianPatrol.Config;
import guardianPatrol.PatrolGraph;
import guardianPatrol.SecurityEnvironment.EnvPercept;
import jason.asSemantics.*;
import jason.asSyntax.*;


public class printer extends DefaultInternalAction {
	private static final long serialVersionUID = 4740178248861241577L;
	
	private Config config = Config.create();
	
	private String buffer = "";

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
    
    public static void printStart(PatrolGraph graph){
    	System.out.println("[start]" + graph.getPatrolsJSONString().toJSONString());
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