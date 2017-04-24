package guardianPatrol;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

public class Robber {
	/* Static context */
	private static Map<Integer, Robber> robberMap;

    public static void create(JSONObject json) {
    	robberMap = new HashMap<>();
        JSONObject robbers;
        JSONArray robberList;
        robbers = (JSONObject)json.get("robbers");
        robberList = (JSONArray)robbers.get("list");
        
        for(Object id : robberList.toArray()){
        	Robber.addRobber(((Number) id).intValue(), json);
        }
    }

	private static void addRobber(Integer id, JSONObject json) {
		robberMap.put(id, new Robber(id, json));
	}
	
	public static Robber getRobber(Integer id) {
		return robberMap.get(id);
	}
	
	public static Set<Integer> getRobberIds(){
		return robberMap.keySet();
	}
    
	
    /* Instance context */
	private Integer id;
	private double catchProbabilityBase;
	
	public Robber(Integer id, JSONObject json) {
		this.setId(id);
		JSONObject robbers = (JSONObject)json.get("robbers");
		JSONObject catchProbability = (JSONObject) robbers.get("catchProbability");
		this.setCatchProbabilityBase(((Number)catchProbability.get(String.valueOf(id))).doubleValue());
	}


	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}
	
	public double getCatchProbabilityBase() {
		return catchProbabilityBase;
	}

	public void setCatchProbabilityBase(double catchProbabilityBase) {
		this.catchProbabilityBase = catchProbabilityBase;
	}

	public static String allRobbersToString() {
		String res = "";
		for(Integer robberId : Robber.robberMap.keySet()){
			res += Robber.robberMap.get(robberId).toString();
		}
		return res;
	}
	
	@Override
	public String toString() {
		return "Robber [id=" + id + ", catchProbabilityBase=" + catchProbabilityBase + "]"  + "\n";
	}
}
