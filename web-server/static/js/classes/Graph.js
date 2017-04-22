/*
*	Graph representing the paths of the simulation.
*
*	You can add targets, deleted target, and link
*	them together.
*
*	For each target, you can set :
*		- robbersInterest (the probability of robbers attacking this target)
*		- guardiansCost (the cost when guardians fail to protect the target)
*		- guardiansReward (the reward when guardians manage to prevent 
*							an attack)
*		- robberSettings (the cost, reward and probability for each robber)
*			(Set through the Robbers class)
*
*	Nodes = Attacks = Targets
*/

class Graph {

	constructor(settings){

		// Fields

		this.settings = settings

		this.stylesheet = [{
				selector: 'node',
				style: {
					height: 20,
					width: 20,
					'background-color': 'mapData(robbersInterest, 0, 25, green, red)',
					content: node => `N${node.data('id')} C${node.data('guardiansCost')}/R${node.data('guardiansReward')}`,
					//'text-valign': 'center',
					'text-halign': 'center'
				}
			},
			{
				selector: 'edge',
				style: {
					'curve-style': 'haystack',
					'haystack-radius': 0,
					width: 5,
					opacity: 0.5,
					'line-color': '#a2efa2'
				}
			},
			{
				selector: '.base',
				style: {
					'background-color': '#61bffc',
					label: 'Base'
				}
			},
			{
				selector: ':selected',
				style: {
					'border-width': 4,
					'border-color': 'purple'
				}
			}
		]

		this.cy = window.cy = cytoscape({
			container: $('#graph'),

			boxSelectionEnabled: false,
			autounselectify: false,

			style: this.stylesheet
		})

		this.cy.minZoom(0.5)
		this.cy.maxZoom(2)

		window.graph = this

		this.nbrEdgesCreated = 0
		this.nbrNodesCreated = 0

		this.lastSelectedNode = null
		this.currentAction = null

		// DOM listeners

		$(document).on('click', '.qtip-content .link', event => {
			console.log("linking")
			this.currentAction = 'linking'
			$('.qtip').qtip('hide')
		})

		$(document).on('click', '.qtip-content .delete', event => {
			this.lastSelectedNode.remove()
			this.reset()
		})

		$(document).on('click', '.qtip-content .dismiss', event => {
			this.reset()
		})

		$(document).on('click', '.qtip-content .plusInterest', event => {
			this.lastSelectedNode.data('robbersInterest', Math.min(this.lastSelectedNode.data('robbersInterest')+1, 25))
		})

		$(document).on('click', '.qtip-content .minusInterest', event => {
			this.lastSelectedNode.data('robbersInterest', Math.max(this.lastSelectedNode.data('robbersInterest')-1, 0))
		})

		$(document).on('click', '.qtip-content .plusCost', event => {
			this.lastSelectedNode.data('guardiansCost', Math.min(this.lastSelectedNode.data('guardiansCost')+1, 25))
		})

		$(document).on('click', '.qtip-content .minusCost', event => {
			this.lastSelectedNode.data('guardiansCost', Math.max(this.lastSelectedNode.data('guardiansCost')-1, 0))
		})

		$(document).on('click', '.qtip-content .plusReward', event => {
			this.lastSelectedNode.data('guardiansReward', Math.min(this.lastSelectedNode.data('guardiansReward')+1, 25))
		})

		$(document).on('click', '.qtip-content .minusReward', event => {
			this.lastSelectedNode.data('guardiansReward', Math.max(this.lastSelectedNode.data('guardiansReward')-1, 0))
		})

		// Cytoscape listeners

		this.cy.on('tap', event => {
			if (event.target === event.cy)
				this.reset()
			// When you tap on the background and that there are no visible tips, you add a new node at this position.
			// If a tip is visible, you probably just want to dismiss it
			if (event.target === event.cy && !$('.qtip:visible').length){
				return this.addNode(event.position)
			}
		})

		this.cy.on('tap', 'node', event => {
			if (this.currentAction === 'linking'){
				this.currentAction = null
				const secondNode = event.target
				// We check if that edge aleady exists or if the source and target are the same node.
				if (!this.cy.elements(`edge[source = "${this.lastSelectedNode.id()}"][target = "${secondNode.id()}"]`).length && 
					!this.cy.elements(`edge[target = "${this.lastSelectedNode.id()}"][source = "${secondNode.id()}"]`).length && 
					secondNode != this.lastSelectedNode){
					this.link(this.lastSelectedNode.id(), secondNode.id())
				}
			}

			this.lastSelectedNode = event.target
		})

		this.cy.on('tap', 'edge', event => {
			event.target.remove()
		})
	}

