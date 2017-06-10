import Settings from './interface/Settings'
import Results from './interface/Results'

/**
 *	Interface between the client side and the back-end.
 *
 *	The interface has settings and a socket enabling it 
 *	to send and receive data from the server running the
 *	Java MAS simulation.
 */

export default class Interface{  
	
	/**
	 * Constructor setting fields and listeners.
	 */
	constructor(){

		// Fields

		/**
		 * Socket to communicate with the backend.
		 * @type {Socket}
		 */
		this.socket = io.connect(`http://${window.location.hostname}:8083`)
		/**
		 * Settings of the whole environnement.
		 * @type {Settings}
		 */
		this.settings = new Settings(this)
		/**
		 * Results handler for calculations from the back-end.
		 * @type {Results}
		 */
		this.results = new Results(this)
		/**
		 * Flag signalant si une simulation est en cours ou non.
		 * @type {Boolean}
		 */
		this.simulationRunning = false

		// Socket listeners

		this.socket.on('connect', () => {
		
			console.info('Connection to the remote server established.')

		})
	}

	/**
	 *	Start the simulation by sending the settings to the back-end
	 *	along the message 'startSimulation'.
	 *
	 *  @return {Interface} chaining
	 */

	startSimulation(){

		this.simulationRunning = true

		this.socket.on('loading', data => this.results.loading(data.progress))
		
		this.results.loading(0)

		this.socket.emit('startSimulation', this.settings.getSettings(), results => {

			console.log(results)

			if (!this.simulationRunning)
				return

			if (results.error)
				return this.results.error(results.error)

			this.results.showResults(results.data)

		})

		return this
	
	}

	/**
	 *	Stop the client-side simulation by removing the loading screen and
	 *	blocking results callback.
	 *
	 *  @return {Interface} chaining
	 */

	stopSimulation(){
		this.simulationRunning = false

		this.socket.removeListener('loading')

		this.socket.emit('cancel')

		return this
	}
}