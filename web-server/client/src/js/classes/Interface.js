import Settings from './interface/Settings'
import Results from './interface/Results'

/*
*	Interface between the client side and the back-end.
*
*	The interface has settings and a socket enabling it 
*	to send and receive data from the server running the
*	Java MAS simulation.
*/

export default class Interface{
	
	constructor(){

		// Fields

		this.socket = io.connect(`http://${window.location.hostname}:8083`)
		this.settings = new Settings()
		this.results = new Results()
		this.simulationRunning = false

		// Socket listeners

		this.socket.on('connect', () => {
		
			console.info('Connection to the remote server established.')

		})
	}

	/*
	*	Start the simulation by sending the settings to the back-end
	*	along the message 'startSimulation'.
	*/

	startSimulation(){

		this.simulationRunning = true

		this.socket.on('loading', data => this.results.loading(data.progression))
		
		this.results.loading(0)

		this.socket.emit('startSimulation', this.settings.getSettings(), (results) => {

			if (!this.simulationRunning)
				return

			if (results.error)
				return this.results.error(results.error)

			this.results.showResults(results.data)

		})

		return this
	
	}

	/*
	*	Stop the client-side simulation by removing the loading screen and
	*	blocking results callback.
	*/

	stopSimulation(){
		this.simulationRunning = false

		this.socket.removeListener('loading')

		return this
	}
}