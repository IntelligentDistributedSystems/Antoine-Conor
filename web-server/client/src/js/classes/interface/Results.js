import LiveSimulation from './results/LiveSimulation'

/*
*	Deals with the results sent by the server.
*/
export default class Results{

	constructor(iface){
		this.interface = iface
		window.results = this
	}

	/*
	*	When an error is received, print it to screen.
	*/
	error(err){

		console.error(`Error: ${err}`)

		$('#modal-results p').html(`

			<div class="center">
				Error encountered while computing the results: <br>
				${err}
			</div>
		`).modal('open')
	}

	/*
	*	When the server is processing, show the progress.
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

	/*
	*	When everything is okay, display paths, stats and show a simulation.
	*/
	showResults(data){

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
					<td>${patrol.reduce((sum, target) => `${sum}${target} ⇒ `, '').slice(0,-3)}</td>
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

		new LiveSimulation(this, data, bestStreategy, '#liveSimulation').run()

		return this

	}

}