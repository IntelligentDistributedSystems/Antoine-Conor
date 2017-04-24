package guardianPatrol;
// Environment code for project GuardianPatrol.mas2j

import jason.asSyntax.*;

import jason.*;
import jason.asSemantics.TransitionSystem;
import jason.environment.*;

import java.util.logging.*;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.*;

@SuppressWarnings("unused")
public class SecurityEnvironment extends Environment {
	
	private static final String JSON_FILE_ENVIRONMENT_VARIABLE = "PATROL_JSON_NAME";
	
	private PatrolGraph graph;
	private Config config;
	
	/** Called before the MAS execution with the args informed in .mas2j */

    @Override
    public void init(String[] args) {
        super.init(args);
       
        String filepath = "./config/" + System.getenv(JSON_FILE_ENVIRONMENT_VARIABLE);
        
        // For testing, uncomment following line :
        // filepath = "./tests/inputPDF.json";
        
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
    }
	
    private Logger logger = Logger.getLogger("GuardianPatrol.mas2j."+SecurityEnvironment.class.getName());
    
    // Number of patrols, attacks and robber types
    //private final int nPatrols = 4;
    //private final int nAttacks = 3;
    //private final int nRobberTypes = 2;
    
    // Current patrol, attack and robber type
    private int iPatrol = -1;
    private int iAttack = -1;
    private int iRobberType = -1;
    
    // Agent types
    private final int ROBBER = 1;
	private final int GUARDIAN = 2;
    /*
    // Robber parameters
    private final double p1[] = {1.0,0.7};
    private final double p2[] = {0.7,0.4};
    private final double p3[] = {0.5,0.2};
    
    // pCaught[r][a][p] = probability that a robber of type r is caught by a guard 
    // patrolling using strategy p while attacking a target using a.
    // RobberType x Attack x Patrol.
    private final double pCaught[][][] = {
        { { p1[0], p3[0], p2[0], 0.0 },
          { p2[0], p2[0], p1[0], p1[0] }, 
          { p3[0], p1[0], 0.0, p2[0] } },
        { { p1[1], p3[1], p2[1], 0.0},
          { p2[1], p2[1], p1[1], p1[1]},         
          { p3[1], p1[1], 0.0, p2[1]} }
    };
    

    // Guardian cost for missing to catch a robber doing attack a.
    private final double gCost[] = {1.0, 2.0, 3.0};
    
    // Guardian reward for catching a robber doing attack a.
    private final double gReward[] = {1.0, 2.0, 3.0};
    
    // Cost of a robber of type r if it is caught doing attack a
    // RobberType x Attack
    private final double rCost[][] = {
        {1.0, 2.0, 3.0},
        {2.0, 4.0, 6.0}
    };
    
    // Cost of a robber of type r if it is caught doing attack a
    // RobberType x Attack
    private final double rReward[][] = {
        {1.0, 2.0, 3.0},
        {2.0, 4.0, 6.0}
    };
    */
    
    private int iPercept = 0;
    
    class EnvPercept {
        int i,r,a,p;
        double ur,ug;
        
        EnvPercept(int i1,int r1,int a1,int p1,double ur1,double ug1) {
            i = i1;
            r = r1;
            a = a1;
            p = p1;
            ur = ur1;
            ug = ug1;
        }
   
    };
    
    private ArrayList<EnvPercept> history = new ArrayList<EnvPercept>();
    
    // Robber utility
    // RobberType x Attack x Patrol
    private double rUtility(int r, int a, int p) {
    	
    	double newRReward = graph.getAttack(a).getRobberReward(r);
        double newRCost = graph.getAttack(a).getRobberCost(r);
        double newProb = graph.getPatrol(p).getCatchProbability(a, r);
        
        /*
        double oldRReward = rReward[r][a];
        double oldRCost = rCost[r][a];
        double oldProb = pCaught[r][a][p];
        double oldRes = oldProb*(-oldRCost) + (1-oldProb)*oldRReward;
        */
        
        double newRes = newProb*(-newRCost) + (1-newProb)*newRReward;
        
        return newRes;
    }   
    
    // Guardian utility
    // RobberType x Attack x Patrol
    private double gUtility(int r, int a, int p) {
    	double newGReward = graph.getAttack(a).getGuardiansReward();
        double newGCost = graph.getAttack(a).getGuardiansCost();
        double newProb = graph.getPatrol(p).getCatchProbability(a, r);
        
        /*
        double oldGReward = gReward[a];
        double oldGCost = gCost[a];
        double oldProb = pCaught[r][a][p];
        double oldRes = oldProb*oldGReward + (1-oldProb)*(-oldGCost);
        */
        
        double newRes = newProb*newGReward + (1-newProb)*(-newGCost);
        
        return newRes;
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

        logger.info("Robber type: "+iRobberType+" Attack: "+iAttack);
        
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
        
//        logger.info("Patrol: "+iPatrol);

        updatePercepts();
                
        return true;

    }

    /** update the agent's percepts based on the current
    state of the world model */
    private void updatePercepts() {
        
//        logger.info("updatePercepts: "+ iRobberType + "  " + iAttack + "  " + iPatrol); 
        
        if ((iPatrol > 0) && (iAttack > 0) && (iRobberType > 0)) {
            clearPercepts();    // remove previous percepts
//            clearPercepts("guardian");    // remove previous percepts
//            clearPercepts("robber");    // remove previous percepts
            double ur = rUtility(iRobberType-1,iAttack-1,iPatrol-1);
            double ug = gUtility(iRobberType-1,iAttack-1,iPatrol-1);
            String percept = new String("perc(");
            iPercept++;
            history.add(new EnvPercept(iPercept,iRobberType,iAttack,iPatrol,ur,ug));
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
            addPercept(Literal.parseLiteral(percept));
            iPatrol = iAttack = iRobberType = -1;
//            logger.info("added percept: "+ percept); 
//            addPercept("guardian",Literal.parseLiteral(percept));
//            addPercept("robber",Literal.parseLiteral(percept));
        }
    }
    
    
    public List<Literal> getPercepts(String agName) {
        // logger.info(agName+" calling getPaercepts()");
        return (List<Literal>)super.getPercepts(agName);
    }

    /** Called before the end of MAS execution */

    @Override
    public void stop() {
	    
    	/*
	    logger.info("History size : "+history.size());
	    for (EnvPercept per : history) {
	        logger.info(per.i+","+per.r+","+per.a+","+per.p+","+per.ur+","+per.ug);
	    }
	    */
    	double averageRobberUtility = 0;
    	double averageGuardianUtility = 0;
    	
    	for (EnvPercept per : history) {
    		averageRobberUtility += per.ur;
    		averageGuardianUtility += per.ug;
	    }
    	averageRobberUtility /= history.size();
    	averageGuardianUtility /= history.size();
	    System.out.println("AVERAGE UG : " + averageGuardianUtility + ", TOTAL UR : " + averageRobberUtility);
        super.stop();
    }


}

