/*
*	Interface between the client side and the back-end.
*
*	The interface has settings and a socket enabling it 
*	to send and receive data from the server running the
*	Java MAS simulation.
*/

class Interface{
	
	constructor(){

		// Fields

		this.socket = io.connect(`http://${window.location.hostname}:8081`)
		this.settings = new Settings()
		this.results = new Results()

		// Socket listeners

		this.socket.on('connect', () => {
		
			console.log('Connection to the remote server established.')

			this.socket.on('stdout', data => console.log(data.text))
			this.socket.on('stderr', data => console.log(data.text))
			this.socket.on('close', data => console.log(data.text))

		})
	}

	/*
	*	Start the simulation by sending the settings to the back-end
	*	along the message 'startSimulation'.
	*/

	startSimulation(){
		this.socket.emit('startSimulation', this.settings.getSettings())
		this.results.loading(0)
		setTimeout(() => this.results.showResults(), 3000)
	}
}