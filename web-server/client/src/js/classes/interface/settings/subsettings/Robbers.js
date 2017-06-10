/**
 * Sub-setting for robbers manipulation.
 */
export default class Robbers{

	/**
	* @param {Settings} settings - Settings object using this robbers. 
	*/
	constructor(settings){

		// Fields
		/**
		 * Settings object using this robbers.
		 * @type {Settings}
		 */
		this.settings = settings

		// DOM listeners

		$(document).on('click', '#robbers .delete', event => {

			this.removeRobber($(event.currentTarget).parent().parent().parent().data('robberid'))

		})

		$(document).on('click', '#robbers .configure', event => {

			this.configureRobber($(event.currentTarget).parent().parent().parent().data('robberid'))

		})

		$(document).on('change', '#robbers input.discretion', event => {

			const newValue = 1-parseFloat($(event.currentTarget).val())

			if (newValue < 0 || newValue > 1){
				return $(event.currentTarget).css({
					color: 'red'
				})
			}

			$(event.currentTarget).css({
				color: "#fff"
			})

			this.catchProbability.set(
				$(event.currentTarget).parent().parent().parent().parent().data('robberid'),
				newValue
			)

		})

		$(document).on('change', '#modal-robber-config input', event => {

			const row = $(event.currentTarget).parent().parent()

			const nodeId = row.data('nodeid')
			const robberId = row.data('robberid')

			const setting = $(event.currentTarget).data('setting')
			const newValue = parseFloat($(event.currentTarget).val())

			console.info(`${setting} changed for target ${nodeId}, new value is ${newValue}.`)

			this.settings.graph.cy.nodes(`[id = "${nodeId}"]`).data('robberSettings').get(robberId)[setting] = newValue

		})

		this.init()

	}

	/**
	 * Initialize the robbers by setting default values.
	 *
	 * @return {Robbers} chaining
	 */
	init(){

		if (typeof this.list !== 'undefined')
			[...this.list].forEach(robberId => this.removeRobber(robberId))

		/**
		 * Number of robbers created until now.
		 * Deleting a robber doesn't decrease that counter.
		 * 
		 * @type {Number}
		 */
		this.numberOfRobbersCreated = 0

		/**
		 * Set of all robbers.
		 * @todo We should probably change the name of this variable.
		 * 
		 * @type {Set<Object>}
		 */
		this.list = new Set()

		/**
		 * Probability of beeing caught for each robber.
		 *
		 * @type {Map<Number, Number>}
		 */
		this.catchProbability = new Map()

		return this
	}

	/**
	 * Add a robber to the settings.
	 * His card can be seen in the "Robbers" tab.
	 * His settings are set to default in every target.
	 *
	 * @param {Number} catchProbability - the catch probability of the new robber.
	 * @return {Number} the new robber id.
	 */
	newRobber(catchProbability = 0.5){

		const robberId = this.numberOfRobbersCreated++

		this.list.add(robberId)

		this.catchProbability.set(robberId, catchProbability)

		this.settings.graph.cy.nodes().each(node => node.data('robberSettings').set(robberId, {
			cost: 1,
			reward: 1
		}))

		$('#robbers').append(`
			<div class="col s4" data-robberid="${robberId}">
			    <div class="card blue-grey darken-1">
					<div class="card-content white-text">
						<span class="card-title">Robber ${robberId+1}</span>
						<!--<p>Some bad guy.</p>-->
					</div>
					<div class="card-action">
						<div class="discretionContainer">
							<span>Discretion</span>
							<input type="number" step="0.05" class="discretion" min="0" max="1" value="${(1-catchProbability)}">
						</div>
						<a class="waves-effect waves-light btn blue configure" style="width: 100%; margin-top: 10px;"><i class="material-icons right">mode_edit</i>Rewards</a>
						<a class="waves-effect waves-light btn red delete" style="width: 100%; margin-top: 10px" ${(robberId === 0) ? 'disabled' : ''}><i class="material-icons right">delete</i>Delete</a>
					</div>
				</div>
			</div>
		`)

		return robberId
	}

	/**
	 * Remove a robber from the settings.
	 * His card gets removed and references to his settings are
	 * removed from each target.
	 *
	 * @param {Number} robberId - the robber to remove.
	 * @return {Robbers} chaining
	 */
	removeRobber(robberId){

		console.info(`Removing robber ${robberId}...`)

		this.list.delete(robberId)

		this.settings.graph.cy.nodes().each(node => node.data('robberSettings').delete(robberId))

		$('#robbers').find(`[data-robberid=${robberId}]`).remove()

		return this
	}

	/**
	 * Display a modal enabling the user to set the
	 * robber properties for every target.
	 * 
	 * @param {Number} robberId - the robber to configure.
	 * @return {Robbers} chaining
	 */
	configureRobber(robberId){

		console.info(`Configuring robber ${robberId+1}.`)

		let table = `
			<table class="striped centered">
				<thead>
					<tr>
						<th>Target ID</th>
						<th>Cost</th>
						<th>Reward</th>
					</tr>
				</thead>

				<tbody>`

		this.settings.graph.cy.nodes('[id != "0"]').forEach(node => {

			let settings = node.data('robberSettings').get(robberId)

			table += `
				<tr data-nodeid="${node.id()}" data-robberid="${robberId}">
					<td>${node.id()}</td>
					<td><input data-setting="cost" type="number" value="${settings.cost}" min="0"></td>
					<td><input data-setting="reward" type="number" value="${settings.reward}" min="0"></td>
				</tr>`
		})

		table += `
				</tbody>
			</table>`

		$('#modal-robber-config h4').text(`Robber ${robberId+1} configuration`)

		$('#modal-robber-config p').html(table)

		$('#modal-robber-config').modal('open')

		return this
	}

	/**
 	 * Return the list of every robber.
	 *
	 * @return {Object} Robbers settings.
	 */
	getSettings(){
		return {
			list: [...this.list],
			catchProbability: Array.from(this.catchProbability).reduce((obj, [key, value]) => { obj[key] = value; return obj}, {})
		}
	}


}