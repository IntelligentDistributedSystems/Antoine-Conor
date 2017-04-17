package guardianPatrol;

import java.util.HashMap;

import org.jgrapht.graph.DefaultEdge;
import org.jgrapht.graph.SimpleGraph;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Class representing a patrolling game map :
 * 	- includes a list of possible attack points (nodes)
 *  - includes a base (special node, unique)
 *  - includes a set of edges with determine whether a guardian
 *  	can go from one attack point to another (represents
 *  	physical constraints)
 * @author ConorRyan
 *
 */

/*
 * Assuming JSON Structure (node id 0 is considered to be the base):
 * 
{
    "graph": {
        "nodes": [
            {
                "id": "0",
            },
            {
                "id": "1",
            },
            {
                "id": "2",
            }
        ],
        "edges": [
            {
                "source": "0",
                "target": "1"
            }
        ]
    }
}
 */


public class PatrolGraph extends SimpleGraph<String, DefaultEdge> {
	
	private static final long serialVersionUID = -7038166255538966671L;
	
	/* TODO : remove test String */
	public static void main(String[] args) {
		String jsonString = "{\"graph\":{\"nodes\":[{\"id\":\"0\",},{\"id\":\"1\",},{\"id\":\"2\",}],\"edges\":[{\"source\":\"0\",\"target\":\"1\"}]}}";
		new PatrolGraph(jsonString);
	}
	
	public PatrolGraph(String jsonString) {
		super(DefaultEdge.class);

		JSONObject json, graph;
		JSONArray nodes, edges;
		
		json = new JSONObject(jsonString);
		graph = json.getJSONObject("graph");
		nodes = graph.getJSONArray("nodes");
		edges = graph.getJSONArray("edges");
		
		// nodes.toList().getClass() == java.util.ArrayList<HashMap>
		for(Object node : nodes.toList()){
			HashMap<String, String> nodeMap = (HashMap<String, String>)(node);
			String id = nodeMap.get("id");
			this.addVertex(id);
		}
		
		// edges.toList().getClass() == java.util.ArrayList<HashMap>
		for(Object edge : edges.toList()){
			HashMap<String, String> edgeMap = (HashMap<String, String>)(edge);
			String source = edgeMap.get("source");
			String target = edgeMap.get("target");
			this.addEdge(source, target);
		}
	}
}
