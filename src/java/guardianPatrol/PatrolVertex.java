package guardianPatrol;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.json.simple.JSONObject;

public class PatrolVertex {
	private String id;
	private int robbersInterest;
	private double guardiansCost;
	private double guardiansReward;
	private Map<String, Double> robbersCost;
	private Map<String, Double> robbersReward;
	
	public PatrolVertex(HashMap<String, Object> vertexMap) {
		robbersCost = new HashMap<>();
		robbersReward = new HashMap<>();
		this.id = (String) vertexMap.get("id");
		/* Conversion by Number necessary, as json.simple assumes Long or Double
		 * type based on comma, and an implicit conversion is not possible */
		this.robbersInterest = ((Number) vertexMap.get("robbersInterest")).intValue();
		this.guardiansCost = ((Number) vertexMap.get("guardiansCost")).doubleValue();
		this.guardiansReward = ((Number) vertexMap.get("guardiansReward")).doubleValue();
		
		JSONObject robberSettings = (JSONObject) vertexMap.get("robberSettings");
		Set<String> robberIds = Robber.getRobberIds();
		for(String id : robberIds){
			JSONObject robberValues = (JSONObject)(robberSettings.get(id));
			robbersCost.put(id, ((Number) robberValues.get("cost")).doubleValue());
			robbersReward.put(id, ((Number) robberValues.get("reward")).doubleValue());
		}
	}

	public String getId() {
		return id;
	}

	@Override
	public String toString() {
		return "PatrolVertex [id=" + id + ", robbersInterest=" + robbersInterest + ", guardiansCost=" + guardiansCost
				+ ", guardiansReward=" + guardiansReward + ", robbersCost=" + robbersCost + ", robbersReward="
				+ robbersReward + "]" + "\n";
	}
}
