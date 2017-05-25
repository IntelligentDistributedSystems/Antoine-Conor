import Graph from './settings/subsettings/Graph.js'
import Robbers from './settings/subsettings/Robbers.js'
import Saver from './settings/files/Saver'
import Loader from './settings/files/Loader'

/*
*	Settings of the simulation.
*
*	Initialize settings with default values.
*/

export default class Settings {

	constructor(iface){

		this.interface = iface

		// Fields

		this.graph = new Graph(this)
		
		this.robbers = new Robbers(this)

		this.saver = new Saver(this)
		this.loader = new Loader(this)

		// Default values

		this.init()
		this.loader.loadDefault()

	}

	init(){
		this.graph.init()
		this.robbers.init()
		$('#numberOfIterations').val(20)

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
			paths: this.graph.getSettings(),
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