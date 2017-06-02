(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Settings = require('./interface/Settings');

var _Settings2 = _interopRequireDefault(_Settings);

var _Results = require('./interface/Results');

var _Results2 = _interopRequireDefault(_Results);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
*	Interface between the client side and the back-end.
*
*	The interface has settings and a socket enabling it 
*	to send and receive data from the server running the
*	Java MAS simulation.
*/

var Interface = function () {
	function Interface() {
		_classCallCheck(this, Interface);

		// Fields

		this.socket = io.connect('http://' + window.location.hostname + ':8083');
		this.settings = new _Settings2.default(this);
		this.results = new _Results2.default(this);
		this.simulationRunning = false;

		// Socket listeners

		this.socket.on('connect', function () {

			console.info('Connection to the remote server established.');
		});
	}

	/*
 *	Start the simulation by sending the settings to the back-end
 *	along the message 'startSimulation'.
 */

	_createClass(Interface, [{
		key: 'startSimulation',
		value: function startSimulation() {
			var _this = this;

			this.simulationRunning = true;

			this.socket.on('loading', function (data) {
				return _this.results.loading(data.progress);
			});

			this.results.loading(0);

			this.socket.emit('startSimulation', this.settings.getSettings(), function (results) {

				console.log(results);

				if (!_this.simulationRunning) return;

				if (results.error) return _this.results.error(results.error);

				_this.results.showResults(results.data);
			});

			return this;
		}

		/*
  *	Stop the client-side simulation by removing the loading screen and
  *	blocking results callback.
  */

	}, {
		key: 'stopSimulation',
		value: function stopSimulation() {
			this.simulationRunning = false;

			this.socket.removeListener('loading');

			this.socket.emit('cancel');

			return this;
		}
	}]);

	return Interface;
}();

exports.default = Interface;
},{"./interface/Results":2,"./interface/Settings":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _LiveSimulation = require('./results/LiveSimulation');

var _LiveSimulation2 = _interopRequireDefault(_LiveSimulation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
*	Deals with the results sent by the server.
*/
var Results = function () {
	function Results(iface) {
		_classCallCheck(this, Results);

		this.interface = iface;
		this.data = null;
		window.results = this;
	}

	/*
 *	When an error is received, print it to screen.
 */


	_createClass(Results, [{
		key: 'error',
		value: function error(err) {

			console.error('Error: ' + err);

			$('#modal-results p').html('\n\n\t\t\t<div class="center">\n\t\t\t\tError encountered while computing the results: <br>\n\t\t\t\t' + err + '\n\t\t\t</div>\n\t\t').modal('open');
		}

		/*
  *	When the server is processing, show the progress.
  */

	}, {
		key: 'loading',
		value: function loading() {
			var percent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;


			$('#modal-results p').html('\n\n\t\t\t<div class="center">\n\t\t\t\tPlease wait while our server is computing the results.\n\t\t\t</div>\n\n\t\t\t<div class="progress">\n\t\t\t\t<div class="' + (percent ? 'determinate" style="width: ' + percent + '%"' : 'indeterminate"') + '></div>\n\t\t\t</div>\n\t\t').modal('open');

			return this;
		}

		/*
  *	When everything is okay, display paths, stats and show a simulation.
  */

	}, {
		key: 'showResults',
		value: function showResults(data) {

			this.data = data;

			data.patrols.forEach(function (patrol) {
				patrol.label = patrol.reduce(function (sum, target) {
					return '' + sum + target + ' \u21D2 ';
				}, '').slice(0, -3);
			});

			console.info('Results received.');

			// Building the list of patrols.

			var patrolsTableHTML = '\n\t\t\t<table class="striped centered">\n\t\t\t\t<thead>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<th>Patrol ID</th>\n\t\t\t\t\t\t<th>path</th>\n\t\t\t\t\t</tr>\n\t\t\t\t</thead>\n\n\t\t\t\t<tbody>';

			data.patrols.forEach(function (patrol, index) {

				patrolsTableHTML += '\n\t\t\t\t<tr>\n\t\t\t\t\t<td>' + index + '</td>\n\t\t\t\t\t<td>' + patrol.label + '</td>\n\t\t\t\t</tr>';
			});

			patrolsTableHTML += '\n\t\t\t\t</tbody>\n\t\t\t</table>';

			// We have to find the best strategy.

			var statisticsTable = [];

			data.strategies.forEach(function (strategy) {

				var averageGuardianUtility = strategy.iterations.reduce(function (sum, iteration) {
					return sum + iteration.guardianUtility;
				}, 0) / strategy.iterations.length;
				var averageRobberUtility = strategy.iterations.reduce(function (sum, iteration) {
					return sum + iteration.robberUtility;
				}, 0) / strategy.iterations.length;

				statisticsTable.push({
					iterations: strategy.iterations,
					probabilities: strategy.probabilities.reduce(function (sum, probability) {
						return '' + sum + probability.toFixed(2) + ' | ';
					}, '').slice(0, -3),
					guardianUtility: averageGuardianUtility,
					robberUtility: averageRobberUtility,
					strategy: strategy
				});
			});

			var sortedStatisticsTable = statisticsTable.sort(function (s1, s2) {
				return s2.guardianUtility - s1.guardianUtility;
			});

			var bestStreategy = sortedStatisticsTable[0].strategy;

			// We feed the chart with average evolution for the best strategy.

			var chartData = [];
			var sum = 0;

			sortedStatisticsTable[0].iterations.forEach(function (iteration) {

				chartData.push({
					x: chartData.length,
					y: (sum += iteration.guardianUtility) / (chartData.length + 1)
				});
			});

			// Building the list of statistics.

			var statisticsTableHTML = '\n\t\t\t<table class="striped centered">\n\t\t\t\t<thead>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<th>Probabilities</th>\n\t\t\t\t\t\t<th>Guardian utility</th>\n\t\t\t\t\t\t<th>Robber utility</th>\n\t\t\t\t\t</tr>\n\t\t\t\t</thead>\n\n\t\t\t\t<tbody>';

			sortedStatisticsTable.forEach(function (strategy) {

				statisticsTableHTML += '\n\t\t\t\t<tr>\n\t\t\t\t\t<td>' + strategy.probabilities + '</td>\n\t\t\t\t\t<td>' + Number(strategy.guardianUtility).toFixed(4) + '</td>\n\t\t\t\t\t<td>' + Number(strategy.robberUtility).toFixed(4) + '</td>\n\t\t\t\t</tr>';
			});

			statisticsTableHTML += '\n\t\t\t\t</tbody>\n\t\t\t</table>';

			$('#modal-results p').html('\n\n\t\t\t<div class="row">\n\t\t\t\t<div class="col s12">\n\t\t\t\t\t<ul class="tabs">\n\t\t\t\t\t\t<li class="tab col s3"><a class="active" href="#chart">Chart</a></li>\n\t\t\t\t\t\t<li class="tab col s3"><a href="#visualization">Visualization</a></li>\n\t\t\t\t\t\t<li class="tab col s3"><a href="#patrols">Patrols</a></li>\n\t\t\t\t\t\t<li class="tab col s3"><a href="#statistics">Statistics</a></li>\n\t\t\t\t\t</ul>\n\t\t\t\t</div>\n\t\t\t\t<div id="chart" class="col s12">\n\t\t\t\t\t<canvas width="100%" height="400" id="line-chart"></canvas>\n\t\t\t\t</div>\n\t\t\t\t<div id="visualization" class="col s12">\n\t\t\t\t\t<div id="liveSimulationLog">Iteration running...</div>\n\t\t\t\t\t<div id="liveSimulation" class="s12">\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div id="patrols" class="col s12">\n\t\t\t\t\t' + patrolsTableHTML + '\n\t\t\t\t</div>\n\t\t\t\t<div id="statistics" class="col s12">\n\t\t\t\t\t' + statisticsTableHTML + '\n\t\t\t\t</div>\n\t\t\t</div>\n\n\t\t').modal('open');

			$('#modal-results p ul.tabs').tabs();

			var scatterChart = new Chart("line-chart", {
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
			});

			$('#export-gambit').removeAttr('disabled');

			new _LiveSimulation2.default(this, data, bestStreategy, '#liveSimulation').run();

			return this;
		}
	}, {
		key: 'exportGambit',
		value: function exportGambit() {

			var distanceWeight = parseInt($('#distanceWeight').val());
			var settings = this.interface.settings.getSettings();

			var patrols = this.data.patrols;
			var robbers = this.interface.settings.robbers.getSettings().list;
			var vertices = settings.paths.vertices.filter(function (vertex) {
				return vertex.id != 0;
			});

			var patrolsListString = patrols.reduce(function (sum, patrol) {
				return sum + ' "' + patrol.label + '"';
			}, '');

			var attacksListString = '';

			var attacks = [];

			robbers.forEach(function (robber) {

				vertices.forEach(function (vertex) {

					attacksListString += '"Robber type ' + robber + ' attacking ' + vertex.id + '" ';

					attacks.push({ robber: robber, target: vertex });
				});
			});

			var rewardsString = '';

			var numberString = [].concat(_toConsumableArray(Array(patrols.length * robbers.length * vertices.length).keys())).reduce(function (sum, index) {
				return '' + sum + (index + 1) + ' ';
			}, '');

			attacks.forEach(function (attack) {

				patrols.forEach(function (patrol) {

					var distance = 0;

					if (patrol.includes(attack.target.id)) {
						var _loop = function (n) {
							distance += settings.paths.edges.find(edge => edge.source === patrol[n] && edge.target === patrol[n + 1] || edge.source === patrol[n + 1] && edge.target === patrol[n]).length;
						};

						for (let n = 0; patrol[n] !== attack.target.id; n++) {
							_loop(n);
						}
					} else distance = Infinity;

					console.log(patrol.label);
					console.log(attack.target.id);
					console.log(distance);

					var catchProbability = settings.robbers.catchProbability['' + attack.robber] * distanceWeight / (distance + distanceWeight);

					console.log(attack, catchProbability);

					var guardianUtility = catchProbability * attack.target.guardiansReward - (1 - catchProbability) * attack.target.guardiansCost;

					var robberUtility = -catchProbability * attack.target.robberSettings[attack.robber].cost + (1 - catchProbability) * attack.target.robberSettings[attack.robber].reward;

					rewardsString += '{ "' + patrol.label + ' vs ' + attack.robber + ' - ' + attack.target.id + '" ' + guardianUtility + ', ' + robberUtility + ' }\n';
				});
			});

			var nfg = 'NFG 1 R "Patrolling game" { "Guardian" "Robber" }\n\n{ { ' + patrolsListString + '}\n{ ' + attacksListString + '}\n}\n""\n\n{\n' + rewardsString + '}\n' + numberString + '\n';

			var date = new Date();

			this.interface.settings.saver.download(date.toLocaleDateString() + '-' + date.toLocaleTimeString().replace(':', '-') + '.nfg', nfg);
		}
	}]);

	return Results;
}();

exports.default = Results;
},{"./results/LiveSimulation":4}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Graph = require('./settings/subsettings/Graph.js');

var _Graph2 = _interopRequireDefault(_Graph);

var _Robbers = require('./settings/subsettings/Robbers.js');

var _Robbers2 = _interopRequireDefault(_Robbers);

var _Saver = require('./settings/files/Saver');

var _Saver2 = _interopRequireDefault(_Saver);

var _Loader = require('./settings/files/Loader');

var _Loader2 = _interopRequireDefault(_Loader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
*	Settings of the simulation.
*
*	Initialize settings with default values.
*/

var Settings = function () {
	function Settings(iface) {
		_classCallCheck(this, Settings);

		this.interface = iface;

		// Fields

		this.graph = new _Graph2.default(this);

		this.robbers = new _Robbers2.default(this);

		this.saver = new _Saver2.default(this);
		this.loader = new _Loader2.default(this);

		// Default values

		this.init();
		this.loader.loadDefault();
	}

	_createClass(Settings, [{
		key: 'init',
		value: function init() {
			this.graph.init();
			this.robbers.init();
			$('#numberOfIterations').val(20);

			return this;
		}

		/*
  *	Return settings as as JSON object.
  *
  *	Those settings can be send to the backend.
  */

	}, {
		key: 'getSettings',
		value: function getSettings() {
			return {
				general: this.getGeneralSettings(),
				paths: this.graph.getSettings(),
				robbers: this.robbers.getSettings()
			};
		}

		/*
  *	Concatenate the general settings in one 
  *	JSON object.
  */

	}, {
		key: 'getGeneralSettings',
		value: function getGeneralSettings() {
			return {
				numberOfIterations: parseInt($('#numberOfIterations').val()),
				distanceWeight: parseInt($('#distanceWeight').val())
			};
		}
	}]);

	return Settings;
}();

exports.default = Settings;
},{"./settings/files/Loader":5,"./settings/files/Saver":6,"./settings/subsettings/Graph.js":7,"./settings/subsettings/Robbers.js":8}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LiveSimulation = function () {
	function LiveSimulation(results, computedData, bestStreategy, selector) {
		var _this = this;

		_classCallCheck(this, LiveSimulation);

		this.results = results;
		this.originalCy = this.results.interface.settings.graph.cy;
		window.liveSimulation = this;

		this.computedData = computedData;
		this.bestStreategy = bestStreategy;
		this.selector = selector;

		this.stylesheet = [{
			selector: 'node',
			style: {
				height: 20,
				width: 20
			}
		}, {
			selector: 'edge',
			style: {
				'curve-style': 'haystack',
				'haystack-radius': 0,
				width: 5,
				opacity: 0.5,
				'line-color': 'grey'
			}
		}, {
			selector: '.base',
			style: {
				'background-color': '#61bffc'
			}
		}, {
			selector: '.secured',
			style: {
				'background-color': '#81c784'
			}
		}, {
			selector: '.robbed',
			style: {
				'background-color': '#e57373'
			}
		}, {
			selector: '.caught',
			style: {
				'background-color': '#E57373'
			}
		}, {
			selector: '.guardian',
			style: {
				height: 40,
				width: 40,
				'background-image': '/img/guardian-40.png',
				'background-opacity': 0
			}
		}, {
			selector: '.robber',
			style: {
				height: 40,
				width: 40,
				'background-image': '/img/robber-40.png',
				'background-opacity': 0
			}
		}];

		this.cy = cytoscape({
			container: $(this.selector),

			boxSelectionEnabled: false,
			autounselectify: false,

			style: this.stylesheet
		});

		this.cy.minZoom(0.5);
		this.cy.maxZoom(2);

		// Import nodes and vertices from cy object.

		this.originalCy.nodes().forEach(function (node) {
			_this.cy.add({
				data: { id: node.id() },
				position: node.position(),
				group: 'nodes',
				classes: 'node' + (node.id() === '0' ? ' base' : ''),
				selectable: false,
				locked: true,
				grabbable: false
			});
		});

		this.base = this.cy.nodes('[id = "0"]');

		this.originalCy.edges().forEach(function (edge) {
			_this.cy.add({
				data: {
					id: edge.id(),
					source: edge.source().id(),
					target: edge.target().id()
				},
				group: 'edges',
				selectable: false,
				locked: true,
				grabbable: false
			});
		});

		// Add robber and guardian.

		this.cy.add({
			data: { id: 'robber' },
			position: {
				x: Math.cos(new Date() / 1000) * 20,
				y: Math.sin(new Date() / 1000) * 20
			},
			classes: 'robber',
			selectable: false,
			locked: false,
			grabbable: false
		});

		this.cy.add({
			data: { id: 'guardian' },
			position: Object.assign({}, this.cy.nodes('[id = "0"]').position()),
			classes: 'guardian',
			selectable: false,
			locked: false,
			grabbable: false
		});

		this.robber = this.cy.nodes('#robber');
		this.guardian = this.cy.nodes('#guardian');
	}

	_createClass(LiveSimulation, [{
		key: 'newIteration',
		value: function newIteration() {
			this.robberTarget = this.randomTarget();
			this.iterationStart = new Date();
			this.countdown = Math.random() * 2500 * this.cy.filter('.node').length + 2500;
			this.guardianPath = this.randomPath();
			this.guardianLastVisit = this.base;
			this.guardian.position(Object.assign({}, this.base.position()));
			this.guardianTarget = this.nextGuardianTarget(true);

			return this;
		}
	}, {
		key: 'nextStep',
		value: function nextStep() {
			var _this2 = this;

			// fix a bug when graph is not showing on page change.
			this.cy.resize();
			this.cy.fit(this.cy.filter('.node'));

			// If the user dismiss the results, we stop the simulation.
			if ($(this.selector).length === 0) return console.info('Live simulation stopped.');

			var delta = (this.iterationStart.valueOf() + this.countdown - new Date().valueOf()) / 50;

			if (delta <= 0) return this.robberHitTarget();

			this.robber.position({
				x: Math.cos(new Date() / 1000) * delta + this.robberTarget.position().x,
				y: Math.sin(new Date() / 1000) * delta + this.robberTarget.position().y
			});
			this.robber.data('refresh', Math.random());

			var guardianPosition = this.guardian.position();
			var targetPosition = this.guardianTarget.position();

			guardianPosition.x = guardianPosition.x * 0.95 + targetPosition.x * 0.05;
			guardianPosition.y = guardianPosition.y * 0.95 + targetPosition.y * 0.05;
			this.guardian.data('refresh', Math.random());

			if ((guardianPosition.x - targetPosition.x) ** 2 + (guardianPosition.y - targetPosition.y) ** 2 < 5) {
				this.guardianTarget.addClass('secured');
				this.guardianLastVisit = this.guardianTarget;
				var newGuardianTarget = this.nextGuardianTarget();
				if (newGuardianTarget !== null) this.guardianTarget = newGuardianTarget;
				//else 
				//	return this.everyTargetIsSecured()
			}

			setTimeout(function () {
				return _this2.nextStep();
			}, 50);
		}
	}, {
		key: 'robberHitTarget',
		value: function robberHitTarget() {
			if (!this.robberTarget.hasClass('secured')) {
				this.robberTarget.addClass('robbed');
				$('#liveSimulationLog').text('Robbed!');
			} else {
				this.robberTarget.removeClass('secured').addClass('caught');
				$('#liveSimulationLog').text('Caught!');
			}
			return this.iterationEnd();
		}
	}, {
		key: 'randomPath',
		value: function randomPath() {
			var _this3 = this;

			var fairDiceRoll = Math.random();

			var pathNumber = -1;

			while (fairDiceRoll > 0) {
				pathNumber++;
				fairDiceRoll -= this.bestStreategy.probabilities[pathNumber];
			}

			return this.computedData.patrols[pathNumber].slice(1).map(function (nodeId) {
				return _this3.cy.nodes('[id = "' + nodeId + '"]')[0];
			});
		}
	}, {
		key: 'iterationEnd',
		value: function iterationEnd() {
			var _this4 = this;

			setTimeout(function () {
				_this4.cy.nodes().forEach(function (node) {
					return node.removeClass('secured').removeClass('robbed').removeClass('caught');
				});
				_this4.run();
				$('#liveSimulationLog').text('Iteration running...');
			}, 1000);

			return this;
		}
	}, {
		key: 'nextGuardianTarget',
		value: function nextGuardianTarget(init) {
			if (init) return this.guardianPath[0];

			var index = this.guardianPath.indexOf(this.guardianTarget);
			if (index + 1 === this.guardianPath.length) return null;

			return this.guardianPath[index + 1];
		}

		/*
  *	Target get according to the distribution (see RobbersInterest)
  */

	}, {
		key: 'randomTarget',
		value: function randomTarget() {
			var distribution = [];
			this.originalCy.nodes('[id != "0"]').forEach(function (node) {
				for (var i = 0; i < node.data('robbersInterest'); i++) {
					distribution.push(node.id());
				}
			});

			var randomId = distribution[Math.floor(Math.random() * distribution.length)];

			return this.cy.nodes('#' + randomId)[0];
		}
	}, {
		key: 'run',
		value: function run() {
			this.newIteration();
			this.nextStep();

			return this;
		}
	}]);

	return LiveSimulation;
}();

exports.default = LiveSimulation;
},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
*	Loader enables us to load settings from an object or from a file.
*/

