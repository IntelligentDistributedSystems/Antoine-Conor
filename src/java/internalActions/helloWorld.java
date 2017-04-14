// Internal action code for project Antoine-Conor

package internalActions;

import jason.*;
import jason.asSemantics.*;
import jason.asSyntax.*;

public class helloWorld extends DefaultInternalAction {

    @Override
    public Object execute(TransitionSystem ts, Unifier un, Term[] args) throws Exception {
        // execute the internal action
        ts.getAg().getLogger().info("executing internal action 'internalActions.helloWorld'");
        // everything ok, so returns true
        return true;
    }
}
