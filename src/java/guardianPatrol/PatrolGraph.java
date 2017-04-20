package guardianPatrol;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.jgrapht.GraphPath;
import org.jgrapht.graph.DefaultEdge;
import org.jgrapht.graph.GraphWalk;
import org.jgrapht.graph.SimpleGraph;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

/**
 * This class is a specialized implementation of jGraphT's Graph :
 * 	- includes a list of possible attack points (vertices)
 *  - includes a base (special vertex, unique)
 *  - includes a set of edges with determine whether a guardian
 *  	can go from one attack point to another (represents
 *  	physical constraints)
 * @author ConorRyan
 *
 */

public class PatrolGraph extends SimpleGraph<PatrolVertex, DefaultEdge> {
	
	
	private static final long serialVersionUID = -7038166255538966671L;
	private static final String baseID = "0";
	
	private Config config;
	
	/**
	 * Constructor for PatrolGraph class
	 * @param jsonString
	 * A JSON String with following structure : {"graph":{"vertices":[{"id":"0",},{"id":"1",}],"edges":[{"source":"1","target":"0"},{"source":"0","target":"2"}]}}
	 */
	public PatrolGraph(JSONObject json) {
		super(DefaultEdge.class);
		config = Config.create();

		JSONObject graph;
		JSONArray vertices;
		JSONArray edges;
		
		graph = (JSONObject) json.get("paths");
		vertices = (JSONArray) graph.get("vertices");
		edges = (JSONArray) graph.get("edges");
		
		// vertices.toArray() == java.util.ArrayList<HashMap>
		for(Object vertex : vertices.toArray()){
			@SuppressWarnings("unchecked")
			HashMap<String, Object> vertexMap = (HashMap<String, Object>)(vertex);
			this.addVertex(new PatrolVertex(vertexMap));
		}
		
		// edges.toList().getClass() == java.util.ArrayList<HashMap>
		for(Object edge : edges.toArray()){
			@SuppressWarnings("unchecked")
			HashMap<String, String> edgeMap = (HashMap<String, String>)(edge);
			PatrolVertex source = this.getVertex(edgeMap.get("source"));
			PatrolVertex target = this.getVertex(edgeMap.get("target"));
			this.addEdge(source, target);
		}
		
		config.setNumberPossiblePatrols(this.getAllPossiblePaths().size());
		config.setNumberPossibleAttacks(this.vertexSet().size());
	}
	
	public PatrolVertex getVertex(String id){
		for(PatrolVertex vertex : this.vertexSet()){
			if(vertex.getId().equals(id)){
				return vertex;
			}
		}
		return null;
	}
	
	/**
	 * Default usage for getAllPossiblePaths (from base vertex)
	 * @return A set of all possible simple paths from the base 
	 */
	private Set<GraphPath<PatrolVertex, DefaultEdge>> getAllPossiblePaths(){
		return this.getAllPossiblePaths(this.getVertex(PatrolGraph.baseID), new ArrayList<PatrolVertex>());
	}
	
	/**
	 * Function to get all possible simple paths (not going by any vertex twice) from the base vertex.
	 * Contrary to most algorithms, this one doesn't try to optimize path length or visited vertices,
	 * and is used only to find possible guardian paths, not the best one.
	 * @param source
	 * The source vertex
	 * @param visited
	 * Vertexes already visited on the current path
	 * @return A set of all possible simple paths from the source
	 */
	private Set<GraphPath<PatrolVertex, DefaultEdge>> getAllPossiblePaths(PatrolVertex source, List<PatrolVertex> visited){
		visited.add(source);
		
		/* Get all the vertices that are neighbors to the source node.
		 * Note : using sets to not check duplication.
		 */
		Set<DefaultEdge> edges = this.edgesOf(source);
		Set<PatrolVertex> neighbors = new HashSet<PatrolVertex>();
		for(DefaultEdge edge : edges){
			PatrolVertex edgeSource = this.getEdgeSource(edge);
			PatrolVertex edgeTarget = this.getEdgeTarget(edge);
			neighbors.add(edgeSource);
			neighbors.add(edgeTarget);
		}
		
		/* Remove all vertices that are already visited (can't go back) */
		neighbors.removeAll(visited);
		
		/* If they're are no neighbors return the current path, else return the paths of all neighbors
		 * NOTE : possible to add partial paths to program by removing if(neighbors.isEmpty()) condition
		 */
		Set<GraphPath<PatrolVertex, DefaultEdge>> result = new HashSet<GraphPath<PatrolVertex,DefaultEdge>>();
		if(neighbors.isEmpty()){
			GraphPath<PatrolVertex, DefaultEdge> path = new GraphWalk<PatrolVertex, DefaultEdge>(this, visited, 0);
			result.add(path);
		}
		else {
			for(PatrolVertex neighbor : neighbors){
				/* Essential to make a new list of visited points, for each "direction" from source vertex */
				List<PatrolVertex> newVisited = new ArrayList<PatrolVertex>(visited);
				result.addAll(this.getAllPossiblePaths(neighbor, newVisited));
			}
		}
		return result;
	}
}