var Loader = function () {
	function Loader(settings) {
		_classCallCheck(this, Loader);

		this.settings = settings;

		this.defaultSettings = {
			"general": {
				"numberOfIterations": 20,
				"distanceWeight": 200
			},
			"paths": {
				"vertices": [{
					"id": 0,
					"position": {
						"x": 93.74723822180408,
						"y": 20
					},
					"robbersInterest": 1,
					"guardiansCost": 1,
					"guardiansReward": 1,
					"robberSettings": {
						"0": {
							"cost": 1,
							"reward": 1
						}
					}
				}, {
					"id": 1,
					"position": {
						"x": 20.252761778195918,
						"y": 20
					},
					"robbersInterest": 1,
					"guardiansCost": 1,
					"guardiansReward": 1,
					"robberSettings": {
						"0": {
							"cost": 1,
							"reward": 1
						}
					}
				}],
				"edges": [{
					"source": 0,
					"target": 1,
					"length": 73.49447644360816
				}]
			},
			"robbers": {
				"list": [0],
				"catchProbability": {
					"0": 0.5
				}
			}
		};
	}

	/*
 *	Load the settings (Object) after checking if they are corrupted or not.
 */


	_createClass(Loader, [{
		key: "load",
		value: function load(settings) {
			var _this = this;

			// TODO : Verify integrity.
			this.settings.init();

			$('#numberOfIterations').val(settings.general.numberOfIterations);
			$('#distanceWeight').val(settings.general.distanceWeight);

			// Id maps (loaded ids => current ids)

			var verticesIdMap = new Map();
			var robbersIdMap = new Map();

			settings.robbers.list.forEach(function (robberId) {
				robbersIdMap.set(robberId, _this.settings.robbers.newRobber(1 - settings.robbers.catchProbability["" + robberId]));
			});

			settings.paths.vertices.forEach(function (vertex) {

				verticesIdMap.set(vertex.id, _this.settings.graph.addNode(vertex.position, vertex.id === 0, vertex.robbersInterest, vertex.guardiansCost, vertex.guardiansReward));

				var newNodeId = verticesIdMap.get(vertex.id);

				settings.robbers.list.forEach(function (robberId) {
					var newRobberId = robbersIdMap.get(robberId);

					_this.settings.graph.cy.nodes("[id = \"" + newNodeId + "\"]").data('robberSettings').set(newRobberId, vertex.robberSettings[robberId]);
				});
			});

			settings.paths.edges.forEach(function (edge) {
				_this.settings.graph.link(verticesIdMap.get(edge.source), verticesIdMap.get(edge.target));
			});

			this.settings.graph.cy.fit();

			console.log('Settings loaded');

			return this;
		}

		/*
  *	Load the settings object from a JSON file on client's computer.
  */

	}, {
		key: "import",
		value: function _import() {
			var _this2 = this;

			var input = document.createElement('input');
			input.setAttribute('type', 'file');

			input.style.display = 'none';

			input.addEventListener('change', function (event) {

				var file = input.files[0];

				var reader = new FileReader();
				reader.onload = function (event) {
					_this2.load(JSON.parse(atob(event.target.result.split(',').pop())));
				};

				reader.readAsDataURL(file);

				document.body.removeChild(input);
			});

			document.body.appendChild(input);

			input.click();

			return this;
		}

		/*
  *	Initialize the graph by setting default values.
  */

	}, {
		key: "loadDefault",
		value: function loadDefault() {
			return this.load(this.defaultSettings);
		}
	}]);

	return Loader;
}();

exports.default = Loader;
},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Saver = function () {
	function Saver(settings) {
		_classCallCheck(this, Saver);

		this.settings = settings;
	}

	_createClass(Saver, [{
		key: 'save',
		value: function save() {

			var date = new Date();

			return this.download(date.toLocaleDateString() + '-' + date.toLocaleTimeString().replace(':', '-') + '.json', JSON.stringify(this.settings.getSettings()));
		}
	}, {
		key: 'download',
		value: function download(filename, text) {
			var link = document.createElement('a');
			link.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
			link.setAttribute('download', filename);

			link.style.display = 'none';
			document.body.appendChild(link);

			link.click();

			document.body.removeChild(link);

			return this;
		}
	}]);

	return Saver;
}();

exports.default = Saver;
},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
*	Class representing the graph of the simulation.
*
*	You can add targets, delete targets, and link
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

var Graph = function () {
	function Graph(settings) {
		var _this = this;

		_classCallCheck(this, Graph);

		// Fields

		this.settings = settings;

		this.stylesheet = [{
			selector: 'node',
			style: {
				height: 20,
				width: 20,
				'background-color': 'mapData(robbersInterest, 0, 25, green, red)',
				content: function content(node) {
					return 'N' + node.data('id') + ' C' + node.data('guardiansCost') + '/R' + node.data('guardiansReward');
				},
				//'text-valign': 'center',
				'text-halign': 'center'
			}
		}, {
			selector: 'edge',
			style: {
				'curve-style': 'haystack',
				'haystack-radius': 0,
				width: 5,
				opacity: 0.5,
				'line-color': '#a2efa2',
				content: function content(edge) {
					return Math.floor(_this.length(edge));
				}
			}
		}, {
			selector: '.base',
			style: {
				'background-color': '#61bffc',
				label: 'Base'
			}
		}, {
			selector: ':selected',
			style: {
				'border-width': 4,
				'border-color': 'purple'
			}
		}];

		this.cy = window.cy = cytoscape({
			container: $('#graph'),

			boxSelectionEnabled: false,
			autounselectify: false,

			style: this.stylesheet
		});

		this.cy.minZoom(0.5);
		this.cy.maxZoom(2);

		window.graph = this;

		// Refreshing the length

		this.refreshInterval = setInterval(function () {
			return cy.edges().forEach(function (edge) {
				return edge.data('refresh', Math.random());
			});
		}, 250);

		// DOM listeners

		$(document).on('click', '.qtip-content .link', function (event) {
			console.info("Linking a target to another...");
			_this.currentAction = 'linking';
			$('.qtip').qtip('hide');
		});

		$(document).on('click', '.qtip-content .delete', function (event) {
			_this.lastSelectedNode.remove();
			_this.reset();
		});

		$(document).on('click', '.qtip-content .dismiss', function (event) {
			_this.reset();
		});

		$(document).on('click', '.qtip-content .plusInterest', function (event) {
			_this.lastSelectedNode.data('robbersInterest', Math.min(_this.lastSelectedNode.data('robbersInterest') + 1, 25));
		});

		$(document).on('click', '.qtip-content .minusInterest', function (event) {
			_this.lastSelectedNode.data('robbersInterest', Math.max(_this.lastSelectedNode.data('robbersInterest') - 1, 0));
		});

		$(document).on('click', '.qtip-content .plusCost', function (event) {
			_this.lastSelectedNode.data('guardiansCost', Math.min(_this.lastSelectedNode.data('guardiansCost') + 1, 25));
		});

		$(document).on('click', '.qtip-content .minusCost', function (event) {
			_this.lastSelectedNode.data('guardiansCost', Math.max(_this.lastSelectedNode.data('guardiansCost') - 1, 0));
		});

		$(document).on('click', '.qtip-content .plusReward', function (event) {
			_this.lastSelectedNode.data('guardiansReward', Math.min(_this.lastSelectedNode.data('guardiansReward') + 1, 25));
		});

		$(document).on('click', '.qtip-content .minusReward', function (event) {
			_this.lastSelectedNode.data('guardiansReward', Math.max(_this.lastSelectedNode.data('guardiansReward') - 1, 0));
		});

		// Cytoscape listeners

		this.cy.on('tap', function (event) {
			if (event.target === event.cy) _this.reset();
			// When you tap on the background and that there are no visible tips, you add a new node at this position.
			// If a tip is visible, you probably just want to dismiss it
			if (event.target === event.cy && !$('.qtip:visible').length) {
				return _this.addNode(event.position);
			}
		});

		this.cy.on('tap', 'node', function (event) {
			if (_this.currentAction === 'linking') {
				_this.currentAction = null;
				var secondNode = event.target;
				// We check if that edge aleady exists or if the source and target are the same node.
				if (!_this.cy.elements('edge[source = "' + _this.lastSelectedNode.id() + '"][target = "' + secondNode.id() + '"]').length && !_this.cy.elements('edge[target = "' + _this.lastSelectedNode.id() + '"][source = "' + secondNode.id() + '"]').length && secondNode != _this.lastSelectedNode) {
					_this.link(_this.lastSelectedNode.id(), secondNode.id());
				}
			}

			_this.lastSelectedNode = event.target;
		});

		this.cy.on('tap', 'edge', function (event) {
			event.target.remove();
		});

		// fix a bug when tap doesn't work on page change.

		$(document).on('click', function (event) {
			return _this.cy.resize();
		});

		this.init();
	}

	/*
 *	Initialize the graph by setting default values.
 */


	_createClass(Graph, [{
		key: 'init',
		value: function init() {
			this.nbrEdgesCreated = 0;
			this.nbrNodesCreated = 0;

			this.lastSelectedNode = null;
			this.currentAction = null;

			this.cy.elements().forEach(function (element) {
				return element.remove();
			});

			return this;
		}

		/*
  *	Sort targets with the CoSE layout (by Bilkent University).
  */

	}, {
		key: 'sort',
		value: function sort() {
			this.cy.layout({
				name: 'cose-bilkent',
				animate: true
			}).run();

			return this;
		}

		/*
  *	Reset the current action, selected target and hide the tips.
  */

	}, {
		key: 'reset',
		value: function reset() {
			this.lastSelectedNode = null;
			this.currentAction = null;
			$('.qtip').qtip('hide');

			return this;
		}

		/*
  *	Link two targets together. You have to specify the ids.
  */

	}, {
		key: 'link',
		value: function link(source, target) {
			this.cy.add({
				data: {
					id: 'e' + this.nbrEdgesCreated++,
					source: source,
					target: target
				},
				group: 'edges',
				selectable: true,
				locked: false,
				grabbable: true,
				classes: ''
			});
			console.info('Edge added linking ' + source + ' to ' + target + '.');

			return this;
		}

		/*
  *	Add a node to the graph.
  *	
  *	Arguments :
  *		- position should be an object with fields x and y.
  *		- base is a boolean defining if the node is the base.
  *
  *	Base nodes can not been attacket nor defended.
  *	Patrols have to start and end at the base.
  */

	}, {
		key: 'addNode',
		value: function addNode() {
			var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { x: 0, y: 0 };
			var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
			var robbersInterest = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
			var guardiansCost = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
			var guardiansReward = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;

			var newNodeId = this.cy.nodes().length;

			var newNode = this.cy.add({
				data: {
					id: newNodeId,
					robbersInterest: robbersInterest,
					guardiansCost: guardiansCost,
					guardiansReward: guardiansReward,
					robberSettings: new Map()
				},
				position: position,
				group: 'nodes',
				selectable: true,
				locked: false,
				grabbable: true,
				classes: base ? 'base' : ''
			}).qtip({
				content: '\n\t\t\t<div>\n\t\t\t\t<a class="waves-effect waves-light btn blue link" style="width:160px"><i class="material-icons right">timeline</i>Link to...</a>\n\t\t\t\t<a class="waves-effect waves-light btn red delete" style="width:160px; margin-top: 10px" ' + (base ? 'disabled' : '') + '><i class="material-icons right">delete</i>Delete</a>\n\t\t\t\t\n\t\t\t\t<a class="waves-effect waves-light btn red lighten-2 minusInterest col" ' + (base ? 'disabled' : '') + '><i class="material-icons">remove_circle</i></a>\n\t\t\t\t<div class="label">Robbers Interest</div>\n\t\t\t\t<a class="waves-effect waves-light btn green lighten-2 plusInterest col" ' + (base ? 'disabled' : '') + '><i class="material-icons">add_circle</i></a>\n\n\t\t\t\t<a class="waves-effect waves-light btn red lighten-2 minusCost col" ' + (base ? 'disabled' : '') + '><i class="material-icons">remove_circle</i></a>\n\t\t\t\t<div class="label">Guardians Cost</div>\n\t\t\t\t<a class="waves-effect waves-light btn green lighten-2 plusCost col" ' + (base ? 'disabled' : '') + '><i class="material-icons">add_circle</i></a>\n\n\t\t\t\t<a class="waves-effect waves-light btn red lighten-2 minusReward col" ' + (base ? 'disabled' : '') + '><i class="material-icons">remove_circle</i></a>\n\t\t\t\t<div class="label">Guardians Reward</div>\n\t\t\t\t<a class="waves-effect waves-light btn green lighten-2 plusReward col" ' + (base ? 'disabled' : '') + '><i class="material-icons">add_circle</i></a>\n\n\t\t\t\t<a class="waves-effect waves-light btn green dismiss" style="width:160px; margin-top: 10px"><i class="material-icons right">cancel</i>Dismiss</a>\n\t\t\t</div>\n\t\t\t',
				position: {
					my: 'top center',
					at: 'bottom center'
				},
				style: {
					classes: 'qtip-bootstrap',
					width: 195
				}
			});

			this.settings.robbers.list.forEach(function (robber) {
				return newNode.data('robberSettings').set(robber, {
					cost: 2,
					reward: 1
				});
			});

			return newNodeId;
		}

		/*
  *	Return the length of an edge.
  */

	}, {
		key: 'length',
		value: function length(edge) {
			return this.distance(edge.source(), edge.target());
		}

		/*
  *	Return the distance between dwo vertices.
  */

	}, {
		key: 'distance',
		value: function distance(node1, node2) {
			return ((node1.position().x - node2.position().x) ** 2 + (node1.position().y - node2.position().y) ** 2) ** 0.5;
		}

		/*
  *	Concatenate settings into a JSON object.
  */

	}, {
		key: 'getSettings',
		value: function getSettings() {
			var _this2 = this;

			return {
				vertices: Object.keys(cy.nodes()).filter(function (key) {
					return !isNaN(key);
				}).map(function (key) {
					return {
						id: parseInt(cy.nodes()[key].id()),
						position: cy.nodes()[key].position(),
						robbersInterest: cy.nodes()[key].data('robbersInterest'),
						guardiansCost: cy.nodes()[key].data('guardiansCost'),
						guardiansReward: cy.nodes()[key].data('guardiansReward'),
						robberSettings: Array.from(cy.nodes()[key].data('robberSettings')).reduce(function (obj, _ref) {
							var _ref2 = _slicedToArray(_ref, 2),
							    key = _ref2[0],
							    value = _ref2[1];

							obj[key] = value;return obj;
						}, {})
					};
				}),
				edges: Object.keys(cy.edges()).filter(function (key) {
					return !isNaN(key);
				}).map(function (key) {
					return {
						source: parseInt(cy.edges()[key].source().id()),
						target: parseInt(cy.edges()[key].target().id()),
						length: _this2.length(cy.edges()[key])
					};
				})
			};
		}
	}]);

	return Graph;
}();

exports.default = Graph;
},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Robbers = function () {
	function Robbers(settings) {
		var _this = this;

		_classCallCheck(this, Robbers);

		// Fields

		this.settings = settings;

		// DOM listeners

		$(document).on('click', '#robbers .delete', function (event) {

			_this.removeRobber($(event.currentTarget).parent().parent().parent().data('robberid'));
		});

		$(document).on('click', '#robbers .configure', function (event) {

			_this.configureRobber($(event.currentTarget).parent().parent().parent().data('robberid'));
		});

		$(document).on('change', '#robbers input.discretion', function (event) {

			var newValue = 1 - parseFloat($(event.currentTarget).val());

			if (newValue < 0 || newValue > 1) {
				return $(event.currentTarget).css({
					color: 'red'
				});
			}

			$(event.currentTarget).css({
				color: "#fff"
			});

			_this.catchProbability.set($(event.currentTarget).parent().parent().parent().parent().data('robberid'), newValue);
		});

		$(document).on('change', '#modal-robber-config input', function (event) {

			var row = $(event.currentTarget).parent().parent();

			var nodeId = row.data('nodeid');
			var robberId = row.data('robberid');

			var setting = $(event.currentTarget).data('setting');
			var newValue = parseFloat($(event.currentTarget).val());

			console.info(setting + ' changed for target ' + nodeId + ', new value is ' + newValue + '.');

			_this.settings.graph.cy.nodes('[id = "' + nodeId + '"]').data('robberSettings').get(robberId)[setting] = newValue;
		});

		this.init();
	}

	/*
 *	Initialize the robbers by setting default values.
 */


	_createClass(Robbers, [{
		key: 'init',
		value: function init() {
			var _this2 = this;

			if (typeof this.list !== 'undefined') [].concat(_toConsumableArray(this.list)).forEach(function (robberId) {
				return _this2.removeRobber(robberId);
			});

			this.numberOfRobbersCreated = 0;

			this.list = new Set();

			this.catchProbability = new Map();

			return this;
		}

		/*
  *	Add a robber to the settings.
  *	His card can be seen in the "Robbers" tab.
  *	His settings are set to default in every target.
  */

	}, {
		key: 'newRobber',
		value: function newRobber() {
			var catchProbability = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0.5;


			var robberId = this.numberOfRobbersCreated++;

			this.list.add(robberId);

			this.catchProbability.set(robberId, catchProbability);

			this.settings.graph.cy.nodes().each(function (node) {
				return node.data('robberSettings').set(robberId, {
					cost: 1,
					reward: 1
				});
			});

			$('#robbers').append('\n\t\t\t<div class="col s4" data-robberid="' + robberId + '">\n\t\t\t    <div class="card blue-grey darken-1">\n\t\t\t\t\t<div class="card-content white-text">\n\t\t\t\t\t\t<span class="card-title">Robber ' + (robberId + 1) + '</span>\n\t\t\t\t\t\t<!--<p>Some bad guy.</p>-->\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="card-action">\n\t\t\t\t\t\t<div class="discretionContainer">\n\t\t\t\t\t\t\t<span>Discretion</span>\n\t\t\t\t\t\t\t<input type="number" step="0.05" class="discretion" min="0" max="1" value="' + (1 - catchProbability) + '">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<a class="waves-effect waves-light btn blue configure" style="width: 100%; margin-top: 10px;"><i class="material-icons right">mode_edit</i>Rewards</a>\n\t\t\t\t\t\t<a class="waves-effect waves-light btn red delete" style="width: 100%; margin-top: 10px" ' + (robberId === 0 ? 'disabled' : '') + '><i class="material-icons right">delete</i>Delete</a>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t');

			return robberId;
		}

		/*
  *	Remove a robber from the settings.
  *	His card gets removed and references to his settings are
  *	removed from each target.
  */

	}, {
		key: 'removeRobber',
		value: function removeRobber(robberId) {

			console.info('Removing robber ' + robberId + '...');

			this.list.delete(robberId);

			this.settings.graph.cy.nodes().each(function (node) {
				return node.data('robberSettings').delete(robberId);
			});

			$('#robbers').find('[data-robberid=' + robberId + ']').remove();

			return this;
		}

		/*
  *	Display a modal enabling the user to set the
  *	robber properties for every target.
  */

	}, {
		key: 'configureRobber',
		value: function configureRobber(robberId) {

			console.info('Configuring robber ' + (robberId + 1) + '.');

			var table = '\n\t\t\t<table class="striped centered">\n\t\t\t\t<thead>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<th>Target ID</th>\n\t\t\t\t\t\t<th>Cost</th>\n\t\t\t\t\t\t<th>Reward</th>\n\t\t\t\t\t</tr>\n\t\t\t\t</thead>\n\n\t\t\t\t<tbody>';

			this.settings.graph.cy.nodes('[id != "0"]').forEach(function (node) {

				var settings = node.data('robberSettings').get(robberId);

				table += '\n\t\t\t\t<tr data-nodeid="' + node.id() + '" data-robberid="' + robberId + '">\n\t\t\t\t\t<td>' + node.id() + '</td>\n\t\t\t\t\t<td><input data-setting="cost" type="number" value="' + settings.cost + '" min="0"></td>\n\t\t\t\t\t<td><input data-setting="reward" type="number" value="' + settings.reward + '" min="0"></td>\n\t\t\t\t</tr>';
			});

			table += '\n\t\t\t\t</tbody>\n\t\t\t</table>';

			$('#modal-robber-config h4').text('Robber ' + (robberId + 1) + ' configuration');

			$('#modal-robber-config p').html(table);

			$('#modal-robber-config').modal('open');

			return this;
		}

		/*
  *	Return the list of every robber.
  */

	}, {
		key: 'getSettings',
		value: function getSettings() {
			return {
				list: [].concat(_toConsumableArray(this.list)),
				catchProbability: Array.from(this.catchProbability).reduce(function (obj, _ref) {
					var _ref2 = _slicedToArray(_ref, 2),
					    key = _ref2[0],
					    value = _ref2[1];

					obj[key] = value;return obj;
				}, {})
			};
		}
	}]);

	return Robbers;
}();

