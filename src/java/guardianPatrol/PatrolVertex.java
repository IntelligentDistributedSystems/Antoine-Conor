package guardianPatrol;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.json.simple.JSONObject;

public class PatrolVertex {
	private String id;
	private long robbersInterest;
	private long guardiansCost;
	private long guardiansReward;
	private Map<String, Long> robbersCost;
	private Map<String, Long> robbersReward;
	
	public PatrolVertex(HashMap<String, Object> vertexMap) {
		robbersCost = new HashMap<>();
		robbersReward = new HashMap<>();
		this.id = (String) vertexMap.get("id");
		this.robbersInterest = (long)vertexMap.get("robbersInterest");
		this.guardiansCost = (long)vertexMap.get("guardiansCost");
		this.guardiansReward = (long)vertexMap.get("guardiansReward");
		
		JSONObject robberSettings = (JSONObject) vertexMap.get("robberSettings");
		Set<String> robberIds = Robber.getRobberIds();
		for(String id : robberIds){
			JSONObject robberValues = (JSONObject)(robberSettings.get(id));
			robbersCost.put(id, (Long) robberValues.get("cost"));
			robbersReward.put(id, (Long) robberValues.get("reward"));
		}
	}

	public String getId() {
		return id;
	}
}
