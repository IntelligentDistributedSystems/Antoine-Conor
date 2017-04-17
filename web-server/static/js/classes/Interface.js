class Interface{
	
	constructor(){

		this.socket = io.connect(`http://${window.location.hostname}:8081`)
		this.socket.on('connect', () => {
		
			console.log('Connection to the remote server established.')

			this.socket.on('stdout', data => console.log(data.text))
			this.socket.on('stderr', data => console.log(data.text))
			this.socket.on('close', data => console.log(data.text))

		})

		this.properties = new Properties()
	}

	startSimulation(){
		this.socket.emit('startSimulation', this.properties.getProperties())
	}
}