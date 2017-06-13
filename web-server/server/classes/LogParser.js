/**
 * Class handling the Jason output.
 */
class LogParser{

	/**
	 * @param  {Simulation} simulation - The simulation using this handler.
	 */
	constructor(simulation){
		/**
		 * The simulation using this handler.
		 * @type {Simulation}
		 */
		this.simulation = simulation
	}

	/**
	 * Jason's output handler.
	 * @param  {StringBuffer} data - Output
	 * @return {LogParser} chaining
	 */
	handleOutput(data){

		// The buffered data can be multiline.

		const str = data.toString(), lines = str.split(/(\r?\n)/g)

		lines.forEach(line => {

			let objectString

			if ((objectString = line.replace('\n', '')) == '')
				return 

			//this.simulation.logInfo(`Parsing : '${objectString}'`)

			if (objectString.startsWith('[start]')){
				objectString = objectString.slice(7)
				this.simulation.results.patrols = JSON.parse(objectString).patrols
				this.simulation.totalNumberOfStrategies = JSON.parse(objectString).numberStrategies

				return
			}

			if (objectString.startsWith('[strategy]')){
				objectString = objectString.slice(10)
				this.simulation.results.strategies.push({probabilities: JSON.parse(JSON.parse(objectString).strategy), iterations:[]})

				this.simulation.progress += 1/this.simulation.totalNumberOfStrategies*100

				this.simulation.sendProgress()

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

	/**
	 * Handle the error messages.
	 * @param  {StringBuffer} data - The error message.
	 * @return {LogParser} chaining
	 */
	handleError(data){

		this.simulation.sendError(data)
		return this
	}
}

module.exports = LogParser