class Settings {
	constructor(){
		this.path = new Graph(this)
		
		this.numberOfRobbersCreated = 0

		this.robbers = []

		this.initPath()
	}

	initPath(){
		
		this.path.addNode({
			x: 50,
			y: 45
		}, true)
		.addNode({
			x: 150,
			y: 45
		})
		.link('0', '1')
		.sort()

		return this
	}

	getSettings(){
		return {
			paths: this.path.getSettings(),
			general: this.generalSettings
		}
	}

	get generalSettings(){
		return {}
	}

	newRobber(){

		const robberId = numberOfRobbersCreated++

		this.robbers.push(robberId)

		this.graph.cy.nodes().each(node => node.put(robberId, {
			cost: 2,
			reward: 1,
			caughtProbability: 0.3
		}))
	}
}