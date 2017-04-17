class Properties {
	constructor(){
		this.path = new Graph()
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
		.link('n0', 'n1')
		.sort()

		return this
	}

	getProperties(){
		return {
			paths: this.path.getProperties(),
			general: this.generalParameters,
			robbers: this.robberParameters,
			attack: this.attackParameters
		}
	}
}