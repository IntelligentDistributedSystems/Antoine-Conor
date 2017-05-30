package guardianPatrol;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.jgrapht.GraphPath;
import org.jgrapht.graph.DefaultWeightedEdge;
import org.jgrapht.graph.GraphWalk;
import org.jgrapht.graph.SimpleWeightedGraph;
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

public class PatrolGraph extends SimpleWeightedGraph<PatrolVertex, DefaultWeightedEdge> {
	
	
	private static final long serialVersionUID = -7038166255538966671L;
	private static final int baseID = 0;
	
	private Config config;
	
	/**
	 * The base of the graph, where all patrols must start. It is also impossible for a
	 * robber to attack this vertex
	 */
	private PatrolVertex base;
	
	/**
	 * List of all possible attacks for the robber. Their index in this list is used
	 * for the definition of guardians patrols
	 */
	private List<PatrolVertex> attacks;
	
	/**
	 * List of paths the guardian can follow to patrol
	 */
	private List<PatrolPath> patrols;
	
	/**
	 * Constructor for PatrolGraph class
	 * @param jsonString JSON String containing all configuration
	 */
	public PatrolGraph(JSONObject json) {
		super(DefaultWeightedEdge.class);
		config = Config.create();
		attacks = new ArrayList<>();
		patrols = new ArrayList<>();
		
		JSONObject paths;
		JSONArray vertices;
		JSONArray edges;
		
		paths = (JSONObject) json.get("paths");
		vertices = (JSONArray) paths.get("vertices");
		edges = (JSONArray) paths.get("edges");
		
		// Add all vertices in JSON
		for(Object vertex : vertices.toArray()){
			@SuppressWarnings("unchecked")
			HashMap<String, Object> vertexMap = (HashMap<String, Object>)(vertex);
			this.addVertex(new PatrolVertex(vertexMap));
		}
		
		// Read each edge in JSON and determine the two vertices, before adding edge
		for(Object edge : edges.toArray()){
			@SuppressWarnings("unchecked")
			HashMap<String, Integer> edgeMap = (HashMap<String, Integer>)(edge);
			PatrolVertex source = this.getVertexByGuiId(((Number)(edgeMap.get("source"))).intValue());
			PatrolVertex target = this.getVertexByGuiId(((Number)(edgeMap.get("target"))).intValue());
			float length = ((Number)(edgeMap.get("length"))).floatValue();
			try {
				DefaultWeightedEdge e = this.addEdge(source, target);
				this.setEdgeWeight(e, length);
			} catch (NullPointerException npe) {
				System.out.println("JSON invalid - edge references non existing vertex");
			}
		}
		

		/*
		 * We add each GraphPath representing a possible patrol by the list of attack point
		 * ids defined by List<PatrolVertex> attacks
		 */
		for(GraphPath<PatrolVertex, DefaultWeightedEdge> graphPath : this.getAllPossiblePaths()){
			patrols.add(new PatrolPath(this, graphPath));
		}
		
		config.setNumberPossiblePatrols(patrols.size());
		config.setNumberPossibleAttacks(attacks.size());
	}

	/**
	 * Adds a vertex to the PatrolGraph. If the vertex is not the base, adds
	 * it also to the list of possible attacks
	 * @param v the vertex to add
	 * @return true if the add is successful
	 */
	@Override 
	public boolean addVertex(PatrolVertex v){
		if(v.getGuiId() == baseID){
			base = v;
		} else {
			this.attacks.add(v);
		}
		return super.addVertex(v);
	}
	
	
	public PatrolVertex getAttack(int index){
		return attacks.get(index);
	}
	
	public int getAttackIndex(PatrolVertex v){
		return attacks.indexOf(v);
	}
	
	public PatrolVertex getVertexByGuiId(int guiId){
		if(guiId == baseID){
			return base;
		}
		for(PatrolVertex v : attacks){
			if(v.getGuiId() == guiId){
				return v;
			}
		}
		return null;
	}
	
	public PatrolPath getPatrol(int index){
		return this.patrols.get(index);
	}
	
	public JSONArray getPatrolsJSONArray(){
		JSONArray array = new JSONArray();
		for(PatrolPath p : patrols){
			array.add(p.getPathByGuiIds());
		}
		return array;
	}

	
	/**
	 * Default usage for getAllPossiblePaths (from base vertex)
	 * @return A set of all possible simple paths from the base
	 * @see guardianPatrol.PatrolGraph#getAllPossiblePaths(PatrolVertex, List) 
	 */
	private Set<GraphPath<PatrolVertex, DefaultWeightedEdge>> getAllPossiblePaths(){
		return this.getAllPossiblePaths(base, new ArrayList<PatrolVertex>());
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
	private Set<GraphPath<PatrolVertex, DefaultWeightedEdge>> getAllPossiblePaths(PatrolVertex source, List<PatrolVertex> visited){
		visited.add(source);
		
		/* Get all the vertices that are neighbors to the source node.
		 * Note : using sets to not check duplication.
		 */
		Set<DefaultWeightedEdge> edges = this.edgesOf(source);
		Set<PatrolVertex> neighbors = new HashSet<PatrolVertex>();
		for(DefaultWeightedEdge edge : edges){
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
		Set<GraphPath<PatrolVertex, DefaultWeightedEdge>> result = new HashSet<GraphPath<PatrolVertex,DefaultWeightedEdge>>();
		if(neighbors.isEmpty()){
			GraphPath<PatrolVertex, DefaultWeightedEdge> path = new GraphWalk<PatrolVertex, DefaultWeightedEdge>(this, visited, 0);
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
	
	public PatrolVertex getBase() {
		return base;
	}

	@Override
	public String toString() {
		return "PatrolGraph [config=" + config  +",  vertexSet()=" + vertexSet() + "]";
	}
}
