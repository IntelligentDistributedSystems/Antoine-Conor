import Graph from './settings/subsettings/Graph.js'
import Robbers from './settings/subsettings/Robbers.js'
import Saver from './settings/files/Saver'
import Loader from './settings/files/Loader'

/**
 * Settings of the simulation.
 *
 * Initialize settings with default values.
 */

export default class Settings {

	/**
	 * @param  {Interface} iface - Interface object using this settings.
	 */
	constructor(iface){
		
		// Fields

		/**
		 * Interface object using this settings.
		 * @type {Interface}
		 */
		this.interface = iface

		/**
		 * The graph configuration.
		 * @type {Graph}
		 */
		this.graph = new Graph(this)
		
		/**
		 * The robbers configuration.
		 * @type {Robbers}
		 */
		this.robbers = new Robbers(this)

		/**
		 * A class enabling us to save the configuration (or any text file) on the client's computer.
		 * @type {Saver}
		 */
		this.saver = new Saver(this)

		/**
		 * A class enabling us to load a configuration from the client's computer.
		 * @type {Loader}
		 */
		this.loader = new Loader(this)

		// Default values

		this.init()
		this.loader.loadDefault()

	}

	/**
	 * (Re)-Initialize every sub-settings. 
	 * 
	 * @return {Settings} chaining
	 */
	init(){
		this.graph.init()
		this.robbers.init()
		$('#numberOfIterations').val(20)

		return this
	}

	/**
	 * Return settings as as JSON object.
	 *
	 * Those settings can be sent to the backend.
	 *
	 * @return {Object} JSON-ed concatenated settings.
	 */

	getSettings(){
		return {
			general: this.getGeneralSettings(),
			paths: this.graph.getSettings(),
			robbers: this.robbers.getSettings()
		}
	}

	/**
	 *	Concatenate the general settings in one 
	 *	JSON object.
	 *
	 * @return {Object} concatenated settings.
	 */

	getGeneralSettings(){
		return {
			numberOfIterations: parseInt($('#numberOfIterations').val()),
			distanceWeight: parseInt($('#distanceWeight').val())
		}
	}
}