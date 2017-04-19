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

		$(document).on('change', '#modal-robber-config input', event => {

			const row = $(event.currentTarget).parent().parent()

			const nodeId = row.data('nodeid')
			const robberId = row.data('robberid')

			const setting = $(event.currentTarget).data('setting')
			const newValue = parseInt($(event.currentTarget).val())

			console.log(`${setting} changed for node ${nodeId} : ${newValue}`)

			this.settings.path.cy.nodes(`[id = "${nodeId}"]`).data('robberSettings').get(robberId)[setting] = newValue

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

		this.settings.path.cy.nodes().each(node => node.data('robberSettings').set(robberId, {
			cost: 2,
			reward: 1,
			catchProbability: 0.3
		}))

		$('#robbers').append(`
			<div class="col s4" data-robberid="${robberId}">
			    <div class="card blue-grey darken-1">
					<div class="card-content white-text">
						<span class="card-title">Robber ${robberId}</span>
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

		this.settings.path.cy.nodes().each(node => node.data('robberSettings').delete(robberId))

		$('#robbers').find(`[data-robberid=${robberId}]`).remove()
	}

	/*
	*	Display a modal enabling the user to set the
	*	robber properties for every target.
	*/
	configureRobber(robberId){

		console.log(`Configuring robber ${robberId}.`)

		// TODO : Setup the modal content.
		let table = `
			<table class="striped centered">
				<thead>
					<tr>
						<th>Target ID</th>
						<th>Cost</th>
						<th>Reward</th>
						<th>Probability of getting caught</th>
					</tr>
				</thead>

				<tbody>`

		this.settings.path.cy.nodes('[id != "0"]').forEach(node => {
			let settings = node.data('robberSettings').get(robberId)

			table += `
				<tr data-nodeid="${node.id()}" data-robberid="${robberId}">
					<td>${node.id()}</td>
					<td><input data-setting="cost" type="number" value="${settings.cost}" min="0"></td>
					<td><input data-setting="reward" type="number" value="${settings.reward}" min="0"></td>
					<td><input data-setting="catchProbability" type="number" value="${settings.catchProbability}" min="0" max="1" step="0.1"></td>
				</tr>`
		})

		table += `
				</tbody>
			</table>`

		$('#modal-robber-config h4').text(`Robber ${robberId} configuration`)

		$('#modal-robber-config p').html(table)

		$('#modal-robber-config').modal('open')

	}

	/*
	*	Return the list of every robber.
	*/
	getSettings(){
		return [...this.list]
	}


}