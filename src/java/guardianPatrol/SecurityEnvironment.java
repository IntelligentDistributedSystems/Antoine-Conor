package guardianPatrol;
// Environment code for project GuardianPatrol.mas2j

import jason.asSyntax.*;

import jason.*;
import jason.asSemantics.TransitionSystem;
import jason.environment.*;

import java.util.logging.*;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import helpers.printer;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.*;

@SuppressWarnings("unused")
public class SecurityEnvironment extends Environment {
	
	private static final String JSON_FILE_ENVIRONMENT_VARIABLE = "PATROL_JSON_NAME";
	
	private Logger logger = Logger.getLogger("GuardianPatrol.mas2j."+SecurityEnvironment.class.getName());
	
	private PatrolGraph graph;
	private Config config;
	
	/** Called before the MAS execution with the args informed in .mas2j */

    @Override
    public void init(String[] args) {
        super.init(args);

        String filepath = "./configs/" + System.getenv(JSON_FILE_ENVIRONMENT_VARIABLE);
        
        // For testing, uncomment following line :
        // filepath = "./configs/inputPDF.json";
        
        JSONObject json = null;
        JSONParser parser = new JSONParser();
        try {
        	json = (JSONObject)parser.parse(new FileReader(filepath));
        } catch (Exception e) {
        	System.out.println("Cannot read JSON file");
        }
        
        Robber.create(json);

        graph = new PatrolGraph(json);

        config = Config.create(json);
        
        //Send JSON with paths to StdOut
        printer.printStart(graph);
    }

    
    // Current patrol, attack and robber type
    private int iPatrol = -1;
    private int iAttack = -1;
    private int iRobberType = -1;
    
    private int iPercept = 0;
    
    public class EnvPercept {
        public int i,r,a,p;
        public double ur,ug;
        
        EnvPercept(int i1,int r1,int a1,int p1,double ur1,double ug1) {
            i = i1;
            r = r1;
            a = a1;
            p = p1;
            ur = ur1;
            ug = ug1;
        }
        
        public String toLiteral(){
        	String percept = new String("perc(");
        	percept += iPercept;
            percept += ",";
            percept += iRobberType;
            percept += ",";
            percept += iAttack;
            percept += ",";
            percept += iPatrol;
            percept += ",";
            percept += ur;
            percept += ",";
            percept += ug;
            percept += ")";
            return percept;
        }

    };
    
    private ArrayList<EnvPercept> history = new ArrayList<EnvPercept>();
    
    // Robber utility
    // RobberType x Attack x Patrol
    private double rUtility(int r, int a, int p) {
    	
    	double rReward = graph.getAttack(a).getRobberReward(r);
        double rCost = graph.getAttack(a).getRobberCost(r);
        double catchProb = graph.getPatrol(p).getCatchProbability(a, r);
        
        return catchProb*(-rCost) + (1-catchProb)*rReward;
    }   
    
    // Guardian utility
    // RobberType x Attack x Patrol
    private double gUtility(int r, int a, int p) {
    	double gReward = graph.getAttack(a).getGuardiansReward();
        double gCost = graph.getAttack(a).getGuardiansCost();
        double catchProb = graph.getPatrol(p).getCatchProbability(a, r);
       
        return catchProb*gReward + (1-catchProb)*(-gCost);
    }

    @Override
    public synchronized boolean executeAction(String agName, Structure action) {

        // logger.info("executing: "+action+", but not implemented!");
        
        if (agName.equals("robber")) {
            return executeRobberAction(action);
        }
        else if (agName.equals("guardian")) {
            return executeGuardianAction(action);
        }
        else {
            return true;
        }

    }

    public synchronized boolean executeRobberAction(Structure action) {

//      logger.info("Robber executing: "+action);
        
        NumberTerm type, attack;
        
        type = (NumberTerm)action.getTerm(1);
        attack = (NumberTerm)action.getTerm(2);
        
        try {
            iRobberType = (int)type.solve();
            iAttack = (int)attack.solve();
        }
        catch(NoValueException e) {}

//        logger.info("Robber type: "+iRobberType+" Attack: "+iAttack);
        
        updatePercepts();

        return true;

    }

    public synchronized boolean executeGuardianAction(Structure action) {
//        logger.info("Guardian executing: "+action);
        
        NumberTerm patrol;
        
        patrol = (NumberTerm)action.getTerm(1);
        
        
        try {
            iPatrol = (int)patrol.solve();
        }
        catch(NoValueException e) {}
        
        // logger.info("Patrol: "+iPatrol);

        updatePercepts();
                
        return true;

    }

    /** update the agent's percepts based on the current
    state of the world model */
    private void updatePercepts() {
        
        // logger.info("updatePercepts: "+ iRobberType + "  " + iAttack + "  " + iPatrol); 
        
        if ((iPatrol > 0) && (iAttack > 0) && (iRobberType > 0)) {
            clearPercepts();    // remove previous percepts
//            clearPercepts("guardian");    // remove previous percepts
//            clearPercepts("robber");    // remove previous percepts
            double ur = rUtility(iRobberType-1,iAttack-1,iPatrol-1);
            double ug = gUtility(iRobberType-1,iAttack-1,iPatrol-1);
            iPercept++;
            EnvPercept percept = new EnvPercept(iPercept,iRobberType,iAttack,iPatrol,ur,ug);
            history.add(percept);
            printer.printIteration(percept);
            addPercept(Literal.parseLiteral(percept.toLiteral()));
            iPatrol = iAttack = iRobberType = -1;
        }
    }
    
    
    public List<Literal> getPercepts(String agName) {
        // logger.info(agName+" calling getPaercepts()");
        return (List<Literal>)super.getPercepts(agName);
    }

    /** Called before the end of MAS execution */

    @Override
    public void stop() {
	    
    	double averageGuardianUtility = 0;
    	double averageRobberUtility = 0;
    	
    	for (EnvPercept per : history) {
    		averageGuardianUtility += per.ug;
    		averageRobberUtility += per.ur;
	    }
    	averageGuardianUtility /= history.size();
	    averageRobberUtility /= history.size();
    	
    	printer.printEnd(averageGuardianUtility, averageGuardianUtility);
	  
        super.stop();
    }


}

