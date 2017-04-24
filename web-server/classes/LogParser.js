class LogParser{

	constructor(simulation){
		this.simulation = simulation
	}

	handleOutput(data){

		this.simulation.results.message += data
		return this
	}

	handleError(data){

		this.simulation.sendError(data)
		return this
	}
}

module.exports = LogParser