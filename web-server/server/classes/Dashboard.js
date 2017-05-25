const blessed = require('blessed')
const os = require('os-utils')

class Dashboard {

	constructor(sockets, httpPort, webSocketsPort){

		this.sockets = sockets
		this.httpPort = httpPort
		this.webSocketsPort = webSocketsPort

		// Main

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

		// IPs-list

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

		// Ressources

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

		// Logs

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

	log(msg){
		this.logs.log(msg)

		return this
	}

}

module.exports = Dashboard