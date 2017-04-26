class LogParser{

	constructor(simulation){
		this.simulation = simulation
	}

	handleOutput(data){

		this.simulation.results.message += data
		let objectString = `${data}`

		if (objectString.startsWith('[start]')){
			objectString = objectString.slice(7)
			this.simulation.results.patrols = JSON.parse(objectString).patrols

			return this
		}

		if (objectString.startsWith('[strategy]')){
			objectString = objectString.slice(10)
			this.simulation.results.strategies.push({probabilities: JSON.parse(JSON.parse(objectString).strategy), iterations:[]})

			return this
		}

		if (objectString.startsWith('[iteration]')){
			objectString = objectString.slice(11)
			this.simulation.results.strategies.slice(-1)[0].iterations.push(JSON.parse(objectString))

			return this
		}

		return this
	}

	handleError(data){

		this.simulation.sendError(data)
		return this
	}
}

module.exports = LogParser