	/*
	*	Sort targets with the CoSE layout (by Bilkent University).
	*/
	sort(){
		this.cy.layout({
			name: 'cose-bilkent',
			animate: true
		}).run()

		return this
	}

	/*
	*	Reset the current action, selected target and hide the tips.
	*/
	reset(){
		this.lastSelectedNode = null
		this.currentAction = null
		$('.qtip').qtip('hide')

		return this
	}

	/*
	*	Link two targets together. You have to specify the ids.
	*/

	link(source, target){
		this.cy.add({
			data: {
				id: `e${this.nbrEdgesCreated++}`,
				source: source,
				target: target
			},
			group: 'edges',
			selectable: true,
			locked: false,
			grabbable: true,
			classes: ''
		})
		console.log(`Edge added linking ${source} to ${target}.`)

		return this
	}

	/*
	*	Add a node to the path.
	*	
	*	Arguments :
	*		- position should be an object with fields x and y.
	*		- base is a boolean defining if the node is the base.
	*
	*	Base nodes can not been attacket nor defended.
	*	Patrols have to start and end at the base.
	*/
	addNode(position, base = false){
		const newNode = this.cy.add({
			data: {
				id: this.nbrNodesCreated++,
				robbersInterest: 1,
				guardiansCost: 2,
				guardiansReward: 1,
				robberSettings : new Map()
			},
			position: position,
			group: 'nodes',
			selectable: true,
			locked: false,
			grabbable: true,
			classes: base ? 'base' : ''
		}).qtip({
			content: `
			<div>
				<a class="waves-effect waves-light btn blue link" style="width:160px"><i class="material-icons right">timeline</i>Link to...</a>
				<a class="waves-effect waves-light btn red delete" style="width:160px; margin-top: 10px" ${base ? 'disabled' : ''}><i class="material-icons right">delete</i>Delete</a>
				
				<a class="waves-effect waves-light btn red lighten-2 minusInterest col" ${base ? 'disabled' : ''}><i class="material-icons">remove_circle</i></a>
				<div class="label">Robbers Interest</div>
				<a class="waves-effect waves-light btn green lighten-2 plusInterest col" ${base ? 'disabled' : ''}><i class="material-icons">add_circle</i></a>

				<a class="waves-effect waves-light btn red lighten-2 minusCost col" ${base ? 'disabled' : ''}><i class="material-icons">remove_circle</i></a>
				<div class="label">Guardians Cost</div>
				<a class="waves-effect waves-light btn green lighten-2 plusCost col" ${base ? 'disabled' : ''}><i class="material-icons">add_circle</i></a>

				<a class="waves-effect waves-light btn red lighten-2 minusReward col" ${base ? 'disabled' : ''}><i class="material-icons">remove_circle</i></a>
				<div class="label">Guardians Reward</div>
				<a class="waves-effect waves-light btn green lighten-2 plusReward col" ${base ? 'disabled' : ''}><i class="material-icons">add_circle</i></a>

				<a class="waves-effect waves-light btn green dismiss" style="width:160px; margin-top: 10px"><i class="material-icons right">cancel</i>Dismiss</a>
			</div>
			`,
			position: {
				my: 'top center',
				at: 'bottom center'
			},
			style: {
				classes: 'qtip-bootstrap',
				width: 195
			}
		})

		this.settings.robbers.list.forEach(robber => newNode.data('robberSettings').set(robber, {
			cost: 2,
			reward: 1
		}))

		return this
	}

	/*
	*	Concatenate settings into a JSON object.
	*/
	getSettings(){
		return {
			vertices: Object.keys(cy.nodes())
							 .filter(key => !isNaN(key))
							 .map(key => ({
							 	id: parseInt(cy.nodes()[key].id()),
							 	robbersInterest: cy.nodes()[key].data('robbersInterest'),
							 	guardiansCost: cy.nodes()[key].data('guardiansCost'),
								guardiansReward: cy.nodes()[key].data('guardiansReward'),
								robberSettings: Array.from(cy.nodes()[key].data('robberSettings')).reduce((obj, [key, value]) => { obj[key] = value; return obj}, {})
							 })),
			edges: Object.keys(cy.edges())
						 .filter(key => !isNaN(key))
						 .map(key => ({
						 	source: parseInt(cy.edges()[key].source().id()),
						 	target: parseInt(cy.edges()[key].target().id())
						 }))
		}
	}
}