/**
 * Class enabling us to play a live simulation of the best strategy 
 * sent by the server.
 */

export default class LiveSimulation{

	/**
	 * @param  {Results} results - Results object that instanciated this simulation.
	 * @param  {Object} computedData - Data computed by the server.
	 * @param  {Object} bestStrategy - Strategy previously built.
	 * @param  {string} selector - jQuery selector for where to put the simulation.
	 */
	constructor(results, computedData, bestStreategy, selector){

		/**
		 * Results object that instanciated this simulation.
		 * @type {Results}
		 */
		this.results = results

		/**
		 * Original cytoscape graph.
		 * @type {cytoscape}
		 */
		this.originalCy = this.results.interface.settings.graph.cy
		window.liveSimulation = this

		/**
		 * Data computed by the server.
		 * @type {Object}
		 */
		this.computedData = computedData

		/**
		 * Strategy previously built.
		 * @type {Object}
		 */
		this.bestStreategy = bestStreategy

		/**
		 * jQuery selector for where to put the simulation.
		 * @type {string}
		 */
		this.selector = selector

		/**
		 * LiveSimulation graph stylesheet. 
		 * @type {Array<Object>}
		 */
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

		/**
		 * LiveSImulation cytoscape graph.
		 * @type {cytoscape}
		 */
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

		/**
		 * Base du gardien.
		 * 
		 * @type {Node}
		 */
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

		/**
		 * Node representing the robber.
		 * 
		 * @type {Node}
		 */
		this.robber = this.cy.nodes('#robber')

		/**
		 * Node representing the guardian.
		 * 
		 * @type {Node}
		 */
		this.guardian = this.cy.nodes('#guardian')
	}

	/**
	 * Launch a new iterration.
	 * 
	 * @return {LiveSimulation} chaining
	 */
	newIteration(){
		/**
		 * The robber's current target.
		 * @type {Node}
		 */
		this.robberTarget = this.randomTarget()
		
		/**
		 * Startup tmestamp (for the robber movement).
		 * @type {Date}
		 */
		this.iterationStart = new Date()
		
		/**
		 * How many ms before the robber hit the target?
		 * @type {Number}
		 */
		this.countdown = Math.random()*2500*this.cy.filter('.node').length + 2500
		
		/**
		 * The path the guardian will follow.
		 * @type {Array<Node>}
		 */
		this.guardianPath = this.randomPath()

		/**
		 * The last node the guardian visited.
		 * @type {Node}
		 */
		this.guardianLastVisit = this.base
		this.guardian.position(Object.assign({}, this.base.position()))

		/**
		 * The node the guardian is going to.
		 * @type {Node}
		 */
		this.guardianTarget = this.nextGuardianTarget(true)

		return this
	}

	/**
	 * Render the next step.
	 * 
	 * @return {void} undefined
	 */
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

		if ((guardianPosition.x - targetPosition.x)**2 + (guardianPosition.y - targetPosition.y)**2 < 5){
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

	/**
	 * Handle what happen when the robber hit his targer.
	 * /!\ Is asynchronous because of LiveSimulation::iterationEnd use.
	 * 
	 * @return {LiveSimulation} chaining
	 */

	robberHitTarget(){
		if (!this.robberTarget.hasClass('secured')){
			this.robberTarget.addClass('robbed')
			$('#liveSimulationLog').text('Robbed!')
		} else {
			this.robberTarget.removeClass('secured').addClass('caught')
			$('#liveSimulationLog').text('Caught!')
		}
		return this.iterationEnd()

	}

	/**
	 * @return {Array<Node>}
	 */
	randomPath(){

		let fairDiceRoll = Math.random()

		let pathNumber = -1

		while(fairDiceRoll > 0){
			pathNumber++
			fairDiceRoll-=this.bestStreategy.probabilities[pathNumber]
		}

		return this.computedData.patrols[pathNumber].slice(1).map(nodeId => 
			this.cy.nodes(`[id = "${nodeId}"]`)[0]
		)
	}

	/**
	 * Call for another iteration when the running one finishes.
	 * 
	 * @return {LiveSimulation} chaining
	 */
	iterationEnd(){
		setTimeout(() => {
			this.cy.nodes().forEach(node => node.removeClass('secured').removeClass('robbed').removeClass('caught'))
			this.run()
			$('#liveSimulationLog').text('Iteration running...')
		}, 1000)

		return this
	}

	/**
	 * Give the next target the Guardian should go for.
	 * 
	 * @param  {Boolean} init - Is this the first target?
	 * @return {Node} next target for the guardian.
	 */
	nextGuardianTarget(init){
		if (init)
			return this.guardianPath[0]
		
		const index = this.guardianPath.indexOf(this.guardianTarget)
		if (index+1 === this.guardianPath.length)
			return null
		
		return this.guardianPath[index+1]
	}

	/**
	 * Get a random target according to the distribution (see RobbersInterest).
	 *
	 * @return {Node} a random target
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

	/**
	 * Start the simulation.
	 *
	 * @return {LiveSimulation} chaining
	 */
	run(){
		this.newIteration()
		this.nextStep()

		return this
	}

}