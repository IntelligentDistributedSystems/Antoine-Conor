package beliefbases;

import jason.asSyntax.Literal;
import jason.bb.DefaultBeliefBase;

/**
 * This class defines methods needed to add beliefs to the belief base
 * @author ConorRyan
 *
 */
public abstract class PatrolBeliefBase extends DefaultBeliefBase {

	protected void addLiteral(String tag, String value){
		this.add(Literal.parseLiteral(tag + "(" + value +")"));
	}
	
	protected void addLiteral(String tag, int value){
		this.addLiteral(tag, String.valueOf(value));
	}
}
