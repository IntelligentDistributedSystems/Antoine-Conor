class Interface{
	
	constructor(){

		this.socket = io.connect(`http://${window.location.hostname}:8081`)
		this.socket.on('connect', () => {
		
			console.log('Connection to the remote server established.')

		})

		this.properties = new Properties()
	}

	startSimulation(){
		this.socket.emit('startSimulation', this.properties.getProperties())
	}
}