// Configuration

const httpPort = 8080
const webSocketsPort = 8081


// Express

const express = require('express')
const app = express()

app.use('/', express.static('static'))

app.listen(httpPort, () => console.log(`Web-GUI hosted on port ${httpPort}.`))

// Socket.io

const io = require('socket.io')(webSocketsPort)

io.on('connection', socket => {
	console.log(socket.conn.id)

	socket.on('startSimulation', data => {

		console.log(data)

	})
})

console.log(`WebSockets listening on port ${webSocketsPort}.`)