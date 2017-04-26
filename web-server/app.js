// Imports

const Simulation = require('./classes/Simulation')

// Configuration

const httpPort = 8082
const webSocketsPort = 8083

// Express

const express = require('express')
const app = express()

app.use('/', express.static('static'))

app.listen(httpPort, () => console.info(`Web-GUI hosted on port ${httpPort}.`))

// Socket.io

const io = require('socket.io')(webSocketsPort)

io.on('connection', socket => {

	console.info(`[${socket.id}] Connected`)

	socket.on('startSimulation', (settings, fn) => {

		const simulation = new Simulation(socket, settings, fn)

		simulation.run()

	})

	socket.on('disconnect', () => console.info(`[${socket.id}] Disconnected`))
})

console.info(`WebSockets listening on port ${webSocketsPort}.`)