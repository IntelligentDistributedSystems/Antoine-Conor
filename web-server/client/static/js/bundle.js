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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
*	Deals with the results sent by the server.
*/
var Results = function () {
	function Results(iface) {
		_classCallCheck(this, Results);

		this.interface = iface;
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

			console.info('Results received.');

			// Building the list of patrols.

			var patrolsTableHTML = '\n\t\t\t<table class="striped centered">\n\t\t\t\t<thead>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<th>Patrol ID</th>\n\t\t\t\t\t\t<th>path</th>\n\t\t\t\t\t</tr>\n\t\t\t\t</thead>\n\n\t\t\t\t<tbody>';

			data.patrols.forEach(function (patrol, index) {

				patrolsTableHTML += '\n\t\t\t\t<tr>\n\t\t\t\t\t<td>' + index + '</td>\n\t\t\t\t\t<td>' + patrol.reduce(function (sum, target) {
					return '' + sum + target + ' \u21D2 ';
				}, '').slice(0, -3) + '</td>\n\t\t\t\t</tr>';
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

			new _LiveSimulation2.default(this, data, bestStreategy, '#liveSimulation').run();

			return this;
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
				"distanceWeight": 1
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

			$('#robbers').append('\n\t\t\t<div class="col s4" data-robberid="' + robberId + '">\n\t\t\t    <div class="card blue-grey darken-1">\n\t\t\t\t\t<div class="card-content white-text">\n\t\t\t\t\t\t<span class="card-title">Robber ' + (robberId + 1) + '</span>\n\t\t\t\t\t\t<!--<p>Some bad guy.</p>-->\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="card-action">\n\t\t\t\t\t\t<div class="discretionContainer">\n\t\t\t\t\t\t\t<span>Discretion</span>\n\t\t\t\t\t\t\t<input type="number" step="0.05" class="discretion" min="0" max="1" value="' + catchProbability + '">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<a class="waves-effect waves-light btn blue configure" style="width: 100%; margin-top: 10px;"><i class="material-icons right">mode_edit</i>Rewards</a>\n\t\t\t\t\t\t<a class="waves-effect waves-light btn red delete" style="width: 100%; margin-top: 10px" ' + (robberId === 0 ? 'disabled' : '') + '><i class="material-icons right">delete</i>Delete</a>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t');

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
	$('.modal#modal-results').modal({ complete: function complete() {
			return iface.stopSimulation();
		} });
});
},{"./classes/Interface":1}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvZGlzdC9qcy9jbGFzc2VzL0ludGVyZmFjZS5qcyIsImNsaWVudC9kaXN0L2pzL2NsYXNzZXMvaW50ZXJmYWNlL1Jlc3VsdHMuanMiLCJjbGllbnQvZGlzdC9qcy9jbGFzc2VzL2ludGVyZmFjZS9TZXR0aW5ncy5qcyIsImNsaWVudC9kaXN0L2pzL2NsYXNzZXMvaW50ZXJmYWNlL3Jlc3VsdHMvTGl2ZVNpbXVsYXRpb24uanMiLCJjbGllbnQvZGlzdC9qcy9jbGFzc2VzL2ludGVyZmFjZS9zZXR0aW5ncy9maWxlcy9Mb2FkZXIuanMiLCJjbGllbnQvZGlzdC9qcy9jbGFzc2VzL2ludGVyZmFjZS9zZXR0aW5ncy9maWxlcy9TYXZlci5qcyIsImNsaWVudC9kaXN0L2pzL2NsYXNzZXMvaW50ZXJmYWNlL3NldHRpbmdzL3N1YnNldHRpbmdzL0dyYXBoLmpzIiwiY2xpZW50L2Rpc3QvanMvY2xhc3Nlcy9pbnRlcmZhY2Uvc2V0dGluZ3Mvc3Vic2V0dGluZ3MvUm9iYmVycy5qcyIsImNsaWVudC9kaXN0L2pzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfU2V0dGluZ3MgPSByZXF1aXJlKCcuL2ludGVyZmFjZS9TZXR0aW5ncycpO1xuXG52YXIgX1NldHRpbmdzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NldHRpbmdzKTtcblxudmFyIF9SZXN1bHRzID0gcmVxdWlyZSgnLi9pbnRlcmZhY2UvUmVzdWx0cycpO1xuXG52YXIgX1Jlc3VsdHMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUmVzdWx0cyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8qXG4qXHRJbnRlcmZhY2UgYmV0d2VlbiB0aGUgY2xpZW50IHNpZGUgYW5kIHRoZSBiYWNrLWVuZC5cbipcbipcdFRoZSBpbnRlcmZhY2UgaGFzIHNldHRpbmdzIGFuZCBhIHNvY2tldCBlbmFibGluZyBpdCBcbipcdHRvIHNlbmQgYW5kIHJlY2VpdmUgZGF0YSBmcm9tIHRoZSBzZXJ2ZXIgcnVubmluZyB0aGVcbipcdEphdmEgTUFTIHNpbXVsYXRpb24uXG4qL1xuXG52YXIgSW50ZXJmYWNlID0gZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBJbnRlcmZhY2UoKSB7XG5cdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIEludGVyZmFjZSk7XG5cblx0XHQvLyBGaWVsZHNcblxuXHRcdHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgnaHR0cDovLycgKyB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgKyAnOjgwODMnKTtcblx0XHR0aGlzLnNldHRpbmdzID0gbmV3IF9TZXR0aW5nczIuZGVmYXVsdCh0aGlzKTtcblx0XHR0aGlzLnJlc3VsdHMgPSBuZXcgX1Jlc3VsdHMyLmRlZmF1bHQodGhpcyk7XG5cdFx0dGhpcy5zaW11bGF0aW9uUnVubmluZyA9IGZhbHNlO1xuXG5cdFx0Ly8gU29ja2V0IGxpc3RlbmVyc1xuXG5cdFx0dGhpcy5zb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdGNvbnNvbGUuaW5mbygnQ29ubmVjdGlvbiB0byB0aGUgcmVtb3RlIHNlcnZlciBlc3RhYmxpc2hlZC4nKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qXG4gKlx0U3RhcnQgdGhlIHNpbXVsYXRpb24gYnkgc2VuZGluZyB0aGUgc2V0dGluZ3MgdG8gdGhlIGJhY2stZW5kXG4gKlx0YWxvbmcgdGhlIG1lc3NhZ2UgJ3N0YXJ0U2ltdWxhdGlvbicuXG4gKi9cblxuXHRfY3JlYXRlQ2xhc3MoSW50ZXJmYWNlLCBbe1xuXHRcdGtleTogJ3N0YXJ0U2ltdWxhdGlvbicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHN0YXJ0U2ltdWxhdGlvbigpIHtcblx0XHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0XHRcdHRoaXMuc2ltdWxhdGlvblJ1bm5pbmcgPSB0cnVlO1xuXG5cdFx0XHR0aGlzLnNvY2tldC5vbignbG9hZGluZycsIGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0XHRcdHJldHVybiBfdGhpcy5yZXN1bHRzLmxvYWRpbmcoZGF0YS5wcm9ncmVzcyk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5yZXN1bHRzLmxvYWRpbmcoMCk7XG5cblx0XHRcdHRoaXMuc29ja2V0LmVtaXQoJ3N0YXJ0U2ltdWxhdGlvbicsIHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZ3MoKSwgZnVuY3Rpb24gKHJlc3VsdHMpIHtcblxuXHRcdFx0XHRjb25zb2xlLmxvZyhyZXN1bHRzKTtcblxuXHRcdFx0XHRpZiAoIV90aGlzLnNpbXVsYXRpb25SdW5uaW5nKSByZXR1cm47XG5cblx0XHRcdFx0aWYgKHJlc3VsdHMuZXJyb3IpIHJldHVybiBfdGhpcy5yZXN1bHRzLmVycm9yKHJlc3VsdHMuZXJyb3IpO1xuXG5cdFx0XHRcdF90aGlzLnJlc3VsdHMuc2hvd1Jlc3VsdHMocmVzdWx0cy5kYXRhKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRTdG9wIHRoZSBjbGllbnQtc2lkZSBzaW11bGF0aW9uIGJ5IHJlbW92aW5nIHRoZSBsb2FkaW5nIHNjcmVlbiBhbmRcbiAgKlx0YmxvY2tpbmcgcmVzdWx0cyBjYWxsYmFjay5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnc3RvcFNpbXVsYXRpb24nLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBzdG9wU2ltdWxhdGlvbigpIHtcblx0XHRcdHRoaXMuc2ltdWxhdGlvblJ1bm5pbmcgPSBmYWxzZTtcblxuXHRcdFx0dGhpcy5zb2NrZXQucmVtb3ZlTGlzdGVuZXIoJ2xvYWRpbmcnKTtcblxuXHRcdFx0dGhpcy5zb2NrZXQuZW1pdCgnY2FuY2VsJyk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblx0fV0pO1xuXG5cdHJldHVybiBJbnRlcmZhY2U7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IEludGVyZmFjZTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfTGl2ZVNpbXVsYXRpb24gPSByZXF1aXJlKCcuL3Jlc3VsdHMvTGl2ZVNpbXVsYXRpb24nKTtcblxudmFyIF9MaXZlU2ltdWxhdGlvbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9MaXZlU2ltdWxhdGlvbik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8qXG4qXHREZWFscyB3aXRoIHRoZSByZXN1bHRzIHNlbnQgYnkgdGhlIHNlcnZlci5cbiovXG52YXIgUmVzdWx0cyA9IGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gUmVzdWx0cyhpZmFjZSkge1xuXHRcdF9jbGFzc0NhbGxDaGVjayh0aGlzLCBSZXN1bHRzKTtcblxuXHRcdHRoaXMuaW50ZXJmYWNlID0gaWZhY2U7XG5cdFx0d2luZG93LnJlc3VsdHMgPSB0aGlzO1xuXHR9XG5cblx0LypcbiAqXHRXaGVuIGFuIGVycm9yIGlzIHJlY2VpdmVkLCBwcmludCBpdCB0byBzY3JlZW4uXG4gKi9cblxuXG5cdF9jcmVhdGVDbGFzcyhSZXN1bHRzLCBbe1xuXHRcdGtleTogJ2Vycm9yJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gZXJyb3IoZXJyKSB7XG5cblx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Vycm9yOiAnICsgZXJyKTtcblxuXHRcdFx0JCgnI21vZGFsLXJlc3VsdHMgcCcpLmh0bWwoJ1xcblxcblxcdFxcdFxcdDxkaXYgY2xhc3M9XCJjZW50ZXJcIj5cXG5cXHRcXHRcXHRcXHRFcnJvciBlbmNvdW50ZXJlZCB3aGlsZSBjb21wdXRpbmcgdGhlIHJlc3VsdHM6IDxicj5cXG5cXHRcXHRcXHRcXHQnICsgZXJyICsgJ1xcblxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdCcpLm1vZGFsKCdvcGVuJyk7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0V2hlbiB0aGUgc2VydmVyIGlzIHByb2Nlc3NpbmcsIHNob3cgdGhlIHByb2dyZXNzLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdsb2FkaW5nJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gbG9hZGluZygpIHtcblx0XHRcdHZhciBwZXJjZW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBmYWxzZTtcblxuXG5cdFx0XHQkKCcjbW9kYWwtcmVzdWx0cyBwJykuaHRtbCgnXFxuXFxuXFx0XFx0XFx0PGRpdiBjbGFzcz1cImNlbnRlclwiPlxcblxcdFxcdFxcdFxcdFBsZWFzZSB3YWl0IHdoaWxlIG91ciBzZXJ2ZXIgaXMgY29tcHV0aW5nIHRoZSByZXN1bHRzLlxcblxcdFxcdFxcdDwvZGl2PlxcblxcblxcdFxcdFxcdDxkaXYgY2xhc3M9XCJwcm9ncmVzc1wiPlxcblxcdFxcdFxcdFxcdDxkaXYgY2xhc3M9XCInICsgKHBlcmNlbnQgPyAnZGV0ZXJtaW5hdGVcIiBzdHlsZT1cIndpZHRoOiAnICsgcGVyY2VudCArICclXCInIDogJ2luZGV0ZXJtaW5hdGVcIicpICsgJz48L2Rpdj5cXG5cXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHQnKS5tb2RhbCgnb3BlbicpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRXaGVuIGV2ZXJ5dGhpbmcgaXMgb2theSwgZGlzcGxheSBwYXRocywgc3RhdHMgYW5kIHNob3cgYSBzaW11bGF0aW9uLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdzaG93UmVzdWx0cycsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHNob3dSZXN1bHRzKGRhdGEpIHtcblxuXHRcdFx0Y29uc29sZS5pbmZvKCdSZXN1bHRzIHJlY2VpdmVkLicpO1xuXG5cdFx0XHQvLyBCdWlsZGluZyB0aGUgbGlzdCBvZiBwYXRyb2xzLlxuXG5cdFx0XHR2YXIgcGF0cm9sc1RhYmxlSFRNTCA9ICdcXG5cXHRcXHRcXHQ8dGFibGUgY2xhc3M9XCJzdHJpcGVkIGNlbnRlcmVkXCI+XFxuXFx0XFx0XFx0XFx0PHRoZWFkPlxcblxcdFxcdFxcdFxcdFxcdDx0cj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8dGg+UGF0cm9sIElEPC90aD5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8dGg+cGF0aDwvdGg+XFxuXFx0XFx0XFx0XFx0XFx0PC90cj5cXG5cXHRcXHRcXHRcXHQ8L3RoZWFkPlxcblxcblxcdFxcdFxcdFxcdDx0Ym9keT4nO1xuXG5cdFx0XHRkYXRhLnBhdHJvbHMuZm9yRWFjaChmdW5jdGlvbiAocGF0cm9sLCBpbmRleCkge1xuXG5cdFx0XHRcdHBhdHJvbHNUYWJsZUhUTUwgKz0gJ1xcblxcdFxcdFxcdFxcdDx0cj5cXG5cXHRcXHRcXHRcXHRcXHQ8dGQ+JyArIGluZGV4ICsgJzwvdGQ+XFxuXFx0XFx0XFx0XFx0XFx0PHRkPicgKyBwYXRyb2wucmVkdWNlKGZ1bmN0aW9uIChzdW0sIHRhcmdldCkge1xuXHRcdFx0XHRcdHJldHVybiAnJyArIHN1bSArIHRhcmdldCArICcgXFx1MjFEMiAnO1xuXHRcdFx0XHR9LCAnJykuc2xpY2UoMCwgLTMpICsgJzwvdGQ+XFxuXFx0XFx0XFx0XFx0PC90cj4nO1xuXHRcdFx0fSk7XG5cblx0XHRcdHBhdHJvbHNUYWJsZUhUTUwgKz0gJ1xcblxcdFxcdFxcdFxcdDwvdGJvZHk+XFxuXFx0XFx0XFx0PC90YWJsZT4nO1xuXG5cdFx0XHQvLyBXZSBoYXZlIHRvIGZpbmQgdGhlIGJlc3Qgc3RyYXRlZ3kuXG5cblx0XHRcdHZhciBzdGF0aXN0aWNzVGFibGUgPSBbXTtcblxuXHRcdFx0ZGF0YS5zdHJhdGVnaWVzLmZvckVhY2goZnVuY3Rpb24gKHN0cmF0ZWd5KSB7XG5cblx0XHRcdFx0dmFyIGF2ZXJhZ2VHdWFyZGlhblV0aWxpdHkgPSBzdHJhdGVneS5pdGVyYXRpb25zLnJlZHVjZShmdW5jdGlvbiAoc3VtLCBpdGVyYXRpb24pIHtcblx0XHRcdFx0XHRyZXR1cm4gc3VtICsgaXRlcmF0aW9uLmd1YXJkaWFuVXRpbGl0eTtcblx0XHRcdFx0fSwgMCkgLyBzdHJhdGVneS5pdGVyYXRpb25zLmxlbmd0aDtcblx0XHRcdFx0dmFyIGF2ZXJhZ2VSb2JiZXJVdGlsaXR5ID0gc3RyYXRlZ3kuaXRlcmF0aW9ucy5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgaXRlcmF0aW9uKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHN1bSArIGl0ZXJhdGlvbi5yb2JiZXJVdGlsaXR5O1xuXHRcdFx0XHR9LCAwKSAvIHN0cmF0ZWd5Lml0ZXJhdGlvbnMubGVuZ3RoO1xuXG5cdFx0XHRcdHN0YXRpc3RpY3NUYWJsZS5wdXNoKHtcblx0XHRcdFx0XHRpdGVyYXRpb25zOiBzdHJhdGVneS5pdGVyYXRpb25zLFxuXHRcdFx0XHRcdHByb2JhYmlsaXRpZXM6IHN0cmF0ZWd5LnByb2JhYmlsaXRpZXMucmVkdWNlKGZ1bmN0aW9uIChzdW0sIHByb2JhYmlsaXR5KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gJycgKyBzdW0gKyBwcm9iYWJpbGl0eS50b0ZpeGVkKDIpICsgJyB8ICc7XG5cdFx0XHRcdFx0fSwgJycpLnNsaWNlKDAsIC0zKSxcblx0XHRcdFx0XHRndWFyZGlhblV0aWxpdHk6IGF2ZXJhZ2VHdWFyZGlhblV0aWxpdHksXG5cdFx0XHRcdFx0cm9iYmVyVXRpbGl0eTogYXZlcmFnZVJvYmJlclV0aWxpdHksXG5cdFx0XHRcdFx0c3RyYXRlZ3k6IHN0cmF0ZWd5XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdHZhciBzb3J0ZWRTdGF0aXN0aWNzVGFibGUgPSBzdGF0aXN0aWNzVGFibGUuc29ydChmdW5jdGlvbiAoczEsIHMyKSB7XG5cdFx0XHRcdHJldHVybiBzMi5ndWFyZGlhblV0aWxpdHkgLSBzMS5ndWFyZGlhblV0aWxpdHk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dmFyIGJlc3RTdHJlYXRlZ3kgPSBzb3J0ZWRTdGF0aXN0aWNzVGFibGVbMF0uc3RyYXRlZ3k7XG5cblx0XHRcdC8vIFdlIGZlZWQgdGhlIGNoYXJ0IHdpdGggYXZlcmFnZSBldm9sdXRpb24gZm9yIHRoZSBiZXN0IHN0cmF0ZWd5LlxuXG5cdFx0XHR2YXIgY2hhcnREYXRhID0gW107XG5cdFx0XHR2YXIgc3VtID0gMDtcblxuXHRcdFx0c29ydGVkU3RhdGlzdGljc1RhYmxlWzBdLml0ZXJhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoaXRlcmF0aW9uKSB7XG5cblx0XHRcdFx0Y2hhcnREYXRhLnB1c2goe1xuXHRcdFx0XHRcdHg6IGNoYXJ0RGF0YS5sZW5ndGgsXG5cdFx0XHRcdFx0eTogKHN1bSArPSBpdGVyYXRpb24uZ3VhcmRpYW5VdGlsaXR5KSAvIChjaGFydERhdGEubGVuZ3RoICsgMSlcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gQnVpbGRpbmcgdGhlIGxpc3Qgb2Ygc3RhdGlzdGljcy5cblxuXHRcdFx0dmFyIHN0YXRpc3RpY3NUYWJsZUhUTUwgPSAnXFxuXFx0XFx0XFx0PHRhYmxlIGNsYXNzPVwic3RyaXBlZCBjZW50ZXJlZFwiPlxcblxcdFxcdFxcdFxcdDx0aGVhZD5cXG5cXHRcXHRcXHRcXHRcXHQ8dHI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPlByb2JhYmlsaXRpZXM8L3RoPlxcblxcdFxcdFxcdFxcdFxcdFxcdDx0aD5HdWFyZGlhbiB1dGlsaXR5PC90aD5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8dGg+Um9iYmVyIHV0aWxpdHk8L3RoPlxcblxcdFxcdFxcdFxcdFxcdDwvdHI+XFxuXFx0XFx0XFx0XFx0PC90aGVhZD5cXG5cXG5cXHRcXHRcXHRcXHQ8dGJvZHk+JztcblxuXHRcdFx0c29ydGVkU3RhdGlzdGljc1RhYmxlLmZvckVhY2goZnVuY3Rpb24gKHN0cmF0ZWd5KSB7XG5cblx0XHRcdFx0c3RhdGlzdGljc1RhYmxlSFRNTCArPSAnXFxuXFx0XFx0XFx0XFx0PHRyPlxcblxcdFxcdFxcdFxcdFxcdDx0ZD4nICsgc3RyYXRlZ3kucHJvYmFiaWxpdGllcyArICc8L3RkPlxcblxcdFxcdFxcdFxcdFxcdDx0ZD4nICsgTnVtYmVyKHN0cmF0ZWd5Lmd1YXJkaWFuVXRpbGl0eSkudG9GaXhlZCg0KSArICc8L3RkPlxcblxcdFxcdFxcdFxcdFxcdDx0ZD4nICsgTnVtYmVyKHN0cmF0ZWd5LnJvYmJlclV0aWxpdHkpLnRvRml4ZWQoNCkgKyAnPC90ZD5cXG5cXHRcXHRcXHRcXHQ8L3RyPic7XG5cdFx0XHR9KTtcblxuXHRcdFx0c3RhdGlzdGljc1RhYmxlSFRNTCArPSAnXFxuXFx0XFx0XFx0XFx0PC90Ym9keT5cXG5cXHRcXHRcXHQ8L3RhYmxlPic7XG5cblx0XHRcdCQoJyNtb2RhbC1yZXN1bHRzIHAnKS5odG1sKCdcXG5cXG5cXHRcXHRcXHQ8ZGl2IGNsYXNzPVwicm93XCI+XFxuXFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cImNvbCBzMTJcIj5cXG5cXHRcXHRcXHRcXHRcXHQ8dWwgY2xhc3M9XCJ0YWJzXCI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGxpIGNsYXNzPVwidGFiIGNvbCBzM1wiPjxhIGNsYXNzPVwiYWN0aXZlXCIgaHJlZj1cIiNjaGFydFwiPkNoYXJ0PC9hPjwvbGk+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGxpIGNsYXNzPVwidGFiIGNvbCBzM1wiPjxhIGhyZWY9XCIjdmlzdWFsaXphdGlvblwiPlZpc3VhbGl6YXRpb248L2E+PC9saT5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8bGkgY2xhc3M9XCJ0YWIgY29sIHMzXCI+PGEgaHJlZj1cIiNwYXRyb2xzXCI+UGF0cm9sczwvYT48L2xpPlxcblxcdFxcdFxcdFxcdFxcdFxcdDxsaSBjbGFzcz1cInRhYiBjb2wgczNcIj48YSBocmVmPVwiI3N0YXRpc3RpY3NcIj5TdGF0aXN0aWNzPC9hPjwvbGk+XFxuXFx0XFx0XFx0XFx0XFx0PC91bD5cXG5cXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHQ8ZGl2IGlkPVwiY2hhcnRcIiBjbGFzcz1cImNvbCBzMTJcIj5cXG5cXHRcXHRcXHRcXHRcXHQ8Y2FudmFzIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjQwMFwiIGlkPVwibGluZS1jaGFydFwiPjwvY2FudmFzPlxcblxcdFxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdFxcdFxcdDxkaXYgaWQ9XCJ2aXN1YWxpemF0aW9uXCIgY2xhc3M9XCJjb2wgczEyXCI+XFxuXFx0XFx0XFx0XFx0XFx0PGRpdiBpZD1cImxpdmVTaW11bGF0aW9uTG9nXCI+SXRlcmF0aW9uIHJ1bm5pbmcuLi48L2Rpdj5cXG5cXHRcXHRcXHRcXHRcXHQ8ZGl2IGlkPVwibGl2ZVNpbXVsYXRpb25cIiBjbGFzcz1cInMxMlwiPlxcblxcdFxcdFxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdFxcdFxcdDxkaXYgaWQ9XCJwYXRyb2xzXCIgY2xhc3M9XCJjb2wgczEyXCI+XFxuXFx0XFx0XFx0XFx0XFx0JyArIHBhdHJvbHNUYWJsZUhUTUwgKyAnXFxuXFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0XFx0PGRpdiBpZD1cInN0YXRpc3RpY3NcIiBjbGFzcz1cImNvbCBzMTJcIj5cXG5cXHRcXHRcXHRcXHRcXHQnICsgc3RhdGlzdGljc1RhYmxlSFRNTCArICdcXG5cXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHQ8L2Rpdj5cXG5cXG5cXHRcXHQnKS5tb2RhbCgnb3BlbicpO1xuXG5cdFx0XHQkKCcjbW9kYWwtcmVzdWx0cyBwIHVsLnRhYnMnKS50YWJzKCk7XG5cblx0XHRcdHZhciBzY2F0dGVyQ2hhcnQgPSBuZXcgQ2hhcnQoXCJsaW5lLWNoYXJ0XCIsIHtcblx0XHRcdFx0dHlwZTogJ2xpbmUnLFxuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0ZGF0YXNldHM6IFt7XG5cdFx0XHRcdFx0XHRsYWJlbDogJ0Jlc3Qgc3RyYXRlZ3kgdXRpbGl0eSBvdmVyIHRpbWUuJyxcblx0XHRcdFx0XHRcdGRhdGE6IGNoYXJ0RGF0YVxuXHRcdFx0XHRcdH1dXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0XHRtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcblx0XHRcdFx0XHRzY2FsZXM6IHtcblx0XHRcdFx0XHRcdHhBeGVzOiBbe1xuXHRcdFx0XHRcdFx0XHR0eXBlOiAnbGluZWFyJyxcblx0XHRcdFx0XHRcdFx0cG9zaXRpb246ICdib3R0b20nXG5cdFx0XHRcdFx0XHR9XVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdG5ldyBfTGl2ZVNpbXVsYXRpb24yLmRlZmF1bHQodGhpcywgZGF0YSwgYmVzdFN0cmVhdGVneSwgJyNsaXZlU2ltdWxhdGlvbicpLnJ1bigpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cdH1dKTtcblxuXHRyZXR1cm4gUmVzdWx0cztcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gUmVzdWx0czsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfR3JhcGggPSByZXF1aXJlKCcuL3NldHRpbmdzL3N1YnNldHRpbmdzL0dyYXBoLmpzJyk7XG5cbnZhciBfR3JhcGgyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfR3JhcGgpO1xuXG52YXIgX1JvYmJlcnMgPSByZXF1aXJlKCcuL3NldHRpbmdzL3N1YnNldHRpbmdzL1JvYmJlcnMuanMnKTtcblxudmFyIF9Sb2JiZXJzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1JvYmJlcnMpO1xuXG52YXIgX1NhdmVyID0gcmVxdWlyZSgnLi9zZXR0aW5ncy9maWxlcy9TYXZlcicpO1xuXG52YXIgX1NhdmVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NhdmVyKTtcblxudmFyIF9Mb2FkZXIgPSByZXF1aXJlKCcuL3NldHRpbmdzL2ZpbGVzL0xvYWRlcicpO1xuXG52YXIgX0xvYWRlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Mb2FkZXIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vKlxuKlx0U2V0dGluZ3Mgb2YgdGhlIHNpbXVsYXRpb24uXG4qXG4qXHRJbml0aWFsaXplIHNldHRpbmdzIHdpdGggZGVmYXVsdCB2YWx1ZXMuXG4qL1xuXG52YXIgU2V0dGluZ3MgPSBmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIFNldHRpbmdzKGlmYWNlKSB7XG5cdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNldHRpbmdzKTtcblxuXHRcdHRoaXMuaW50ZXJmYWNlID0gaWZhY2U7XG5cblx0XHQvLyBGaWVsZHNcblxuXHRcdHRoaXMuZ3JhcGggPSBuZXcgX0dyYXBoMi5kZWZhdWx0KHRoaXMpO1xuXG5cdFx0dGhpcy5yb2JiZXJzID0gbmV3IF9Sb2JiZXJzMi5kZWZhdWx0KHRoaXMpO1xuXG5cdFx0dGhpcy5zYXZlciA9IG5ldyBfU2F2ZXIyLmRlZmF1bHQodGhpcyk7XG5cdFx0dGhpcy5sb2FkZXIgPSBuZXcgX0xvYWRlcjIuZGVmYXVsdCh0aGlzKTtcblxuXHRcdC8vIERlZmF1bHQgdmFsdWVzXG5cblx0XHR0aGlzLmluaXQoKTtcblx0XHR0aGlzLmxvYWRlci5sb2FkRGVmYXVsdCgpO1xuXHR9XG5cblx0X2NyZWF0ZUNsYXNzKFNldHRpbmdzLCBbe1xuXHRcdGtleTogJ2luaXQnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBpbml0KCkge1xuXHRcdFx0dGhpcy5ncmFwaC5pbml0KCk7XG5cdFx0XHR0aGlzLnJvYmJlcnMuaW5pdCgpO1xuXHRcdFx0JCgnI251bWJlck9mSXRlcmF0aW9ucycpLnZhbCgyMCk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdFJldHVybiBzZXR0aW5ncyBhcyBhcyBKU09OIG9iamVjdC5cbiAgKlxuICAqXHRUaG9zZSBzZXR0aW5ncyBjYW4gYmUgc2VuZCB0byB0aGUgYmFja2VuZC5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnZ2V0U2V0dGluZ3MnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBnZXRTZXR0aW5ncygpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGdlbmVyYWw6IHRoaXMuZ2V0R2VuZXJhbFNldHRpbmdzKCksXG5cdFx0XHRcdHBhdGhzOiB0aGlzLmdyYXBoLmdldFNldHRpbmdzKCksXG5cdFx0XHRcdHJvYmJlcnM6IHRoaXMucm9iYmVycy5nZXRTZXR0aW5ncygpXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdENvbmNhdGVuYXRlIHRoZSBnZW5lcmFsIHNldHRpbmdzIGluIG9uZSBcbiAgKlx0SlNPTiBvYmplY3QuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ2dldEdlbmVyYWxTZXR0aW5ncycsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGdldEdlbmVyYWxTZXR0aW5ncygpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdG51bWJlck9mSXRlcmF0aW9uczogcGFyc2VJbnQoJCgnI251bWJlck9mSXRlcmF0aW9ucycpLnZhbCgpKSxcblx0XHRcdFx0ZGlzdGFuY2VXZWlnaHQ6IHBhcnNlSW50KCQoJyNkaXN0YW5jZVdlaWdodCcpLnZhbCgpKVxuXHRcdFx0fTtcblx0XHR9XG5cdH1dKTtcblxuXHRyZXR1cm4gU2V0dGluZ3M7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFNldHRpbmdzOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIExpdmVTaW11bGF0aW9uID0gZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBMaXZlU2ltdWxhdGlvbihyZXN1bHRzLCBjb21wdXRlZERhdGEsIGJlc3RTdHJlYXRlZ3ksIHNlbGVjdG9yKSB7XG5cdFx0dmFyIF90aGlzID0gdGhpcztcblxuXHRcdF9jbGFzc0NhbGxDaGVjayh0aGlzLCBMaXZlU2ltdWxhdGlvbik7XG5cblx0XHR0aGlzLnJlc3VsdHMgPSByZXN1bHRzO1xuXHRcdHRoaXMub3JpZ2luYWxDeSA9IHRoaXMucmVzdWx0cy5pbnRlcmZhY2Uuc2V0dGluZ3MuZ3JhcGguY3k7XG5cdFx0d2luZG93LmxpdmVTaW11bGF0aW9uID0gdGhpcztcblxuXHRcdHRoaXMuY29tcHV0ZWREYXRhID0gY29tcHV0ZWREYXRhO1xuXHRcdHRoaXMuYmVzdFN0cmVhdGVneSA9IGJlc3RTdHJlYXRlZ3k7XG5cdFx0dGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuXG5cdFx0dGhpcy5zdHlsZXNoZWV0ID0gW3tcblx0XHRcdHNlbGVjdG9yOiAnbm9kZScsXG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHRoZWlnaHQ6IDIwLFxuXHRcdFx0XHR3aWR0aDogMjBcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRzZWxlY3RvcjogJ2VkZ2UnLFxuXHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0J2N1cnZlLXN0eWxlJzogJ2hheXN0YWNrJyxcblx0XHRcdFx0J2hheXN0YWNrLXJhZGl1cyc6IDAsXG5cdFx0XHRcdHdpZHRoOiA1LFxuXHRcdFx0XHRvcGFjaXR5OiAwLjUsXG5cdFx0XHRcdCdsaW5lLWNvbG9yJzogJ2dyZXknXG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0c2VsZWN0b3I6ICcuYmFzZScsXG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHQnYmFja2dyb3VuZC1jb2xvcic6ICcjNjFiZmZjJ1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdHNlbGVjdG9yOiAnLnNlY3VyZWQnLFxuXHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0J2JhY2tncm91bmQtY29sb3InOiAnIzgxYzc4NCdcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRzZWxlY3RvcjogJy5yb2JiZWQnLFxuXHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0J2JhY2tncm91bmQtY29sb3InOiAnI2U1NzM3Mydcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRzZWxlY3RvcjogJy5jYXVnaHQnLFxuXHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0J2JhY2tncm91bmQtY29sb3InOiAnI0U1NzM3Mydcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRzZWxlY3RvcjogJy5ndWFyZGlhbicsXG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHRoZWlnaHQ6IDQwLFxuXHRcdFx0XHR3aWR0aDogNDAsXG5cdFx0XHRcdCdiYWNrZ3JvdW5kLWltYWdlJzogJy9pbWcvZ3VhcmRpYW4tNDAucG5nJyxcblx0XHRcdFx0J2JhY2tncm91bmQtb3BhY2l0eSc6IDBcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRzZWxlY3RvcjogJy5yb2JiZXInLFxuXHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0aGVpZ2h0OiA0MCxcblx0XHRcdFx0d2lkdGg6IDQwLFxuXHRcdFx0XHQnYmFja2dyb3VuZC1pbWFnZSc6ICcvaW1nL3JvYmJlci00MC5wbmcnLFxuXHRcdFx0XHQnYmFja2dyb3VuZC1vcGFjaXR5JzogMFxuXHRcdFx0fVxuXHRcdH1dO1xuXG5cdFx0dGhpcy5jeSA9IGN5dG9zY2FwZSh7XG5cdFx0XHRjb250YWluZXI6ICQodGhpcy5zZWxlY3RvciksXG5cblx0XHRcdGJveFNlbGVjdGlvbkVuYWJsZWQ6IGZhbHNlLFxuXHRcdFx0YXV0b3Vuc2VsZWN0aWZ5OiBmYWxzZSxcblxuXHRcdFx0c3R5bGU6IHRoaXMuc3R5bGVzaGVldFxuXHRcdH0pO1xuXG5cdFx0dGhpcy5jeS5taW5ab29tKDAuNSk7XG5cdFx0dGhpcy5jeS5tYXhab29tKDIpO1xuXG5cdFx0Ly8gSW1wb3J0IG5vZGVzIGFuZCB2ZXJ0aWNlcyBmcm9tIGN5IG9iamVjdC5cblxuXHRcdHRoaXMub3JpZ2luYWxDeS5ub2RlcygpLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcblx0XHRcdF90aGlzLmN5LmFkZCh7XG5cdFx0XHRcdGRhdGE6IHsgaWQ6IG5vZGUuaWQoKSB9LFxuXHRcdFx0XHRwb3NpdGlvbjogbm9kZS5wb3NpdGlvbigpLFxuXHRcdFx0XHRncm91cDogJ25vZGVzJyxcblx0XHRcdFx0Y2xhc3NlczogJ25vZGUnICsgKG5vZGUuaWQoKSA9PT0gJzAnID8gJyBiYXNlJyA6ICcnKSxcblx0XHRcdFx0c2VsZWN0YWJsZTogZmFsc2UsXG5cdFx0XHRcdGxvY2tlZDogdHJ1ZSxcblx0XHRcdFx0Z3JhYmJhYmxlOiBmYWxzZVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmJhc2UgPSB0aGlzLmN5Lm5vZGVzKCdbaWQgPSBcIjBcIl0nKTtcblxuXHRcdHRoaXMub3JpZ2luYWxDeS5lZGdlcygpLmZvckVhY2goZnVuY3Rpb24gKGVkZ2UpIHtcblx0XHRcdF90aGlzLmN5LmFkZCh7XG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRpZDogZWRnZS5pZCgpLFxuXHRcdFx0XHRcdHNvdXJjZTogZWRnZS5zb3VyY2UoKS5pZCgpLFxuXHRcdFx0XHRcdHRhcmdldDogZWRnZS50YXJnZXQoKS5pZCgpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGdyb3VwOiAnZWRnZXMnLFxuXHRcdFx0XHRzZWxlY3RhYmxlOiBmYWxzZSxcblx0XHRcdFx0bG9ja2VkOiB0cnVlLFxuXHRcdFx0XHRncmFiYmFibGU6IGZhbHNlXG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdC8vIEFkZCByb2JiZXIgYW5kIGd1YXJkaWFuLlxuXG5cdFx0dGhpcy5jeS5hZGQoe1xuXHRcdFx0ZGF0YTogeyBpZDogJ3JvYmJlcicgfSxcblx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdHg6IE1hdGguY29zKG5ldyBEYXRlKCkgLyAxMDAwKSAqIDIwLFxuXHRcdFx0XHR5OiBNYXRoLnNpbihuZXcgRGF0ZSgpIC8gMTAwMCkgKiAyMFxuXHRcdFx0fSxcblx0XHRcdGNsYXNzZXM6ICdyb2JiZXInLFxuXHRcdFx0c2VsZWN0YWJsZTogZmFsc2UsXG5cdFx0XHRsb2NrZWQ6IGZhbHNlLFxuXHRcdFx0Z3JhYmJhYmxlOiBmYWxzZVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5jeS5hZGQoe1xuXHRcdFx0ZGF0YTogeyBpZDogJ2d1YXJkaWFuJyB9LFxuXHRcdFx0cG9zaXRpb246IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY3kubm9kZXMoJ1tpZCA9IFwiMFwiXScpLnBvc2l0aW9uKCkpLFxuXHRcdFx0Y2xhc3NlczogJ2d1YXJkaWFuJyxcblx0XHRcdHNlbGVjdGFibGU6IGZhbHNlLFxuXHRcdFx0bG9ja2VkOiBmYWxzZSxcblx0XHRcdGdyYWJiYWJsZTogZmFsc2Vcblx0XHR9KTtcblxuXHRcdHRoaXMucm9iYmVyID0gdGhpcy5jeS5ub2RlcygnI3JvYmJlcicpO1xuXHRcdHRoaXMuZ3VhcmRpYW4gPSB0aGlzLmN5Lm5vZGVzKCcjZ3VhcmRpYW4nKTtcblx0fVxuXG5cdF9jcmVhdGVDbGFzcyhMaXZlU2ltdWxhdGlvbiwgW3tcblx0XHRrZXk6ICduZXdJdGVyYXRpb24nLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBuZXdJdGVyYXRpb24oKSB7XG5cdFx0XHR0aGlzLnJvYmJlclRhcmdldCA9IHRoaXMucmFuZG9tVGFyZ2V0KCk7XG5cdFx0XHR0aGlzLml0ZXJhdGlvblN0YXJ0ID0gbmV3IERhdGUoKTtcblx0XHRcdHRoaXMuY291bnRkb3duID0gTWF0aC5yYW5kb20oKSAqIDI1MDAgKiB0aGlzLmN5LmZpbHRlcignLm5vZGUnKS5sZW5ndGggKyAyNTAwO1xuXHRcdFx0dGhpcy5ndWFyZGlhblBhdGggPSB0aGlzLnJhbmRvbVBhdGgoKTtcblx0XHRcdHRoaXMuZ3VhcmRpYW5MYXN0VmlzaXQgPSB0aGlzLmJhc2U7XG5cdFx0XHR0aGlzLmd1YXJkaWFuLnBvc2l0aW9uKE9iamVjdC5hc3NpZ24oe30sIHRoaXMuYmFzZS5wb3NpdGlvbigpKSk7XG5cdFx0XHR0aGlzLmd1YXJkaWFuVGFyZ2V0ID0gdGhpcy5uZXh0R3VhcmRpYW5UYXJnZXQodHJ1ZSk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblx0fSwge1xuXHRcdGtleTogJ25leHRTdGVwJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gbmV4dFN0ZXAoKSB7XG5cdFx0XHR2YXIgX3RoaXMyID0gdGhpcztcblxuXHRcdFx0Ly8gZml4IGEgYnVnIHdoZW4gZ3JhcGggaXMgbm90IHNob3dpbmcgb24gcGFnZSBjaGFuZ2UuXG5cdFx0XHR0aGlzLmN5LnJlc2l6ZSgpO1xuXHRcdFx0dGhpcy5jeS5maXQodGhpcy5jeS5maWx0ZXIoJy5ub2RlJykpO1xuXG5cdFx0XHQvLyBJZiB0aGUgdXNlciBkaXNtaXNzIHRoZSByZXN1bHRzLCB3ZSBzdG9wIHRoZSBzaW11bGF0aW9uLlxuXHRcdFx0aWYgKCQodGhpcy5zZWxlY3RvcikubGVuZ3RoID09PSAwKSByZXR1cm4gY29uc29sZS5pbmZvKCdMaXZlIHNpbXVsYXRpb24gc3RvcHBlZC4nKTtcblxuXHRcdFx0dmFyIGRlbHRhID0gKHRoaXMuaXRlcmF0aW9uU3RhcnQudmFsdWVPZigpICsgdGhpcy5jb3VudGRvd24gLSBuZXcgRGF0ZSgpLnZhbHVlT2YoKSkgLyA1MDtcblxuXHRcdFx0aWYgKGRlbHRhIDw9IDApIHJldHVybiB0aGlzLnJvYmJlckhpdFRhcmdldCgpO1xuXG5cdFx0XHR0aGlzLnJvYmJlci5wb3NpdGlvbih7XG5cdFx0XHRcdHg6IE1hdGguY29zKG5ldyBEYXRlKCkgLyAxMDAwKSAqIGRlbHRhICsgdGhpcy5yb2JiZXJUYXJnZXQucG9zaXRpb24oKS54LFxuXHRcdFx0XHR5OiBNYXRoLnNpbihuZXcgRGF0ZSgpIC8gMTAwMCkgKiBkZWx0YSArIHRoaXMucm9iYmVyVGFyZ2V0LnBvc2l0aW9uKCkueVxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnJvYmJlci5kYXRhKCdyZWZyZXNoJywgTWF0aC5yYW5kb20oKSk7XG5cblx0XHRcdHZhciBndWFyZGlhblBvc2l0aW9uID0gdGhpcy5ndWFyZGlhbi5wb3NpdGlvbigpO1xuXHRcdFx0dmFyIHRhcmdldFBvc2l0aW9uID0gdGhpcy5ndWFyZGlhblRhcmdldC5wb3NpdGlvbigpO1xuXG5cdFx0XHRndWFyZGlhblBvc2l0aW9uLnggPSBndWFyZGlhblBvc2l0aW9uLnggKiAwLjk1ICsgdGFyZ2V0UG9zaXRpb24ueCAqIDAuMDU7XG5cdFx0XHRndWFyZGlhblBvc2l0aW9uLnkgPSBndWFyZGlhblBvc2l0aW9uLnkgKiAwLjk1ICsgdGFyZ2V0UG9zaXRpb24ueSAqIDAuMDU7XG5cdFx0XHR0aGlzLmd1YXJkaWFuLmRhdGEoJ3JlZnJlc2gnLCBNYXRoLnJhbmRvbSgpKTtcblxuXHRcdFx0aWYgKChndWFyZGlhblBvc2l0aW9uLnggLSB0YXJnZXRQb3NpdGlvbi54KSAqKiAyICsgKGd1YXJkaWFuUG9zaXRpb24ueSAtIHRhcmdldFBvc2l0aW9uLnkpICoqIDIgPCA1KSB7XG5cdFx0XHRcdHRoaXMuZ3VhcmRpYW5UYXJnZXQuYWRkQ2xhc3MoJ3NlY3VyZWQnKTtcblx0XHRcdFx0dGhpcy5ndWFyZGlhbkxhc3RWaXNpdCA9IHRoaXMuZ3VhcmRpYW5UYXJnZXQ7XG5cdFx0XHRcdHZhciBuZXdHdWFyZGlhblRhcmdldCA9IHRoaXMubmV4dEd1YXJkaWFuVGFyZ2V0KCk7XG5cdFx0XHRcdGlmIChuZXdHdWFyZGlhblRhcmdldCAhPT0gbnVsbCkgdGhpcy5ndWFyZGlhblRhcmdldCA9IG5ld0d1YXJkaWFuVGFyZ2V0O1xuXHRcdFx0XHQvL2Vsc2UgXG5cdFx0XHRcdC8vXHRyZXR1cm4gdGhpcy5ldmVyeVRhcmdldElzU2VjdXJlZCgpXG5cdFx0XHR9XG5cblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gX3RoaXMyLm5leHRTdGVwKCk7XG5cdFx0XHR9LCA1MCk7XG5cdFx0fVxuXHR9LCB7XG5cdFx0a2V5OiAncm9iYmVySGl0VGFyZ2V0Jyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gcm9iYmVySGl0VGFyZ2V0KCkge1xuXHRcdFx0aWYgKCF0aGlzLnJvYmJlclRhcmdldC5oYXNDbGFzcygnc2VjdXJlZCcpKSB7XG5cdFx0XHRcdHRoaXMucm9iYmVyVGFyZ2V0LmFkZENsYXNzKCdyb2JiZWQnKTtcblx0XHRcdFx0JCgnI2xpdmVTaW11bGF0aW9uTG9nJykudGV4dCgnUm9iYmVkIScpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5yb2JiZXJUYXJnZXQucmVtb3ZlQ2xhc3MoJ3NlY3VyZWQnKS5hZGRDbGFzcygnY2F1Z2h0Jyk7XG5cdFx0XHRcdCQoJyNsaXZlU2ltdWxhdGlvbkxvZycpLnRleHQoJ0NhdWdodCEnKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzLml0ZXJhdGlvbkVuZCgpO1xuXHRcdH1cblx0fSwge1xuXHRcdGtleTogJ3JhbmRvbVBhdGgnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiByYW5kb21QYXRoKCkge1xuXHRcdFx0dmFyIF90aGlzMyA9IHRoaXM7XG5cblx0XHRcdHZhciBmYWlyRGljZVJvbGwgPSBNYXRoLnJhbmRvbSgpO1xuXG5cdFx0XHR2YXIgcGF0aE51bWJlciA9IC0xO1xuXG5cdFx0XHR3aGlsZSAoZmFpckRpY2VSb2xsID4gMCkge1xuXHRcdFx0XHRwYXRoTnVtYmVyKys7XG5cdFx0XHRcdGZhaXJEaWNlUm9sbCAtPSB0aGlzLmJlc3RTdHJlYXRlZ3kucHJvYmFiaWxpdGllc1twYXRoTnVtYmVyXTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXMuY29tcHV0ZWREYXRhLnBhdHJvbHNbcGF0aE51bWJlcl0uc2xpY2UoMSkubWFwKGZ1bmN0aW9uIChub2RlSWQpIHtcblx0XHRcdFx0cmV0dXJuIF90aGlzMy5jeS5ub2RlcygnW2lkID0gXCInICsgbm9kZUlkICsgJ1wiXScpWzBdO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LCB7XG5cdFx0a2V5OiAnaXRlcmF0aW9uRW5kJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gaXRlcmF0aW9uRW5kKCkge1xuXHRcdFx0dmFyIF90aGlzNCA9IHRoaXM7XG5cblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRfdGhpczQuY3kubm9kZXMoKS5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG5vZGUucmVtb3ZlQ2xhc3MoJ3NlY3VyZWQnKS5yZW1vdmVDbGFzcygncm9iYmVkJykucmVtb3ZlQ2xhc3MoJ2NhdWdodCcpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0X3RoaXM0LnJ1bigpO1xuXHRcdFx0XHQkKCcjbGl2ZVNpbXVsYXRpb25Mb2cnKS50ZXh0KCdJdGVyYXRpb24gcnVubmluZy4uLicpO1xuXHRcdFx0fSwgMTAwMCk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblx0fSwge1xuXHRcdGtleTogJ25leHRHdWFyZGlhblRhcmdldCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIG5leHRHdWFyZGlhblRhcmdldChpbml0KSB7XG5cdFx0XHRpZiAoaW5pdCkgcmV0dXJuIHRoaXMuZ3VhcmRpYW5QYXRoWzBdO1xuXG5cdFx0XHR2YXIgaW5kZXggPSB0aGlzLmd1YXJkaWFuUGF0aC5pbmRleE9mKHRoaXMuZ3VhcmRpYW5UYXJnZXQpO1xuXHRcdFx0aWYgKGluZGV4ICsgMSA9PT0gdGhpcy5ndWFyZGlhblBhdGgubGVuZ3RoKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0cmV0dXJuIHRoaXMuZ3VhcmRpYW5QYXRoW2luZGV4ICsgMV07XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0VGFyZ2V0IGdldCBhY2NvcmRpbmcgdG8gdGhlIGRpc3RyaWJ1dGlvbiAoc2VlIFJvYmJlcnNJbnRlcmVzdClcbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAncmFuZG9tVGFyZ2V0Jyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gcmFuZG9tVGFyZ2V0KCkge1xuXHRcdFx0dmFyIGRpc3RyaWJ1dGlvbiA9IFtdO1xuXHRcdFx0dGhpcy5vcmlnaW5hbEN5Lm5vZGVzKCdbaWQgIT0gXCIwXCJdJykuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG5vZGUuZGF0YSgncm9iYmVyc0ludGVyZXN0Jyk7IGkrKykge1xuXHRcdFx0XHRcdGRpc3RyaWJ1dGlvbi5wdXNoKG5vZGUuaWQoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHR2YXIgcmFuZG9tSWQgPSBkaXN0cmlidXRpb25bTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogZGlzdHJpYnV0aW9uLmxlbmd0aCldO1xuXG5cdFx0XHRyZXR1cm4gdGhpcy5jeS5ub2RlcygnIycgKyByYW5kb21JZClbMF07XG5cdFx0fVxuXHR9LCB7XG5cdFx0a2V5OiAncnVuJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gcnVuKCkge1xuXHRcdFx0dGhpcy5uZXdJdGVyYXRpb24oKTtcblx0XHRcdHRoaXMubmV4dFN0ZXAoKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXHR9XSk7XG5cblx0cmV0dXJuIExpdmVTaW11bGF0aW9uO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBMaXZlU2ltdWxhdGlvbjsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLypcbipcdExvYWRlciBlbmFibGVzIHVzIHRvIGxvYWQgc2V0dGluZ3MgZnJvbSBhbiBvYmplY3Qgb3IgZnJvbSBhIGZpbGUuXG4qL1xuXG52YXIgTG9hZGVyID0gZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBMb2FkZXIoc2V0dGluZ3MpIHtcblx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgTG9hZGVyKTtcblxuXHRcdHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcblxuXHRcdHRoaXMuZGVmYXVsdFNldHRpbmdzID0ge1xuXHRcdFx0XCJnZW5lcmFsXCI6IHtcblx0XHRcdFx0XCJudW1iZXJPZkl0ZXJhdGlvbnNcIjogMjAsXG5cdFx0XHRcdFwiZGlzdGFuY2VXZWlnaHRcIjogMVxuXHRcdFx0fSxcblx0XHRcdFwicGF0aHNcIjoge1xuXHRcdFx0XHRcInZlcnRpY2VzXCI6IFt7XG5cdFx0XHRcdFx0XCJpZFwiOiAwLFxuXHRcdFx0XHRcdFwicG9zaXRpb25cIjoge1xuXHRcdFx0XHRcdFx0XCJ4XCI6IDkzLjc0NzIzODIyMTgwNDA4LFxuXHRcdFx0XHRcdFx0XCJ5XCI6IDIwXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcInJvYmJlcnNJbnRlcmVzdFwiOiAxLFxuXHRcdFx0XHRcdFwiZ3VhcmRpYW5zQ29zdFwiOiAxLFxuXHRcdFx0XHRcdFwiZ3VhcmRpYW5zUmV3YXJkXCI6IDEsXG5cdFx0XHRcdFx0XCJyb2JiZXJTZXR0aW5nc1wiOiB7XG5cdFx0XHRcdFx0XHRcIjBcIjoge1xuXHRcdFx0XHRcdFx0XHRcImNvc3RcIjogMSxcblx0XHRcdFx0XHRcdFx0XCJyZXdhcmRcIjogMVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdFwiaWRcIjogMSxcblx0XHRcdFx0XHRcInBvc2l0aW9uXCI6IHtcblx0XHRcdFx0XHRcdFwieFwiOiAyMC4yNTI3NjE3NzgxOTU5MTgsXG5cdFx0XHRcdFx0XHRcInlcIjogMjBcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwicm9iYmVyc0ludGVyZXN0XCI6IDEsXG5cdFx0XHRcdFx0XCJndWFyZGlhbnNDb3N0XCI6IDEsXG5cdFx0XHRcdFx0XCJndWFyZGlhbnNSZXdhcmRcIjogMSxcblx0XHRcdFx0XHRcInJvYmJlclNldHRpbmdzXCI6IHtcblx0XHRcdFx0XHRcdFwiMFwiOiB7XG5cdFx0XHRcdFx0XHRcdFwiY29zdFwiOiAxLFxuXHRcdFx0XHRcdFx0XHRcInJld2FyZFwiOiAxXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XSxcblx0XHRcdFx0XCJlZGdlc1wiOiBbe1xuXHRcdFx0XHRcdFwic291cmNlXCI6IDAsXG5cdFx0XHRcdFx0XCJ0YXJnZXRcIjogMSxcblx0XHRcdFx0XHRcImxlbmd0aFwiOiA3My40OTQ0NzY0NDM2MDgxNlxuXHRcdFx0XHR9XVxuXHRcdFx0fSxcblx0XHRcdFwicm9iYmVyc1wiOiB7XG5cdFx0XHRcdFwibGlzdFwiOiBbMF0sXG5cdFx0XHRcdFwiY2F0Y2hQcm9iYWJpbGl0eVwiOiB7XG5cdFx0XHRcdFx0XCIwXCI6IDAuNVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdC8qXG4gKlx0TG9hZCB0aGUgc2V0dGluZ3MgKE9iamVjdCkgYWZ0ZXIgY2hlY2tpbmcgaWYgdGhleSBhcmUgY29ycnVwdGVkIG9yIG5vdC5cbiAqL1xuXG5cblx0X2NyZWF0ZUNsYXNzKExvYWRlciwgW3tcblx0XHRrZXk6IFwibG9hZFwiLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBsb2FkKHNldHRpbmdzKSB7XG5cdFx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdFx0XHQvLyBUT0RPIDogVmVyaWZ5IGludGVncml0eS5cblx0XHRcdHRoaXMuc2V0dGluZ3MuaW5pdCgpO1xuXG5cdFx0XHQkKCcjbnVtYmVyT2ZJdGVyYXRpb25zJykudmFsKHNldHRpbmdzLmdlbmVyYWwubnVtYmVyT2ZJdGVyYXRpb25zKTtcblx0XHRcdCQoJyNkaXN0YW5jZVdlaWdodCcpLnZhbChzZXR0aW5ncy5nZW5lcmFsLmRpc3RhbmNlV2VpZ2h0KTtcblxuXHRcdFx0Ly8gSWQgbWFwcyAobG9hZGVkIGlkcyA9PiBjdXJyZW50IGlkcylcblxuXHRcdFx0dmFyIHZlcnRpY2VzSWRNYXAgPSBuZXcgTWFwKCk7XG5cdFx0XHR2YXIgcm9iYmVyc0lkTWFwID0gbmV3IE1hcCgpO1xuXG5cdFx0XHRzZXR0aW5ncy5yb2JiZXJzLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAocm9iYmVySWQpIHtcblx0XHRcdFx0cm9iYmVyc0lkTWFwLnNldChyb2JiZXJJZCwgX3RoaXMuc2V0dGluZ3Mucm9iYmVycy5uZXdSb2JiZXIoMSAtIHNldHRpbmdzLnJvYmJlcnMuY2F0Y2hQcm9iYWJpbGl0eVtcIlwiICsgcm9iYmVySWRdKSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0c2V0dGluZ3MucGF0aHMudmVydGljZXMuZm9yRWFjaChmdW5jdGlvbiAodmVydGV4KSB7XG5cblx0XHRcdFx0dmVydGljZXNJZE1hcC5zZXQodmVydGV4LmlkLCBfdGhpcy5zZXR0aW5ncy5ncmFwaC5hZGROb2RlKHZlcnRleC5wb3NpdGlvbiwgdmVydGV4LmlkID09PSAwLCB2ZXJ0ZXgucm9iYmVyc0ludGVyZXN0LCB2ZXJ0ZXguZ3VhcmRpYW5zQ29zdCwgdmVydGV4Lmd1YXJkaWFuc1Jld2FyZCkpO1xuXG5cdFx0XHRcdHZhciBuZXdOb2RlSWQgPSB2ZXJ0aWNlc0lkTWFwLmdldCh2ZXJ0ZXguaWQpO1xuXG5cdFx0XHRcdHNldHRpbmdzLnJvYmJlcnMubGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChyb2JiZXJJZCkge1xuXHRcdFx0XHRcdHZhciBuZXdSb2JiZXJJZCA9IHJvYmJlcnNJZE1hcC5nZXQocm9iYmVySWQpO1xuXG5cdFx0XHRcdFx0X3RoaXMuc2V0dGluZ3MuZ3JhcGguY3kubm9kZXMoXCJbaWQgPSBcXFwiXCIgKyBuZXdOb2RlSWQgKyBcIlxcXCJdXCIpLmRhdGEoJ3JvYmJlclNldHRpbmdzJykuc2V0KG5ld1JvYmJlcklkLCB2ZXJ0ZXgucm9iYmVyU2V0dGluZ3Nbcm9iYmVySWRdKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0c2V0dGluZ3MucGF0aHMuZWRnZXMuZm9yRWFjaChmdW5jdGlvbiAoZWRnZSkge1xuXHRcdFx0XHRfdGhpcy5zZXR0aW5ncy5ncmFwaC5saW5rKHZlcnRpY2VzSWRNYXAuZ2V0KGVkZ2Uuc291cmNlKSwgdmVydGljZXNJZE1hcC5nZXQoZWRnZS50YXJnZXQpKTtcblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLnNldHRpbmdzLmdyYXBoLmN5LmZpdCgpO1xuXG5cdFx0XHRjb25zb2xlLmxvZygnU2V0dGluZ3MgbG9hZGVkJyk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdExvYWQgdGhlIHNldHRpbmdzIG9iamVjdCBmcm9tIGEgSlNPTiBmaWxlIG9uIGNsaWVudCdzIGNvbXB1dGVyLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6IFwiaW1wb3J0XCIsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIF9pbXBvcnQoKSB7XG5cdFx0XHR2YXIgX3RoaXMyID0gdGhpcztcblxuXHRcdFx0dmFyIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcblx0XHRcdGlucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsICdmaWxlJyk7XG5cblx0XHRcdGlucHV0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cblx0XHRcdGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uIChldmVudCkge1xuXG5cdFx0XHRcdHZhciBmaWxlID0gaW5wdXQuZmlsZXNbMF07XG5cblx0XHRcdFx0dmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0XHRcdHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdFx0XHRfdGhpczIubG9hZChKU09OLnBhcnNlKGF0b2IoZXZlbnQudGFyZ2V0LnJlc3VsdC5zcGxpdCgnLCcpLnBvcCgpKSkpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuXG5cdFx0XHRcdGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoaW5wdXQpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuXG5cdFx0XHRpbnB1dC5jbGljaygpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRJbml0aWFsaXplIHRoZSBncmFwaCBieSBzZXR0aW5nIGRlZmF1bHQgdmFsdWVzLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6IFwibG9hZERlZmF1bHRcIixcblx0XHR2YWx1ZTogZnVuY3Rpb24gbG9hZERlZmF1bHQoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5sb2FkKHRoaXMuZGVmYXVsdFNldHRpbmdzKTtcblx0XHR9XG5cdH1dKTtcblxuXHRyZXR1cm4gTG9hZGVyO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBMb2FkZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcblx0dmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgU2F2ZXIgPSBmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIFNhdmVyKHNldHRpbmdzKSB7XG5cdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNhdmVyKTtcblxuXHRcdHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcblx0fVxuXG5cdF9jcmVhdGVDbGFzcyhTYXZlciwgW3tcblx0XHRrZXk6ICdzYXZlJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gc2F2ZSgpIHtcblxuXHRcdFx0dmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcy5kb3dubG9hZChkYXRlLnRvTG9jYWxlRGF0ZVN0cmluZygpICsgJy0nICsgZGF0ZS50b0xvY2FsZVRpbWVTdHJpbmcoKS5yZXBsYWNlKCc6JywgJy0nKSArICcuanNvbicsIEpTT04uc3RyaW5naWZ5KHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZ3MoKSkpO1xuXHRcdH1cblx0fSwge1xuXHRcdGtleTogJ2Rvd25sb2FkJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gZG93bmxvYWQoZmlsZW5hbWUsIHRleHQpIHtcblx0XHRcdHZhciBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuXHRcdFx0bGluay5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCAnZGF0YTp0ZXh0L2pzb247Y2hhcnNldD11dGYtOCwnICsgZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpKTtcblx0XHRcdGxpbmsuc2V0QXR0cmlidXRlKCdkb3dubG9hZCcsIGZpbGVuYW1lKTtcblxuXHRcdFx0bGluay5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKTtcblxuXHRcdFx0bGluay5jbGljaygpO1xuXG5cdFx0XHRkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGxpbmspO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cdH1dKTtcblxuXHRyZXR1cm4gU2F2ZXI7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFNhdmVyOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9zbGljZWRUb0FycmF5ID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkgeyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9IHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgcmV0dXJuIGFycjsgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHsgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTsgfSBlbHNlIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7IH0gfTsgfSgpO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vKlxuKlx0Q2xhc3MgcmVwcmVzZW50aW5nIHRoZSBncmFwaCBvZiB0aGUgc2ltdWxhdGlvbi5cbipcbipcdFlvdSBjYW4gYWRkIHRhcmdldHMsIGRlbGV0ZSB0YXJnZXRzLCBhbmQgbGlua1xuKlx0dGhlbSB0b2dldGhlci5cbipcbipcdEZvciBlYWNoIHRhcmdldCwgeW91IGNhbiBzZXQgOlxuKlx0XHQtIHJvYmJlcnNJbnRlcmVzdCAodGhlIHByb2JhYmlsaXR5IG9mIHJvYmJlcnMgYXR0YWNraW5nIHRoaXMgdGFyZ2V0KVxuKlx0XHQtIGd1YXJkaWFuc0Nvc3QgKHRoZSBjb3N0IHdoZW4gZ3VhcmRpYW5zIGZhaWwgdG8gcHJvdGVjdCB0aGUgdGFyZ2V0KVxuKlx0XHQtIGd1YXJkaWFuc1Jld2FyZCAodGhlIHJld2FyZCB3aGVuIGd1YXJkaWFucyBtYW5hZ2UgdG8gcHJldmVudCBcbipcdFx0XHRcdFx0XHRcdGFuIGF0dGFjaylcbipcdFx0LSByb2JiZXJTZXR0aW5ncyAodGhlIGNvc3QsIHJld2FyZCBhbmQgcHJvYmFiaWxpdHkgZm9yIGVhY2ggcm9iYmVyKVxuKlx0XHRcdChTZXQgdGhyb3VnaCB0aGUgUm9iYmVycyBjbGFzcylcbipcbipcdE5vZGVzID0gQXR0YWNrcyA9IFRhcmdldHNcbiovXG5cbnZhciBHcmFwaCA9IGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gR3JhcGgoc2V0dGluZ3MpIHtcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIEdyYXBoKTtcblxuXHRcdC8vIEZpZWxkc1xuXG5cdFx0dGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXG5cdFx0dGhpcy5zdHlsZXNoZWV0ID0gW3tcblx0XHRcdHNlbGVjdG9yOiAnbm9kZScsXG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHRoZWlnaHQ6IDIwLFxuXHRcdFx0XHR3aWR0aDogMjAsXG5cdFx0XHRcdCdiYWNrZ3JvdW5kLWNvbG9yJzogJ21hcERhdGEocm9iYmVyc0ludGVyZXN0LCAwLCAyNSwgZ3JlZW4sIHJlZCknLFxuXHRcdFx0XHRjb250ZW50OiBmdW5jdGlvbiBjb250ZW50KG5vZGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gJ04nICsgbm9kZS5kYXRhKCdpZCcpICsgJyBDJyArIG5vZGUuZGF0YSgnZ3VhcmRpYW5zQ29zdCcpICsgJy9SJyArIG5vZGUuZGF0YSgnZ3VhcmRpYW5zUmV3YXJkJyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdC8vJ3RleHQtdmFsaWduJzogJ2NlbnRlcicsXG5cdFx0XHRcdCd0ZXh0LWhhbGlnbic6ICdjZW50ZXInXG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0c2VsZWN0b3I6ICdlZGdlJyxcblx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdCdjdXJ2ZS1zdHlsZSc6ICdoYXlzdGFjaycsXG5cdFx0XHRcdCdoYXlzdGFjay1yYWRpdXMnOiAwLFxuXHRcdFx0XHR3aWR0aDogNSxcblx0XHRcdFx0b3BhY2l0eTogMC41LFxuXHRcdFx0XHQnbGluZS1jb2xvcic6ICcjYTJlZmEyJyxcblx0XHRcdFx0Y29udGVudDogZnVuY3Rpb24gY29udGVudChlZGdlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIE1hdGguZmxvb3IoX3RoaXMubGVuZ3RoKGVkZ2UpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdHNlbGVjdG9yOiAnLmJhc2UnLFxuXHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0J2JhY2tncm91bmQtY29sb3InOiAnIzYxYmZmYycsXG5cdFx0XHRcdGxhYmVsOiAnQmFzZSdcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRzZWxlY3RvcjogJzpzZWxlY3RlZCcsXG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHQnYm9yZGVyLXdpZHRoJzogNCxcblx0XHRcdFx0J2JvcmRlci1jb2xvcic6ICdwdXJwbGUnXG5cdFx0XHR9XG5cdFx0fV07XG5cblx0XHR0aGlzLmN5ID0gd2luZG93LmN5ID0gY3l0b3NjYXBlKHtcblx0XHRcdGNvbnRhaW5lcjogJCgnI2dyYXBoJyksXG5cblx0XHRcdGJveFNlbGVjdGlvbkVuYWJsZWQ6IGZhbHNlLFxuXHRcdFx0YXV0b3Vuc2VsZWN0aWZ5OiBmYWxzZSxcblxuXHRcdFx0c3R5bGU6IHRoaXMuc3R5bGVzaGVldFxuXHRcdH0pO1xuXG5cdFx0dGhpcy5jeS5taW5ab29tKDAuNSk7XG5cdFx0dGhpcy5jeS5tYXhab29tKDIpO1xuXG5cdFx0d2luZG93LmdyYXBoID0gdGhpcztcblxuXHRcdC8vIFJlZnJlc2hpbmcgdGhlIGxlbmd0aFxuXG5cdFx0dGhpcy5yZWZyZXNoSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gY3kuZWRnZXMoKS5mb3JFYWNoKGZ1bmN0aW9uIChlZGdlKSB7XG5cdFx0XHRcdHJldHVybiBlZGdlLmRhdGEoJ3JlZnJlc2gnLCBNYXRoLnJhbmRvbSgpKTtcblx0XHRcdH0pO1xuXHRcdH0sIDI1MCk7XG5cblx0XHQvLyBET00gbGlzdGVuZXJzXG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnF0aXAtY29udGVudCAubGluaycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0Y29uc29sZS5pbmZvKFwiTGlua2luZyBhIHRhcmdldCB0byBhbm90aGVyLi4uXCIpO1xuXHRcdFx0X3RoaXMuY3VycmVudEFjdGlvbiA9ICdsaW5raW5nJztcblx0XHRcdCQoJy5xdGlwJykucXRpcCgnaGlkZScpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5xdGlwLWNvbnRlbnQgLmRlbGV0ZScsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0X3RoaXMubGFzdFNlbGVjdGVkTm9kZS5yZW1vdmUoKTtcblx0XHRcdF90aGlzLnJlc2V0KCk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnF0aXAtY29udGVudCAuZGlzbWlzcycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0X3RoaXMucmVzZXQoKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucXRpcC1jb250ZW50IC5wbHVzSW50ZXJlc3QnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgncm9iYmVyc0ludGVyZXN0JywgTWF0aC5taW4oX3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdyb2JiZXJzSW50ZXJlc3QnKSArIDEsIDI1KSk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnF0aXAtY29udGVudCAubWludXNJbnRlcmVzdCcsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0X3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdyb2JiZXJzSW50ZXJlc3QnLCBNYXRoLm1heChfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ3JvYmJlcnNJbnRlcmVzdCcpIC0gMSwgMCkpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5xdGlwLWNvbnRlbnQgLnBsdXNDb3N0JywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ2d1YXJkaWFuc0Nvc3QnLCBNYXRoLm1pbihfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ2d1YXJkaWFuc0Nvc3QnKSArIDEsIDI1KSk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnF0aXAtY29udGVudCAubWludXNDb3N0JywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ2d1YXJkaWFuc0Nvc3QnLCBNYXRoLm1heChfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ2d1YXJkaWFuc0Nvc3QnKSAtIDEsIDApKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucXRpcC1jb250ZW50IC5wbHVzUmV3YXJkJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ2d1YXJkaWFuc1Jld2FyZCcsIE1hdGgubWluKF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgnZ3VhcmRpYW5zUmV3YXJkJykgKyAxLCAyNSkpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5xdGlwLWNvbnRlbnQgLm1pbnVzUmV3YXJkJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ2d1YXJkaWFuc1Jld2FyZCcsIE1hdGgubWF4KF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgnZ3VhcmRpYW5zUmV3YXJkJykgLSAxLCAwKSk7XG5cdFx0fSk7XG5cblx0XHQvLyBDeXRvc2NhcGUgbGlzdGVuZXJzXG5cblx0XHR0aGlzLmN5Lm9uKCd0YXAnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdGlmIChldmVudC50YXJnZXQgPT09IGV2ZW50LmN5KSBfdGhpcy5yZXNldCgpO1xuXHRcdFx0Ly8gV2hlbiB5b3UgdGFwIG9uIHRoZSBiYWNrZ3JvdW5kIGFuZCB0aGF0IHRoZXJlIGFyZSBubyB2aXNpYmxlIHRpcHMsIHlvdSBhZGQgYSBuZXcgbm9kZSBhdCB0aGlzIHBvc2l0aW9uLlxuXHRcdFx0Ly8gSWYgYSB0aXAgaXMgdmlzaWJsZSwgeW91IHByb2JhYmx5IGp1c3Qgd2FudCB0byBkaXNtaXNzIGl0XG5cdFx0XHRpZiAoZXZlbnQudGFyZ2V0ID09PSBldmVudC5jeSAmJiAhJCgnLnF0aXA6dmlzaWJsZScpLmxlbmd0aCkge1xuXHRcdFx0XHRyZXR1cm4gX3RoaXMuYWRkTm9kZShldmVudC5wb3NpdGlvbik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR0aGlzLmN5Lm9uKCd0YXAnLCAnbm9kZScsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0aWYgKF90aGlzLmN1cnJlbnRBY3Rpb24gPT09ICdsaW5raW5nJykge1xuXHRcdFx0XHRfdGhpcy5jdXJyZW50QWN0aW9uID0gbnVsbDtcblx0XHRcdFx0dmFyIHNlY29uZE5vZGUgPSBldmVudC50YXJnZXQ7XG5cdFx0XHRcdC8vIFdlIGNoZWNrIGlmIHRoYXQgZWRnZSBhbGVhZHkgZXhpc3RzIG9yIGlmIHRoZSBzb3VyY2UgYW5kIHRhcmdldCBhcmUgdGhlIHNhbWUgbm9kZS5cblx0XHRcdFx0aWYgKCFfdGhpcy5jeS5lbGVtZW50cygnZWRnZVtzb3VyY2UgPSBcIicgKyBfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmlkKCkgKyAnXCJdW3RhcmdldCA9IFwiJyArIHNlY29uZE5vZGUuaWQoKSArICdcIl0nKS5sZW5ndGggJiYgIV90aGlzLmN5LmVsZW1lbnRzKCdlZGdlW3RhcmdldCA9IFwiJyArIF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuaWQoKSArICdcIl1bc291cmNlID0gXCInICsgc2Vjb25kTm9kZS5pZCgpICsgJ1wiXScpLmxlbmd0aCAmJiBzZWNvbmROb2RlICE9IF90aGlzLmxhc3RTZWxlY3RlZE5vZGUpIHtcblx0XHRcdFx0XHRfdGhpcy5saW5rKF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuaWQoKSwgc2Vjb25kTm9kZS5pZCgpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRfdGhpcy5sYXN0U2VsZWN0ZWROb2RlID0gZXZlbnQudGFyZ2V0O1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5jeS5vbigndGFwJywgJ2VkZ2UnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdGV2ZW50LnRhcmdldC5yZW1vdmUoKTtcblx0XHR9KTtcblxuXHRcdC8vIGZpeCBhIGJ1ZyB3aGVuIHRhcCBkb2Vzbid0IHdvcmsgb24gcGFnZSBjaGFuZ2UuXG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdHJldHVybiBfdGhpcy5jeS5yZXNpemUoKTtcblx0XHR9KTtcblxuXHRcdHRoaXMuaW5pdCgpO1xuXHR9XG5cblx0LypcbiAqXHRJbml0aWFsaXplIHRoZSBncmFwaCBieSBzZXR0aW5nIGRlZmF1bHQgdmFsdWVzLlxuICovXG5cblxuXHRfY3JlYXRlQ2xhc3MoR3JhcGgsIFt7XG5cdFx0a2V5OiAnaW5pdCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGluaXQoKSB7XG5cdFx0XHR0aGlzLm5ickVkZ2VzQ3JlYXRlZCA9IDA7XG5cdFx0XHR0aGlzLm5ick5vZGVzQ3JlYXRlZCA9IDA7XG5cblx0XHRcdHRoaXMubGFzdFNlbGVjdGVkTm9kZSA9IG51bGw7XG5cdFx0XHR0aGlzLmN1cnJlbnRBY3Rpb24gPSBudWxsO1xuXG5cdFx0XHR0aGlzLmN5LmVsZW1lbnRzKCkuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0XHRyZXR1cm4gZWxlbWVudC5yZW1vdmUoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRTb3J0IHRhcmdldHMgd2l0aCB0aGUgQ29TRSBsYXlvdXQgKGJ5IEJpbGtlbnQgVW5pdmVyc2l0eSkuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ3NvcnQnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBzb3J0KCkge1xuXHRcdFx0dGhpcy5jeS5sYXlvdXQoe1xuXHRcdFx0XHRuYW1lOiAnY29zZS1iaWxrZW50Jyxcblx0XHRcdFx0YW5pbWF0ZTogdHJ1ZVxuXHRcdFx0fSkucnVuKCk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdFJlc2V0IHRoZSBjdXJyZW50IGFjdGlvbiwgc2VsZWN0ZWQgdGFyZ2V0IGFuZCBoaWRlIHRoZSB0aXBzLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdyZXNldCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHJlc2V0KCkge1xuXHRcdFx0dGhpcy5sYXN0U2VsZWN0ZWROb2RlID0gbnVsbDtcblx0XHRcdHRoaXMuY3VycmVudEFjdGlvbiA9IG51bGw7XG5cdFx0XHQkKCcucXRpcCcpLnF0aXAoJ2hpZGUnKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0TGluayB0d28gdGFyZ2V0cyB0b2dldGhlci4gWW91IGhhdmUgdG8gc3BlY2lmeSB0aGUgaWRzLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdsaW5rJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gbGluayhzb3VyY2UsIHRhcmdldCkge1xuXHRcdFx0dGhpcy5jeS5hZGQoe1xuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0aWQ6ICdlJyArIHRoaXMubmJyRWRnZXNDcmVhdGVkKyssXG5cdFx0XHRcdFx0c291cmNlOiBzb3VyY2UsXG5cdFx0XHRcdFx0dGFyZ2V0OiB0YXJnZXRcblx0XHRcdFx0fSxcblx0XHRcdFx0Z3JvdXA6ICdlZGdlcycsXG5cdFx0XHRcdHNlbGVjdGFibGU6IHRydWUsXG5cdFx0XHRcdGxvY2tlZDogZmFsc2UsXG5cdFx0XHRcdGdyYWJiYWJsZTogdHJ1ZSxcblx0XHRcdFx0Y2xhc3NlczogJydcblx0XHRcdH0pO1xuXHRcdFx0Y29uc29sZS5pbmZvKCdFZGdlIGFkZGVkIGxpbmtpbmcgJyArIHNvdXJjZSArICcgdG8gJyArIHRhcmdldCArICcuJyk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdEFkZCBhIG5vZGUgdG8gdGhlIGdyYXBoLlxuICAqXHRcbiAgKlx0QXJndW1lbnRzIDpcbiAgKlx0XHQtIHBvc2l0aW9uIHNob3VsZCBiZSBhbiBvYmplY3Qgd2l0aCBmaWVsZHMgeCBhbmQgeS5cbiAgKlx0XHQtIGJhc2UgaXMgYSBib29sZWFuIGRlZmluaW5nIGlmIHRoZSBub2RlIGlzIHRoZSBiYXNlLlxuICAqXG4gICpcdEJhc2Ugbm9kZXMgY2FuIG5vdCBiZWVuIGF0dGFja2V0IG5vciBkZWZlbmRlZC5cbiAgKlx0UGF0cm9scyBoYXZlIHRvIHN0YXJ0IGFuZCBlbmQgYXQgdGhlIGJhc2UuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ2FkZE5vZGUnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBhZGROb2RlKCkge1xuXHRcdFx0dmFyIHBvc2l0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7IHg6IDAsIHk6IDAgfTtcblx0XHRcdHZhciBiYXNlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmYWxzZTtcblx0XHRcdHZhciByb2JiZXJzSW50ZXJlc3QgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IDE7XG5cdFx0XHR2YXIgZ3VhcmRpYW5zQ29zdCA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogMTtcblx0XHRcdHZhciBndWFyZGlhbnNSZXdhcmQgPSBhcmd1bWVudHMubGVuZ3RoID4gNCAmJiBhcmd1bWVudHNbNF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1s0XSA6IDE7XG5cblx0XHRcdHZhciBuZXdOb2RlSWQgPSB0aGlzLmN5Lm5vZGVzKCkubGVuZ3RoO1xuXG5cdFx0XHR2YXIgbmV3Tm9kZSA9IHRoaXMuY3kuYWRkKHtcblx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdGlkOiBuZXdOb2RlSWQsXG5cdFx0XHRcdFx0cm9iYmVyc0ludGVyZXN0OiByb2JiZXJzSW50ZXJlc3QsXG5cdFx0XHRcdFx0Z3VhcmRpYW5zQ29zdDogZ3VhcmRpYW5zQ29zdCxcblx0XHRcdFx0XHRndWFyZGlhbnNSZXdhcmQ6IGd1YXJkaWFuc1Jld2FyZCxcblx0XHRcdFx0XHRyb2JiZXJTZXR0aW5nczogbmV3IE1hcCgpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHBvc2l0aW9uOiBwb3NpdGlvbixcblx0XHRcdFx0Z3JvdXA6ICdub2RlcycsXG5cdFx0XHRcdHNlbGVjdGFibGU6IHRydWUsXG5cdFx0XHRcdGxvY2tlZDogZmFsc2UsXG5cdFx0XHRcdGdyYWJiYWJsZTogdHJ1ZSxcblx0XHRcdFx0Y2xhc3NlczogYmFzZSA/ICdiYXNlJyA6ICcnXG5cdFx0XHR9KS5xdGlwKHtcblx0XHRcdFx0Y29udGVudDogJ1xcblxcdFxcdFxcdDxkaXY+XFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGJsdWUgbGlua1wiIHN0eWxlPVwid2lkdGg6MTYwcHhcIj48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zIHJpZ2h0XCI+dGltZWxpbmU8L2k+TGluayB0by4uLjwvYT5cXG5cXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gcmVkIGRlbGV0ZVwiIHN0eWxlPVwid2lkdGg6MTYwcHg7IG1hcmdpbi10b3A6IDEwcHhcIiAnICsgKGJhc2UgPyAnZGlzYWJsZWQnIDogJycpICsgJz48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zIHJpZ2h0XCI+ZGVsZXRlPC9pPkRlbGV0ZTwvYT5cXG5cXHRcXHRcXHRcXHRcXG5cXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gcmVkIGxpZ2h0ZW4tMiBtaW51c0ludGVyZXN0IGNvbFwiICcgKyAoYmFzZSA/ICdkaXNhYmxlZCcgOiAnJykgKyAnPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIj5yZW1vdmVfY2lyY2xlPC9pPjwvYT5cXG5cXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVwibGFiZWxcIj5Sb2JiZXJzIEludGVyZXN0PC9kaXY+XFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGdyZWVuIGxpZ2h0ZW4tMiBwbHVzSW50ZXJlc3QgY29sXCIgJyArIChiYXNlID8gJ2Rpc2FibGVkJyA6ICcnKSArICc+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPmFkZF9jaXJjbGU8L2k+PC9hPlxcblxcblxcdFxcdFxcdFxcdDxhIGNsYXNzPVwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biByZWQgbGlnaHRlbi0yIG1pbnVzQ29zdCBjb2xcIiAnICsgKGJhc2UgPyAnZGlzYWJsZWQnIDogJycpICsgJz48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+cmVtb3ZlX2NpcmNsZTwvaT48L2E+XFxuXFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cImxhYmVsXCI+R3VhcmRpYW5zIENvc3Q8L2Rpdj5cXG5cXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gZ3JlZW4gbGlnaHRlbi0yIHBsdXNDb3N0IGNvbFwiICcgKyAoYmFzZSA/ICdkaXNhYmxlZCcgOiAnJykgKyAnPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIj5hZGRfY2lyY2xlPC9pPjwvYT5cXG5cXG5cXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gcmVkIGxpZ2h0ZW4tMiBtaW51c1Jld2FyZCBjb2xcIiAnICsgKGJhc2UgPyAnZGlzYWJsZWQnIDogJycpICsgJz48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+cmVtb3ZlX2NpcmNsZTwvaT48L2E+XFxuXFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cImxhYmVsXCI+R3VhcmRpYW5zIFJld2FyZDwvZGl2PlxcblxcdFxcdFxcdFxcdDxhIGNsYXNzPVwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biBncmVlbiBsaWdodGVuLTIgcGx1c1Jld2FyZCBjb2xcIiAnICsgKGJhc2UgPyAnZGlzYWJsZWQnIDogJycpICsgJz48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+YWRkX2NpcmNsZTwvaT48L2E+XFxuXFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGdyZWVuIGRpc21pc3NcIiBzdHlsZT1cIndpZHRoOjE2MHB4OyBtYXJnaW4tdG9wOiAxMHB4XCI+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29ucyByaWdodFwiPmNhbmNlbDwvaT5EaXNtaXNzPC9hPlxcblxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdFxcdCcsXG5cdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0bXk6ICd0b3AgY2VudGVyJyxcblx0XHRcdFx0XHRhdDogJ2JvdHRvbSBjZW50ZXInXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0Y2xhc3NlczogJ3F0aXAtYm9vdHN0cmFwJyxcblx0XHRcdFx0XHR3aWR0aDogMTk1XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLnNldHRpbmdzLnJvYmJlcnMubGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChyb2JiZXIpIHtcblx0XHRcdFx0cmV0dXJuIG5ld05vZGUuZGF0YSgncm9iYmVyU2V0dGluZ3MnKS5zZXQocm9iYmVyLCB7XG5cdFx0XHRcdFx0Y29zdDogMixcblx0XHRcdFx0XHRyZXdhcmQ6IDFcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIG5ld05vZGVJZDtcblx0XHR9XG5cblx0XHQvKlxuICAqXHRSZXR1cm4gdGhlIGxlbmd0aCBvZiBhbiBlZGdlLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdsZW5ndGgnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBsZW5ndGgoZWRnZSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZGlzdGFuY2UoZWRnZS5zb3VyY2UoKSwgZWRnZS50YXJnZXQoKSk7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0UmV0dXJuIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIGR3byB2ZXJ0aWNlcy5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnZGlzdGFuY2UnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBkaXN0YW5jZShub2RlMSwgbm9kZTIpIHtcblx0XHRcdHJldHVybiAoKG5vZGUxLnBvc2l0aW9uKCkueCAtIG5vZGUyLnBvc2l0aW9uKCkueCkgKiogMiArIChub2RlMS5wb3NpdGlvbigpLnkgLSBub2RlMi5wb3NpdGlvbigpLnkpICoqIDIpICoqIDAuNTtcblx0XHR9XG5cblx0XHQvKlxuICAqXHRDb25jYXRlbmF0ZSBzZXR0aW5ncyBpbnRvIGEgSlNPTiBvYmplY3QuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ2dldFNldHRpbmdzJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gZ2V0U2V0dGluZ3MoKSB7XG5cdFx0XHR2YXIgX3RoaXMyID0gdGhpcztcblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dmVydGljZXM6IE9iamVjdC5rZXlzKGN5Lm5vZGVzKCkpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdFx0cmV0dXJuICFpc05hTihrZXkpO1xuXHRcdFx0XHR9KS5tYXAoZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRpZDogcGFyc2VJbnQoY3kubm9kZXMoKVtrZXldLmlkKCkpLFxuXHRcdFx0XHRcdFx0cG9zaXRpb246IGN5Lm5vZGVzKClba2V5XS5wb3NpdGlvbigpLFxuXHRcdFx0XHRcdFx0cm9iYmVyc0ludGVyZXN0OiBjeS5ub2RlcygpW2tleV0uZGF0YSgncm9iYmVyc0ludGVyZXN0JyksXG5cdFx0XHRcdFx0XHRndWFyZGlhbnNDb3N0OiBjeS5ub2RlcygpW2tleV0uZGF0YSgnZ3VhcmRpYW5zQ29zdCcpLFxuXHRcdFx0XHRcdFx0Z3VhcmRpYW5zUmV3YXJkOiBjeS5ub2RlcygpW2tleV0uZGF0YSgnZ3VhcmRpYW5zUmV3YXJkJyksXG5cdFx0XHRcdFx0XHRyb2JiZXJTZXR0aW5nczogQXJyYXkuZnJvbShjeS5ub2RlcygpW2tleV0uZGF0YSgncm9iYmVyU2V0dGluZ3MnKSkucmVkdWNlKGZ1bmN0aW9uIChvYmosIF9yZWYpIHtcblx0XHRcdFx0XHRcdFx0dmFyIF9yZWYyID0gX3NsaWNlZFRvQXJyYXkoX3JlZiwgMiksXG5cdFx0XHRcdFx0XHRcdCAgICBrZXkgPSBfcmVmMlswXSxcblx0XHRcdFx0XHRcdFx0ICAgIHZhbHVlID0gX3JlZjJbMV07XG5cblx0XHRcdFx0XHRcdFx0b2JqW2tleV0gPSB2YWx1ZTtyZXR1cm4gb2JqO1xuXHRcdFx0XHRcdFx0fSwge30pXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fSksXG5cdFx0XHRcdGVkZ2VzOiBPYmplY3Qua2V5cyhjeS5lZGdlcygpKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRcdHJldHVybiAhaXNOYU4oa2V5KTtcblx0XHRcdFx0fSkubWFwKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0c291cmNlOiBwYXJzZUludChjeS5lZGdlcygpW2tleV0uc291cmNlKCkuaWQoKSksXG5cdFx0XHRcdFx0XHR0YXJnZXQ6IHBhcnNlSW50KGN5LmVkZ2VzKClba2V5XS50YXJnZXQoKS5pZCgpKSxcblx0XHRcdFx0XHRcdGxlbmd0aDogX3RoaXMyLmxlbmd0aChjeS5lZGdlcygpW2tleV0pXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fSlcblx0XHRcdH07XG5cdFx0fVxuXHR9XSk7XG5cblx0cmV0dXJuIEdyYXBoO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBHcmFwaDsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheSA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gc2xpY2VJdGVyYXRvcihhcnIsIGkpIHsgdmFyIF9hcnIgPSBbXTsgdmFyIF9uID0gdHJ1ZTsgdmFyIF9kID0gZmFsc2U7IHZhciBfZSA9IHVuZGVmaW5lZDsgdHJ5IHsgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkgeyBfYXJyLnB1c2goX3MudmFsdWUpOyBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7IH0gfSBjYXRjaCAoZXJyKSB7IF9kID0gdHJ1ZTsgX2UgPSBlcnI7IH0gZmluYWxseSB7IHRyeSB7IGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0pIF9pW1wicmV0dXJuXCJdKCk7IH0gZmluYWxseSB7IGlmIChfZCkgdGhyb3cgX2U7IH0gfSByZXR1cm4gX2FycjsgfSByZXR1cm4gZnVuY3Rpb24gKGFyciwgaSkgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IHJldHVybiBhcnI7IH0gZWxzZSBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSB7IHJldHVybiBzbGljZUl0ZXJhdG9yKGFyciwgaSk7IH0gZWxzZSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpOyB9IH07IH0oKTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBSb2JiZXJzID0gZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBSb2JiZXJzKHNldHRpbmdzKSB7XG5cdFx0dmFyIF90aGlzID0gdGhpcztcblxuXHRcdF9jbGFzc0NhbGxDaGVjayh0aGlzLCBSb2JiZXJzKTtcblxuXHRcdC8vIEZpZWxkc1xuXG5cdFx0dGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXG5cdFx0Ly8gRE9NIGxpc3RlbmVyc1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJyNyb2JiZXJzIC5kZWxldGUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuXHRcdFx0X3RoaXMucmVtb3ZlUm9iYmVyKCQoZXZlbnQuY3VycmVudFRhcmdldCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkuZGF0YSgncm9iYmVyaWQnKSk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnI3JvYmJlcnMgLmNvbmZpZ3VyZScsIGZ1bmN0aW9uIChldmVudCkge1xuXG5cdFx0XHRfdGhpcy5jb25maWd1cmVSb2JiZXIoJChldmVudC5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5kYXRhKCdyb2JiZXJpZCcpKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnI3JvYmJlcnMgaW5wdXQuZGlzY3JldGlvbicsIGZ1bmN0aW9uIChldmVudCkge1xuXG5cdFx0XHR2YXIgbmV3VmFsdWUgPSAxIC0gcGFyc2VGbG9hdCgkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnZhbCgpKTtcblxuXHRcdFx0aWYgKG5ld1ZhbHVlIDwgMCB8fCBuZXdWYWx1ZSA+IDEpIHtcblx0XHRcdFx0cmV0dXJuICQoZXZlbnQuY3VycmVudFRhcmdldCkuY3NzKHtcblx0XHRcdFx0XHRjb2xvcjogJ3JlZCdcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdCQoZXZlbnQuY3VycmVudFRhcmdldCkuY3NzKHtcblx0XHRcdFx0Y29sb3I6IFwiI2ZmZlwiXG5cdFx0XHR9KTtcblxuXHRcdFx0X3RoaXMuY2F0Y2hQcm9iYWJpbGl0eS5zZXQoJChldmVudC5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5kYXRhKCdyb2JiZXJpZCcpLCBuZXdWYWx1ZSk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJyNtb2RhbC1yb2JiZXItY29uZmlnIGlucHV0JywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cblx0XHRcdHZhciByb3cgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnBhcmVudCgpLnBhcmVudCgpO1xuXG5cdFx0XHR2YXIgbm9kZUlkID0gcm93LmRhdGEoJ25vZGVpZCcpO1xuXHRcdFx0dmFyIHJvYmJlcklkID0gcm93LmRhdGEoJ3JvYmJlcmlkJyk7XG5cblx0XHRcdHZhciBzZXR0aW5nID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5kYXRhKCdzZXR0aW5nJyk7XG5cdFx0XHR2YXIgbmV3VmFsdWUgPSBwYXJzZUZsb2F0KCQoZXZlbnQuY3VycmVudFRhcmdldCkudmFsKCkpO1xuXG5cdFx0XHRjb25zb2xlLmluZm8oc2V0dGluZyArICcgY2hhbmdlZCBmb3IgdGFyZ2V0ICcgKyBub2RlSWQgKyAnLCBuZXcgdmFsdWUgaXMgJyArIG5ld1ZhbHVlICsgJy4nKTtcblxuXHRcdFx0X3RoaXMuc2V0dGluZ3MuZ3JhcGguY3kubm9kZXMoJ1tpZCA9IFwiJyArIG5vZGVJZCArICdcIl0nKS5kYXRhKCdyb2JiZXJTZXR0aW5ncycpLmdldChyb2JiZXJJZClbc2V0dGluZ10gPSBuZXdWYWx1ZTtcblx0XHR9KTtcblxuXHRcdHRoaXMuaW5pdCgpO1xuXHR9XG5cblx0LypcbiAqXHRJbml0aWFsaXplIHRoZSByb2JiZXJzIGJ5IHNldHRpbmcgZGVmYXVsdCB2YWx1ZXMuXG4gKi9cblxuXG5cdF9jcmVhdGVDbGFzcyhSb2JiZXJzLCBbe1xuXHRcdGtleTogJ2luaXQnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBpbml0KCkge1xuXHRcdFx0dmFyIF90aGlzMiA9IHRoaXM7XG5cblx0XHRcdGlmICh0eXBlb2YgdGhpcy5saXN0ICE9PSAndW5kZWZpbmVkJykgW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLmxpc3QpKS5mb3JFYWNoKGZ1bmN0aW9uIChyb2JiZXJJZCkge1xuXHRcdFx0XHRyZXR1cm4gX3RoaXMyLnJlbW92ZVJvYmJlcihyb2JiZXJJZCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5udW1iZXJPZlJvYmJlcnNDcmVhdGVkID0gMDtcblxuXHRcdFx0dGhpcy5saXN0ID0gbmV3IFNldCgpO1xuXG5cdFx0XHR0aGlzLmNhdGNoUHJvYmFiaWxpdHkgPSBuZXcgTWFwKCk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdEFkZCBhIHJvYmJlciB0byB0aGUgc2V0dGluZ3MuXG4gICpcdEhpcyBjYXJkIGNhbiBiZSBzZWVuIGluIHRoZSBcIlJvYmJlcnNcIiB0YWIuXG4gICpcdEhpcyBzZXR0aW5ncyBhcmUgc2V0IHRvIGRlZmF1bHQgaW4gZXZlcnkgdGFyZ2V0LlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICduZXdSb2JiZXInLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBuZXdSb2JiZXIoKSB7XG5cdFx0XHR2YXIgY2F0Y2hQcm9iYWJpbGl0eSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogMC41O1xuXG5cblx0XHRcdHZhciByb2JiZXJJZCA9IHRoaXMubnVtYmVyT2ZSb2JiZXJzQ3JlYXRlZCsrO1xuXG5cdFx0XHR0aGlzLmxpc3QuYWRkKHJvYmJlcklkKTtcblxuXHRcdFx0dGhpcy5jYXRjaFByb2JhYmlsaXR5LnNldChyb2JiZXJJZCwgY2F0Y2hQcm9iYWJpbGl0eSk7XG5cblx0XHRcdHRoaXMuc2V0dGluZ3MuZ3JhcGguY3kubm9kZXMoKS5lYWNoKGZ1bmN0aW9uIChub2RlKSB7XG5cdFx0XHRcdHJldHVybiBub2RlLmRhdGEoJ3JvYmJlclNldHRpbmdzJykuc2V0KHJvYmJlcklkLCB7XG5cdFx0XHRcdFx0Y29zdDogMSxcblx0XHRcdFx0XHRyZXdhcmQ6IDFcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI3JvYmJlcnMnKS5hcHBlbmQoJ1xcblxcdFxcdFxcdDxkaXYgY2xhc3M9XCJjb2wgczRcIiBkYXRhLXJvYmJlcmlkPVwiJyArIHJvYmJlcklkICsgJ1wiPlxcblxcdFxcdFxcdCAgICA8ZGl2IGNsYXNzPVwiY2FyZCBibHVlLWdyZXkgZGFya2VuLTFcIj5cXG5cXHRcXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiY2FyZC1jb250ZW50IHdoaXRlLXRleHRcIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8c3BhbiBjbGFzcz1cImNhcmQtdGl0bGVcIj5Sb2JiZXIgJyArIChyb2JiZXJJZCArIDEpICsgJzwvc3Bhbj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8IS0tPHA+U29tZSBiYWQgZ3V5LjwvcD4tLT5cXG5cXHRcXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiY2FyZC1hY3Rpb25cIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiZGlzY3JldGlvbkNvbnRhaW5lclwiPlxcblxcdFxcdFxcdFxcdFxcdFxcdFxcdDxzcGFuPkRpc2NyZXRpb248L3NwYW4+XFxuXFx0XFx0XFx0XFx0XFx0XFx0XFx0PGlucHV0IHR5cGU9XCJudW1iZXJcIiBzdGVwPVwiMC4wNVwiIGNsYXNzPVwiZGlzY3JldGlvblwiIG1pbj1cIjBcIiBtYXg9XCIxXCIgdmFsdWU9XCInICsgY2F0Y2hQcm9iYWJpbGl0eSArICdcIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gYmx1ZSBjb25maWd1cmVcIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBtYXJnaW4tdG9wOiAxMHB4O1wiPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnMgcmlnaHRcIj5tb2RlX2VkaXQ8L2k+UmV3YXJkczwvYT5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gcmVkIGRlbGV0ZVwiIHN0eWxlPVwid2lkdGg6IDEwMCU7IG1hcmdpbi10b3A6IDEwcHhcIiAnICsgKHJvYmJlcklkID09PSAwID8gJ2Rpc2FibGVkJyA6ICcnKSArICc+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29ucyByaWdodFwiPmRlbGV0ZTwvaT5EZWxldGU8L2E+XFxuXFx0XFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0Jyk7XG5cblx0XHRcdHJldHVybiByb2JiZXJJZDtcblx0XHR9XG5cblx0XHQvKlxuICAqXHRSZW1vdmUgYSByb2JiZXIgZnJvbSB0aGUgc2V0dGluZ3MuXG4gICpcdEhpcyBjYXJkIGdldHMgcmVtb3ZlZCBhbmQgcmVmZXJlbmNlcyB0byBoaXMgc2V0dGluZ3MgYXJlXG4gICpcdHJlbW92ZWQgZnJvbSBlYWNoIHRhcmdldC5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAncmVtb3ZlUm9iYmVyJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlUm9iYmVyKHJvYmJlcklkKSB7XG5cblx0XHRcdGNvbnNvbGUuaW5mbygnUmVtb3Zpbmcgcm9iYmVyICcgKyByb2JiZXJJZCArICcuLi4nKTtcblxuXHRcdFx0dGhpcy5saXN0LmRlbGV0ZShyb2JiZXJJZCk7XG5cblx0XHRcdHRoaXMuc2V0dGluZ3MuZ3JhcGguY3kubm9kZXMoKS5lYWNoKGZ1bmN0aW9uIChub2RlKSB7XG5cdFx0XHRcdHJldHVybiBub2RlLmRhdGEoJ3JvYmJlclNldHRpbmdzJykuZGVsZXRlKHJvYmJlcklkKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjcm9iYmVycycpLmZpbmQoJ1tkYXRhLXJvYmJlcmlkPScgKyByb2JiZXJJZCArICddJykucmVtb3ZlKCk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdERpc3BsYXkgYSBtb2RhbCBlbmFibGluZyB0aGUgdXNlciB0byBzZXQgdGhlXG4gICpcdHJvYmJlciBwcm9wZXJ0aWVzIGZvciBldmVyeSB0YXJnZXQuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ2NvbmZpZ3VyZVJvYmJlcicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGNvbmZpZ3VyZVJvYmJlcihyb2JiZXJJZCkge1xuXG5cdFx0XHRjb25zb2xlLmluZm8oJ0NvbmZpZ3VyaW5nIHJvYmJlciAnICsgKHJvYmJlcklkICsgMSkgKyAnLicpO1xuXG5cdFx0XHR2YXIgdGFibGUgPSAnXFxuXFx0XFx0XFx0PHRhYmxlIGNsYXNzPVwic3RyaXBlZCBjZW50ZXJlZFwiPlxcblxcdFxcdFxcdFxcdDx0aGVhZD5cXG5cXHRcXHRcXHRcXHRcXHQ8dHI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPlRhcmdldCBJRDwvdGg+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPkNvc3Q8L3RoPlxcblxcdFxcdFxcdFxcdFxcdFxcdDx0aD5SZXdhcmQ8L3RoPlxcblxcdFxcdFxcdFxcdFxcdDwvdHI+XFxuXFx0XFx0XFx0XFx0PC90aGVhZD5cXG5cXG5cXHRcXHRcXHRcXHQ8dGJvZHk+JztcblxuXHRcdFx0dGhpcy5zZXR0aW5ncy5ncmFwaC5jeS5ub2RlcygnW2lkICE9IFwiMFwiXScpLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcblxuXHRcdFx0XHR2YXIgc2V0dGluZ3MgPSBub2RlLmRhdGEoJ3JvYmJlclNldHRpbmdzJykuZ2V0KHJvYmJlcklkKTtcblxuXHRcdFx0XHR0YWJsZSArPSAnXFxuXFx0XFx0XFx0XFx0PHRyIGRhdGEtbm9kZWlkPVwiJyArIG5vZGUuaWQoKSArICdcIiBkYXRhLXJvYmJlcmlkPVwiJyArIHJvYmJlcklkICsgJ1wiPlxcblxcdFxcdFxcdFxcdFxcdDx0ZD4nICsgbm9kZS5pZCgpICsgJzwvdGQ+XFxuXFx0XFx0XFx0XFx0XFx0PHRkPjxpbnB1dCBkYXRhLXNldHRpbmc9XCJjb3N0XCIgdHlwZT1cIm51bWJlclwiIHZhbHVlPVwiJyArIHNldHRpbmdzLmNvc3QgKyAnXCIgbWluPVwiMFwiPjwvdGQ+XFxuXFx0XFx0XFx0XFx0XFx0PHRkPjxpbnB1dCBkYXRhLXNldHRpbmc9XCJyZXdhcmRcIiB0eXBlPVwibnVtYmVyXCIgdmFsdWU9XCInICsgc2V0dGluZ3MucmV3YXJkICsgJ1wiIG1pbj1cIjBcIj48L3RkPlxcblxcdFxcdFxcdFxcdDwvdHI+Jztcblx0XHRcdH0pO1xuXG5cdFx0XHR0YWJsZSArPSAnXFxuXFx0XFx0XFx0XFx0PC90Ym9keT5cXG5cXHRcXHRcXHQ8L3RhYmxlPic7XG5cblx0XHRcdCQoJyNtb2RhbC1yb2JiZXItY29uZmlnIGg0JykudGV4dCgnUm9iYmVyICcgKyAocm9iYmVySWQgKyAxKSArICcgY29uZmlndXJhdGlvbicpO1xuXG5cdFx0XHQkKCcjbW9kYWwtcm9iYmVyLWNvbmZpZyBwJykuaHRtbCh0YWJsZSk7XG5cblx0XHRcdCQoJyNtb2RhbC1yb2JiZXItY29uZmlnJykubW9kYWwoJ29wZW4nKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0UmV0dXJuIHRoZSBsaXN0IG9mIGV2ZXJ5IHJvYmJlci5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnZ2V0U2V0dGluZ3MnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBnZXRTZXR0aW5ncygpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGxpc3Q6IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5saXN0KSksXG5cdFx0XHRcdGNhdGNoUHJvYmFiaWxpdHk6IEFycmF5LmZyb20odGhpcy5jYXRjaFByb2JhYmlsaXR5KS5yZWR1Y2UoZnVuY3Rpb24gKG9iaiwgX3JlZikge1xuXHRcdFx0XHRcdHZhciBfcmVmMiA9IF9zbGljZWRUb0FycmF5KF9yZWYsIDIpLFxuXHRcdFx0XHRcdCAgICBrZXkgPSBfcmVmMlswXSxcblx0XHRcdFx0XHQgICAgdmFsdWUgPSBfcmVmMlsxXTtcblxuXHRcdFx0XHRcdG9ialtrZXldID0gdmFsdWU7cmV0dXJuIG9iajtcblx0XHRcdFx0fSwge30pXG5cdFx0XHR9O1xuXHRcdH1cblx0fV0pO1xuXG5cdHJldHVybiBSb2JiZXJzO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBSb2JiZXJzOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9JbnRlcmZhY2UgPSByZXF1aXJlKCcuL2NsYXNzZXMvSW50ZXJmYWNlJyk7XG5cbnZhciBfSW50ZXJmYWNlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0ludGVyZmFjZSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbi8qXG4qXHRDeXRvc2NhcGUgKHRoZSBncmFwaCBsaWJyYXJ5IHdlIGFyZSB1c2luZykgZG9lc24ndCB3b3JrIHNvXG4qXHR3ZWxsIHdoZW4gdGhlIHJlbmRlcmluZyBjYW52YXMgaXMgaGlkZGVuIHdoaWxlIHRoZSBncmFwaFxuKlx0aXMgaW5pdGlhbGl6ZWQuIFdlIGhhdmUgdG8gd2FpdCBmb3IgdGhlIGNhbnZhcyB0byBiZSBkaXNwbGF5ZWRcbipcdGJlZm9yZSBpbml0aWFsaXppbmcgaXQgYW5kIHRvIG9ubHkgZG8gc28gb25jZS5cbipcbipcdFRodXMsIHdlIHVzZSB0aGUgZ2xvYmFsIGZsYWcgZ3JhcGhJbml0aWFsaXplZC5cbiovXG5cbnZhciBncmFwaEluaXRpYWxpemVkID0gZmFsc2U7XG5cbi8qXG4qXHRGdW5jdGlvbiBjYWxsZWQgd2hlbmV2ZXIgdGhlIGhhc2ggaXMgdXBkYXRlZCB0byBkbyB0aGUgY29ycmVjdFxuKlx0YWN0aW9uLlxuKi9cblxudmFyIHVwZGF0ZUhhc2ggPSBmdW5jdGlvbiB1cGRhdGVIYXNoKGhhc2gpIHtcblxuXHQvLyBXZSByZW1vdmUgdGhlICcjJyBjaGFyYWN0ZXIgZnJvbSB0aGUgaGFzaC4gSnVzdCBpbiBjYXNlLlxuXHRoYXNoID0gaGFzaC5yZXBsYWNlKC9eIy8sICcnKTtcblxuXHQvKlxuICpcdFByZXZlbnRzICMgbGlua3MgZnJvbSBnb2luZyB0byB0aGUgZWxlbWVudC5cbiAqL1xuXHR2YXIgbm9kZSA9ICQoJyMnICsgaGFzaCk7XG5cdG5vZGUuYXR0cignaWQnLCAnJyk7XG5cdGRvY3VtZW50LmxvY2F0aW9uLmhhc2ggPSBoYXNoO1xuXHRub2RlLmF0dHIoJ2lkJywgaGFzaCk7XG5cblx0LypcbiAqXHRXZSBoYXZlIHRvIHNvcnQgdGhlIGdyYXBoIHdoZW4gaXQncyBkaXNwbGF5ZWRcbiAqXHRmb3IgdGhlIGZpcnN0IHRpbWUuXG4gKi9cblx0aWYgKCFncmFwaEluaXRpYWxpemVkICYmIGhhc2ggPT09ICdzaW11bGF0ZScpIHtcblx0XHR3aW5kb3cuZ3JhcGguc29ydCgpO1xuXHRcdGdyYXBoSW5pdGlhbGl6ZWQgPSB0cnVlO1xuXHR9XG5cblx0aWYgKHdpbmRvdy5jeSAhPT0gdW5kZWZpbmVkKSB3aW5kb3cuY3kucmVzaXplKCk7XG5cblx0LypcbiAqXHRGaXggYSBidWcgd2l0aCBwYXJhbGxheCBpbWFnZXMuXG4gKi9cblxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHQkKHdpbmRvdykuc2Nyb2xsKCkucmVzaXplKCk7XG5cdH0sIDI1KTtcbn07XG5cbi8qXG4qXHRTZXR1cCBub24tc3BlY2lmaWMgRE9NIGxpc3RlbmVycyBhbmQgaW5pdGlhbGl6ZSBtb2R1bGVzLlxuKi9cbnZhciBzZXR1cERPTSA9IGZ1bmN0aW9uIHNldHVwRE9NKCkge1xuXG5cdCQoJ1tkYXRhLWRlc3RdJykuY2xpY2soZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0d2luZG93LmxvY2F0aW9uLmhhc2ggPSAkKGV2ZW50LmV2ZW50VGFyZ2V0KS5kYXRhKCdkZXN0Jyk7XG5cdFx0JCgnbmF2IHVsLnRhYnMnKS50YWJzKCdzZWxlY3RfdGFiJywgJChldmVudC5jdXJyZW50VGFyZ2V0KS5kYXRhKCdkZXN0JykpO1xuXHRcdHVwZGF0ZUhhc2goJChldmVudC5jdXJyZW50VGFyZ2V0KS5kYXRhKCdkZXN0JykpO1xuXHR9KTtcblxuXHQkKCduYXYgdWwudGFicycpLm9uKCdjbGljaycsICdhJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0dXBkYXRlSGFzaCgkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmF0dHIoJ2hyZWYnKSk7XG5cdH0pO1xuXG5cdCQod2luZG93KS5vbignaGFzaGNoYW5nZScsIGZ1bmN0aW9uICgpIHtcblx0XHQkKCduYXYgdWwudGFicycpLnRhYnMoJ3NlbGVjdF90YWInLCB3aW5kb3cubG9jYXRpb24uaGFzaC5zbGljZSgxKSk7XG5cdFx0dXBkYXRlSGFzaCh3aW5kb3cubG9jYXRpb24uaGFzaCk7XG5cdH0pO1xuXG5cdCQoJy5wYXJhbGxheCcpLnBhcmFsbGF4KCk7XG5cblx0JCgnLm1vZGFsI21vZGFsLXJvYmJlci1jb25maWcnKS5tb2RhbCgpO1xuXG5cdENvbnNvbGVMb2dIVE1MLmNvbm5lY3QoJCgnI2NvbnNvbGUnKSk7XG59O1xuXG4vKlxuKlx0V2hlbmV2ZXIgdGhlIERPTSBjb250ZW50IGlzIHJlYWFkeSB0byBiZSBtYW5pcHVsYXRlZCxcbipcdHNldHVwZSB0aGUgc3BlY2lmaWMgRE9NIGFuZCBjcmVhdGUgYW4gSW50ZXJmYWNlIHdpdGggdGhlIHNlcnZlci5cbipcdFRoZW4sIHdlIGxpbmsgdGhlIFVJIGVsZW1lbnRzIHRvIHRoZSBzZXR0aW5ncyB0aGV5IG1hbmlwdWxhdGUuXG4qL1xuJChmdW5jdGlvbiAoKSB7XG5cdHNldHVwRE9NKCk7XG5cblx0dmFyIGlmYWNlID0gbmV3IF9JbnRlcmZhY2UyLmRlZmF1bHQoKTtcblx0JCgnI3NvcnROb2RlcycpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdHJldHVybiBpZmFjZS5zZXR0aW5ncy5ncmFwaC5zb3J0KCk7XG5cdH0pO1xuXHQkKCcjbmV3Um9iYmVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0cmV0dXJuIGlmYWNlLnNldHRpbmdzLnJvYmJlcnMubmV3Um9iYmVyKCk7XG5cdH0pO1xuXHQkKCcjbGF1bmNoQnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0cmV0dXJuIGlmYWNlLnN0YXJ0U2ltdWxhdGlvbigpO1xuXHR9KTtcblx0JCgnI2ltcG9ydEJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdHJldHVybiBpZmFjZS5zZXR0aW5ncy5sb2FkZXIuaW1wb3J0KCk7XG5cdH0pO1xuXHQkKCcjZXhwb3J0QnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0cmV0dXJuIGlmYWNlLnNldHRpbmdzLnNhdmVyLnNhdmUoKTtcblx0fSk7XG5cdCQoJy5tb2RhbCNtb2RhbC1yZXN1bHRzJykubW9kYWwoeyBjb21wbGV0ZTogZnVuY3Rpb24gY29tcGxldGUoKSB7XG5cdFx0XHRyZXR1cm4gaWZhY2Uuc3RvcFNpbXVsYXRpb24oKTtcblx0XHR9IH0pO1xufSk7Il19
