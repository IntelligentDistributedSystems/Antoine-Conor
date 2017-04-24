/*
*	Settings of the simulation.
*
*	Initialize settings with default values.
*/

class Settings {

	constructor(){

		// Fields

		this.path = new Graph(this)
		
		this.robbers = new Robbers(this)

		// Default values

		this.initPath()

		this.initRobbers()

	}

	/*
	*	Create a default path and then sort the targets.
	*/

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

	/*
	*	Create the default robbers.
	*/

	initRobbers(){

		this.robbers.newRobber()

		return this
	}

	/*
	*	Return settings as as JSON object.
	*
	*	Those settings can be send to the backend.
	*/

	getSettings(){
		return {
			general: this.getGeneralSettings(),
			paths: this.path.getSettings(),
			robbers: this.robbers.getSettings()
		}
	}

	/*
	*	Concatenate the general settings in one 
	*	JSON object.
	*/

	getGeneralSettings(){
		return {
			numberOfIterations: parseInt($('#numberOfIterations').val())
		}
	}
}