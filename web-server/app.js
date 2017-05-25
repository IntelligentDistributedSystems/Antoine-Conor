// Imports

const Simulation = require('./server/classes/Simulation')
const Dashboard = require('./server/classes/Dashboard')

// Configuration

const httpPort = 8082
const webSocketsPort = 8083

// Dashboard

const sockets = new Set()
const dashboard = new Dashboard(sockets, httpPort, webSocketsPort)

// Express

const express = require('express')
const app = express()

app.use('/', express.static('client/static'))

app.listen(httpPort, () => dashboard.log(`Web-GUI hosted on port ${httpPort}.`))

// Socket.io

const io = require('socket.io')(webSocketsPort)

io.on('connection', socket => {

	dashboard.log(`[${socket.id}] Connected`)

	socket.dashboard = dashboard
	sockets.add(socket)

	socket.on('startSimulation', (settings, fn) => {

		const simulation = new Simulation(socket, settings, fn)

		socket.simulation = simulation

		simulation.run()

	})

	socket.on('disconnect', () => {
		dashboard.log(`[${socket.id}] Disconnected`)

		sockets.delete(socket)
	})
})

dashboard.log(`Web-Sockets listening on port ${webSocketsPort}.`)