// Internal action code for project Antoine-Conor
/*
 * Note : 	Internal actions must be compiled manually before running the project.
 * 			Use compileInternalActions.sh to do so
 */

package internalActions;

import jason.asSemantics.*;
import jason.asSyntax.*;

public class helloWorld extends DefaultInternalAction {


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
        return 1;
    }
    
    @Override
    public Object execute(TransitionSystem ts, Unifier un, Term[] args) throws Exception {
    	super.checkArguments(args);
    	//Logger
        //ts.getAg().getLogger().info("executing internal action 'internalActions.helloWorld'");
        
        //If there's an argument, i.e. internalActions.helloWorld(E)
        if (args.length == 1) {
            return un.unifies(args[0], new StringTermImpl("Hello World ! "));
        }
        // Else return true, no errors
        return true;
    }
}