exports.default = Robbers;
},{}],9:[function(require,module,exports){
'use strict';

var _Interface = require('./classes/Interface');

var _Interface2 = _interopRequireDefault(_Interface);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
*	Cytoscape (the graph library we are using) doesn't work so
*	well when the rendering canvas is hidden while the graph
*	is initialized. We have to wait for the canvas to be displayed
*	before initializing it and to only do so once.
*
*	Thus, we use the global flag graphInitialized.
*/

var graphInitialized = false;

/*
*	Function called whenever the hash is updated to do the correct
*	action.
*/

var updateHash = function updateHash(hash) {

	// We remove the '#' character from the hash. Just in case.
	hash = hash.replace(/^#/, '');

	/*
 *	Prevents # links from going to the element.
 */
	var node = $('#' + hash);
	node.attr('id', '');
	document.location.hash = hash;
	node.attr('id', hash);

	/*
 *	We have to sort the graph when it's displayed
 *	for the first time.
 */
	if (!graphInitialized && hash === 'simulate') {
		window.graph.sort();
		graphInitialized = true;
	}

	if (window.cy !== undefined) window.cy.resize();

	/*
 *	Fix a bug with parallax images.
 */

	setTimeout(function () {
		$(window).scroll().resize();
	}, 25);
};

/*
*	Setup non-specific DOM listeners and initialize modules.
*/
var setupDOM = function setupDOM() {

	$('[data-dest]').click(function (event) {
		window.location.hash = $(event.eventTarget).data('dest');
		$('nav ul.tabs').tabs('select_tab', $(event.currentTarget).data('dest'));
		updateHash($(event.currentTarget).data('dest'));
	});

	$('nav ul.tabs').on('click', 'a', function (event) {
		updateHash($(event.currentTarget).attr('href'));
	});

	$(window).on('hashchange', function () {
		$('nav ul.tabs').tabs('select_tab', window.location.hash.slice(1));
		updateHash(window.location.hash);
	});

	$('.parallax').parallax();

	$('.modal#modal-robber-config').modal();

	ConsoleLogHTML.connect($('#console'));
};

/*
*	Whenever the DOM content is reaady to be manipulated,
*	setupe the specific DOM and create an Interface with the server.
*	Then, we link the UI elements to the settings they manipulate.
*/
$(function () {
	setupDOM();

	var iface = new _Interface2.default();
	$('#sortNodes').on('click', function (event) {
		return iface.settings.graph.sort();
	});
	$('#newRobber').on('click', function (event) {
		return iface.settings.robbers.newRobber();
	});
	$('#launchButton').on('click', function (event) {
		return iface.startSimulation();
	});
	$('#importButton').on('click', function (event) {
		return iface.settings.loader.import();
	});
	$('#exportButton').on('click', function (event) {
		return iface.settings.saver.save();
	});
	$('#export-gambit').on('click', function (event) {
		return iface.results.exportGambit();
	});
	$('.modal#modal-results').modal({ complete: function complete() {
			iface.stopSimulation();
			$('#export-gambit').attr('disabled', 'true');
		} });
});
},{"./classes/Interface":1}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvZGlzdC9qcy9jbGFzc2VzL0ludGVyZmFjZS5qcyIsImNsaWVudC9kaXN0L2pzL2NsYXNzZXMvaW50ZXJmYWNlL1Jlc3VsdHMuanMiLCJjbGllbnQvZGlzdC9qcy9jbGFzc2VzL2ludGVyZmFjZS9TZXR0aW5ncy5qcyIsImNsaWVudC9kaXN0L2pzL2NsYXNzZXMvaW50ZXJmYWNlL3Jlc3VsdHMvTGl2ZVNpbXVsYXRpb24uanMiLCJjbGllbnQvZGlzdC9qcy9jbGFzc2VzL2ludGVyZmFjZS9zZXR0aW5ncy9maWxlcy9Mb2FkZXIuanMiLCJjbGllbnQvZGlzdC9qcy9jbGFzc2VzL2ludGVyZmFjZS9zZXR0aW5ncy9maWxlcy9TYXZlci5qcyIsImNsaWVudC9kaXN0L2pzL2NsYXNzZXMvaW50ZXJmYWNlL3NldHRpbmdzL3N1YnNldHRpbmdzL0dyYXBoLmpzIiwiY2xpZW50L2Rpc3QvanMvY2xhc3Nlcy9pbnRlcmZhY2Uvc2V0dGluZ3Mvc3Vic2V0dGluZ3MvUm9iYmVycy5qcyIsImNsaWVudC9kaXN0L2pzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfU2V0dGluZ3MgPSByZXF1aXJlKCcuL2ludGVyZmFjZS9TZXR0aW5ncycpO1xuXG52YXIgX1NldHRpbmdzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NldHRpbmdzKTtcblxudmFyIF9SZXN1bHRzID0gcmVxdWlyZSgnLi9pbnRlcmZhY2UvUmVzdWx0cycpO1xuXG52YXIgX1Jlc3VsdHMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUmVzdWx0cyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8qXG4qXHRJbnRlcmZhY2UgYmV0d2VlbiB0aGUgY2xpZW50IHNpZGUgYW5kIHRoZSBiYWNrLWVuZC5cbipcbipcdFRoZSBpbnRlcmZhY2UgaGFzIHNldHRpbmdzIGFuZCBhIHNvY2tldCBlbmFibGluZyBpdCBcbipcdHRvIHNlbmQgYW5kIHJlY2VpdmUgZGF0YSBmcm9tIHRoZSBzZXJ2ZXIgcnVubmluZyB0aGVcbipcdEphdmEgTUFTIHNpbXVsYXRpb24uXG4qL1xuXG52YXIgSW50ZXJmYWNlID0gZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBJbnRlcmZhY2UoKSB7XG5cdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIEludGVyZmFjZSk7XG5cblx0XHQvLyBGaWVsZHNcblxuXHRcdHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgnaHR0cDovLycgKyB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgKyAnOjgwODMnKTtcblx0XHR0aGlzLnNldHRpbmdzID0gbmV3IF9TZXR0aW5nczIuZGVmYXVsdCh0aGlzKTtcblx0XHR0aGlzLnJlc3VsdHMgPSBuZXcgX1Jlc3VsdHMyLmRlZmF1bHQodGhpcyk7XG5cdFx0dGhpcy5zaW11bGF0aW9uUnVubmluZyA9IGZhbHNlO1xuXG5cdFx0Ly8gU29ja2V0IGxpc3RlbmVyc1xuXG5cdFx0dGhpcy5zb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdGNvbnNvbGUuaW5mbygnQ29ubmVjdGlvbiB0byB0aGUgcmVtb3RlIHNlcnZlciBlc3RhYmxpc2hlZC4nKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qXG4gKlx0U3RhcnQgdGhlIHNpbXVsYXRpb24gYnkgc2VuZGluZyB0aGUgc2V0dGluZ3MgdG8gdGhlIGJhY2stZW5kXG4gKlx0YWxvbmcgdGhlIG1lc3NhZ2UgJ3N0YXJ0U2ltdWxhdGlvbicuXG4gKi9cblxuXHRfY3JlYXRlQ2xhc3MoSW50ZXJmYWNlLCBbe1xuXHRcdGtleTogJ3N0YXJ0U2ltdWxhdGlvbicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHN0YXJ0U2ltdWxhdGlvbigpIHtcblx0XHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0XHRcdHRoaXMuc2ltdWxhdGlvblJ1bm5pbmcgPSB0cnVlO1xuXG5cdFx0XHR0aGlzLnNvY2tldC5vbignbG9hZGluZycsIGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0XHRcdHJldHVybiBfdGhpcy5yZXN1bHRzLmxvYWRpbmcoZGF0YS5wcm9ncmVzcyk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5yZXN1bHRzLmxvYWRpbmcoMCk7XG5cblx0XHRcdHRoaXMuc29ja2V0LmVtaXQoJ3N0YXJ0U2ltdWxhdGlvbicsIHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZ3MoKSwgZnVuY3Rpb24gKHJlc3VsdHMpIHtcblxuXHRcdFx0XHRjb25zb2xlLmxvZyhyZXN1bHRzKTtcblxuXHRcdFx0XHRpZiAoIV90aGlzLnNpbXVsYXRpb25SdW5uaW5nKSByZXR1cm47XG5cblx0XHRcdFx0aWYgKHJlc3VsdHMuZXJyb3IpIHJldHVybiBfdGhpcy5yZXN1bHRzLmVycm9yKHJlc3VsdHMuZXJyb3IpO1xuXG5cdFx0XHRcdF90aGlzLnJlc3VsdHMuc2hvd1Jlc3VsdHMocmVzdWx0cy5kYXRhKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRTdG9wIHRoZSBjbGllbnQtc2lkZSBzaW11bGF0aW9uIGJ5IHJlbW92aW5nIHRoZSBsb2FkaW5nIHNjcmVlbiBhbmRcbiAgKlx0YmxvY2tpbmcgcmVzdWx0cyBjYWxsYmFjay5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnc3RvcFNpbXVsYXRpb24nLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBzdG9wU2ltdWxhdGlvbigpIHtcblx0XHRcdHRoaXMuc2ltdWxhdGlvblJ1bm5pbmcgPSBmYWxzZTtcblxuXHRcdFx0dGhpcy5zb2NrZXQucmVtb3ZlTGlzdGVuZXIoJ2xvYWRpbmcnKTtcblxuXHRcdFx0dGhpcy5zb2NrZXQuZW1pdCgnY2FuY2VsJyk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblx0fV0pO1xuXG5cdHJldHVybiBJbnRlcmZhY2U7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IEludGVyZmFjZTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfTGl2ZVNpbXVsYXRpb24gPSByZXF1aXJlKCcuL3Jlc3VsdHMvTGl2ZVNpbXVsYXRpb24nKTtcblxudmFyIF9MaXZlU2ltdWxhdGlvbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9MaXZlU2ltdWxhdGlvbik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vKlxuKlx0RGVhbHMgd2l0aCB0aGUgcmVzdWx0cyBzZW50IGJ5IHRoZSBzZXJ2ZXIuXG4qL1xudmFyIFJlc3VsdHMgPSBmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIFJlc3VsdHMoaWZhY2UpIHtcblx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgUmVzdWx0cyk7XG5cblx0XHR0aGlzLmludGVyZmFjZSA9IGlmYWNlO1xuXHRcdHRoaXMuZGF0YSA9IG51bGw7XG5cdFx0d2luZG93LnJlc3VsdHMgPSB0aGlzO1xuXHR9XG5cblx0LypcbiAqXHRXaGVuIGFuIGVycm9yIGlzIHJlY2VpdmVkLCBwcmludCBpdCB0byBzY3JlZW4uXG4gKi9cblxuXG5cdF9jcmVhdGVDbGFzcyhSZXN1bHRzLCBbe1xuXHRcdGtleTogJ2Vycm9yJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gZXJyb3IoZXJyKSB7XG5cblx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Vycm9yOiAnICsgZXJyKTtcblxuXHRcdFx0JCgnI21vZGFsLXJlc3VsdHMgcCcpLmh0bWwoJ1xcblxcblxcdFxcdFxcdDxkaXYgY2xhc3M9XCJjZW50ZXJcIj5cXG5cXHRcXHRcXHRcXHRFcnJvciBlbmNvdW50ZXJlZCB3aGlsZSBjb21wdXRpbmcgdGhlIHJlc3VsdHM6IDxicj5cXG5cXHRcXHRcXHRcXHQnICsgZXJyICsgJ1xcblxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdCcpLm1vZGFsKCdvcGVuJyk7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0V2hlbiB0aGUgc2VydmVyIGlzIHByb2Nlc3NpbmcsIHNob3cgdGhlIHByb2dyZXNzLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdsb2FkaW5nJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gbG9hZGluZygpIHtcblx0XHRcdHZhciBwZXJjZW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBmYWxzZTtcblxuXG5cdFx0XHQkKCcjbW9kYWwtcmVzdWx0cyBwJykuaHRtbCgnXFxuXFxuXFx0XFx0XFx0PGRpdiBjbGFzcz1cImNlbnRlclwiPlxcblxcdFxcdFxcdFxcdFBsZWFzZSB3YWl0IHdoaWxlIG91ciBzZXJ2ZXIgaXMgY29tcHV0aW5nIHRoZSByZXN1bHRzLlxcblxcdFxcdFxcdDwvZGl2PlxcblxcblxcdFxcdFxcdDxkaXYgY2xhc3M9XCJwcm9ncmVzc1wiPlxcblxcdFxcdFxcdFxcdDxkaXYgY2xhc3M9XCInICsgKHBlcmNlbnQgPyAnZGV0ZXJtaW5hdGVcIiBzdHlsZT1cIndpZHRoOiAnICsgcGVyY2VudCArICclXCInIDogJ2luZGV0ZXJtaW5hdGVcIicpICsgJz48L2Rpdj5cXG5cXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHQnKS5tb2RhbCgnb3BlbicpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRXaGVuIGV2ZXJ5dGhpbmcgaXMgb2theSwgZGlzcGxheSBwYXRocywgc3RhdHMgYW5kIHNob3cgYSBzaW11bGF0aW9uLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdzaG93UmVzdWx0cycsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHNob3dSZXN1bHRzKGRhdGEpIHtcblxuXHRcdFx0dGhpcy5kYXRhID0gZGF0YTtcblxuXHRcdFx0ZGF0YS5wYXRyb2xzLmZvckVhY2goZnVuY3Rpb24gKHBhdHJvbCkge1xuXHRcdFx0XHRwYXRyb2wubGFiZWwgPSBwYXRyb2wucmVkdWNlKGZ1bmN0aW9uIChzdW0sIHRhcmdldCkge1xuXHRcdFx0XHRcdHJldHVybiAnJyArIHN1bSArIHRhcmdldCArICcgXFx1MjFEMiAnO1xuXHRcdFx0XHR9LCAnJykuc2xpY2UoMCwgLTMpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGNvbnNvbGUuaW5mbygnUmVzdWx0cyByZWNlaXZlZC4nKTtcblxuXHRcdFx0Ly8gQnVpbGRpbmcgdGhlIGxpc3Qgb2YgcGF0cm9scy5cblxuXHRcdFx0dmFyIHBhdHJvbHNUYWJsZUhUTUwgPSAnXFxuXFx0XFx0XFx0PHRhYmxlIGNsYXNzPVwic3RyaXBlZCBjZW50ZXJlZFwiPlxcblxcdFxcdFxcdFxcdDx0aGVhZD5cXG5cXHRcXHRcXHRcXHRcXHQ8dHI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPlBhdHJvbCBJRDwvdGg+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPnBhdGg8L3RoPlxcblxcdFxcdFxcdFxcdFxcdDwvdHI+XFxuXFx0XFx0XFx0XFx0PC90aGVhZD5cXG5cXG5cXHRcXHRcXHRcXHQ8dGJvZHk+JztcblxuXHRcdFx0ZGF0YS5wYXRyb2xzLmZvckVhY2goZnVuY3Rpb24gKHBhdHJvbCwgaW5kZXgpIHtcblxuXHRcdFx0XHRwYXRyb2xzVGFibGVIVE1MICs9ICdcXG5cXHRcXHRcXHRcXHQ8dHI+XFxuXFx0XFx0XFx0XFx0XFx0PHRkPicgKyBpbmRleCArICc8L3RkPlxcblxcdFxcdFxcdFxcdFxcdDx0ZD4nICsgcGF0cm9sLmxhYmVsICsgJzwvdGQ+XFxuXFx0XFx0XFx0XFx0PC90cj4nO1xuXHRcdFx0fSk7XG5cblx0XHRcdHBhdHJvbHNUYWJsZUhUTUwgKz0gJ1xcblxcdFxcdFxcdFxcdDwvdGJvZHk+XFxuXFx0XFx0XFx0PC90YWJsZT4nO1xuXG5cdFx0XHQvLyBXZSBoYXZlIHRvIGZpbmQgdGhlIGJlc3Qgc3RyYXRlZ3kuXG5cblx0XHRcdHZhciBzdGF0aXN0aWNzVGFibGUgPSBbXTtcblxuXHRcdFx0ZGF0YS5zdHJhdGVnaWVzLmZvckVhY2goZnVuY3Rpb24gKHN0cmF0ZWd5KSB7XG5cblx0XHRcdFx0dmFyIGF2ZXJhZ2VHdWFyZGlhblV0aWxpdHkgPSBzdHJhdGVneS5pdGVyYXRpb25zLnJlZHVjZShmdW5jdGlvbiAoc3VtLCBpdGVyYXRpb24pIHtcblx0XHRcdFx0XHRyZXR1cm4gc3VtICsgaXRlcmF0aW9uLmd1YXJkaWFuVXRpbGl0eTtcblx0XHRcdFx0fSwgMCkgLyBzdHJhdGVneS5pdGVyYXRpb25zLmxlbmd0aDtcblx0XHRcdFx0dmFyIGF2ZXJhZ2VSb2JiZXJVdGlsaXR5ID0gc3RyYXRlZ3kuaXRlcmF0aW9ucy5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgaXRlcmF0aW9uKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHN1bSArIGl0ZXJhdGlvbi5yb2JiZXJVdGlsaXR5O1xuXHRcdFx0XHR9LCAwKSAvIHN0cmF0ZWd5Lml0ZXJhdGlvbnMubGVuZ3RoO1xuXG5cdFx0XHRcdHN0YXRpc3RpY3NUYWJsZS5wdXNoKHtcblx0XHRcdFx0XHRpdGVyYXRpb25zOiBzdHJhdGVneS5pdGVyYXRpb25zLFxuXHRcdFx0XHRcdHByb2JhYmlsaXRpZXM6IHN0cmF0ZWd5LnByb2JhYmlsaXRpZXMucmVkdWNlKGZ1bmN0aW9uIChzdW0sIHByb2JhYmlsaXR5KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gJycgKyBzdW0gKyBwcm9iYWJpbGl0eS50b0ZpeGVkKDIpICsgJyB8ICc7XG5cdFx0XHRcdFx0fSwgJycpLnNsaWNlKDAsIC0zKSxcblx0XHRcdFx0XHRndWFyZGlhblV0aWxpdHk6IGF2ZXJhZ2VHdWFyZGlhblV0aWxpdHksXG5cdFx0XHRcdFx0cm9iYmVyVXRpbGl0eTogYXZlcmFnZVJvYmJlclV0aWxpdHksXG5cdFx0XHRcdFx0c3RyYXRlZ3k6IHN0cmF0ZWd5XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdHZhciBzb3J0ZWRTdGF0aXN0aWNzVGFibGUgPSBzdGF0aXN0aWNzVGFibGUuc29ydChmdW5jdGlvbiAoczEsIHMyKSB7XG5cdFx0XHRcdHJldHVybiBzMi5ndWFyZGlhblV0aWxpdHkgLSBzMS5ndWFyZGlhblV0aWxpdHk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dmFyIGJlc3RTdHJlYXRlZ3kgPSBzb3J0ZWRTdGF0aXN0aWNzVGFibGVbMF0uc3RyYXRlZ3k7XG5cblx0XHRcdC8vIFdlIGZlZWQgdGhlIGNoYXJ0IHdpdGggYXZlcmFnZSBldm9sdXRpb24gZm9yIHRoZSBiZXN0IHN0cmF0ZWd5LlxuXG5cdFx0XHR2YXIgY2hhcnREYXRhID0gW107XG5cdFx0XHR2YXIgc3VtID0gMDtcblxuXHRcdFx0c29ydGVkU3RhdGlzdGljc1RhYmxlWzBdLml0ZXJhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoaXRlcmF0aW9uKSB7XG5cblx0XHRcdFx0Y2hhcnREYXRhLnB1c2goe1xuXHRcdFx0XHRcdHg6IGNoYXJ0RGF0YS5sZW5ndGgsXG5cdFx0XHRcdFx0eTogKHN1bSArPSBpdGVyYXRpb24uZ3VhcmRpYW5VdGlsaXR5KSAvIChjaGFydERhdGEubGVuZ3RoICsgMSlcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gQnVpbGRpbmcgdGhlIGxpc3Qgb2Ygc3RhdGlzdGljcy5cblxuXHRcdFx0dmFyIHN0YXRpc3RpY3NUYWJsZUhUTUwgPSAnXFxuXFx0XFx0XFx0PHRhYmxlIGNsYXNzPVwic3RyaXBlZCBjZW50ZXJlZFwiPlxcblxcdFxcdFxcdFxcdDx0aGVhZD5cXG5cXHRcXHRcXHRcXHRcXHQ8dHI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPlByb2JhYmlsaXRpZXM8L3RoPlxcblxcdFxcdFxcdFxcdFxcdFxcdDx0aD5HdWFyZGlhbiB1dGlsaXR5PC90aD5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8dGg+Um9iYmVyIHV0aWxpdHk8L3RoPlxcblxcdFxcdFxcdFxcdFxcdDwvdHI+XFxuXFx0XFx0XFx0XFx0PC90aGVhZD5cXG5cXG5cXHRcXHRcXHRcXHQ8dGJvZHk+JztcblxuXHRcdFx0c29ydGVkU3RhdGlzdGljc1RhYmxlLmZvckVhY2goZnVuY3Rpb24gKHN0cmF0ZWd5KSB7XG5cblx0XHRcdFx0c3RhdGlzdGljc1RhYmxlSFRNTCArPSAnXFxuXFx0XFx0XFx0XFx0PHRyPlxcblxcdFxcdFxcdFxcdFxcdDx0ZD4nICsgc3RyYXRlZ3kucHJvYmFiaWxpdGllcyArICc8L3RkPlxcblxcdFxcdFxcdFxcdFxcdDx0ZD4nICsgTnVtYmVyKHN0cmF0ZWd5Lmd1YXJkaWFuVXRpbGl0eSkudG9GaXhlZCg0KSArICc8L3RkPlxcblxcdFxcdFxcdFxcdFxcdDx0ZD4nICsgTnVtYmVyKHN0cmF0ZWd5LnJvYmJlclV0aWxpdHkpLnRvRml4ZWQoNCkgKyAnPC90ZD5cXG5cXHRcXHRcXHRcXHQ8L3RyPic7XG5cdFx0XHR9KTtcblxuXHRcdFx0c3RhdGlzdGljc1RhYmxlSFRNTCArPSAnXFxuXFx0XFx0XFx0XFx0PC90Ym9keT5cXG5cXHRcXHRcXHQ8L3RhYmxlPic7XG5cblx0XHRcdCQoJyNtb2RhbC1yZXN1bHRzIHAnKS5odG1sKCdcXG5cXG5cXHRcXHRcXHQ8ZGl2IGNsYXNzPVwicm93XCI+XFxuXFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cImNvbCBzMTJcIj5cXG5cXHRcXHRcXHRcXHRcXHQ8dWwgY2xhc3M9XCJ0YWJzXCI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGxpIGNsYXNzPVwidGFiIGNvbCBzM1wiPjxhIGNsYXNzPVwiYWN0aXZlXCIgaHJlZj1cIiNjaGFydFwiPkNoYXJ0PC9hPjwvbGk+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGxpIGNsYXNzPVwidGFiIGNvbCBzM1wiPjxhIGhyZWY9XCIjdmlzdWFsaXphdGlvblwiPlZpc3VhbGl6YXRpb248L2E+PC9saT5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8bGkgY2xhc3M9XCJ0YWIgY29sIHMzXCI+PGEgaHJlZj1cIiNwYXRyb2xzXCI+UGF0cm9sczwvYT48L2xpPlxcblxcdFxcdFxcdFxcdFxcdFxcdDxsaSBjbGFzcz1cInRhYiBjb2wgczNcIj48YSBocmVmPVwiI3N0YXRpc3RpY3NcIj5TdGF0aXN0aWNzPC9hPjwvbGk+XFxuXFx0XFx0XFx0XFx0XFx0PC91bD5cXG5cXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHQ8ZGl2IGlkPVwiY2hhcnRcIiBjbGFzcz1cImNvbCBzMTJcIj5cXG5cXHRcXHRcXHRcXHRcXHQ8Y2FudmFzIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjQwMFwiIGlkPVwibGluZS1jaGFydFwiPjwvY2FudmFzPlxcblxcdFxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdFxcdFxcdDxkaXYgaWQ9XCJ2aXN1YWxpemF0aW9uXCIgY2xhc3M9XCJjb2wgczEyXCI+XFxuXFx0XFx0XFx0XFx0XFx0PGRpdiBpZD1cImxpdmVTaW11bGF0aW9uTG9nXCI+SXRlcmF0aW9uIHJ1bm5pbmcuLi48L2Rpdj5cXG5cXHRcXHRcXHRcXHRcXHQ8ZGl2IGlkPVwibGl2ZVNpbXVsYXRpb25cIiBjbGFzcz1cInMxMlwiPlxcblxcdFxcdFxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdFxcdFxcdDxkaXYgaWQ9XCJwYXRyb2xzXCIgY2xhc3M9XCJjb2wgczEyXCI+XFxuXFx0XFx0XFx0XFx0XFx0JyArIHBhdHJvbHNUYWJsZUhUTUwgKyAnXFxuXFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0XFx0PGRpdiBpZD1cInN0YXRpc3RpY3NcIiBjbGFzcz1cImNvbCBzMTJcIj5cXG5cXHRcXHRcXHRcXHRcXHQnICsgc3RhdGlzdGljc1RhYmxlSFRNTCArICdcXG5cXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHQ8L2Rpdj5cXG5cXG5cXHRcXHQnKS5tb2RhbCgnb3BlbicpO1xuXG5cdFx0XHQkKCcjbW9kYWwtcmVzdWx0cyBwIHVsLnRhYnMnKS50YWJzKCk7XG5cblx0XHRcdHZhciBzY2F0dGVyQ2hhcnQgPSBuZXcgQ2hhcnQoXCJsaW5lLWNoYXJ0XCIsIHtcblx0XHRcdFx0dHlwZTogJ2xpbmUnLFxuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0ZGF0YXNldHM6IFt7XG5cdFx0XHRcdFx0XHRsYWJlbDogJ0Jlc3Qgc3RyYXRlZ3kgdXRpbGl0eSBvdmVyIHRpbWUuJyxcblx0XHRcdFx0XHRcdGRhdGE6IGNoYXJ0RGF0YVxuXHRcdFx0XHRcdH1dXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0XHRtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcblx0XHRcdFx0XHRzY2FsZXM6IHtcblx0XHRcdFx0XHRcdHhBeGVzOiBbe1xuXHRcdFx0XHRcdFx0XHR0eXBlOiAnbGluZWFyJyxcblx0XHRcdFx0XHRcdFx0cG9zaXRpb246ICdib3R0b20nXG5cdFx0XHRcdFx0XHR9XVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNleHBvcnQtZ2FtYml0JykucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcblxuXHRcdFx0bmV3IF9MaXZlU2ltdWxhdGlvbjIuZGVmYXVsdCh0aGlzLCBkYXRhLCBiZXN0U3RyZWF0ZWd5LCAnI2xpdmVTaW11bGF0aW9uJykucnVuKCk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblx0fSwge1xuXHRcdGtleTogJ2V4cG9ydEdhbWJpdCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGV4cG9ydEdhbWJpdCgpIHtcblxuXHRcdFx0dmFyIGRpc3RhbmNlV2VpZ2h0ID0gcGFyc2VJbnQoJCgnI2Rpc3RhbmNlV2VpZ2h0JykudmFsKCkpO1xuXHRcdFx0dmFyIHNldHRpbmdzID0gdGhpcy5pbnRlcmZhY2Uuc2V0dGluZ3MuZ2V0U2V0dGluZ3MoKTtcblxuXHRcdFx0dmFyIHBhdHJvbHMgPSB0aGlzLmRhdGEucGF0cm9scztcblx0XHRcdHZhciByb2JiZXJzID0gdGhpcy5pbnRlcmZhY2Uuc2V0dGluZ3Mucm9iYmVycy5nZXRTZXR0aW5ncygpLmxpc3Q7XG5cdFx0XHR2YXIgdmVydGljZXMgPSBzZXR0aW5ncy5wYXRocy52ZXJ0aWNlcy5maWx0ZXIoZnVuY3Rpb24gKHZlcnRleCkge1xuXHRcdFx0XHRyZXR1cm4gdmVydGV4LmlkICE9IDA7XG5cdFx0XHR9KTtcblxuXHRcdFx0dmFyIHBhdHJvbHNMaXN0U3RyaW5nID0gcGF0cm9scy5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgcGF0cm9sKSB7XG5cdFx0XHRcdHJldHVybiBzdW0gKyAnIFwiJyArIHBhdHJvbC5sYWJlbCArICdcIic7XG5cdFx0XHR9LCAnJyk7XG5cblx0XHRcdHZhciBhdHRhY2tzTGlzdFN0cmluZyA9ICcnO1xuXG5cdFx0XHR2YXIgYXR0YWNrcyA9IFtdO1xuXG5cdFx0XHRyb2JiZXJzLmZvckVhY2goZnVuY3Rpb24gKHJvYmJlcikge1xuXG5cdFx0XHRcdHZlcnRpY2VzLmZvckVhY2goZnVuY3Rpb24gKHZlcnRleCkge1xuXG5cdFx0XHRcdFx0YXR0YWNrc0xpc3RTdHJpbmcgKz0gJ1wiUm9iYmVyIHR5cGUgJyArIHJvYmJlciArICcgYXR0YWNraW5nICcgKyB2ZXJ0ZXguaWQgKyAnXCIgJztcblxuXHRcdFx0XHRcdGF0dGFja3MucHVzaCh7IHJvYmJlcjogcm9iYmVyLCB0YXJnZXQ6IHZlcnRleCB9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dmFyIHJld2FyZHNTdHJpbmcgPSAnJztcblxuXHRcdFx0dmFyIG51bWJlclN0cmluZyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkoQXJyYXkocGF0cm9scy5sZW5ndGggKiByb2JiZXJzLmxlbmd0aCAqIHZlcnRpY2VzLmxlbmd0aCkua2V5cygpKSkucmVkdWNlKGZ1bmN0aW9uIChzdW0sIGluZGV4KSB7XG5cdFx0XHRcdHJldHVybiAnJyArIHN1bSArIChpbmRleCArIDEpICsgJyAnO1xuXHRcdFx0fSwgJycpO1xuXG5cdFx0XHRhdHRhY2tzLmZvckVhY2goZnVuY3Rpb24gKGF0dGFjaykge1xuXG5cdFx0XHRcdHBhdHJvbHMuZm9yRWFjaChmdW5jdGlvbiAocGF0cm9sKSB7XG5cblx0XHRcdFx0XHR2YXIgZGlzdGFuY2UgPSAwO1xuXG5cdFx0XHRcdFx0aWYgKHBhdHJvbC5pbmNsdWRlcyhhdHRhY2sudGFyZ2V0LmlkKSkge1xuXHRcdFx0XHRcdFx0dmFyIF9sb29wID0gZnVuY3Rpb24gKG4pIHtcblx0XHRcdFx0XHRcdFx0ZGlzdGFuY2UgKz0gc2V0dGluZ3MucGF0aHMuZWRnZXMuZmluZChlZGdlID0+IGVkZ2Uuc291cmNlID09PSBwYXRyb2xbbl0gJiYgZWRnZS50YXJnZXQgPT09IHBhdHJvbFtuICsgMV0gfHwgZWRnZS5zb3VyY2UgPT09IHBhdHJvbFtuICsgMV0gJiYgZWRnZS50YXJnZXQgPT09IHBhdHJvbFtuXSkubGVuZ3RoO1xuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0Zm9yIChsZXQgbiA9IDA7IHBhdHJvbFtuXSAhPT0gYXR0YWNrLnRhcmdldC5pZDsgbisrKSB7XG5cdFx0XHRcdFx0XHRcdF9sb29wKG4pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSBkaXN0YW5jZSA9IEluZmluaXR5O1xuXG5cdFx0XHRcdFx0Y29uc29sZS5sb2cocGF0cm9sLmxhYmVsKTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhhdHRhY2sudGFyZ2V0LmlkKTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhkaXN0YW5jZSk7XG5cblx0XHRcdFx0XHR2YXIgY2F0Y2hQcm9iYWJpbGl0eSA9IHNldHRpbmdzLnJvYmJlcnMuY2F0Y2hQcm9iYWJpbGl0eVsnJyArIGF0dGFjay5yb2JiZXJdICogZGlzdGFuY2VXZWlnaHQgLyAoZGlzdGFuY2UgKyBkaXN0YW5jZVdlaWdodCk7XG5cblx0XHRcdFx0XHRjb25zb2xlLmxvZyhhdHRhY2ssIGNhdGNoUHJvYmFiaWxpdHkpO1xuXG5cdFx0XHRcdFx0dmFyIGd1YXJkaWFuVXRpbGl0eSA9IGNhdGNoUHJvYmFiaWxpdHkgKiBhdHRhY2sudGFyZ2V0Lmd1YXJkaWFuc1Jld2FyZCAtICgxIC0gY2F0Y2hQcm9iYWJpbGl0eSkgKiBhdHRhY2sudGFyZ2V0Lmd1YXJkaWFuc0Nvc3Q7XG5cblx0XHRcdFx0XHR2YXIgcm9iYmVyVXRpbGl0eSA9IC1jYXRjaFByb2JhYmlsaXR5ICogYXR0YWNrLnRhcmdldC5yb2JiZXJTZXR0aW5nc1thdHRhY2sucm9iYmVyXS5jb3N0ICsgKDEgLSBjYXRjaFByb2JhYmlsaXR5KSAqIGF0dGFjay50YXJnZXQucm9iYmVyU2V0dGluZ3NbYXR0YWNrLnJvYmJlcl0ucmV3YXJkO1xuXG5cdFx0XHRcdFx0cmV3YXJkc1N0cmluZyArPSAneyBcIicgKyBwYXRyb2wubGFiZWwgKyAnIHZzICcgKyBhdHRhY2sucm9iYmVyICsgJyAtICcgKyBhdHRhY2sudGFyZ2V0LmlkICsgJ1wiICcgKyBndWFyZGlhblV0aWxpdHkgKyAnLCAnICsgcm9iYmVyVXRpbGl0eSArICcgfVxcbic7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdHZhciBuZmcgPSAnTkZHIDEgUiBcIlBhdHJvbGxpbmcgZ2FtZVwiIHsgXCJHdWFyZGlhblwiIFwiUm9iYmVyXCIgfVxcblxcbnsgeyAnICsgcGF0cm9sc0xpc3RTdHJpbmcgKyAnfVxcbnsgJyArIGF0dGFja3NMaXN0U3RyaW5nICsgJ31cXG59XFxuXCJcIlxcblxcbntcXG4nICsgcmV3YXJkc1N0cmluZyArICd9XFxuJyArIG51bWJlclN0cmluZyArICdcXG4nO1xuXG5cdFx0XHR2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XG5cblx0XHRcdHRoaXMuaW50ZXJmYWNlLnNldHRpbmdzLnNhdmVyLmRvd25sb2FkKGRhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKCkgKyAnLScgKyBkYXRlLnRvTG9jYWxlVGltZVN0cmluZygpLnJlcGxhY2UoJzonLCAnLScpICsgJy5uZmcnLCBuZmcpO1xuXHRcdH1cblx0fV0pO1xuXG5cdHJldHVybiBSZXN1bHRzO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBSZXN1bHRzOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9HcmFwaCA9IHJlcXVpcmUoJy4vc2V0dGluZ3Mvc3Vic2V0dGluZ3MvR3JhcGguanMnKTtcblxudmFyIF9HcmFwaDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9HcmFwaCk7XG5cbnZhciBfUm9iYmVycyA9IHJlcXVpcmUoJy4vc2V0dGluZ3Mvc3Vic2V0dGluZ3MvUm9iYmVycy5qcycpO1xuXG52YXIgX1JvYmJlcnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUm9iYmVycyk7XG5cbnZhciBfU2F2ZXIgPSByZXF1aXJlKCcuL3NldHRpbmdzL2ZpbGVzL1NhdmVyJyk7XG5cbnZhciBfU2F2ZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2F2ZXIpO1xuXG52YXIgX0xvYWRlciA9IHJlcXVpcmUoJy4vc2V0dGluZ3MvZmlsZXMvTG9hZGVyJyk7XG5cbnZhciBfTG9hZGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0xvYWRlcik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8qXG4qXHRTZXR0aW5ncyBvZiB0aGUgc2ltdWxhdGlvbi5cbipcbipcdEluaXRpYWxpemUgc2V0dGluZ3Mgd2l0aCBkZWZhdWx0IHZhbHVlcy5cbiovXG5cbnZhciBTZXR0aW5ncyA9IGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gU2V0dGluZ3MoaWZhY2UpIHtcblx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2V0dGluZ3MpO1xuXG5cdFx0dGhpcy5pbnRlcmZhY2UgPSBpZmFjZTtcblxuXHRcdC8vIEZpZWxkc1xuXG5cdFx0dGhpcy5ncmFwaCA9IG5ldyBfR3JhcGgyLmRlZmF1bHQodGhpcyk7XG5cblx0XHR0aGlzLnJvYmJlcnMgPSBuZXcgX1JvYmJlcnMyLmRlZmF1bHQodGhpcyk7XG5cblx0XHR0aGlzLnNhdmVyID0gbmV3IF9TYXZlcjIuZGVmYXVsdCh0aGlzKTtcblx0XHR0aGlzLmxvYWRlciA9IG5ldyBfTG9hZGVyMi5kZWZhdWx0KHRoaXMpO1xuXG5cdFx0Ly8gRGVmYXVsdCB2YWx1ZXNcblxuXHRcdHRoaXMuaW5pdCgpO1xuXHRcdHRoaXMubG9hZGVyLmxvYWREZWZhdWx0KCk7XG5cdH1cblxuXHRfY3JlYXRlQ2xhc3MoU2V0dGluZ3MsIFt7XG5cdFx0a2V5OiAnaW5pdCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGluaXQoKSB7XG5cdFx0XHR0aGlzLmdyYXBoLmluaXQoKTtcblx0XHRcdHRoaXMucm9iYmVycy5pbml0KCk7XG5cdFx0XHQkKCcjbnVtYmVyT2ZJdGVyYXRpb25zJykudmFsKDIwKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0UmV0dXJuIHNldHRpbmdzIGFzIGFzIEpTT04gb2JqZWN0LlxuICAqXG4gICpcdFRob3NlIHNldHRpbmdzIGNhbiBiZSBzZW5kIHRvIHRoZSBiYWNrZW5kLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdnZXRTZXR0aW5ncycsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGdldFNldHRpbmdzKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Z2VuZXJhbDogdGhpcy5nZXRHZW5lcmFsU2V0dGluZ3MoKSxcblx0XHRcdFx0cGF0aHM6IHRoaXMuZ3JhcGguZ2V0U2V0dGluZ3MoKSxcblx0XHRcdFx0cm9iYmVyczogdGhpcy5yb2JiZXJzLmdldFNldHRpbmdzKClcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0Q29uY2F0ZW5hdGUgdGhlIGdlbmVyYWwgc2V0dGluZ3MgaW4gb25lIFxuICAqXHRKU09OIG9iamVjdC5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnZ2V0R2VuZXJhbFNldHRpbmdzJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gZ2V0R2VuZXJhbFNldHRpbmdzKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0bnVtYmVyT2ZJdGVyYXRpb25zOiBwYXJzZUludCgkKCcjbnVtYmVyT2ZJdGVyYXRpb25zJykudmFsKCkpLFxuXHRcdFx0XHRkaXN0YW5jZVdlaWdodDogcGFyc2VJbnQoJCgnI2Rpc3RhbmNlV2VpZ2h0JykudmFsKCkpXG5cdFx0XHR9O1xuXHRcdH1cblx0fV0pO1xuXG5cdHJldHVybiBTZXR0aW5ncztcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gU2V0dGluZ3M7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcblx0dmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgTGl2ZVNpbXVsYXRpb24gPSBmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIExpdmVTaW11bGF0aW9uKHJlc3VsdHMsIGNvbXB1dGVkRGF0YSwgYmVzdFN0cmVhdGVneSwgc2VsZWN0b3IpIHtcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIExpdmVTaW11bGF0aW9uKTtcblxuXHRcdHRoaXMucmVzdWx0cyA9IHJlc3VsdHM7XG5cdFx0dGhpcy5vcmlnaW5hbEN5ID0gdGhpcy5yZXN1bHRzLmludGVyZmFjZS5zZXR0aW5ncy5ncmFwaC5jeTtcblx0XHR3aW5kb3cubGl2ZVNpbXVsYXRpb24gPSB0aGlzO1xuXG5cdFx0dGhpcy5jb21wdXRlZERhdGEgPSBjb21wdXRlZERhdGE7XG5cdFx0dGhpcy5iZXN0U3RyZWF0ZWd5ID0gYmVzdFN0cmVhdGVneTtcblx0XHR0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG5cblx0XHR0aGlzLnN0eWxlc2hlZXQgPSBbe1xuXHRcdFx0c2VsZWN0b3I6ICdub2RlJyxcblx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdGhlaWdodDogMjAsXG5cdFx0XHRcdHdpZHRoOiAyMFxuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdHNlbGVjdG9yOiAnZWRnZScsXG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHQnY3VydmUtc3R5bGUnOiAnaGF5c3RhY2snLFxuXHRcdFx0XHQnaGF5c3RhY2stcmFkaXVzJzogMCxcblx0XHRcdFx0d2lkdGg6IDUsXG5cdFx0XHRcdG9wYWNpdHk6IDAuNSxcblx0XHRcdFx0J2xpbmUtY29sb3InOiAnZ3JleSdcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRzZWxlY3RvcjogJy5iYXNlJyxcblx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdCdiYWNrZ3JvdW5kLWNvbG9yJzogJyM2MWJmZmMnXG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0c2VsZWN0b3I6ICcuc2VjdXJlZCcsXG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHQnYmFja2dyb3VuZC1jb2xvcic6ICcjODFjNzg0J1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdHNlbGVjdG9yOiAnLnJvYmJlZCcsXG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHQnYmFja2dyb3VuZC1jb2xvcic6ICcjZTU3MzczJ1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdHNlbGVjdG9yOiAnLmNhdWdodCcsXG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHQnYmFja2dyb3VuZC1jb2xvcic6ICcjRTU3MzczJ1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdHNlbGVjdG9yOiAnLmd1YXJkaWFuJyxcblx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdGhlaWdodDogNDAsXG5cdFx0XHRcdHdpZHRoOiA0MCxcblx0XHRcdFx0J2JhY2tncm91bmQtaW1hZ2UnOiAnL2ltZy9ndWFyZGlhbi00MC5wbmcnLFxuXHRcdFx0XHQnYmFja2dyb3VuZC1vcGFjaXR5JzogMFxuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdHNlbGVjdG9yOiAnLnJvYmJlcicsXG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHRoZWlnaHQ6IDQwLFxuXHRcdFx0XHR3aWR0aDogNDAsXG5cdFx0XHRcdCdiYWNrZ3JvdW5kLWltYWdlJzogJy9pbWcvcm9iYmVyLTQwLnBuZycsXG5cdFx0XHRcdCdiYWNrZ3JvdW5kLW9wYWNpdHknOiAwXG5cdFx0XHR9XG5cdFx0fV07XG5cblx0XHR0aGlzLmN5ID0gY3l0b3NjYXBlKHtcblx0XHRcdGNvbnRhaW5lcjogJCh0aGlzLnNlbGVjdG9yKSxcblxuXHRcdFx0Ym94U2VsZWN0aW9uRW5hYmxlZDogZmFsc2UsXG5cdFx0XHRhdXRvdW5zZWxlY3RpZnk6IGZhbHNlLFxuXG5cdFx0XHRzdHlsZTogdGhpcy5zdHlsZXNoZWV0XG5cdFx0fSk7XG5cblx0XHR0aGlzLmN5Lm1pblpvb20oMC41KTtcblx0XHR0aGlzLmN5Lm1heFpvb20oMik7XG5cblx0XHQvLyBJbXBvcnQgbm9kZXMgYW5kIHZlcnRpY2VzIGZyb20gY3kgb2JqZWN0LlxuXG5cdFx0dGhpcy5vcmlnaW5hbEN5Lm5vZGVzKCkuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuXHRcdFx0X3RoaXMuY3kuYWRkKHtcblx0XHRcdFx0ZGF0YTogeyBpZDogbm9kZS5pZCgpIH0sXG5cdFx0XHRcdHBvc2l0aW9uOiBub2RlLnBvc2l0aW9uKCksXG5cdFx0XHRcdGdyb3VwOiAnbm9kZXMnLFxuXHRcdFx0XHRjbGFzc2VzOiAnbm9kZScgKyAobm9kZS5pZCgpID09PSAnMCcgPyAnIGJhc2UnIDogJycpLFxuXHRcdFx0XHRzZWxlY3RhYmxlOiBmYWxzZSxcblx0XHRcdFx0bG9ja2VkOiB0cnVlLFxuXHRcdFx0XHRncmFiYmFibGU6IGZhbHNlXG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdHRoaXMuYmFzZSA9IHRoaXMuY3kubm9kZXMoJ1tpZCA9IFwiMFwiXScpO1xuXG5cdFx0dGhpcy5vcmlnaW5hbEN5LmVkZ2VzKCkuZm9yRWFjaChmdW5jdGlvbiAoZWRnZSkge1xuXHRcdFx0X3RoaXMuY3kuYWRkKHtcblx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdGlkOiBlZGdlLmlkKCksXG5cdFx0XHRcdFx0c291cmNlOiBlZGdlLnNvdXJjZSgpLmlkKCksXG5cdFx0XHRcdFx0dGFyZ2V0OiBlZGdlLnRhcmdldCgpLmlkKClcblx0XHRcdFx0fSxcblx0XHRcdFx0Z3JvdXA6ICdlZGdlcycsXG5cdFx0XHRcdHNlbGVjdGFibGU6IGZhbHNlLFxuXHRcdFx0XHRsb2NrZWQ6IHRydWUsXG5cdFx0XHRcdGdyYWJiYWJsZTogZmFsc2Vcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gQWRkIHJvYmJlciBhbmQgZ3VhcmRpYW4uXG5cblx0XHR0aGlzLmN5LmFkZCh7XG5cdFx0XHRkYXRhOiB7IGlkOiAncm9iYmVyJyB9LFxuXHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0eDogTWF0aC5jb3MobmV3IERhdGUoKSAvIDEwMDApICogMjAsXG5cdFx0XHRcdHk6IE1hdGguc2luKG5ldyBEYXRlKCkgLyAxMDAwKSAqIDIwXG5cdFx0XHR9LFxuXHRcdFx0Y2xhc3NlczogJ3JvYmJlcicsXG5cdFx0XHRzZWxlY3RhYmxlOiBmYWxzZSxcblx0XHRcdGxvY2tlZDogZmFsc2UsXG5cdFx0XHRncmFiYmFibGU6IGZhbHNlXG5cdFx0fSk7XG5cblx0XHR0aGlzLmN5LmFkZCh7XG5cdFx0XHRkYXRhOiB7IGlkOiAnZ3VhcmRpYW4nIH0sXG5cdFx0XHRwb3NpdGlvbjogT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jeS5ub2RlcygnW2lkID0gXCIwXCJdJykucG9zaXRpb24oKSksXG5cdFx0XHRjbGFzc2VzOiAnZ3VhcmRpYW4nLFxuXHRcdFx0c2VsZWN0YWJsZTogZmFsc2UsXG5cdFx0XHRsb2NrZWQ6IGZhbHNlLFxuXHRcdFx0Z3JhYmJhYmxlOiBmYWxzZVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5yb2JiZXIgPSB0aGlzLmN5Lm5vZGVzKCcjcm9iYmVyJyk7XG5cdFx0dGhpcy5ndWFyZGlhbiA9IHRoaXMuY3kubm9kZXMoJyNndWFyZGlhbicpO1xuXHR9XG5cblx0X2NyZWF0ZUNsYXNzKExpdmVTaW11bGF0aW9uLCBbe1xuXHRcdGtleTogJ25ld0l0ZXJhdGlvbicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIG5ld0l0ZXJhdGlvbigpIHtcblx0XHRcdHRoaXMucm9iYmVyVGFyZ2V0ID0gdGhpcy5yYW5kb21UYXJnZXQoKTtcblx0XHRcdHRoaXMuaXRlcmF0aW9uU3RhcnQgPSBuZXcgRGF0ZSgpO1xuXHRcdFx0dGhpcy5jb3VudGRvd24gPSBNYXRoLnJhbmRvbSgpICogMjUwMCAqIHRoaXMuY3kuZmlsdGVyKCcubm9kZScpLmxlbmd0aCArIDI1MDA7XG5cdFx0XHR0aGlzLmd1YXJkaWFuUGF0aCA9IHRoaXMucmFuZG9tUGF0aCgpO1xuXHRcdFx0dGhpcy5ndWFyZGlhbkxhc3RWaXNpdCA9IHRoaXMuYmFzZTtcblx0XHRcdHRoaXMuZ3VhcmRpYW4ucG9zaXRpb24oT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5iYXNlLnBvc2l0aW9uKCkpKTtcblx0XHRcdHRoaXMuZ3VhcmRpYW5UYXJnZXQgPSB0aGlzLm5leHRHdWFyZGlhblRhcmdldCh0cnVlKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXHR9LCB7XG5cdFx0a2V5OiAnbmV4dFN0ZXAnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBuZXh0U3RlcCgpIHtcblx0XHRcdHZhciBfdGhpczIgPSB0aGlzO1xuXG5cdFx0XHQvLyBmaXggYSBidWcgd2hlbiBncmFwaCBpcyBub3Qgc2hvd2luZyBvbiBwYWdlIGNoYW5nZS5cblx0XHRcdHRoaXMuY3kucmVzaXplKCk7XG5cdFx0XHR0aGlzLmN5LmZpdCh0aGlzLmN5LmZpbHRlcignLm5vZGUnKSk7XG5cblx0XHRcdC8vIElmIHRoZSB1c2VyIGRpc21pc3MgdGhlIHJlc3VsdHMsIHdlIHN0b3AgdGhlIHNpbXVsYXRpb24uXG5cdFx0XHRpZiAoJCh0aGlzLnNlbGVjdG9yKS5sZW5ndGggPT09IDApIHJldHVybiBjb25zb2xlLmluZm8oJ0xpdmUgc2ltdWxhdGlvbiBzdG9wcGVkLicpO1xuXG5cdFx0XHR2YXIgZGVsdGEgPSAodGhpcy5pdGVyYXRpb25TdGFydC52YWx1ZU9mKCkgKyB0aGlzLmNvdW50ZG93biAtIG5ldyBEYXRlKCkudmFsdWVPZigpKSAvIDUwO1xuXG5cdFx0XHRpZiAoZGVsdGEgPD0gMCkgcmV0dXJuIHRoaXMucm9iYmVySGl0VGFyZ2V0KCk7XG5cblx0XHRcdHRoaXMucm9iYmVyLnBvc2l0aW9uKHtcblx0XHRcdFx0eDogTWF0aC5jb3MobmV3IERhdGUoKSAvIDEwMDApICogZGVsdGEgKyB0aGlzLnJvYmJlclRhcmdldC5wb3NpdGlvbigpLngsXG5cdFx0XHRcdHk6IE1hdGguc2luKG5ldyBEYXRlKCkgLyAxMDAwKSAqIGRlbHRhICsgdGhpcy5yb2JiZXJUYXJnZXQucG9zaXRpb24oKS55XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMucm9iYmVyLmRhdGEoJ3JlZnJlc2gnLCBNYXRoLnJhbmRvbSgpKTtcblxuXHRcdFx0dmFyIGd1YXJkaWFuUG9zaXRpb24gPSB0aGlzLmd1YXJkaWFuLnBvc2l0aW9uKCk7XG5cdFx0XHR2YXIgdGFyZ2V0UG9zaXRpb24gPSB0aGlzLmd1YXJkaWFuVGFyZ2V0LnBvc2l0aW9uKCk7XG5cblx0XHRcdGd1YXJkaWFuUG9zaXRpb24ueCA9IGd1YXJkaWFuUG9zaXRpb24ueCAqIDAuOTUgKyB0YXJnZXRQb3NpdGlvbi54ICogMC4wNTtcblx0XHRcdGd1YXJkaWFuUG9zaXRpb24ueSA9IGd1YXJkaWFuUG9zaXRpb24ueSAqIDAuOTUgKyB0YXJnZXRQb3NpdGlvbi55ICogMC4wNTtcblx0XHRcdHRoaXMuZ3VhcmRpYW4uZGF0YSgncmVmcmVzaCcsIE1hdGgucmFuZG9tKCkpO1xuXG5cdFx0XHRpZiAoKGd1YXJkaWFuUG9zaXRpb24ueCAtIHRhcmdldFBvc2l0aW9uLngpICoqIDIgKyAoZ3VhcmRpYW5Qb3NpdGlvbi55IC0gdGFyZ2V0UG9zaXRpb24ueSkgKiogMiA8IDUpIHtcblx0XHRcdFx0dGhpcy5ndWFyZGlhblRhcmdldC5hZGRDbGFzcygnc2VjdXJlZCcpO1xuXHRcdFx0XHR0aGlzLmd1YXJkaWFuTGFzdFZpc2l0ID0gdGhpcy5ndWFyZGlhblRhcmdldDtcblx0XHRcdFx0dmFyIG5ld0d1YXJkaWFuVGFyZ2V0ID0gdGhpcy5uZXh0R3VhcmRpYW5UYXJnZXQoKTtcblx0XHRcdFx0aWYgKG5ld0d1YXJkaWFuVGFyZ2V0ICE9PSBudWxsKSB0aGlzLmd1YXJkaWFuVGFyZ2V0ID0gbmV3R3VhcmRpYW5UYXJnZXQ7XG5cdFx0XHRcdC8vZWxzZSBcblx0XHRcdFx0Ly9cdHJldHVybiB0aGlzLmV2ZXJ5VGFyZ2V0SXNTZWN1cmVkKClcblx0XHRcdH1cblxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBfdGhpczIubmV4dFN0ZXAoKTtcblx0XHRcdH0sIDUwKTtcblx0XHR9XG5cdH0sIHtcblx0XHRrZXk6ICdyb2JiZXJIaXRUYXJnZXQnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiByb2JiZXJIaXRUYXJnZXQoKSB7XG5cdFx0XHRpZiAoIXRoaXMucm9iYmVyVGFyZ2V0Lmhhc0NsYXNzKCdzZWN1cmVkJykpIHtcblx0XHRcdFx0dGhpcy5yb2JiZXJUYXJnZXQuYWRkQ2xhc3MoJ3JvYmJlZCcpO1xuXHRcdFx0XHQkKCcjbGl2ZVNpbXVsYXRpb25Mb2cnKS50ZXh0KCdSb2JiZWQhJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnJvYmJlclRhcmdldC5yZW1vdmVDbGFzcygnc2VjdXJlZCcpLmFkZENsYXNzKCdjYXVnaHQnKTtcblx0XHRcdFx0JCgnI2xpdmVTaW11bGF0aW9uTG9nJykudGV4dCgnQ2F1Z2h0IScpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXMuaXRlcmF0aW9uRW5kKCk7XG5cdFx0fVxuXHR9LCB7XG5cdFx0a2V5OiAncmFuZG9tUGF0aCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHJhbmRvbVBhdGgoKSB7XG5cdFx0XHR2YXIgX3RoaXMzID0gdGhpcztcblxuXHRcdFx0dmFyIGZhaXJEaWNlUm9sbCA9IE1hdGgucmFuZG9tKCk7XG5cblx0XHRcdHZhciBwYXRoTnVtYmVyID0gLTE7XG5cblx0XHRcdHdoaWxlIChmYWlyRGljZVJvbGwgPiAwKSB7XG5cdFx0XHRcdHBhdGhOdW1iZXIrKztcblx0XHRcdFx0ZmFpckRpY2VSb2xsIC09IHRoaXMuYmVzdFN0cmVhdGVneS5wcm9iYWJpbGl0aWVzW3BhdGhOdW1iZXJdO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcy5jb21wdXRlZERhdGEucGF0cm9sc1twYXRoTnVtYmVyXS5zbGljZSgxKS5tYXAoZnVuY3Rpb24gKG5vZGVJZCkge1xuXHRcdFx0XHRyZXR1cm4gX3RoaXMzLmN5Lm5vZGVzKCdbaWQgPSBcIicgKyBub2RlSWQgKyAnXCJdJylbMF07XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sIHtcblx0XHRrZXk6ICdpdGVyYXRpb25FbmQnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBpdGVyYXRpb25FbmQoKSB7XG5cdFx0XHR2YXIgX3RoaXM0ID0gdGhpcztcblxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdF90aGlzNC5jeS5ub2RlcygpLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gbm9kZS5yZW1vdmVDbGFzcygnc2VjdXJlZCcpLnJlbW92ZUNsYXNzKCdyb2JiZWQnKS5yZW1vdmVDbGFzcygnY2F1Z2h0Jyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRfdGhpczQucnVuKCk7XG5cdFx0XHRcdCQoJyNsaXZlU2ltdWxhdGlvbkxvZycpLnRleHQoJ0l0ZXJhdGlvbiBydW5uaW5nLi4uJyk7XG5cdFx0XHR9LCAxMDAwKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXHR9LCB7XG5cdFx0a2V5OiAnbmV4dEd1YXJkaWFuVGFyZ2V0Jyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gbmV4dEd1YXJkaWFuVGFyZ2V0KGluaXQpIHtcblx0XHRcdGlmIChpbml0KSByZXR1cm4gdGhpcy5ndWFyZGlhblBhdGhbMF07XG5cblx0XHRcdHZhciBpbmRleCA9IHRoaXMuZ3VhcmRpYW5QYXRoLmluZGV4T2YodGhpcy5ndWFyZGlhblRhcmdldCk7XG5cdFx0XHRpZiAoaW5kZXggKyAxID09PSB0aGlzLmd1YXJkaWFuUGF0aC5sZW5ndGgpIHJldHVybiBudWxsO1xuXG5cdFx0XHRyZXR1cm4gdGhpcy5ndWFyZGlhblBhdGhbaW5kZXggKyAxXTtcblx0XHR9XG5cblx0XHQvKlxuICAqXHRUYXJnZXQgZ2V0IGFjY29yZGluZyB0byB0aGUgZGlzdHJpYnV0aW9uIChzZWUgUm9iYmVyc0ludGVyZXN0KVxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdyYW5kb21UYXJnZXQnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiByYW5kb21UYXJnZXQoKSB7XG5cdFx0XHR2YXIgZGlzdHJpYnV0aW9uID0gW107XG5cdFx0XHR0aGlzLm9yaWdpbmFsQ3kubm9kZXMoJ1tpZCAhPSBcIjBcIl0nKS5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZS5kYXRhKCdyb2JiZXJzSW50ZXJlc3QnKTsgaSsrKSB7XG5cdFx0XHRcdFx0ZGlzdHJpYnV0aW9uLnB1c2gobm9kZS5pZCgpKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHZhciByYW5kb21JZCA9IGRpc3RyaWJ1dGlvbltNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBkaXN0cmlidXRpb24ubGVuZ3RoKV07XG5cblx0XHRcdHJldHVybiB0aGlzLmN5Lm5vZGVzKCcjJyArIHJhbmRvbUlkKVswXTtcblx0XHR9XG5cdH0sIHtcblx0XHRrZXk6ICdydW4nLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBydW4oKSB7XG5cdFx0XHR0aGlzLm5ld0l0ZXJhdGlvbigpO1xuXHRcdFx0dGhpcy5uZXh0U3RlcCgpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cdH1dKTtcblxuXHRyZXR1cm4gTGl2ZVNpbXVsYXRpb247XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IExpdmVTaW11bGF0aW9uOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcblx0dmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vKlxuKlx0TG9hZGVyIGVuYWJsZXMgdXMgdG8gbG9hZCBzZXR0aW5ncyBmcm9tIGFuIG9iamVjdCBvciBmcm9tIGEgZmlsZS5cbiovXG5cbnZhciBMb2FkZXIgPSBmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIExvYWRlcihzZXR0aW5ncykge1xuXHRcdF9jbGFzc0NhbGxDaGVjayh0aGlzLCBMb2FkZXIpO1xuXG5cdFx0dGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXG5cdFx0dGhpcy5kZWZhdWx0U2V0dGluZ3MgPSB7XG5cdFx0XHRcImdlbmVyYWxcIjoge1xuXHRcdFx0XHRcIm51bWJlck9mSXRlcmF0aW9uc1wiOiAyMCxcblx0XHRcdFx0XCJkaXN0YW5jZVdlaWdodFwiOiAyMDBcblx0XHRcdH0sXG5cdFx0XHRcInBhdGhzXCI6IHtcblx0XHRcdFx0XCJ2ZXJ0aWNlc1wiOiBbe1xuXHRcdFx0XHRcdFwiaWRcIjogMCxcblx0XHRcdFx0XHRcInBvc2l0aW9uXCI6IHtcblx0XHRcdFx0XHRcdFwieFwiOiA5My43NDcyMzgyMjE4MDQwOCxcblx0XHRcdFx0XHRcdFwieVwiOiAyMFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJyb2JiZXJzSW50ZXJlc3RcIjogMSxcblx0XHRcdFx0XHRcImd1YXJkaWFuc0Nvc3RcIjogMSxcblx0XHRcdFx0XHRcImd1YXJkaWFuc1Jld2FyZFwiOiAxLFxuXHRcdFx0XHRcdFwicm9iYmVyU2V0dGluZ3NcIjoge1xuXHRcdFx0XHRcdFx0XCIwXCI6IHtcblx0XHRcdFx0XHRcdFx0XCJjb3N0XCI6IDEsXG5cdFx0XHRcdFx0XHRcdFwicmV3YXJkXCI6IDFcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRcImlkXCI6IDEsXG5cdFx0XHRcdFx0XCJwb3NpdGlvblwiOiB7XG5cdFx0XHRcdFx0XHRcInhcIjogMjAuMjUyNzYxNzc4MTk1OTE4LFxuXHRcdFx0XHRcdFx0XCJ5XCI6IDIwXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcInJvYmJlcnNJbnRlcmVzdFwiOiAxLFxuXHRcdFx0XHRcdFwiZ3VhcmRpYW5zQ29zdFwiOiAxLFxuXHRcdFx0XHRcdFwiZ3VhcmRpYW5zUmV3YXJkXCI6IDEsXG5cdFx0XHRcdFx0XCJyb2JiZXJTZXR0aW5nc1wiOiB7XG5cdFx0XHRcdFx0XHRcIjBcIjoge1xuXHRcdFx0XHRcdFx0XHRcImNvc3RcIjogMSxcblx0XHRcdFx0XHRcdFx0XCJyZXdhcmRcIjogMVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fV0sXG5cdFx0XHRcdFwiZWRnZXNcIjogW3tcblx0XHRcdFx0XHRcInNvdXJjZVwiOiAwLFxuXHRcdFx0XHRcdFwidGFyZ2V0XCI6IDEsXG5cdFx0XHRcdFx0XCJsZW5ndGhcIjogNzMuNDk0NDc2NDQzNjA4MTZcblx0XHRcdFx0fV1cblx0XHRcdH0sXG5cdFx0XHRcInJvYmJlcnNcIjoge1xuXHRcdFx0XHRcImxpc3RcIjogWzBdLFxuXHRcdFx0XHRcImNhdGNoUHJvYmFiaWxpdHlcIjoge1xuXHRcdFx0XHRcdFwiMFwiOiAwLjVcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHQvKlxuICpcdExvYWQgdGhlIHNldHRpbmdzIChPYmplY3QpIGFmdGVyIGNoZWNraW5nIGlmIHRoZXkgYXJlIGNvcnJ1cHRlZCBvciBub3QuXG4gKi9cblxuXG5cdF9jcmVhdGVDbGFzcyhMb2FkZXIsIFt7XG5cdFx0a2V5OiBcImxvYWRcIixcblx0XHR2YWx1ZTogZnVuY3Rpb24gbG9hZChzZXR0aW5ncykge1xuXHRcdFx0dmFyIF90aGlzID0gdGhpcztcblxuXHRcdFx0Ly8gVE9ETyA6IFZlcmlmeSBpbnRlZ3JpdHkuXG5cdFx0XHR0aGlzLnNldHRpbmdzLmluaXQoKTtcblxuXHRcdFx0JCgnI251bWJlck9mSXRlcmF0aW9ucycpLnZhbChzZXR0aW5ncy5nZW5lcmFsLm51bWJlck9mSXRlcmF0aW9ucyk7XG5cdFx0XHQkKCcjZGlzdGFuY2VXZWlnaHQnKS52YWwoc2V0dGluZ3MuZ2VuZXJhbC5kaXN0YW5jZVdlaWdodCk7XG5cblx0XHRcdC8vIElkIG1hcHMgKGxvYWRlZCBpZHMgPT4gY3VycmVudCBpZHMpXG5cblx0XHRcdHZhciB2ZXJ0aWNlc0lkTWFwID0gbmV3IE1hcCgpO1xuXHRcdFx0dmFyIHJvYmJlcnNJZE1hcCA9IG5ldyBNYXAoKTtcblxuXHRcdFx0c2V0dGluZ3Mucm9iYmVycy5saXN0LmZvckVhY2goZnVuY3Rpb24gKHJvYmJlcklkKSB7XG5cdFx0XHRcdHJvYmJlcnNJZE1hcC5zZXQocm9iYmVySWQsIF90aGlzLnNldHRpbmdzLnJvYmJlcnMubmV3Um9iYmVyKDEgLSBzZXR0aW5ncy5yb2JiZXJzLmNhdGNoUHJvYmFiaWxpdHlbXCJcIiArIHJvYmJlcklkXSkpO1xuXHRcdFx0fSk7XG5cblx0XHRcdHNldHRpbmdzLnBhdGhzLnZlcnRpY2VzLmZvckVhY2goZnVuY3Rpb24gKHZlcnRleCkge1xuXG5cdFx0XHRcdHZlcnRpY2VzSWRNYXAuc2V0KHZlcnRleC5pZCwgX3RoaXMuc2V0dGluZ3MuZ3JhcGguYWRkTm9kZSh2ZXJ0ZXgucG9zaXRpb24sIHZlcnRleC5pZCA9PT0gMCwgdmVydGV4LnJvYmJlcnNJbnRlcmVzdCwgdmVydGV4Lmd1YXJkaWFuc0Nvc3QsIHZlcnRleC5ndWFyZGlhbnNSZXdhcmQpKTtcblxuXHRcdFx0XHR2YXIgbmV3Tm9kZUlkID0gdmVydGljZXNJZE1hcC5nZXQodmVydGV4LmlkKTtcblxuXHRcdFx0XHRzZXR0aW5ncy5yb2JiZXJzLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAocm9iYmVySWQpIHtcblx0XHRcdFx0XHR2YXIgbmV3Um9iYmVySWQgPSByb2JiZXJzSWRNYXAuZ2V0KHJvYmJlcklkKTtcblxuXHRcdFx0XHRcdF90aGlzLnNldHRpbmdzLmdyYXBoLmN5Lm5vZGVzKFwiW2lkID0gXFxcIlwiICsgbmV3Tm9kZUlkICsgXCJcXFwiXVwiKS5kYXRhKCdyb2JiZXJTZXR0aW5ncycpLnNldChuZXdSb2JiZXJJZCwgdmVydGV4LnJvYmJlclNldHRpbmdzW3JvYmJlcklkXSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdHNldHRpbmdzLnBhdGhzLmVkZ2VzLmZvckVhY2goZnVuY3Rpb24gKGVkZ2UpIHtcblx0XHRcdFx0X3RoaXMuc2V0dGluZ3MuZ3JhcGgubGluayh2ZXJ0aWNlc0lkTWFwLmdldChlZGdlLnNvdXJjZSksIHZlcnRpY2VzSWRNYXAuZ2V0KGVkZ2UudGFyZ2V0KSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5zZXR0aW5ncy5ncmFwaC5jeS5maXQoKTtcblxuXHRcdFx0Y29uc29sZS5sb2coJ1NldHRpbmdzIGxvYWRlZCcpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRMb2FkIHRoZSBzZXR0aW5ncyBvYmplY3QgZnJvbSBhIEpTT04gZmlsZSBvbiBjbGllbnQncyBjb21wdXRlci5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiBcImltcG9ydFwiLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBfaW1wb3J0KCkge1xuXHRcdFx0dmFyIF90aGlzMiA9IHRoaXM7XG5cblx0XHRcdHZhciBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG5cdFx0XHRpbnB1dC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnZmlsZScpO1xuXG5cdFx0XHRpbnB1dC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG5cdFx0XHRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuXHRcdFx0XHR2YXIgZmlsZSA9IGlucHV0LmZpbGVzWzBdO1xuXG5cdFx0XHRcdHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXHRcdFx0XHRyZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRcdFx0X3RoaXMyLmxvYWQoSlNPTi5wYXJzZShhdG9iKGV2ZW50LnRhcmdldC5yZXN1bHQuc3BsaXQoJywnKS5wb3AoKSkpKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRyZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcblxuXHRcdFx0XHRkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGlucHV0KTtcblx0XHRcdH0pO1xuXG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGlucHV0KTtcblxuXHRcdFx0aW5wdXQuY2xpY2soKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0SW5pdGlhbGl6ZSB0aGUgZ3JhcGggYnkgc2V0dGluZyBkZWZhdWx0IHZhbHVlcy5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiBcImxvYWREZWZhdWx0XCIsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGxvYWREZWZhdWx0KCkge1xuXHRcdFx0cmV0dXJuIHRoaXMubG9hZCh0aGlzLmRlZmF1bHRTZXR0aW5ncyk7XG5cdFx0fVxuXHR9XSk7XG5cblx0cmV0dXJuIExvYWRlcjtcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gTG9hZGVyOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFNhdmVyID0gZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBTYXZlcihzZXR0aW5ncykge1xuXHRcdF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTYXZlcik7XG5cblx0XHR0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG5cdH1cblxuXHRfY3JlYXRlQ2xhc3MoU2F2ZXIsIFt7XG5cdFx0a2V5OiAnc2F2ZScsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHNhdmUoKSB7XG5cblx0XHRcdHZhciBkYXRlID0gbmV3IERhdGUoKTtcblxuXHRcdFx0cmV0dXJuIHRoaXMuZG93bmxvYWQoZGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoKSArICctJyArIGRhdGUudG9Mb2NhbGVUaW1lU3RyaW5nKCkucmVwbGFjZSgnOicsICctJykgKyAnLmpzb24nLCBKU09OLnN0cmluZ2lmeSh0aGlzLnNldHRpbmdzLmdldFNldHRpbmdzKCkpKTtcblx0XHR9XG5cdH0sIHtcblx0XHRrZXk6ICdkb3dubG9hZCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGRvd25sb2FkKGZpbGVuYW1lLCB0ZXh0KSB7XG5cdFx0XHR2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcblx0XHRcdGxpbmsuc2V0QXR0cmlidXRlKCdocmVmJywgJ2RhdGE6dGV4dC9qc29uO2NoYXJzZXQ9dXRmLTgsJyArIGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0KSk7XG5cdFx0XHRsaW5rLnNldEF0dHJpYnV0ZSgnZG93bmxvYWQnLCBmaWxlbmFtZSk7XG5cblx0XHRcdGxpbmsuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XG5cblx0XHRcdGxpbmsuY2xpY2soKTtcblxuXHRcdFx0ZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChsaW5rKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXHR9XSk7XG5cblx0cmV0dXJuIFNhdmVyO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBTYXZlcjsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheSA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gc2xpY2VJdGVyYXRvcihhcnIsIGkpIHsgdmFyIF9hcnIgPSBbXTsgdmFyIF9uID0gdHJ1ZTsgdmFyIF9kID0gZmFsc2U7IHZhciBfZSA9IHVuZGVmaW5lZDsgdHJ5IHsgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkgeyBfYXJyLnB1c2goX3MudmFsdWUpOyBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7IH0gfSBjYXRjaCAoZXJyKSB7IF9kID0gdHJ1ZTsgX2UgPSBlcnI7IH0gZmluYWxseSB7IHRyeSB7IGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0pIF9pW1wicmV0dXJuXCJdKCk7IH0gZmluYWxseSB7IGlmIChfZCkgdGhyb3cgX2U7IH0gfSByZXR1cm4gX2FycjsgfSByZXR1cm4gZnVuY3Rpb24gKGFyciwgaSkgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IHJldHVybiBhcnI7IH0gZWxzZSBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSB7IHJldHVybiBzbGljZUl0ZXJhdG9yKGFyciwgaSk7IH0gZWxzZSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpOyB9IH07IH0oKTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLypcbipcdENsYXNzIHJlcHJlc2VudGluZyB0aGUgZ3JhcGggb2YgdGhlIHNpbXVsYXRpb24uXG4qXG4qXHRZb3UgY2FuIGFkZCB0YXJnZXRzLCBkZWxldGUgdGFyZ2V0cywgYW5kIGxpbmtcbipcdHRoZW0gdG9nZXRoZXIuXG4qXG4qXHRGb3IgZWFjaCB0YXJnZXQsIHlvdSBjYW4gc2V0IDpcbipcdFx0LSByb2JiZXJzSW50ZXJlc3QgKHRoZSBwcm9iYWJpbGl0eSBvZiByb2JiZXJzIGF0dGFja2luZyB0aGlzIHRhcmdldClcbipcdFx0LSBndWFyZGlhbnNDb3N0ICh0aGUgY29zdCB3aGVuIGd1YXJkaWFucyBmYWlsIHRvIHByb3RlY3QgdGhlIHRhcmdldClcbipcdFx0LSBndWFyZGlhbnNSZXdhcmQgKHRoZSByZXdhcmQgd2hlbiBndWFyZGlhbnMgbWFuYWdlIHRvIHByZXZlbnQgXG4qXHRcdFx0XHRcdFx0XHRhbiBhdHRhY2spXG4qXHRcdC0gcm9iYmVyU2V0dGluZ3MgKHRoZSBjb3N0LCByZXdhcmQgYW5kIHByb2JhYmlsaXR5IGZvciBlYWNoIHJvYmJlcilcbipcdFx0XHQoU2V0IHRocm91Z2ggdGhlIFJvYmJlcnMgY2xhc3MpXG4qXG4qXHROb2RlcyA9IEF0dGFja3MgPSBUYXJnZXRzXG4qL1xuXG52YXIgR3JhcGggPSBmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIEdyYXBoKHNldHRpbmdzKSB7XG5cdFx0dmFyIF90aGlzID0gdGhpcztcblxuXHRcdF9jbGFzc0NhbGxDaGVjayh0aGlzLCBHcmFwaCk7XG5cblx0XHQvLyBGaWVsZHNcblxuXHRcdHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcblxuXHRcdHRoaXMuc3R5bGVzaGVldCA9IFt7XG5cdFx0XHRzZWxlY3RvcjogJ25vZGUnLFxuXHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0aGVpZ2h0OiAyMCxcblx0XHRcdFx0d2lkdGg6IDIwLFxuXHRcdFx0XHQnYmFja2dyb3VuZC1jb2xvcic6ICdtYXBEYXRhKHJvYmJlcnNJbnRlcmVzdCwgMCwgMjUsIGdyZWVuLCByZWQpJyxcblx0XHRcdFx0Y29udGVudDogZnVuY3Rpb24gY29udGVudChub2RlKSB7XG5cdFx0XHRcdFx0cmV0dXJuICdOJyArIG5vZGUuZGF0YSgnaWQnKSArICcgQycgKyBub2RlLmRhdGEoJ2d1YXJkaWFuc0Nvc3QnKSArICcvUicgKyBub2RlLmRhdGEoJ2d1YXJkaWFuc1Jld2FyZCcpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHQvLyd0ZXh0LXZhbGlnbic6ICdjZW50ZXInLFxuXHRcdFx0XHQndGV4dC1oYWxpZ24nOiAnY2VudGVyJ1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdHNlbGVjdG9yOiAnZWRnZScsXG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHQnY3VydmUtc3R5bGUnOiAnaGF5c3RhY2snLFxuXHRcdFx0XHQnaGF5c3RhY2stcmFkaXVzJzogMCxcblx0XHRcdFx0d2lkdGg6IDUsXG5cdFx0XHRcdG9wYWNpdHk6IDAuNSxcblx0XHRcdFx0J2xpbmUtY29sb3InOiAnI2EyZWZhMicsXG5cdFx0XHRcdGNvbnRlbnQ6IGZ1bmN0aW9uIGNvbnRlbnQoZWRnZSkge1xuXHRcdFx0XHRcdHJldHVybiBNYXRoLmZsb29yKF90aGlzLmxlbmd0aChlZGdlKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRzZWxlY3RvcjogJy5iYXNlJyxcblx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdCdiYWNrZ3JvdW5kLWNvbG9yJzogJyM2MWJmZmMnLFxuXHRcdFx0XHRsYWJlbDogJ0Jhc2UnXG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0c2VsZWN0b3I6ICc6c2VsZWN0ZWQnLFxuXHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0J2JvcmRlci13aWR0aCc6IDQsXG5cdFx0XHRcdCdib3JkZXItY29sb3InOiAncHVycGxlJ1xuXHRcdFx0fVxuXHRcdH1dO1xuXG5cdFx0dGhpcy5jeSA9IHdpbmRvdy5jeSA9IGN5dG9zY2FwZSh7XG5cdFx0XHRjb250YWluZXI6ICQoJyNncmFwaCcpLFxuXG5cdFx0XHRib3hTZWxlY3Rpb25FbmFibGVkOiBmYWxzZSxcblx0XHRcdGF1dG91bnNlbGVjdGlmeTogZmFsc2UsXG5cblx0XHRcdHN0eWxlOiB0aGlzLnN0eWxlc2hlZXRcblx0XHR9KTtcblxuXHRcdHRoaXMuY3kubWluWm9vbSgwLjUpO1xuXHRcdHRoaXMuY3kubWF4Wm9vbSgyKTtcblxuXHRcdHdpbmRvdy5ncmFwaCA9IHRoaXM7XG5cblx0XHQvLyBSZWZyZXNoaW5nIHRoZSBsZW5ndGhcblxuXHRcdHRoaXMucmVmcmVzaEludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGN5LmVkZ2VzKCkuZm9yRWFjaChmdW5jdGlvbiAoZWRnZSkge1xuXHRcdFx0XHRyZXR1cm4gZWRnZS5kYXRhKCdyZWZyZXNoJywgTWF0aC5yYW5kb20oKSk7XG5cdFx0XHR9KTtcblx0XHR9LCAyNTApO1xuXG5cdFx0Ly8gRE9NIGxpc3RlbmVyc1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5xdGlwLWNvbnRlbnQgLmxpbmsnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdGNvbnNvbGUuaW5mbyhcIkxpbmtpbmcgYSB0YXJnZXQgdG8gYW5vdGhlci4uLlwiKTtcblx0XHRcdF90aGlzLmN1cnJlbnRBY3Rpb24gPSAnbGlua2luZyc7XG5cdFx0XHQkKCcucXRpcCcpLnF0aXAoJ2hpZGUnKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucXRpcC1jb250ZW50IC5kZWxldGUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdF90aGlzLmxhc3RTZWxlY3RlZE5vZGUucmVtb3ZlKCk7XG5cdFx0XHRfdGhpcy5yZXNldCgpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5xdGlwLWNvbnRlbnQgLmRpc21pc3MnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdF90aGlzLnJlc2V0KCk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnF0aXAtY29udGVudCAucGx1c0ludGVyZXN0JywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ3JvYmJlcnNJbnRlcmVzdCcsIE1hdGgubWluKF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgncm9iYmVyc0ludGVyZXN0JykgKyAxLCAyNSkpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5xdGlwLWNvbnRlbnQgLm1pbnVzSW50ZXJlc3QnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgncm9iYmVyc0ludGVyZXN0JywgTWF0aC5tYXgoX3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdyb2JiZXJzSW50ZXJlc3QnKSAtIDEsIDApKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucXRpcC1jb250ZW50IC5wbHVzQ29zdCcsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0X3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdndWFyZGlhbnNDb3N0JywgTWF0aC5taW4oX3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdndWFyZGlhbnNDb3N0JykgKyAxLCAyNSkpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5xdGlwLWNvbnRlbnQgLm1pbnVzQ29zdCcsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0X3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdndWFyZGlhbnNDb3N0JywgTWF0aC5tYXgoX3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdndWFyZGlhbnNDb3N0JykgLSAxLCAwKSk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnF0aXAtY29udGVudCAucGx1c1Jld2FyZCcsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0X3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdndWFyZGlhbnNSZXdhcmQnLCBNYXRoLm1pbihfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ2d1YXJkaWFuc1Jld2FyZCcpICsgMSwgMjUpKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucXRpcC1jb250ZW50IC5taW51c1Jld2FyZCcsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0X3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdndWFyZGlhbnNSZXdhcmQnLCBNYXRoLm1heChfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ2d1YXJkaWFuc1Jld2FyZCcpIC0gMSwgMCkpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gQ3l0b3NjYXBlIGxpc3RlbmVyc1xuXG5cdFx0dGhpcy5jeS5vbigndGFwJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRpZiAoZXZlbnQudGFyZ2V0ID09PSBldmVudC5jeSkgX3RoaXMucmVzZXQoKTtcblx0XHRcdC8vIFdoZW4geW91IHRhcCBvbiB0aGUgYmFja2dyb3VuZCBhbmQgdGhhdCB0aGVyZSBhcmUgbm8gdmlzaWJsZSB0aXBzLCB5b3UgYWRkIGEgbmV3IG5vZGUgYXQgdGhpcyBwb3NpdGlvbi5cblx0XHRcdC8vIElmIGEgdGlwIGlzIHZpc2libGUsIHlvdSBwcm9iYWJseSBqdXN0IHdhbnQgdG8gZGlzbWlzcyBpdFxuXHRcdFx0aWYgKGV2ZW50LnRhcmdldCA9PT0gZXZlbnQuY3kgJiYgISQoJy5xdGlwOnZpc2libGUnKS5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIF90aGlzLmFkZE5vZGUoZXZlbnQucG9zaXRpb24pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5jeS5vbigndGFwJywgJ25vZGUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdGlmIChfdGhpcy5jdXJyZW50QWN0aW9uID09PSAnbGlua2luZycpIHtcblx0XHRcdFx0X3RoaXMuY3VycmVudEFjdGlvbiA9IG51bGw7XG5cdFx0XHRcdHZhciBzZWNvbmROb2RlID0gZXZlbnQudGFyZ2V0O1xuXHRcdFx0XHQvLyBXZSBjaGVjayBpZiB0aGF0IGVkZ2UgYWxlYWR5IGV4aXN0cyBvciBpZiB0aGUgc291cmNlIGFuZCB0YXJnZXQgYXJlIHRoZSBzYW1lIG5vZGUuXG5cdFx0XHRcdGlmICghX3RoaXMuY3kuZWxlbWVudHMoJ2VkZ2Vbc291cmNlID0gXCInICsgX3RoaXMubGFzdFNlbGVjdGVkTm9kZS5pZCgpICsgJ1wiXVt0YXJnZXQgPSBcIicgKyBzZWNvbmROb2RlLmlkKCkgKyAnXCJdJykubGVuZ3RoICYmICFfdGhpcy5jeS5lbGVtZW50cygnZWRnZVt0YXJnZXQgPSBcIicgKyBfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmlkKCkgKyAnXCJdW3NvdXJjZSA9IFwiJyArIHNlY29uZE5vZGUuaWQoKSArICdcIl0nKS5sZW5ndGggJiYgc2Vjb25kTm9kZSAhPSBfdGhpcy5sYXN0U2VsZWN0ZWROb2RlKSB7XG5cdFx0XHRcdFx0X3RoaXMubGluayhfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmlkKCksIHNlY29uZE5vZGUuaWQoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0X3RoaXMubGFzdFNlbGVjdGVkTm9kZSA9IGV2ZW50LnRhcmdldDtcblx0XHR9KTtcblxuXHRcdHRoaXMuY3kub24oJ3RhcCcsICdlZGdlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRldmVudC50YXJnZXQucmVtb3ZlKCk7XG5cdFx0fSk7XG5cblx0XHQvLyBmaXggYSBidWcgd2hlbiB0YXAgZG9lc24ndCB3b3JrIG9uIHBhZ2UgY2hhbmdlLlxuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRyZXR1cm4gX3RoaXMuY3kucmVzaXplKCk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmluaXQoKTtcblx0fVxuXG5cdC8qXG4gKlx0SW5pdGlhbGl6ZSB0aGUgZ3JhcGggYnkgc2V0dGluZyBkZWZhdWx0IHZhbHVlcy5cbiAqL1xuXG5cblx0X2NyZWF0ZUNsYXNzKEdyYXBoLCBbe1xuXHRcdGtleTogJ2luaXQnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBpbml0KCkge1xuXHRcdFx0dGhpcy5uYnJFZGdlc0NyZWF0ZWQgPSAwO1xuXHRcdFx0dGhpcy5uYnJOb2Rlc0NyZWF0ZWQgPSAwO1xuXG5cdFx0XHR0aGlzLmxhc3RTZWxlY3RlZE5vZGUgPSBudWxsO1xuXHRcdFx0dGhpcy5jdXJyZW50QWN0aW9uID0gbnVsbDtcblxuXHRcdFx0dGhpcy5jeS5lbGVtZW50cygpLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcblx0XHRcdFx0cmV0dXJuIGVsZW1lbnQucmVtb3ZlKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0U29ydCB0YXJnZXRzIHdpdGggdGhlIENvU0UgbGF5b3V0IChieSBCaWxrZW50IFVuaXZlcnNpdHkpLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdzb3J0Jyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gc29ydCgpIHtcblx0XHRcdHRoaXMuY3kubGF5b3V0KHtcblx0XHRcdFx0bmFtZTogJ2Nvc2UtYmlsa2VudCcsXG5cdFx0XHRcdGFuaW1hdGU6IHRydWVcblx0XHRcdH0pLnJ1bigpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRSZXNldCB0aGUgY3VycmVudCBhY3Rpb24sIHNlbGVjdGVkIHRhcmdldCBhbmQgaGlkZSB0aGUgdGlwcy5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAncmVzZXQnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiByZXNldCgpIHtcblx0XHRcdHRoaXMubGFzdFNlbGVjdGVkTm9kZSA9IG51bGw7XG5cdFx0XHR0aGlzLmN1cnJlbnRBY3Rpb24gPSBudWxsO1xuXHRcdFx0JCgnLnF0aXAnKS5xdGlwKCdoaWRlJyk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdExpbmsgdHdvIHRhcmdldHMgdG9nZXRoZXIuIFlvdSBoYXZlIHRvIHNwZWNpZnkgdGhlIGlkcy5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnbGluaycsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGxpbmsoc291cmNlLCB0YXJnZXQpIHtcblx0XHRcdHRoaXMuY3kuYWRkKHtcblx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdGlkOiAnZScgKyB0aGlzLm5ickVkZ2VzQ3JlYXRlZCsrLFxuXHRcdFx0XHRcdHNvdXJjZTogc291cmNlLFxuXHRcdFx0XHRcdHRhcmdldDogdGFyZ2V0XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGdyb3VwOiAnZWRnZXMnLFxuXHRcdFx0XHRzZWxlY3RhYmxlOiB0cnVlLFxuXHRcdFx0XHRsb2NrZWQ6IGZhbHNlLFxuXHRcdFx0XHRncmFiYmFibGU6IHRydWUsXG5cdFx0XHRcdGNsYXNzZXM6ICcnXG5cdFx0XHR9KTtcblx0XHRcdGNvbnNvbGUuaW5mbygnRWRnZSBhZGRlZCBsaW5raW5nICcgKyBzb3VyY2UgKyAnIHRvICcgKyB0YXJnZXQgKyAnLicpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRBZGQgYSBub2RlIHRvIHRoZSBncmFwaC5cbiAgKlx0XG4gICpcdEFyZ3VtZW50cyA6XG4gICpcdFx0LSBwb3NpdGlvbiBzaG91bGQgYmUgYW4gb2JqZWN0IHdpdGggZmllbGRzIHggYW5kIHkuXG4gICpcdFx0LSBiYXNlIGlzIGEgYm9vbGVhbiBkZWZpbmluZyBpZiB0aGUgbm9kZSBpcyB0aGUgYmFzZS5cbiAgKlxuICAqXHRCYXNlIG5vZGVzIGNhbiBub3QgYmVlbiBhdHRhY2tldCBub3IgZGVmZW5kZWQuXG4gICpcdFBhdHJvbHMgaGF2ZSB0byBzdGFydCBhbmQgZW5kIGF0IHRoZSBiYXNlLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdhZGROb2RlJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gYWRkTm9kZSgpIHtcblx0XHRcdHZhciBwb3NpdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogeyB4OiAwLCB5OiAwIH07XG5cdFx0XHR2YXIgYmFzZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZmFsc2U7XG5cdFx0XHR2YXIgcm9iYmVyc0ludGVyZXN0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiAxO1xuXHRcdFx0dmFyIGd1YXJkaWFuc0Nvc3QgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IDE7XG5cdFx0XHR2YXIgZ3VhcmRpYW5zUmV3YXJkID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiAxO1xuXG5cdFx0XHR2YXIgbmV3Tm9kZUlkID0gdGhpcy5jeS5ub2RlcygpLmxlbmd0aDtcblxuXHRcdFx0dmFyIG5ld05vZGUgPSB0aGlzLmN5LmFkZCh7XG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRpZDogbmV3Tm9kZUlkLFxuXHRcdFx0XHRcdHJvYmJlcnNJbnRlcmVzdDogcm9iYmVyc0ludGVyZXN0LFxuXHRcdFx0XHRcdGd1YXJkaWFuc0Nvc3Q6IGd1YXJkaWFuc0Nvc3QsXG5cdFx0XHRcdFx0Z3VhcmRpYW5zUmV3YXJkOiBndWFyZGlhbnNSZXdhcmQsXG5cdFx0XHRcdFx0cm9iYmVyU2V0dGluZ3M6IG5ldyBNYXAoKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwb3NpdGlvbjogcG9zaXRpb24sXG5cdFx0XHRcdGdyb3VwOiAnbm9kZXMnLFxuXHRcdFx0XHRzZWxlY3RhYmxlOiB0cnVlLFxuXHRcdFx0XHRsb2NrZWQ6IGZhbHNlLFxuXHRcdFx0XHRncmFiYmFibGU6IHRydWUsXG5cdFx0XHRcdGNsYXNzZXM6IGJhc2UgPyAnYmFzZScgOiAnJ1xuXHRcdFx0fSkucXRpcCh7XG5cdFx0XHRcdGNvbnRlbnQ6ICdcXG5cXHRcXHRcXHQ8ZGl2PlxcblxcdFxcdFxcdFxcdDxhIGNsYXNzPVwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biBibHVlIGxpbmtcIiBzdHlsZT1cIndpZHRoOjE2MHB4XCI+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29ucyByaWdodFwiPnRpbWVsaW5lPC9pPkxpbmsgdG8uLi48L2E+XFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIHJlZCBkZWxldGVcIiBzdHlsZT1cIndpZHRoOjE2MHB4OyBtYXJnaW4tdG9wOiAxMHB4XCIgJyArIChiYXNlID8gJ2Rpc2FibGVkJyA6ICcnKSArICc+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29ucyByaWdodFwiPmRlbGV0ZTwvaT5EZWxldGU8L2E+XFxuXFx0XFx0XFx0XFx0XFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIHJlZCBsaWdodGVuLTIgbWludXNJbnRlcmVzdCBjb2xcIiAnICsgKGJhc2UgPyAnZGlzYWJsZWQnIDogJycpICsgJz48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+cmVtb3ZlX2NpcmNsZTwvaT48L2E+XFxuXFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cImxhYmVsXCI+Um9iYmVycyBJbnRlcmVzdDwvZGl2PlxcblxcdFxcdFxcdFxcdDxhIGNsYXNzPVwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biBncmVlbiBsaWdodGVuLTIgcGx1c0ludGVyZXN0IGNvbFwiICcgKyAoYmFzZSA/ICdkaXNhYmxlZCcgOiAnJykgKyAnPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIj5hZGRfY2lyY2xlPC9pPjwvYT5cXG5cXG5cXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gcmVkIGxpZ2h0ZW4tMiBtaW51c0Nvc3QgY29sXCIgJyArIChiYXNlID8gJ2Rpc2FibGVkJyA6ICcnKSArICc+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPnJlbW92ZV9jaXJjbGU8L2k+PC9hPlxcblxcdFxcdFxcdFxcdDxkaXYgY2xhc3M9XCJsYWJlbFwiPkd1YXJkaWFucyBDb3N0PC9kaXY+XFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGdyZWVuIGxpZ2h0ZW4tMiBwbHVzQ29zdCBjb2xcIiAnICsgKGJhc2UgPyAnZGlzYWJsZWQnIDogJycpICsgJz48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+YWRkX2NpcmNsZTwvaT48L2E+XFxuXFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIHJlZCBsaWdodGVuLTIgbWludXNSZXdhcmQgY29sXCIgJyArIChiYXNlID8gJ2Rpc2FibGVkJyA6ICcnKSArICc+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPnJlbW92ZV9jaXJjbGU8L2k+PC9hPlxcblxcdFxcdFxcdFxcdDxkaXYgY2xhc3M9XCJsYWJlbFwiPkd1YXJkaWFucyBSZXdhcmQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gZ3JlZW4gbGlnaHRlbi0yIHBsdXNSZXdhcmQgY29sXCIgJyArIChiYXNlID8gJ2Rpc2FibGVkJyA6ICcnKSArICc+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPmFkZF9jaXJjbGU8L2k+PC9hPlxcblxcblxcdFxcdFxcdFxcdDxhIGNsYXNzPVwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biBncmVlbiBkaXNtaXNzXCIgc3R5bGU9XCJ3aWR0aDoxNjBweDsgbWFyZ2luLXRvcDogMTBweFwiPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnMgcmlnaHRcIj5jYW5jZWw8L2k+RGlzbWlzczwvYT5cXG5cXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHQnLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdG15OiAndG9wIGNlbnRlcicsXG5cdFx0XHRcdFx0YXQ6ICdib3R0b20gY2VudGVyJ1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdGNsYXNzZXM6ICdxdGlwLWJvb3RzdHJhcCcsXG5cdFx0XHRcdFx0d2lkdGg6IDE5NVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5zZXR0aW5ncy5yb2JiZXJzLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAocm9iYmVyKSB7XG5cdFx0XHRcdHJldHVybiBuZXdOb2RlLmRhdGEoJ3JvYmJlclNldHRpbmdzJykuc2V0KHJvYmJlciwge1xuXHRcdFx0XHRcdGNvc3Q6IDIsXG5cdFx0XHRcdFx0cmV3YXJkOiAxXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiBuZXdOb2RlSWQ7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0UmV0dXJuIHRoZSBsZW5ndGggb2YgYW4gZWRnZS5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnbGVuZ3RoJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gbGVuZ3RoKGVkZ2UpIHtcblx0XHRcdHJldHVybiB0aGlzLmRpc3RhbmNlKGVkZ2Uuc291cmNlKCksIGVkZ2UudGFyZ2V0KCkpO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdFJldHVybiB0aGUgZGlzdGFuY2UgYmV0d2VlbiBkd28gdmVydGljZXMuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ2Rpc3RhbmNlJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gZGlzdGFuY2Uobm9kZTEsIG5vZGUyKSB7XG5cdFx0XHRyZXR1cm4gKChub2RlMS5wb3NpdGlvbigpLnggLSBub2RlMi5wb3NpdGlvbigpLngpICoqIDIgKyAobm9kZTEucG9zaXRpb24oKS55IC0gbm9kZTIucG9zaXRpb24oKS55KSAqKiAyKSAqKiAwLjU7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0Q29uY2F0ZW5hdGUgc2V0dGluZ3MgaW50byBhIEpTT04gb2JqZWN0LlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdnZXRTZXR0aW5ncycsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGdldFNldHRpbmdzKCkge1xuXHRcdFx0dmFyIF90aGlzMiA9IHRoaXM7XG5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHZlcnRpY2VzOiBPYmplY3Qua2V5cyhjeS5ub2RlcygpKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRcdHJldHVybiAhaXNOYU4oa2V5KTtcblx0XHRcdFx0fSkubWFwKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0aWQ6IHBhcnNlSW50KGN5Lm5vZGVzKClba2V5XS5pZCgpKSxcblx0XHRcdFx0XHRcdHBvc2l0aW9uOiBjeS5ub2RlcygpW2tleV0ucG9zaXRpb24oKSxcblx0XHRcdFx0XHRcdHJvYmJlcnNJbnRlcmVzdDogY3kubm9kZXMoKVtrZXldLmRhdGEoJ3JvYmJlcnNJbnRlcmVzdCcpLFxuXHRcdFx0XHRcdFx0Z3VhcmRpYW5zQ29zdDogY3kubm9kZXMoKVtrZXldLmRhdGEoJ2d1YXJkaWFuc0Nvc3QnKSxcblx0XHRcdFx0XHRcdGd1YXJkaWFuc1Jld2FyZDogY3kubm9kZXMoKVtrZXldLmRhdGEoJ2d1YXJkaWFuc1Jld2FyZCcpLFxuXHRcdFx0XHRcdFx0cm9iYmVyU2V0dGluZ3M6IEFycmF5LmZyb20oY3kubm9kZXMoKVtrZXldLmRhdGEoJ3JvYmJlclNldHRpbmdzJykpLnJlZHVjZShmdW5jdGlvbiAob2JqLCBfcmVmKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBfcmVmMiA9IF9zbGljZWRUb0FycmF5KF9yZWYsIDIpLFxuXHRcdFx0XHRcdFx0XHQgICAga2V5ID0gX3JlZjJbMF0sXG5cdFx0XHRcdFx0XHRcdCAgICB2YWx1ZSA9IF9yZWYyWzFdO1xuXG5cdFx0XHRcdFx0XHRcdG9ialtrZXldID0gdmFsdWU7cmV0dXJuIG9iajtcblx0XHRcdFx0XHRcdH0sIHt9KVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0pLFxuXHRcdFx0XHRlZGdlczogT2JqZWN0LmtleXMoY3kuZWRnZXMoKSkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0XHRyZXR1cm4gIWlzTmFOKGtleSk7XG5cdFx0XHRcdH0pLm1hcChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHNvdXJjZTogcGFyc2VJbnQoY3kuZWRnZXMoKVtrZXldLnNvdXJjZSgpLmlkKCkpLFxuXHRcdFx0XHRcdFx0dGFyZ2V0OiBwYXJzZUludChjeS5lZGdlcygpW2tleV0udGFyZ2V0KCkuaWQoKSksXG5cdFx0XHRcdFx0XHRsZW5ndGg6IF90aGlzMi5sZW5ndGgoY3kuZWRnZXMoKVtrZXldKVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0pXG5cdFx0XHR9O1xuXHRcdH1cblx0fV0pO1xuXG5cdHJldHVybiBHcmFwaDtcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gR3JhcGg7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcblx0dmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7IHZhciBfYXJyID0gW107IHZhciBfbiA9IHRydWU7IHZhciBfZCA9IGZhbHNlOyB2YXIgX2UgPSB1bmRlZmluZWQ7IHRyeSB7IGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHsgX2Fyci5wdXNoKF9zLnZhbHVlKTsgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrOyB9IH0gY2F0Y2ggKGVycikgeyBfZCA9IHRydWU7IF9lID0gZXJyOyB9IGZpbmFsbHkgeyB0cnkgeyBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdKSBfaVtcInJldHVyblwiXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH0gcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGkpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyByZXR1cm4gYXJyOyB9IGVsc2UgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkgeyByZXR1cm4gc2xpY2VJdGVyYXRvcihhcnIsIGkpOyB9IGVsc2UgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTsgfSB9OyB9KCk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgUm9iYmVycyA9IGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gUm9iYmVycyhzZXR0aW5ncykge1xuXHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgUm9iYmVycyk7XG5cblx0XHQvLyBGaWVsZHNcblxuXHRcdHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcblxuXHRcdC8vIERPTSBsaXN0ZW5lcnNcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcjcm9iYmVycyAuZGVsZXRlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cblx0XHRcdF90aGlzLnJlbW92ZVJvYmJlcigkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLmRhdGEoJ3JvYmJlcmlkJykpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJyNyb2JiZXJzIC5jb25maWd1cmUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuXHRcdFx0X3RoaXMuY29uZmlndXJlUm9iYmVyKCQoZXZlbnQuY3VycmVudFRhcmdldCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkuZGF0YSgncm9iYmVyaWQnKSk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJyNyb2JiZXJzIGlucHV0LmRpc2NyZXRpb24nLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuXHRcdFx0dmFyIG5ld1ZhbHVlID0gMSAtIHBhcnNlRmxvYXQoJChldmVudC5jdXJyZW50VGFyZ2V0KS52YWwoKSk7XG5cblx0XHRcdGlmIChuZXdWYWx1ZSA8IDAgfHwgbmV3VmFsdWUgPiAxKSB7XG5cdFx0XHRcdHJldHVybiAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmNzcyh7XG5cdFx0XHRcdFx0Y29sb3I6ICdyZWQnXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmNzcyh7XG5cdFx0XHRcdGNvbG9yOiBcIiNmZmZcIlxuXHRcdFx0fSk7XG5cblx0XHRcdF90aGlzLmNhdGNoUHJvYmFiaWxpdHkuc2V0KCQoZXZlbnQuY3VycmVudFRhcmdldCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkuZGF0YSgncm9iYmVyaWQnKSwgbmV3VmFsdWUpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NoYW5nZScsICcjbW9kYWwtcm9iYmVyLWNvbmZpZyBpbnB1dCcsIGZ1bmN0aW9uIChldmVudCkge1xuXG5cdFx0XHR2YXIgcm93ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoKS5wYXJlbnQoKTtcblxuXHRcdFx0dmFyIG5vZGVJZCA9IHJvdy5kYXRhKCdub2RlaWQnKTtcblx0XHRcdHZhciByb2JiZXJJZCA9IHJvdy5kYXRhKCdyb2JiZXJpZCcpO1xuXG5cdFx0XHR2YXIgc2V0dGluZyA9ICQoZXZlbnQuY3VycmVudFRhcmdldCkuZGF0YSgnc2V0dGluZycpO1xuXHRcdFx0dmFyIG5ld1ZhbHVlID0gcGFyc2VGbG9hdCgkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnZhbCgpKTtcblxuXHRcdFx0Y29uc29sZS5pbmZvKHNldHRpbmcgKyAnIGNoYW5nZWQgZm9yIHRhcmdldCAnICsgbm9kZUlkICsgJywgbmV3IHZhbHVlIGlzICcgKyBuZXdWYWx1ZSArICcuJyk7XG5cblx0XHRcdF90aGlzLnNldHRpbmdzLmdyYXBoLmN5Lm5vZGVzKCdbaWQgPSBcIicgKyBub2RlSWQgKyAnXCJdJykuZGF0YSgncm9iYmVyU2V0dGluZ3MnKS5nZXQocm9iYmVySWQpW3NldHRpbmddID0gbmV3VmFsdWU7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmluaXQoKTtcblx0fVxuXG5cdC8qXG4gKlx0SW5pdGlhbGl6ZSB0aGUgcm9iYmVycyBieSBzZXR0aW5nIGRlZmF1bHQgdmFsdWVzLlxuICovXG5cblxuXHRfY3JlYXRlQ2xhc3MoUm9iYmVycywgW3tcblx0XHRrZXk6ICdpbml0Jyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gaW5pdCgpIHtcblx0XHRcdHZhciBfdGhpczIgPSB0aGlzO1xuXG5cdFx0XHRpZiAodHlwZW9mIHRoaXMubGlzdCAhPT0gJ3VuZGVmaW5lZCcpIFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5saXN0KSkuZm9yRWFjaChmdW5jdGlvbiAocm9iYmVySWQpIHtcblx0XHRcdFx0cmV0dXJuIF90aGlzMi5yZW1vdmVSb2JiZXIocm9iYmVySWQpO1xuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMubnVtYmVyT2ZSb2JiZXJzQ3JlYXRlZCA9IDA7XG5cblx0XHRcdHRoaXMubGlzdCA9IG5ldyBTZXQoKTtcblxuXHRcdFx0dGhpcy5jYXRjaFByb2JhYmlsaXR5ID0gbmV3IE1hcCgpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRBZGQgYSByb2JiZXIgdG8gdGhlIHNldHRpbmdzLlxuICAqXHRIaXMgY2FyZCBjYW4gYmUgc2VlbiBpbiB0aGUgXCJSb2JiZXJzXCIgdGFiLlxuICAqXHRIaXMgc2V0dGluZ3MgYXJlIHNldCB0byBkZWZhdWx0IGluIGV2ZXJ5IHRhcmdldC5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnbmV3Um9iYmVyJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gbmV3Um9iYmVyKCkge1xuXHRcdFx0dmFyIGNhdGNoUHJvYmFiaWxpdHkgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDAuNTtcblxuXG5cdFx0XHR2YXIgcm9iYmVySWQgPSB0aGlzLm51bWJlck9mUm9iYmVyc0NyZWF0ZWQrKztcblxuXHRcdFx0dGhpcy5saXN0LmFkZChyb2JiZXJJZCk7XG5cblx0XHRcdHRoaXMuY2F0Y2hQcm9iYWJpbGl0eS5zZXQocm9iYmVySWQsIGNhdGNoUHJvYmFiaWxpdHkpO1xuXG5cdFx0XHR0aGlzLnNldHRpbmdzLmdyYXBoLmN5Lm5vZGVzKCkuZWFjaChmdW5jdGlvbiAobm9kZSkge1xuXHRcdFx0XHRyZXR1cm4gbm9kZS5kYXRhKCdyb2JiZXJTZXR0aW5ncycpLnNldChyb2JiZXJJZCwge1xuXHRcdFx0XHRcdGNvc3Q6IDEsXG5cdFx0XHRcdFx0cmV3YXJkOiAxXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNyb2JiZXJzJykuYXBwZW5kKCdcXG5cXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiY29sIHM0XCIgZGF0YS1yb2JiZXJpZD1cIicgKyByb2JiZXJJZCArICdcIj5cXG5cXHRcXHRcXHQgICAgPGRpdiBjbGFzcz1cImNhcmQgYmx1ZS1ncmV5IGRhcmtlbi0xXCI+XFxuXFx0XFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cImNhcmQtY29udGVudCB3aGl0ZS10ZXh0XCI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHNwYW4gY2xhc3M9XCJjYXJkLXRpdGxlXCI+Um9iYmVyICcgKyAocm9iYmVySWQgKyAxKSArICc8L3NwYW4+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PCEtLTxwPlNvbWUgYmFkIGd1eS48L3A+LS0+XFxuXFx0XFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cImNhcmQtYWN0aW9uXCI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cImRpc2NyZXRpb25Db250YWluZXJcIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHRcXHQ8c3Bhbj5EaXNjcmV0aW9uPC9zcGFuPlxcblxcdFxcdFxcdFxcdFxcdFxcdFxcdDxpbnB1dCB0eXBlPVwibnVtYmVyXCIgc3RlcD1cIjAuMDVcIiBjbGFzcz1cImRpc2NyZXRpb25cIiBtaW49XCIwXCIgbWF4PVwiMVwiIHZhbHVlPVwiJyArICgxIC0gY2F0Y2hQcm9iYWJpbGl0eSkgKyAnXCI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGJsdWUgY29uZmlndXJlXCIgc3R5bGU9XCJ3aWR0aDogMTAwJTsgbWFyZ2luLXRvcDogMTBweDtcIj48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zIHJpZ2h0XCI+bW9kZV9lZGl0PC9pPlJld2FyZHM8L2E+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIHJlZCBkZWxldGVcIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBtYXJnaW4tdG9wOiAxMHB4XCIgJyArIChyb2JiZXJJZCA9PT0gMCA/ICdkaXNhYmxlZCcgOiAnJykgKyAnPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnMgcmlnaHRcIj5kZWxldGU8L2k+RGVsZXRlPC9hPlxcblxcdFxcdFxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdCcpO1xuXG5cdFx0XHRyZXR1cm4gcm9iYmVySWQ7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0UmVtb3ZlIGEgcm9iYmVyIGZyb20gdGhlIHNldHRpbmdzLlxuICAqXHRIaXMgY2FyZCBnZXRzIHJlbW92ZWQgYW5kIHJlZmVyZW5jZXMgdG8gaGlzIHNldHRpbmdzIGFyZVxuICAqXHRyZW1vdmVkIGZyb20gZWFjaCB0YXJnZXQuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ3JlbW92ZVJvYmJlcicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHJlbW92ZVJvYmJlcihyb2JiZXJJZCkge1xuXG5cdFx0XHRjb25zb2xlLmluZm8oJ1JlbW92aW5nIHJvYmJlciAnICsgcm9iYmVySWQgKyAnLi4uJyk7XG5cblx0XHRcdHRoaXMubGlzdC5kZWxldGUocm9iYmVySWQpO1xuXG5cdFx0XHR0aGlzLnNldHRpbmdzLmdyYXBoLmN5Lm5vZGVzKCkuZWFjaChmdW5jdGlvbiAobm9kZSkge1xuXHRcdFx0XHRyZXR1cm4gbm9kZS5kYXRhKCdyb2JiZXJTZXR0aW5ncycpLmRlbGV0ZShyb2JiZXJJZCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI3JvYmJlcnMnKS5maW5kKCdbZGF0YS1yb2JiZXJpZD0nICsgcm9iYmVySWQgKyAnXScpLnJlbW92ZSgpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHREaXNwbGF5IGEgbW9kYWwgZW5hYmxpbmcgdGhlIHVzZXIgdG8gc2V0IHRoZVxuICAqXHRyb2JiZXIgcHJvcGVydGllcyBmb3IgZXZlcnkgdGFyZ2V0LlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdjb25maWd1cmVSb2JiZXInLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBjb25maWd1cmVSb2JiZXIocm9iYmVySWQpIHtcblxuXHRcdFx0Y29uc29sZS5pbmZvKCdDb25maWd1cmluZyByb2JiZXIgJyArIChyb2JiZXJJZCArIDEpICsgJy4nKTtcblxuXHRcdFx0dmFyIHRhYmxlID0gJ1xcblxcdFxcdFxcdDx0YWJsZSBjbGFzcz1cInN0cmlwZWQgY2VudGVyZWRcIj5cXG5cXHRcXHRcXHRcXHQ8dGhlYWQ+XFxuXFx0XFx0XFx0XFx0XFx0PHRyPlxcblxcdFxcdFxcdFxcdFxcdFxcdDx0aD5UYXJnZXQgSUQ8L3RoPlxcblxcdFxcdFxcdFxcdFxcdFxcdDx0aD5Db3N0PC90aD5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8dGg+UmV3YXJkPC90aD5cXG5cXHRcXHRcXHRcXHRcXHQ8L3RyPlxcblxcdFxcdFxcdFxcdDwvdGhlYWQ+XFxuXFxuXFx0XFx0XFx0XFx0PHRib2R5Pic7XG5cblx0XHRcdHRoaXMuc2V0dGluZ3MuZ3JhcGguY3kubm9kZXMoJ1tpZCAhPSBcIjBcIl0nKS5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG5cblx0XHRcdFx0dmFyIHNldHRpbmdzID0gbm9kZS5kYXRhKCdyb2JiZXJTZXR0aW5ncycpLmdldChyb2JiZXJJZCk7XG5cblx0XHRcdFx0dGFibGUgKz0gJ1xcblxcdFxcdFxcdFxcdDx0ciBkYXRhLW5vZGVpZD1cIicgKyBub2RlLmlkKCkgKyAnXCIgZGF0YS1yb2JiZXJpZD1cIicgKyByb2JiZXJJZCArICdcIj5cXG5cXHRcXHRcXHRcXHRcXHQ8dGQ+JyArIG5vZGUuaWQoKSArICc8L3RkPlxcblxcdFxcdFxcdFxcdFxcdDx0ZD48aW5wdXQgZGF0YS1zZXR0aW5nPVwiY29zdFwiIHR5cGU9XCJudW1iZXJcIiB2YWx1ZT1cIicgKyBzZXR0aW5ncy5jb3N0ICsgJ1wiIG1pbj1cIjBcIj48L3RkPlxcblxcdFxcdFxcdFxcdFxcdDx0ZD48aW5wdXQgZGF0YS1zZXR0aW5nPVwicmV3YXJkXCIgdHlwZT1cIm51bWJlclwiIHZhbHVlPVwiJyArIHNldHRpbmdzLnJld2FyZCArICdcIiBtaW49XCIwXCI+PC90ZD5cXG5cXHRcXHRcXHRcXHQ8L3RyPic7XG5cdFx0XHR9KTtcblxuXHRcdFx0dGFibGUgKz0gJ1xcblxcdFxcdFxcdFxcdDwvdGJvZHk+XFxuXFx0XFx0XFx0PC90YWJsZT4nO1xuXG5cdFx0XHQkKCcjbW9kYWwtcm9iYmVyLWNvbmZpZyBoNCcpLnRleHQoJ1JvYmJlciAnICsgKHJvYmJlcklkICsgMSkgKyAnIGNvbmZpZ3VyYXRpb24nKTtcblxuXHRcdFx0JCgnI21vZGFsLXJvYmJlci1jb25maWcgcCcpLmh0bWwodGFibGUpO1xuXG5cdFx0XHQkKCcjbW9kYWwtcm9iYmVyLWNvbmZpZycpLm1vZGFsKCdvcGVuJyk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdFJldHVybiB0aGUgbGlzdCBvZiBldmVyeSByb2JiZXIuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ2dldFNldHRpbmdzJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gZ2V0U2V0dGluZ3MoKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRsaXN0OiBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMubGlzdCkpLFxuXHRcdFx0XHRjYXRjaFByb2JhYmlsaXR5OiBBcnJheS5mcm9tKHRoaXMuY2F0Y2hQcm9iYWJpbGl0eSkucmVkdWNlKGZ1bmN0aW9uIChvYmosIF9yZWYpIHtcblx0XHRcdFx0XHR2YXIgX3JlZjIgPSBfc2xpY2VkVG9BcnJheShfcmVmLCAyKSxcblx0XHRcdFx0XHQgICAga2V5ID0gX3JlZjJbMF0sXG5cdFx0XHRcdFx0ICAgIHZhbHVlID0gX3JlZjJbMV07XG5cblx0XHRcdFx0XHRvYmpba2V5XSA9IHZhbHVlO3JldHVybiBvYmo7XG5cdFx0XHRcdH0sIHt9KVxuXHRcdFx0fTtcblx0XHR9XG5cdH1dKTtcblxuXHRyZXR1cm4gUm9iYmVycztcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gUm9iYmVyczsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfSW50ZXJmYWNlID0gcmVxdWlyZSgnLi9jbGFzc2VzL0ludGVyZmFjZScpO1xuXG52YXIgX0ludGVyZmFjZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9JbnRlcmZhY2UpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG4vKlxuKlx0Q3l0b3NjYXBlICh0aGUgZ3JhcGggbGlicmFyeSB3ZSBhcmUgdXNpbmcpIGRvZXNuJ3Qgd29yayBzb1xuKlx0d2VsbCB3aGVuIHRoZSByZW5kZXJpbmcgY2FudmFzIGlzIGhpZGRlbiB3aGlsZSB0aGUgZ3JhcGhcbipcdGlzIGluaXRpYWxpemVkLiBXZSBoYXZlIHRvIHdhaXQgZm9yIHRoZSBjYW52YXMgdG8gYmUgZGlzcGxheWVkXG4qXHRiZWZvcmUgaW5pdGlhbGl6aW5nIGl0IGFuZCB0byBvbmx5IGRvIHNvIG9uY2UuXG4qXG4qXHRUaHVzLCB3ZSB1c2UgdGhlIGdsb2JhbCBmbGFnIGdyYXBoSW5pdGlhbGl6ZWQuXG4qL1xuXG52YXIgZ3JhcGhJbml0aWFsaXplZCA9IGZhbHNlO1xuXG4vKlxuKlx0RnVuY3Rpb24gY2FsbGVkIHdoZW5ldmVyIHRoZSBoYXNoIGlzIHVwZGF0ZWQgdG8gZG8gdGhlIGNvcnJlY3RcbipcdGFjdGlvbi5cbiovXG5cbnZhciB1cGRhdGVIYXNoID0gZnVuY3Rpb24gdXBkYXRlSGFzaChoYXNoKSB7XG5cblx0Ly8gV2UgcmVtb3ZlIHRoZSAnIycgY2hhcmFjdGVyIGZyb20gdGhlIGhhc2guIEp1c3QgaW4gY2FzZS5cblx0aGFzaCA9IGhhc2gucmVwbGFjZSgvXiMvLCAnJyk7XG5cblx0LypcbiAqXHRQcmV2ZW50cyAjIGxpbmtzIGZyb20gZ29pbmcgdG8gdGhlIGVsZW1lbnQuXG4gKi9cblx0dmFyIG5vZGUgPSAkKCcjJyArIGhhc2gpO1xuXHRub2RlLmF0dHIoJ2lkJywgJycpO1xuXHRkb2N1bWVudC5sb2NhdGlvbi5oYXNoID0gaGFzaDtcblx0bm9kZS5hdHRyKCdpZCcsIGhhc2gpO1xuXG5cdC8qXG4gKlx0V2UgaGF2ZSB0byBzb3J0IHRoZSBncmFwaCB3aGVuIGl0J3MgZGlzcGxheWVkXG4gKlx0Zm9yIHRoZSBmaXJzdCB0aW1lLlxuICovXG5cdGlmICghZ3JhcGhJbml0aWFsaXplZCAmJiBoYXNoID09PSAnc2ltdWxhdGUnKSB7XG5cdFx0d2luZG93LmdyYXBoLnNvcnQoKTtcblx0XHRncmFwaEluaXRpYWxpemVkID0gdHJ1ZTtcblx0fVxuXG5cdGlmICh3aW5kb3cuY3kgIT09IHVuZGVmaW5lZCkgd2luZG93LmN5LnJlc2l6ZSgpO1xuXG5cdC8qXG4gKlx0Rml4IGEgYnVnIHdpdGggcGFyYWxsYXggaW1hZ2VzLlxuICovXG5cblx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0JCh3aW5kb3cpLnNjcm9sbCgpLnJlc2l6ZSgpO1xuXHR9LCAyNSk7XG59O1xuXG4vKlxuKlx0U2V0dXAgbm9uLXNwZWNpZmljIERPTSBsaXN0ZW5lcnMgYW5kIGluaXRpYWxpemUgbW9kdWxlcy5cbiovXG52YXIgc2V0dXBET00gPSBmdW5jdGlvbiBzZXR1cERPTSgpIHtcblxuXHQkKCdbZGF0YS1kZXN0XScpLmNsaWNrKGZ1bmN0aW9uIChldmVudCkge1xuXHRcdHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJChldmVudC5ldmVudFRhcmdldCkuZGF0YSgnZGVzdCcpO1xuXHRcdCQoJ25hdiB1bC50YWJzJykudGFicygnc2VsZWN0X3RhYicsICQoZXZlbnQuY3VycmVudFRhcmdldCkuZGF0YSgnZGVzdCcpKTtcblx0XHR1cGRhdGVIYXNoKCQoZXZlbnQuY3VycmVudFRhcmdldCkuZGF0YSgnZGVzdCcpKTtcblx0fSk7XG5cblx0JCgnbmF2IHVsLnRhYnMnKS5vbignY2xpY2snLCAnYScsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdHVwZGF0ZUhhc2goJChldmVudC5jdXJyZW50VGFyZ2V0KS5hdHRyKCdocmVmJykpO1xuXHR9KTtcblxuXHQkKHdpbmRvdykub24oJ2hhc2hjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG5cdFx0JCgnbmF2IHVsLnRhYnMnKS50YWJzKCdzZWxlY3RfdGFiJywgd2luZG93LmxvY2F0aW9uLmhhc2guc2xpY2UoMSkpO1xuXHRcdHVwZGF0ZUhhc2god2luZG93LmxvY2F0aW9uLmhhc2gpO1xuXHR9KTtcblxuXHQkKCcucGFyYWxsYXgnKS5wYXJhbGxheCgpO1xuXG5cdCQoJy5tb2RhbCNtb2RhbC1yb2JiZXItY29uZmlnJykubW9kYWwoKTtcblxuXHRDb25zb2xlTG9nSFRNTC5jb25uZWN0KCQoJyNjb25zb2xlJykpO1xufTtcblxuLypcbipcdFdoZW5ldmVyIHRoZSBET00gY29udGVudCBpcyByZWFhZHkgdG8gYmUgbWFuaXB1bGF0ZWQsXG4qXHRzZXR1cGUgdGhlIHNwZWNpZmljIERPTSBhbmQgY3JlYXRlIGFuIEludGVyZmFjZSB3aXRoIHRoZSBzZXJ2ZXIuXG4qXHRUaGVuLCB3ZSBsaW5rIHRoZSBVSSBlbGVtZW50cyB0byB0aGUgc2V0dGluZ3MgdGhleSBtYW5pcHVsYXRlLlxuKi9cbiQoZnVuY3Rpb24gKCkge1xuXHRzZXR1cERPTSgpO1xuXG5cdHZhciBpZmFjZSA9IG5ldyBfSW50ZXJmYWNlMi5kZWZhdWx0KCk7XG5cdCQoJyNzb3J0Tm9kZXMnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRyZXR1cm4gaWZhY2Uuc2V0dGluZ3MuZ3JhcGguc29ydCgpO1xuXHR9KTtcblx0JCgnI25ld1JvYmJlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdHJldHVybiBpZmFjZS5zZXR0aW5ncy5yb2JiZXJzLm5ld1JvYmJlcigpO1xuXHR9KTtcblx0JCgnI2xhdW5jaEJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdHJldHVybiBpZmFjZS5zdGFydFNpbXVsYXRpb24oKTtcblx0fSk7XG5cdCQoJyNpbXBvcnRCdXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRyZXR1cm4gaWZhY2Uuc2V0dGluZ3MubG9hZGVyLmltcG9ydCgpO1xuXHR9KTtcblx0JCgnI2V4cG9ydEJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdHJldHVybiBpZmFjZS5zZXR0aW5ncy5zYXZlci5zYXZlKCk7XG5cdH0pO1xuXHQkKCcjZXhwb3J0LWdhbWJpdCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdHJldHVybiBpZmFjZS5yZXN1bHRzLmV4cG9ydEdhbWJpdCgpO1xuXHR9KTtcblx0JCgnLm1vZGFsI21vZGFsLXJlc3VsdHMnKS5tb2RhbCh7IGNvbXBsZXRlOiBmdW5jdGlvbiBjb21wbGV0ZSgpIHtcblx0XHRcdGlmYWNlLnN0b3BTaW11bGF0aW9uKCk7XG5cdFx0XHQkKCcjZXhwb3J0LWdhbWJpdCcpLmF0dHIoJ2Rpc2FibGVkJywgJ3RydWUnKTtcblx0XHR9IH0pO1xufSk7Il19
