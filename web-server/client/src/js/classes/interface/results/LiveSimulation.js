export default class LiveSimulation{

	constructor(results, statisticsTable, selector){

		this.results = results
		this.originalCy = this.results.interface.settings.graph.cy
		window.liveSimulation = this

		this.statisticsTable = statisticsTable
		this.selector = selector

		console.log(statisticsTable)

		this.stylesheet = [{
				selector: 'node',
				style: {
					height: 20,
					width: 20
				}
			},
			{
				selector: 'edge',
				style: {
					'curve-style': 'haystack',
					'haystack-radius': 0,
					width: 5,
					opacity: 0.5,
					'line-color': 'grey'
				}
			},
			{
				selector: '.base',
				style: {
					'background-color': '#61bffc'
				}
			},
			{
				selector: '.secured',
				style: {
					'background-color': '#81c784'
				}
			},
			{
				selector: '.robbed',
				style: {
					'background-color': '#e57373'
				}
			},
			{
				selector: '.caught',
				style: {
					'background-color': '#E57373'
				}
			},
			{
				selector: '.guardian',
				style: {
					height: 40,
					width: 40,
					'background-image': '/img/guardian-40.png',
					'background-opacity': 0
				}
			},
			{
				selector: '.robber',
				style: {
					height: 40,
					width: 40,
					'background-image': '/img/robber-40.png',
					'background-opacity': 0
				}
			}
		]

		this.cy = cytoscape({
			container: $(this.selector),

			boxSelectionEnabled: false,
			autounselectify: false,

			style: this.stylesheet
		})

		this.cy.minZoom(0.5)
		this.cy.maxZoom(2)

		// Import nodes and vertices from cy object.

		this.originalCy.nodes().forEach(node => {
			this.cy.add({
				data: {id: node.id()},
				position: node.position(),
				group: 'nodes',
				classes: `node${(node.id() === '0') ? ' base' : ''}`,
				selectable: false,
				locked: true,
				grabbable: false
			})
		})

		this.base = this.cy.nodes('[id = "0"]')

		this.originalCy.edges().forEach(edge => {
			this.cy.add({
				data: {
					id: edge.id(),
					source: edge.source().id(),
					target: edge.target().id()
				},
				group: 'edges',
				selectable: false,
				locked: true,
				grabbable: false
			})
		})

		// Add robber and guardian.

		this.cy.add({
			data: {id: 'robber'},
			position: {
				x: Math.cos(new Date()/1000) * 20,
				y: Math.sin(new Date()/1000) * 20
			},
			classes: 'robber',
			selectable: false,
			locked: false,
			grabbable: false
		})

		this.cy.add({
			data: {id: 'guardian'},
			position: Object.assign({}, this.cy.nodes('[id = "0"]').position()),
			classes: 'guardian',
			selectable: false,
			locked: false,
			grabbable: false
		})

		this.robber = this.cy.nodes('#robber')
		this.guardian = this.cy.nodes('#guardian')
	}

	newIteration(){
		this.robberTarget = this.randomTarget()
		this.iterationStart = new Date()
		this.countdown = Math.random()*7500 + 2500
		this.guardianPath = this.randomPath()
		this.guardianLastVisit = this.base
		this.guardian.position(Object.assign({}, this.base.position()))
		this.guardianTarget = this.nextGuardianTarget(true)
	}

	nextStep(){
		// fix a bug when graph is not showing on page change.
		this.cy.resize()
		this.cy.fit(this.cy.filter('.node'))

		// If the user dismiss the results, we stop the simulation.
		if ($(this.selector).length === 0)
			return console.info('Live simulation stopped.')

		const delta = (this.iterationStart.valueOf() + this.countdown - new Date().valueOf())/50

		if (delta <= 0)
			return this.robberHitTarget()

		this.robber.position({
			x: Math.cos(new Date()/1000) * delta + this.robberTarget.position().x,
			y: Math.sin(new Date()/1000) * delta + this.robberTarget.position().y
		})
		this.robber.data('refresh', Math.random())

		const guardianPosition = this.guardian.position()
		const targetPosition = this.guardianTarget.position()

		guardianPosition.x = guardianPosition.x * 0.95 + targetPosition.x * 0.05
		guardianPosition.y = guardianPosition.y * 0.95 + targetPosition.y * 0.05
		this.guardian.data('refresh', Math.random())

		if ((guardianPosition.x - targetPosition.x)**2 + (guardianPosition.y - targetPosition.y)**2 < 1){
			this.guardianTarget.addClass('secured')
			this.guardianLastVisit = this.guardianTarget
			const newGuardianTarget = this.nextGuardianTarget()
			if (newGuardianTarget !== null)
				this.guardianTarget = newGuardianTarget
			//else 
			//	return this.everyTargetIsSecured()
		}

		setTimeout(() => this.nextStep(), 50)
	}

	robberHitTarget(){
		if (!this.robberTarget.hasClass('secured')){
			this.robberTarget.addClass('robbed')
			$('#liveSimulationLog').text('Robbed!')
		} else {
			this.robberTarget.removeClass('secured').addClass('caught')
			$('#liveSimulationLog').text('Caught!')
		}
		this.iterationEnd()

	}

	randomPath(){
		return this.cy.filter('.node').filter('[id != "0"]').map(node => node)
	}

	iterationEnd(){
		setTimeout(() => {
			this.cy.nodes().forEach(node => node.removeClass('secured').removeClass('robbed').removeClass('caught'))
			this.run()
			$('#liveSimulationLog').text('Iteration running...')
		}, 1000)
	}

	nextGuardianTarget(init){
		if (init)
			return this.guardianPath[0]
		
		const index = this.guardianPath.indexOf(this.guardianTarget)
		if (index+1 === this.guardianPath.length)
			return null
		
		return this.guardianPath[index+1]
	}

	/*
	*	Target get according to the distribution (see RobbersInterest)
	*/
	randomTarget(){
		let distribution = []
		this.originalCy.nodes('[id != "0"]').forEach(node => {
			for (let i=0;i<node.data('robbersInterest');i++)
				distribution.push(node.id())
		})

		let randomId = distribution[Math.floor(Math.random()*distribution.length)]

		return this.cy.nodes(`#${randomId}`)[0]
	}

	run(){
		this.newIteration()
		this.nextStep()
	}

}