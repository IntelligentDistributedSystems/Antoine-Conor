package guardianPatrol;

import java.util.ArrayList;
import java.util.List;

import org.jgrapht.GraphPath;
import org.jgrapht.graph.DefaultEdge;

public class PatrolPath {
	PatrolGraph graph;
	List<Integer> verticesIds;
	
	public PatrolPath(PatrolGraph graph, GraphPath<PatrolVertex, DefaultEdge> graphPath) {
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

	// TODO : change mathematical formula depending on C. Badicas wishes
	public double getCatchProbability(int vertexId, int robberId){
		double baseCatch = Robber.getRobber(robberId).getCatchProbabilityBase();
		int positionOnPath = this.verticesIds.indexOf(vertexId);
		//If the attack is not on the patrol path
		if(positionOnPath == -1){
			return 0.001;
		}
		
		return baseCatch * Math.pow(0.7, positionOnPath);
	}
	
	public List<Integer> getPathByGuiIds(){
		List<Integer> list = new ArrayList<>();
		for(int i : verticesIds){
			list.add(graph.getAttack(i).getGuiId());
		}
		return list;
	}
	
	@Override
	public String toString() {
		return "PatrolPath [verticesIds=" + verticesIds + "]";
	}
}