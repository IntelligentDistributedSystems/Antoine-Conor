package guardianPatrol;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;

import org.jgrapht.GraphPath;
import org.jgrapht.graph.DefaultEdge;
import org.jgrapht.graph.GraphWalk;
import org.jgrapht.graph.SimpleGraph;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

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

/*
 * Assuming JSON Structure (vertex id 0 is considered to be the base):
 * 
{
    "graph": {
        "vertices": [
            {
                "id": "0",
            },
            {
                "id": "1",
            }
        ],
        "edges": [
            {
                "source": "1",
                "target": "0"
            },
            {
                "source": "0",
                "target": "2"
            }
        ]
    }
}
 */


public class PatrolGraph extends SimpleGraph<String, DefaultEdge> {
	
	private static final long serialVersionUID = -7038166255538966671L;
	private static final String baseID = "0";
	
	private PatrolConfig config;
	
	/* TODO : remove test String */
	@SuppressWarnings("unused")
	public static void main(String[] args) {
		String example1 = "/home/conor/Antoine-Conor/tests/input1.json";
		String example2 = "/home/conor/Antoine-Conor/tests/input2.json";
		new PatrolGraph(example2);
	}
	/**
	 * Constructor for PatrolGraph class
	 * @param jsonString
	 * A JSON String with following structure : {"graph":{"vertices":[{"id":"0",},{"id":"1",}],"edges":[{"source":"1","target":"0"},{"source":"0","target":"2"}]}}
	 * @throws ParseException 
	 * @throws IOException 
	 * @throws FileNotFoundException 
	 */
	public PatrolGraph(String filePath) {
		super(DefaultEdge.class);
		config = PatrolConfig.create();

		JSONParser parser = new JSONParser();
		JSONObject json, graph;
		JSONArray vertices, edges;
		
		try {
			
			json = (JSONObject) parser.parse(new FileReader(filePath));
			graph = (JSONObject) json.get("graph");
			vertices = (JSONArray) graph.get("vertices");
			edges = (JSONArray) graph.get("edges");
			
			// vertices.toArray() == java.util.ArrayList<HashMap>
			for(Object vertex : vertices.toArray()){
				@SuppressWarnings("unchecked")
				HashMap<String, String> vertexMap = (HashMap<String, String>)(vertex);
				String id = vertexMap.get("id");
				this.addVertex(id);
			}
			
			// edges.toList().getClass() == java.util.ArrayList<HashMap>
			for(Object edge : edges.toArray()){
				@SuppressWarnings("unchecked")
				HashMap<String, String> edgeMap = (HashMap<String, String>)(edge);
				String source = edgeMap.get("source");
				String target = edgeMap.get("target");
				this.addEdge(source, target);
			}
			
			SecurityEnvironment.logger.info("Setting number patrols");
			config.setNumberPossiblePatrols(this.getAllPossiblePaths().size());
			
		// TODO : Correctly catch exceptions
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} catch (ParseException e) {
			e.printStackTrace();
		}
	}
	
	
	/**
	 * Default usage for getAllPossiblePaths (from base vertex)
	 * @return A set of all possible simple paths from the base 
	 */
	private Set<GraphPath<String, DefaultEdge>> getAllPossiblePaths(){
		return this.getAllPossiblePaths(PatrolGraph.baseID, new ArrayList<String>());
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
	private Set<GraphPath<String, DefaultEdge>> getAllPossiblePaths(String source, List<String> visited){
		visited.add(source);
		
		/* Get all the vertices that are neighbors to the source node.
		 * Note : using sets to not check duplication.
		 */
		Set<DefaultEdge> edges = this.edgesOf(source);
		Set<String> neighbors = new HashSet<String>();
		for(DefaultEdge edge : edges){
			String edgeSource = this.getEdgeSource(edge);
			String edgeTarget = this.getEdgeTarget(edge);
			neighbors.add(edgeSource);
			neighbors.add(edgeTarget);
		}
		
		/* Remove all vertices that are already visited (can't go back) */
		neighbors.removeAll(visited);
		
		/* If they're are no neighbors return the current path, else return the paths of all neighbors
		 * NOTE : possible to add partial paths to program by removing if(neighbors.isEmpty()) condition
		 */
		Set<GraphPath<String, DefaultEdge>> result = new HashSet<GraphPath<String,DefaultEdge>>();
		if(neighbors.isEmpty()){
			GraphPath<String, DefaultEdge> path = new GraphWalk<String, DefaultEdge>(this, visited, 0);
			result.add(path);
		}
		else {
			for(String neighbor : neighbors){
				/* Essential to make a new list of visited points, for each "direction" from source vertex */
				List<String> newVisited = new ArrayList<String>(visited);
				result.addAll(this.getAllPossiblePaths(neighbor, newVisited));
			}
		}
		return result;
	}
}
