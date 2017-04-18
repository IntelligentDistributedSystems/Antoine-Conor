// Imports

const spawn = require('child_process').spawn
const crypto = require('crypto')
const fs = require('fs')

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

		// TODO : vérifier la data.

		const configFileID = crypto.createHmac('sha256', ''+Math.random())
                   				   .digest('hex')

		fs.writeFile(`configs/${configFileID}.json`, JSON.stringify(data), 'utf8', () => {

			const env = Object.create(process.env)
			env.configFileID = configFileID

			const ls = spawn('echo', ['il faut me faire exécuter le .jar'], {env: env})

			ls.stdout.on('data', data => socket.emit('stdout', {text: ''+data}))

			ls.stderr.on('data', data => socket.emit('stderr', {text: ''+data}))

			ls.on('close', code => socket.emit('close', {text: `child process exited with code ${code}`}))

		})

	})
})

console.log(`WebSockets listening on port ${webSocketsPort}.`)