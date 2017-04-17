class Graph {
	constructor(){

		this.stylesheet = [{
				selector: 'node',
				style: {
					'height': 20,
					'width': 20,
					'background-color': '#18e018'
				}
			},
			{
				selector: 'edge',
				style: {
					'curve-style': 'haystack',
					'haystack-radius': 0,
					'width': 5,
					'opacity': 0.5,
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

		window.graph = this

		this.nbrEdgesCreated = 0
		this.nbrNodesCreated = 0

		this.lastSelectedNode = null
		this.currentAction = null

		$(document).on('click', '.link', event => {
			console.log("linking")
			this.currentAction = 'linking'
			$('.qtip').qtip('hide')
		})

		$(document).on('click', '.delete', event => {
			this.cy.remove(`node[id = "${this.lastSelectedNode}"]`)
			this.reset()
		})

		$(document).on('click', '.dismiss', event => {
			this.reset()
		})

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
				const secondNode = event.target.id()
				// We check if that edge aleady exists or if the source and target are the same node.
				if (!this.cy.elements(`edge[source = "${this.lastSelectedNode}"][target = "${secondNode}"]`).length && 
					!this.cy.elements(`edge[target = "${this.lastSelectedNode}"][source = "${secondNode}"]`).length && 
					secondNode != this.lastSelectedNode){
					this.link(this.lastSelectedNode, secondNode)
				}
			}

			this.lastSelectedNode = event.target.id()
		})

		this.cy.on('tap', 'edge', event => {
			event.target.remove()
		})
	}

	sort(){
		this.cy.layout({
			name: 'cose-bilkent',
			animate: true
		}).run()

		return this
	}

	reset(){
		this.lastSelectedNode = null
		this.currentAction = null
		$('.qtip').qtip('hide')

		return this
	}

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

	addNode(position, base){
		this.cy.add({
			data: {
				id: `n${this.nbrNodesCreated++}`
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
				<a class="waves-effect waves-light btn green dismiss" style="width:160px; margin-top: 10px"><i class="material-icons right dismiss">cancel</i>Dismiss</a>
				<a class="waves-effect waves-light btn red lighten-2 minusProbability col" style="margin-top: 10px; width: 78px;"><i class="material-icons dismiss">remove_circle</i></a>
				<a class="waves-effect waves-light btn green lighten-2 plusProbability col" style="margin-top: 10px; width: 78px;"><i class="material-icons dismiss">add_circle</i></a>
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

		return this
	}

	getProperties(){
		return {
			verticies: Object.keys(cy.nodes())
							 .filter(key => !isNaN(key))
							 .map(key => ({
							 	id: cy.nodes()[key].id()
							 })),
			edges: Object.keys(cy.edges())
						 .filter(key => !isNaN(key))
						 .map(key => ({
						 	source: cy.edges()[key].source().id(),
						 	target: cy.edges()[key].target().id()
						 }))
		}
	}
}