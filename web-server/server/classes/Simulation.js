const SettingsIntegrity = require('./SettingsIntegrity')
const LogParser = require('./LogParser')

const spawn = require('child_process').spawn
const crypto = require('crypto')
const fs = require('fs')

/**
 * Class associated to a socket when it asks to run a simulation.
 */
class Simulation{

	/**
	 * @param  {Socket}   socket - The socket that asked for the simulation.
	 * @param  {Object}   settings - The settings of the simulation.
	 * @param  {Function} fn - The function to use to send the results.
	 */
	constructor(socket, settings, fn){

		/**
		 * The socket that asked for the simulation.
		 * @type {Socket}
		 */
		this.socket = socket
		/**
		 * The settings of the simulation.
		 * @type {Object}
		 */
		this.settings = settings
		/**
		 * The function to use to send the results.
		 * @type {Function}
		 */
		this.fn = fn
		/**
		 * @see LogParser
		 * @type {LogParser}
		 */
		this.logParser = new LogParser(this)

		/**
		 * The progress of the simulation.
		 * @type {Number}
		 */
		this.progress = 0
		/**
		 * How many strategies there will be.
		 * @type {Number}
		 */
		this.totalNumberOfStrategies = 1
		/**
		 * The data to send back.
		 * @type {Object}
		 */
		this.results = {patrols:[], strategies:[]}
	}

	/**
	 * Launch the simulation.
	 * @return {Simulation} chaining
	 */
	run(){
		let error = SettingsIntegrity.settingsCorrupted(this.settings)
		if (error){
			return this.sendError(error)
		}

		const configFileID = crypto.createHmac('sha256', ''+Math.random())
                   				   .digest('hex')

		fs.writeFile(`configs/${configFileID}.json`, JSON.stringify(this.settings), 'utf8', () => {

			this.compute(configFileID)

		})

		return this
	}

	/**
	 * DO the computation itself.
	 * @param  {String} configFileID - ID of the simulation to compute.
	 * @return {Simulation} - chaining 
	 */
	compute(configFileID){
		// We set the env. variable configFileID so that the jar executable can know which config file to load.

		const env = Object.create(process.env)
		env.PATROL_JSON_NAME = `${configFileID}.json`

		// We run the jar with the new environnement.

		const jason = spawn('java', ['-jar', './../guardianPatrol.jar'], {env: env})

		// We analyze the output.

		jason.stdout.on('data', data => this.logParser.handleOutput(''+data))

		jason.stderr.on('data', data => this.logParser.handleError(''+data))

		jason.on('close', code => {

			this.socket.removeAllListeners('cancel')

			if (code == 0)
				return this.sendResults()

			this.sendError(`child process exited with code ${code}`)

		})

		this.socket.on('cancel', () => jason.kill('SIGINT'))
		this.socket.on('disconnect', () => jason.kill('SIGINT'))

		return this
	}

	/**
	 * Log a piece of info into the dashboard.
	 * @param  {String} message - Message to log.
	 * @return {Simulation} chaining
	 */
	logInfo(message){
		this.socket.dashboard.log(`[${this.socket.id}] ${message}`)

		return this
	}

	/**
	 * Log an error into the dashboard.
	 * @param  {String} message - Error to log.
	 * @return {Simulation} chaining
	 */
	logError(message){
		this.socket.dashboard.log(`[${this.socket.id}] Error encountered : ${message}`)

		return this
	}

	/**
	 * Send the results back to the client.
	 * @return {Simulation} chaining
	 */
	sendResults(){

		this.fn({
			error: false,
			data: this.results
		})

		this.logInfo('Results sent')

		return this
	}

	/**
	 * Send the error to the client.
	 * @param  {String} error - The error message.
	 * @return {Simulation} chaining
	 */
	sendError(error){

		this.logError(error)

		this.fn({
			error: error
		})

		return this
	}

	/**
	 * Send the progress to the client.
	 * @return {Simulation} chaining
	 */
	sendProgress(){

		this.socket.emit('loading', {progress: this.progress})

		return this
	}
}

module.exports = Simulation