const SettingsIntegrity = require('./SettingsIntegrity')
const LogParser = require('./LogParser')

const spawn = require('child_process').spawn
const crypto = require('crypto')
const fs = require('fs')

class Simulation{

	constructor(socket, settings, fn){

		this.socket = socket
		this.settings = settings
		this.fn = fn
		this.logParser = new LogParser(this)

		this.progress = 0
		this.results = {patrols:[], strategies:[]}
	}

	run(){
		let error = SettingsIntegrity.settingsCorrupted(this.settings)
		if (error){
			this.sendError(error)
		}

		const configFileID = crypto.createHmac('sha256', ''+Math.random())
                   				   .digest('hex')

		fs.writeFile(`configs/${configFileID}.json`, JSON.stringify(this.settings), 'utf8', () => {

			this.compute(configFileID)

		})

		return this
	}

	compute(configFileID){
		// We set the env. variable configFileID so that the jar executable can know which config file to load.

		const env = Object.create(process.env)
		env.PATROL_JSON_NAME = `${configFileID}.json`

		// We run the jar with the new environnement.

		const ls = spawn('java', ['-jar', './../guardianPatrol.jar'], {env: env})

		// We analyze the output.

		ls.stdout.on('data', data => this.logParser.handleOutput(''+data))

		ls.stderr.on('data', data => this.logParser.handleError(''+data))

		ls.on('close', code => {

			if (code == 0)
				return this.sendResults()

			this.sendError(`child process exited with code ${code}`)

		})

		return this
	}

	logInfo(message){
		console.info(`[${this.socket.id}] ${message}`)

		return this
	}

	logError(message){
		console.error(`[${this.socket.id}] Error encountered : ${message}`)

		return this
	}

	sendResults(){

		this.fn({
			error: false,
			data: this.results
		})

		this.logInfo('Results sent')

		return this
	}

	sendError(error){

		this.logError(error)

		this.fn({
			error: error
		})

		return this
	}

	sendProgress(){
		this.socket.emit('loading', {progression: this.progression})

		return this
	}
}

module.exports = Simulation