// Internal action code for project Antoine-Conor
/*
 * Note : 	Internal actions must be compiled manually before running the project.
 * 			Use compileInternalActions.sh to do so
 */

package internalActions;

import guardianPatrol.PatrolConfig;
import jason.asSemantics.*;
import jason.asSyntax.*;

/**
 * Class of InternalAction type, to be called from agents. This class is a controller
 * for the config that is user modifiable (from guardianPatrol.PatrolConfig).
 * @author ConorRyan
 *
 */
public class config extends DefaultInternalAction {
	private PatrolConfig config = PatrolConfig.create();

    /**
     * Used to set the minimum number of arguments expected.
     * Postconditions : checkArguments needs to be called (i.e. super.checkArguments(args)) 
     */
    @Override public int getMinArgs() {
        return 2;
    }
    
    /**
     * Used to set the maximum number of arguments expected.
     * Postconditions : checkArguments needs to be called (i.e. super.checkArguments(args)) 
     */
    @Override public int getMaxArgs() {
        return 2;
    }
    
    /**
     * Method to get a specific configuration elements
     * Arguments args :
     * 		- arg[0] : label of config element
     * 		- arg[1] : variable to store the config element
     */
    @Override
    public Object execute(TransitionSystem ts, Unifier un, Term[] args) throws Exception {
    	//Runs the methods getMinArs() and getMaxArgs() to check input
    	super.checkArguments(args);
    	//Logger
        //ts.getAg().getLogger().info("executing internal action 'internalActions.helloWorld'");
        
        if (args.length == 2) {
        	switch (args[0].toString()) {
        	case "n":
        		return un.unifies(args[1], new NumberTermImpl(config.getNumberPossiblePatrols()));
        	default:
                return un.unifies(args[1], new StringTermImpl("Hello World ! "));
        	}
        }
        // Else return true, no errors
        return true;
    }
}
