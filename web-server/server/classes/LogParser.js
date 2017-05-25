class LogParser{

	constructor(simulation){
		this.simulation = simulation
	}

	handleOutput(data){

		// The buffered data can be multiline.

		const str = data.toString(), lines = str.split(/(\r?\n)/g)

		lines.forEach(line => {

			let objectString

			if ((objectString = line.replace('\n', '')) == '')
				return 

			this.simulation.progress = Math.floor(Math.random() * 100)

			//this.simulation.logInfo(`Parsing : '${objectString}'`)

			if (objectString.startsWith('[start]')){
				objectString = objectString.slice(7)
				this.simulation.results.patrols = JSON.parse(objectString).patrols

				return
			}

			if (objectString.startsWith('[strategy]')){
				objectString = objectString.slice(10)
				this.simulation.results.strategies.push({probabilities: JSON.parse(JSON.parse(objectString).strategy), iterations:[]})

				return
			}

			if (objectString.startsWith('[iteration]')){
				objectString = objectString.slice(11)
				this.simulation.results.strategies.slice(-1)[0].iterations.push(JSON.parse(objectString))

				return
			}

			this.simulation.logError(`Unhandled output: ${objectString}`)

		})

		return this
	}

	handleError(data){

		this.simulation.sendError(data)
		return this
	}
}

module.exports = LogParser