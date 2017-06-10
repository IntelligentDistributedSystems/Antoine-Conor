import LiveSimulation from './results/LiveSimulation'

/**
 * Deals with the results sent by the server.
 */
export default class Results{

	/**
	 * @param  {Interface} iface - Interface object using this results.
	 */
	constructor(iface){
		/**
		 * Interface object using this results.
		 * @type {Interface}
		 */
		this.interface = iface

		/**
		 * The data computed by the server.
		 * @type {Object}
		 */
		this.data = null
		window.results = this
	}

	/**
	 * When an error is received, prints it to screen.
	 * 
	 * @param  {string} err - the received error
	 * @return {Results} chaining
	 */
	error(err){

		console.error(`Error: ${err}`)

		$('#modal-results p').html(`

			<div class="center">
				Error encountered while computing the results: <br>
				${err}
			</div>
		`).modal('open')

		return this
	}

	/**
	 * When the server is processing, show the progress.
	 *
	 * @param {Number | boolean} percent - The loading progression or false (== 0) if it just started.
	 * @return {Results} chaining
	 */
	loading(percent = false){

		$('#modal-results p').html(`

			<div class="center">
				Please wait while our server is computing the results.
			</div>

			<div class="progress">
				<div class="${ percent ? `determinate" style="width: ${percent}%"` : 'indeterminate"'}></div>
			</div>
		`).modal('open')

		return this
	}

	/**
	 * When everything is okay, display paths, stats and show a simulation.
	 *
	 * @param {Object} data - The results object sent by the server.
	 * @return {Results} chaining
	 */
	showResults(data){

		this.data = data

		data.patrols.forEach(patrol => {
			patrol.label = patrol.reduce((sum, target) => `${sum}${target} ⇒ `, '').slice(0,-3)
		})

		console.info('Results received.')

		// Building the list of patrols.

		let patrolsTableHTML = `
			<table class="striped centered">
				<thead>
					<tr>
						<th>Patrol ID</th>
						<th>path</th>
					</tr>
				</thead>

				<tbody>`

		data.patrols.forEach((patrol, index) => {

			patrolsTableHTML += `
				<tr>
					<td>${index}</td>
					<td>${patrol.label}</td>
				</tr>`
		})

		patrolsTableHTML += `
				</tbody>
			</table>`

		// We have to find the best strategy.

		const statisticsTable = []

		data.strategies.forEach(strategy => {

			const averageGuardianUtility = strategy.iterations.reduce((sum, iteration) => sum+iteration.guardianUtility, 0) / strategy.iterations.length
			const averageRobberUtility = strategy.iterations.reduce((sum, iteration) => sum+iteration.robberUtility, 0) / strategy.iterations.length

			statisticsTable.push({
				iterations: strategy.iterations,
				probabilities: strategy.probabilities.reduce((sum, probability) => `${sum}${probability.toFixed(2)} | `, '').slice(0, -3),
				guardianUtility: averageGuardianUtility,
				robberUtility: averageRobberUtility,
				strategy: strategy
			})

		})

		const sortedStatisticsTable = statisticsTable.sort((s1, s2) => s2.guardianUtility - s1.guardianUtility)

		const bestStreategy = sortedStatisticsTable[0].strategy

		// We feed the chart with average evolution for the best strategy.

		let chartData = []
		let sum = 0

		sortedStatisticsTable[0].iterations.forEach(iteration => {

			chartData.push({
				x: chartData.length,
				y: (sum+=iteration.guardianUtility)/(chartData.length+1)
			})

		})

		// Building the list of statistics.

		let statisticsTableHTML = `
			<table class="striped centered">
				<thead>
					<tr>
						<th>Probabilities</th>
						<th>Guardian utility</th>
						<th>Robber utility</th>
					</tr>
				</thead>

				<tbody>`

		sortedStatisticsTable.forEach(strategy => {

			statisticsTableHTML += `
				<tr>
					<td>${strategy.probabilities}</td>
					<td>${Number(strategy.guardianUtility).toFixed(4)}</td>
					<td>${Number(strategy.robberUtility).toFixed(4)}</td>
				</tr>`
		})

		statisticsTableHTML += `
				</tbody>
			</table>`

		$('#modal-results p').html(`

			<div class="row">
				<div class="col s12">
					<ul class="tabs">
						<li class="tab col s3"><a class="active" href="#chart">Chart</a></li>
						<li class="tab col s3"><a href="#visualization">Visualization</a></li>
						<li class="tab col s3"><a href="#patrols">Patrols</a></li>
						<li class="tab col s3"><a href="#statistics">Statistics</a></li>
					</ul>
				</div>
				<div id="chart" class="col s12">
					<canvas width="100%" height="400" id="line-chart"></canvas>
				</div>
				<div id="visualization" class="col s12">
					<div id="liveSimulationLog">Iteration running...</div>
					<div id="liveSimulation" class="s12">
					</div>
				</div>
				<div id="patrols" class="col s12">
					${patrolsTableHTML}
				</div>
				<div id="statistics" class="col s12">
					${statisticsTableHTML}
				</div>
			</div>

		`).modal('open')

		$('#modal-results p ul.tabs').tabs()

		const scatterChart = new Chart("line-chart", {
			type: 'line',
			data: {
				datasets: [{
					label: 'Best strategy utility over time.',
					data: chartData
				}]
			},
			options: {
				maintainAspectRatio: false,
				scales: {
					xAxes: [{
						type: 'linear',
						position: 'bottom'
					}]
				}
			}
		})

		$('#export-gambit').removeAttr('disabled')

		new LiveSimulation(this, data, bestStreategy, '#liveSimulation').run()

		return this

	}

	/**
	 * Download a Gambit version of the server-computed paths.
	 * /!\ Asynchronous as it relies on Saver::download!
	 * 
	 * @return {Results} chaining
	 */
	exportGambit(){

		const distanceWeight = parseInt($('#distanceWeight').val())
		const settings = this.interface.settings.getSettings()

		const patrols = this.data.patrols
		const robbers = this.interface.settings.robbers.getSettings().list
		const vertices = settings.paths.vertices.filter(vertex => vertex.id != 0)

		let patrolsListString = patrols.reduce((sum, patrol) => `${sum} "${patrol.label}"`,'')

		let attacksListString = ''

		const attacks = []

		robbers.forEach(robber => {

			vertices.forEach(vertex => {

				attacksListString += `"Robber type ${robber} attacking ${vertex.id}" `

				attacks.push({robber: robber, target: vertex})

			})

		})

		let rewardsString = ''

		let numberString = [...Array(patrols.length * robbers.length * vertices.length).keys()].reduce((sum,index) => `${sum}${index+1} `, '')

		attacks.forEach(attack => {

			patrols.forEach(patrol => {

				let distance = 0

				if (patrol.includes(attack.target.id))
					for (let n = 0; patrol[n] !== attack.target.id; n++)
						distance += settings.paths.edges.find(edge => (edge.source === patrol[n] && edge.target === patrol[n+1]) || (edge.source === patrol[n+1] && edge.target === patrol[n])).length
				else 
					distance = Infinity

				console.log(patrol.label)
				console.log(attack.target.id)
				console.log(distance)

				const catchProbability = settings.robbers.catchProbability[''+attack.robber] * distanceWeight/( distance + distanceWeight )

				console.log(attack, catchProbability)

				const guardianUtility = catchProbability * attack.target.guardiansReward - (1 - catchProbability) * attack.target.guardiansCost

				const robberUtility = - catchProbability * attack.target.robberSettings[attack.robber].cost + (1 - catchProbability) * attack.target.robberSettings[attack.robber].reward

				rewardsString += `{ "${patrol.label} vs ${attack.robber} - ${attack.target.id}" ${guardianUtility}, ${robberUtility} }\n`

			})

		})

		const nfg = 
`NFG 1 R "Patrolling game" { "Guardian" "Robber" }

{ { ${patrolsListString}}
{ ${attacksListString}}
}
""

{
${rewardsString}}
${numberString}
`

		const date = new Date()

		this.interface.settings.saver.download(
			`${date.toLocaleDateString()}-${date.toLocaleTimeString().replace(':', '-')}.nfg`,
		nfg)

		return this
	}

}