/*
*	Loader enables us to load settings from an object or from a file.
*/

export default class Loader {
	constructor(settings){
		this.settings = settings

		this.defaultSettings = 
			{
			  "general": {
			    "numberOfIterations": 20,
			    "distanceWeight": 1
			  },
			  "paths": {
			    "vertices": [
			      {
			        "id": 0,
			        "position": {
			          "x": 93.74723822180408,
			          "y": 20
			        },
			        "robbersInterest": 1,
			        "guardiansCost": 1,
			        "guardiansReward": 1,
			        "robberSettings": {
			          "0": {
			            "cost": 1,
			            "reward": 1
			          }
			        }
			      },
			      {
			        "id": 1,
			        "position": {
			          "x": 20.252761778195918,
			          "y": 20
			        },
			        "robbersInterest": 1,
			        "guardiansCost": 1,
			        "guardiansReward": 1,
			        "robberSettings": {
			          "0": {
			            "cost": 1,
			            "reward": 1
			          }
			        }
			      }
			    ],
			    "edges": [
			      {
			        "source": 0,
			        "target": 1,
			        "length": 73.49447644360816
			      }
			    ]
			  },
			  "robbers": {
			    "list": [
			      0
			    ],
			    "catchProbability": {
			      "0": 0.5
			    }
			  }
			}
	}

	/*
	*	Load the settings (Object) after checking if they are corrupted or not.
	*/
	load(settings){
		// TODO : Verify integrity.
		this.settings.init()

		$('#numberOfIterations').val(settings.general.numberOfIterations)
		$('#distanceWeight').val(settings.general.distanceWeight)

		// Id maps (loaded ids => current ids)

		const verticesIdMap = new Map()
		const robbersIdMap = new Map()

		settings.robbers.list.forEach(robberId => {
			robbersIdMap.set(robberId, this.settings.robbers.newRobber(1 - settings.robbers.catchProbability[`${robberId}`]))
		})

		settings.paths.vertices.forEach(vertex => {

			verticesIdMap.set(vertex.id, this.settings.graph.addNode(vertex.position, vertex.id === 0, vertex.robbersInterest, vertex.guardiansCost, vertex.guardiansReward))

			const newNodeId = verticesIdMap.get(vertex.id)

			settings.robbers.list.forEach(robberId => {
				const newRobberId = robbersIdMap.get(robberId)

				this.settings.graph.cy.nodes(`[id = "${newNodeId}"]`).data('robberSettings').set(newRobberId, vertex.robberSettings[robberId])
			})

		})

		settings.paths.edges.forEach(edge => {
			this.settings.graph.link(
				verticesIdMap.get(edge.source), 
				verticesIdMap.get(edge.target))
		})

		this.settings.graph.cy.fit()

		console.log('Settings loaded')

		return this
	}

	/*
	*	Load the settings object from a JSON file on client's computer.
	*/
	import(){
		const input = document.createElement('input')
		input.setAttribute('type', 'file')

		input.style.display = 'none'

		input.addEventListener('change', event => {

			const file = input.files[0]

			const reader = new FileReader()
			reader.onload = event => {
				this.load(JSON.parse(atob(event.target.result.split(',').pop())))
			}

			reader.readAsDataURL(file)

			document.body.removeChild(input)

		})

		document.body.appendChild(input)

		input.click()

		return this
	}

	/*
	*	Initialize the graph by setting default values.
	*/
	loadDefault(){
		return this.load(this.defaultSettings)
	}
}