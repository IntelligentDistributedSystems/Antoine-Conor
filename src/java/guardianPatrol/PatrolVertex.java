package guardianPatrol;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.json.simple.JSONObject;

/**
 * This class is a special type of vertex that contains
 * date relevant to the patrol game
 * @author ConorRyan
 *
 */
public class PatrolVertex {
	private int guiId;
	private int robbersInterest;
	private double guardiansCost;
	private double guardiansReward;
	private Map<Integer, Double> robbersCost;
	private Map<Integer, Double> robbersReward;
	
	public PatrolVertex(HashMap<String, Object> vertexMap) {
		robbersCost = new HashMap<>();
		robbersReward = new HashMap<>();
		this.guiId = ((Number) vertexMap.get("id")).intValue();
		/* Conversion by Number necessary, as json.simple assumes Long or Double
		 * type based on comma, and an implicit conversion is not possible */
		this.robbersInterest = ((Number) vertexMap.get("robbersInterest")).intValue();
		this.guardiansCost = ((Number) vertexMap.get("guardiansCost")).doubleValue();
		this.guardiansReward = ((Number) vertexMap.get("guardiansReward")).doubleValue();
		
		JSONObject robberSettings = (JSONObject) vertexMap.get("robberSettings");
		Set<Integer> robberIds = Robber.getRobberIds();
		for(Integer id : robberIds){
			JSONObject robberValues = (JSONObject)(robberSettings.get(String.valueOf(id)));
			robbersCost.put(id, ((Number) robberValues.get("cost")).doubleValue());
			robbersReward.put(id, ((Number) robberValues.get("reward")).doubleValue());
		}
	}


	public int getGuiId() {
		return guiId;
	}


	public double getGuardiansCost() {
		return guardiansCost;
	}


	public double getGuardiansReward() {
		return guardiansReward;
	}


	public double getRobberCost(int id){
		return this.robbersCost.get(id);
	}
	
	public double getRobberReward(int id){
		return this.robbersReward.get(id);
	}


	@Override
	public String toString() {
		return "PatrolVertex [id=" + guiId + ", robbersInterest=" + robbersInterest + ", guardiansCost=" + guardiansCost
				+ ", guardiansReward=" + guardiansReward + ", robbersCost=" + robbersCost + ", robbersReward="
				+ robbersReward + "]" + "\n";
	}
}
