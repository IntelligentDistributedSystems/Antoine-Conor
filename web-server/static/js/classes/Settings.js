class Settings {
	constructor(){
		this.path = new Graph(this)
		
		this.numberOfRobbersCreated = 0

		this.robbers = new Set()

		this.initPath()

		$(document).on('click', '#robbers .delete', event => {

			this.removeRobber($(event.currentTarget).parent().parent().parent().data('robberid'))

		})
	}

	initPath(){
		
		this.path.addNode({
			x: 50,
			y: 45
		}, true)
		.addNode({
			x: 150,
			y: 45
		})
		.link('0', '1')
		.sort()

		return this
	}

	getSettings(){
		return {
			paths: this.path.getSettings(),
			general: this.generalSettings
		}
	}

	get generalSettings(){
		return {}
	}

	newRobber(){

		const robberId = this.numberOfRobbersCreated++

		this.robbers.add(robberId)

		this.path.cy.nodes().each(node => node.data('robbersSettings').set(robberId, {
			cost: 2,
			reward: 1,
			caughtProbability: 0.3
		}))

		$('#robbers').append(`
			<div class="col s4" data-robberid="${robberId}">
			    <div class="card blue-grey darken-1">
					<div class="card-content white-text">
						<span class="card-title">Robber : ${robberId}</span>
						<p>Some bad guy.</p>
					</div>
					<div class="card-action">
						<a class="waves-effect waves-light btn blue configure" style="width: 100%"><i class="material-icons right">mode_edit</i>Configure</a>
						<a class="waves-effect waves-light btn red delete" style="width: 100%; margin-top: 10px"><i class="material-icons right">delete</i>Delete</a>
					</div>
				</div>
			</div>
		`)
	}

	removeRobber(robberId){

		console.log(`Removing robber ${robberId}.`)

		this.robbers.delete(robberId)

		this.path.cy.nodes().each(node => node.data('robbersSettings').delete(robberId))

		$('#robbers').find(`[data-robberid=${robberId}]`).remove()
	}
}