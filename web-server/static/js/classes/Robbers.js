class Robbers{

	constructor(settings){

		// Fields

		this.settings = settings

		this.numberOfRobbersCreated = 0

		this.list = new Set()

		// DOM listeners

		$(document).on('click', '#robbers .delete', event => {

			this.removeRobber($(event.currentTarget).parent().parent().parent().data('robberid'))

		})

		$(document).on('click', '#robbers .configure', event => {

			this.configureRobber($(event.currentTarget).parent().parent().parent().data('robberid'))

		})

	}

	/*
	*	Add a robber to the settings.
	*	His card can be seen in the "Robbers" tab.
	*	His settings are set to default in every target.
	*/
	newRobber(){

		const robberId = this.numberOfRobbersCreated++

		this.list.add(robberId)

		this.settings.path.cy.nodes().each(node => node.data('robbersSettings').set(robberId, {
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

	/*
	*	Remove a robber from the settings.
	*	His card gets removed and references to his settings are
	*	removed from each target.
	*/
	removeRobber(robberId){

		console.log(`Removing robber ${robberId}.`)

		this.list.delete(robberId)

		this.settings.path.cy.nodes().each(node => node.data('robbersSettings').delete(robberId))

		$('#robbers').find(`[data-robberid=${robberId}]`).remove()
	}

	/*
	*	Display a modal enabling the user to set the
	*	robber properties for every target.
	*/
	configureRobber(robberId){

		console.log(`Configuring robber ${robberId}.`)

		// TODO : Setup the modal content.



		$('#modal-robber-conf').modal('open')

	}

	/*
	*	Return the list of every robber.
	*/
	getSettings(){
		return this.list
	}


}