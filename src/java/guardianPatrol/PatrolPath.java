package guardianPatrol;

import java.util.ArrayList;
import java.util.List;

import org.jgrapht.GraphPath;
import org.jgrapht.graph.DefaultEdge;
import org.jgrapht.graph.DefaultWeightedEdge;
import org.json.simple.JSONArray;

/**
 * This class represents a path throughout the PatrolGraph. All paths start with the base but it 
 * is removed to simplify following methods.
 * @author ConorRyan
 *
 */
public class PatrolPath {
	
	private final static double DISTANCE_BASE = 700.0;
	
	PatrolGraph graph;
	List<Integer> verticesIds;
	
	public PatrolPath(PatrolGraph graph, GraphPath<PatrolVertex, DefaultWeightedEdge> graphPath) {
		this.graph = graph;
		verticesIds = new ArrayList<>();
		List<PatrolVertex> vertices = graphPath.getVertexList();
		//Remove the base, unhelpful since all paths start at base
		vertices.remove(graph.getBase());
		
		for(PatrolVertex v : vertices){
			int id = graph.getAttackIndex(v);
			verticesIds.add(id);
		}
	}

	
		
	public double getCatchProbability(int vertexId, int robberId){
		double robberBase = Robber.getRobber(robberId).getCatchProbabilityBase();
		int positionOnPath = this.verticesIds.indexOf(vertexId);
		PatrolVertex end = graph.getAttack(vertexId);
		//If the attack is not on the patrol path
		if(positionOnPath == -1){
			return 0.0;
		}
		
		double length = 0.0;
		PatrolVertex source = graph.getBase();
		PatrolVertex target = null;
		int counter = 0;
		
		while(target != end){
			target = graph.getAttack(this.verticesIds.get(counter));
			DefaultWeightedEdge e = graph.getEdge(source, target);
			length += graph.getEdgeWeight(e);
			
			source = target;
			counter++;
		}
		
		// Catch probability formula
		return (DISTANCE_BASE / ( length + DISTANCE_BASE )) * robberBase;
	}
	
	/* 
	 * Old version, without distances (only using number of vertexes in path)
	 * 
	public double getCatchProbability(int vertexId, int robberId){
		double baseCatch = Robber.getRobber(robberId).getCatchProbabilityBase();
		int positionOnPath = this.verticesIds.indexOf(vertexId);
		//If the attack is not on the patrol path
		if(positionOnPath == -1){
			return 0.0;
		}
		
		return baseCatch * Math.pow(0.7, positionOnPath);
	}
	*/
	
	/**
	 * Method to get a list of points from the graph using GUI id, as the GUI uses different IDs
	 * to the Jason application (to simplify agent code)
	 */
	public JSONArray getPathByGuiIds(){
		JSONArray list = new JSONArray();
		list.add(0);
		for(int i = 0; i < verticesIds.size(); i++){
			list.add(graph.getAttack(verticesIds.get(i)).getGuiId());
		}
		return list;
	}
	
	@Override
	public String toString() {
		return "PatrolPath [verticesIds=" + verticesIds + "]";
	}
}
