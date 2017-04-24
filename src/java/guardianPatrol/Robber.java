package guardianPatrol;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

public class Robber {
	/* Static context */
	private static List<Robber> robbers;

    public static void create(JSONObject json) {
    	robbers = new ArrayList<>();
        JSONObject robbers;
        JSONArray robberList;
        robbers = (JSONObject)json.get("robbers");
        robberList = (JSONArray)robbers.get("list");
        
        for(Object id : robberList.toArray()){
        	Robber.addRobber(((Number) id).intValue(), json);
        }
    }

	private static void addRobber(Integer id, JSONObject json) {
		robbers.add(new Robber(id, json));
	}
	
	public static Robber getRobber(Integer id) {
		return robbers.get(id);
	}   
	
	public static Map<Integer, Integer> getIdsByGuiIds() {
		Map<Integer, Integer> map = new HashMap<>();
		for(int id = 0; id < robbers.size(); id++){
			map.put(robbers.get(id).getGuiId(), id);
		}
		return map;
	}    
	
	public static int getNumberOfRobbers(){
		return robbers.size();
	}
	
	public static String allRobbersToString() {
		String res = "";
		for(Robber r : robbers){
			res += r.toString();
		}
		return res;
	}
	
	
    /* Instance context */
	private Integer guiId;
	private double catchProbabilityBase;
	
	public Robber(Integer id, JSONObject json) {
		this.setGuiId(id);
		JSONObject robbers = (JSONObject)json.get("robbers");
		JSONObject catchProbability = (JSONObject) robbers.get("catchProbability");
		this.setCatchProbabilityBase(((Number)catchProbability.get(String.valueOf(id))).doubleValue());
	}


	public Integer getGuiId() {
		return guiId;
	}

	public void setGuiId(Integer guiId) {
		this.guiId = guiId;
	}
	
	public double getCatchProbabilityBase() {
		return catchProbabilityBase;
	}

	public void setCatchProbabilityBase(double catchProbabilityBase) {
		this.catchProbabilityBase = catchProbabilityBase;
	}
	
	@Override
	public String toString() {
		return "Robber [guiId=" + guiId + ", catchProbabilityBase=" + catchProbabilityBase + "]"  + "\n";
	}
}
