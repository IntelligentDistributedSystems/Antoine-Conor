// Internal action code for project Antoine-Conor
/*
 * Note : 	Internal actions must be compiled manually before running the project.
 * 			Use compileInternalActions.sh to do so
 */

package internalActions;

import jason.asSemantics.*;
import jason.asSyntax.*;

public class helloWorld extends DefaultInternalAction {

	private static InternalAction singleton = null;
    public static InternalAction create() {
        if (singleton == null)
            singleton = new helloWorld();
        return singleton;
    }
    
    @Override
    public Object execute(TransitionSystem ts, Unifier un, Term[] args) throws Exception {

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
