/*
*	Deals with the results sent by the server.
*/
class Results{

	constructor(){
		window.results = this
	}

	/*
	*	When an error is received, print it to screen.
	*/
	error(err){

		console.log(err)

		$('#modal-results p').html(`

			<div class="center">
				Error encountered while computing the results : <br>
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
	}

	/*
	*	When everything is okay, display graphs, stats and show a simulation.
	*/
	showResults(data){

		console.log(data)

		$('#modal-results p').html(`

			<div class="row">
				<div class="col s12">
					<ul class="tabs">
						<li class="tab col s4"><a class="active" href="#charts">Charts</a></li>
						<li class="tab col s4"><a href="#visualisation">Strategy visualisation</a></li>
						<li class="tab col s4"><a href="#statistics">Statistics</a></li>
					</ul>
				</div>
				<div id="charts" class="col s12">
					<canvas width="100%" height="400" id="line-chart"></canvas>
				</div>
				<div id="visualisation" class="col s12">
					Same path as in settings with animation.
				</div>
				<div id="statistics" class="col s12">
					<table class="striped">
						<thead>

						</thead>
						<tbody>

						</tbody>
					</table>
				</div>
			</div>

		`).modal('open')

		$('#modal-results p ul.tabs').tabs()

		const scatterChart = new Chart("line-chart", {
			type: 'line',
			data: {
				datasets: [{
					label: 'Best strategy utility over time.',
					data: [{
						x: -10,
						y: 0
					}, {
						x: 0,
						y: 10
					}, {
						x: 10,
						y: 5
					}]
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

	}

}