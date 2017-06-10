/**
 * Loader enables us to load settings from an object or from a file.
 */
export default class Loader {

	/**
	 * @param {Settings} settings - Settings object using this loader. 
	 */
	constructor(settings){

		/**
		 * Settings object using this loader. 
		 * @type {Settings}
		 */
		this.settings = settings

		/**
		 * Default settings.
		 * @type {Object}
		 */
		this.defaultSettings = 
			{
			  "general": {
			    "numberOfIterations": 20,
			    "distanceWeight": 200
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

	/**
	 * Load the settings after checking if they are corrupted or not.
	 *
	 * @param {Object} settings - JSON representation of the settings.
	 * @return {Loader} chaining
	 */
	load(settings){
		let corruptionMessage = this.checkCorruption(settings)
		if (corruptionMessage)
			console.error(corruptionMessage)

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

	/**
	 * Load the settings object from a JSON file on client's computer.
	 * /!\ May be asynchronous depending on browsers implementation.
	 * 
	 * @return {Loader} chaining
	 */
	import(){
		const input = document.createElement('input')
		input.setAttribute('type', 'file')

		input.style.display = 'none'

		input.addEventListener('change', event => {

			const file = input.files[0]

			const reader = new FileReader()
			reader.onload = event => {
				try {
					this.load(JSON.parse(atob(event.target.result.split(',').pop())))
				} catch (e) {
					console.error('The given config file was not a valid JSON file.')
				}
			}

			reader.readAsDataURL(file)

			document.body.removeChild(input)

		})

		document.body.appendChild(input)

		input.click()

		return this
	}

	/**
	 * Initialize the graph by setting default values.
	 * 
	 * @return {Loader} chaining
	 */
	loadDefault(){
		return this.load(this.defaultSettings)
	}

	/**
	 * Check the corruption of given settings as JSON object.
	 * 
	 * @param  {Object} settings - settings to check if they are corrupted. 
	 * @return {string | false} string (== true) describing the error 
	 * 	if corrupted, false else.
	 */
	checkCorruption(settings){

		// Fields presence

		if (typeof settings === 'undefined')
			return `No settings submitted.`

		if (typeof settings.general === 'undefined')
			return `No general settings submitted.`

		if (typeof settings.paths === 'undefined')
			return `No paths settings submitted.`

		if (typeof settings.paths.vertices === 'undefined')
			return `No vertices settings submitted.`

		if (typeof settings.paths.edges === 'undefined')
			return `No edges settings submitted.`

		if (typeof settings.robbers === 'undefined')
			return `No robbers settings submitted.`

		if (typeof settings.robbers.list === 'undefined')
			return `No robbers list submitted.`

		if (typeof settings.robbers.catchProbability === 'undefined')
			return `No catch probability settings submitted.`

		// settings integrity

		const robbersList = settings.robbers.list

		if (robbersList.length === 0)
			return `Robbers list should contain at least 1 robber.`

		const verticesSet = new Set()

		if (settings.general.numberOfIterations < 1 || settings.general.numberOfIterations > 100)
			return `Invalid number of iterations.`

		if (! settings.general.distanceWeight > 0)
			return `Invalid distance weight (must be > 0).`

		// Vertcies integrity

		for (let vertice of settings.paths.vertices){
			if (verticesSet.has(vertice.id))
				return `Same id (${vertice.id}) shared by two differents target.`

			verticesSet.add(vertice.id)

			if (! (vertice.robbersInterest >= 0))
				return `Invalid robbers interest for target ${vertice.id}.`

			if (! (vertice.guardiansCost >= 0))
				return `Invalid guardians cost for target ${vertice.id}.`

			if (! (vertice.guardiansReward >= 0))
				return `Invalid guardians reward for target ${vertice.id}.`

			if (typeof vertice.robberSettings === 'undefined')
				return `No robber settings submitted for target ${vertice.id}.`

			if (typeof vertice.position !== 'object')
				return `No position settings submitted for target ${vertice.id}.`

			if (typeof vertice.position.x !== 'number')
				return `Invalid x position submitted for target ${vertice.id}.`

			if (typeof vertice.position.y !== 'number')
				return `Invalid y position submitted for target ${vertice.id}.`

			for (let robber of robbersList){

				if (typeof vertice.robberSettings[robber] === 'undefined')
					return `No settings submitted for rober ${robber} and target ${vertice.id}.`

				if (! (vertice.robberSettings[robber].cost >= 0))
					return `Invalid robber cost for rober ${robber} and target ${vertice.id}.`

				if (! (vertice.robberSettings[robber].reward >= 0))
					return `Invalid robber reward for rober ${robber} and target ${vertice.id}.`
			}
		}

		if (! verticesSet.has(0))
			return `No base vertex submitted.`

		// Edges integrity

		for (let edge of settings.paths.edges){
			if (typeof edge.source === 'undefined')
				return `No source submitted for a given edge.`
			if (typeof edge.target === 'undefined')
				return `No target submitted for a given edge.`
			if (edge.length < 0)
				return `Invalid length submitted for a given edge.`
			if (! (verticesSet.has(edge.source)))
				return `The source ${edge.source} does not exist.`
			if (! (verticesSet.has(edge.target)))
				return `The target ${edge.target} does not exist.`
		}

		if (settings.paths.edges.length === 0)
			return 'The path should have at least 1 edge.'

		// Catch probability integrity

		for (let robber of robbersList){
			if (! (settings.robbers.catchProbability[robber] >= 0 
				&& settings.robbers.catchProbability[robber] <= 1))
				return `Invalid catch probability for robber ${robber}.`
		}

		return false
	}
}