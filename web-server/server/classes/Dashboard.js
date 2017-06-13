// Interface
const blessed = require('blessed')
// CPU & RAM
const os = require('os-utils')

/**
 * Class used to have a nice interface.
 */
class Dashboard {

	/**
	 * @param  {Set<Socket>} sockets - Sockets to check.
	 * @param  {Number} httpPort - Port on which the HTTP server is listening.
	 * @param  {Number} webSocketsPort - Port on chich the socket server is listening.
	 */
	constructor(sockets, httpPort, webSocketsPort){

		/**
		 * Sockets to check.
		 * @type {Set<Socket>}
		 */
		this.sockets = sockets
		/**
		 * Port on which the HTTP server is listening.
		 * @type {Number}
		 */
		this.httpPort = httpPort
		/**
		 * Port on chich the socket server is listening.
		 * @type {Number}
		 */
		this.webSocketsPort = webSocketsPort

		// Main

		/**
		 * Screen in which we will put all the components.
		 * @type {blessed.Screen}
		 */
		this.screen = blessed.screen({	
			// Example of optional settings:
			smartCSR: true,
			useBCE: true,
			cursor: {
				artificial: true,
				blink: true,
				shape: 'underline'
			},
			//log: `${__dirname}/application.log`,
			debug: true,
			dockBorders: true
		})

		this.screen.title = 'Patrolling Game Server' 

		this.screen.key(['q', 'C-c'], (ch, key) => process.exit(0))

		// Listening ports

		this.portsBox = blessed.box({
			top: 0,
			left: 0,
			width: '50%',
			height: 4,
			content: `Web-GUI:     :${this.httpPort}\nWeb-sockets: :${this.webSocketsPort}`,
			border: {
				type: 'line'
			}
		})

		this.screen.append(this.portsBox)	

		/**
		 * Component containing the IPs list.
		 * @type {blessed.List}
		 */
		this.ipsList = blessed.list({
			top: 0,
			left: '50%',
			width: '50%',
			height: 12,
			border: {
				type: 'line'
			}
		})

		this.screen.append(this.ipsList)

		/**
		 * Component containing the ressources usage informations.
		 * @type {blessed.Box}
		 */
		this.ressources = blessed.box({
			top: 4,
			left: 0,
			width: '50%',
			height: 8,
			border: {
				type: 'line'
			}
		})

		this.screen.append(this.ressources)

		/**
		 * CPU usage component.
		 * @type {blessed.ProgressBar}
		 */
		this.cpu = blessed.ProgressBar({
			top: 0,
			left: 0,
			width: '97%',
			height: 3,
			content: 'CPU',
			border: {
				type: 'line'
			},
			style: {
				bar :{bg: 'blue'}
			}
		})
		this.ressources.append(this.cpu)

		/**
		 * RAM usage component.
		 * @type {blessed.ProgressBar}
		 */
		this.memory = blessed.ProgressBar({
			top: 3,
			left: 0,
			width: '97%',
			height: 3,
			content: 'memory',
			border: {
				type: 'line'
			},
			style: {
				bar :{bg: 'green'}
			}
		})

		this.ressources.append(this.memory)

		/**
		 * Logs component.
		 * @type {blessed.Log}
		 */
		this.logs = blessed.log({
			top: 12,
			left: 0,
			width: '100%',
			//height: '50%',
			border: {
				type: 'line'
			}
		})

		this.screen.append(this.logs)

		setInterval(() => this.render(), 100)
	}

	/**
	 * Update all the components data.
	 * @return {Dashboard} chaining
	 */
	render(){

		// IPs-list

		if (this.sockets.size === 0){
			this.ipsList.setItems(['No client.'])
		} else {
			this.ipsList.setItems(['Clients:', ...[...this.sockets].map(socket => 
				`[${socket.id.slice(0, 3)}] ${socket.request.connection.remoteAddress} - ${(typeof socket.simulation === 'undefined') ? 'x' : `${socket.simulation.progress}%`}`
			)])
		}

		// Ressources

		// --CPU

		os.cpuUsage(usage => {
			this.cpu.setProgress(usage*100)
			this.cpu.setContent(`CPU:    ${(usage*100).toFixed(1)}%`)
		})

		// --memory

		let freeMemPerc = os.freemem()/os.totalmem() * 100

		this.memory.setProgress(freeMemPerc)
		this.memory.setContent(`memory:  ${freeMemPerc.toFixed(1)}%`)

		this.screen.render()

		return this
	}

	/**
	 * Add a message to the dashboard's log.
	 * @param  {String} msg - Log line to add.
	 * @return {Dashboard} chaining
	 */
	log(msg){
		this.logs.log(msg)

		return this
	}

}

module.exports = Dashboard