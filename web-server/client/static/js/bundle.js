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
				return _this.results.loading(data.progression);
			});

			this.results.loading(0);

			this.socket.emit('startSimulation', this.settings.getSettings(), function (results) {

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
				numberOfIterations: parseInt($('#numberOfIterations').val())
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
			this.iterationEnd();
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
				"numberOfIterations": 20
			},
			"paths": {
				"vertices": [{
					"id": 0,
					"position": {
						"x": 93.74723822180408,
						"y": 20
					},
					"robbersInterest": 1,
					"guardiansCost": 2,
					"guardiansReward": 1,
					"robberSettings": {
						"0": {
							"cost": 2,
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
					"guardiansCost": 2,
					"guardiansReward": 1,
					"robberSettings": {
						"0": {
							"cost": 2,
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
		}

		/*
  *	Initialize the graph by setting default values.
  */

	}, {
		key: "loadDefault",
		value: function loadDefault() {
			this.load(this.defaultSettings);
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

			this.download(date.toLocaleDateString() + '-' + date.toLocaleTimeString().replace(':', '-') + '.json', JSON.stringify(this.settings.getSettings()));
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
			var guardiansCost = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 2;
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
					cost: 2,
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
		$(window).scroll();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvZGlzdC9qcy9jbGFzc2VzL0ludGVyZmFjZS5qcyIsImNsaWVudC9kaXN0L2pzL2NsYXNzZXMvaW50ZXJmYWNlL1Jlc3VsdHMuanMiLCJjbGllbnQvZGlzdC9qcy9jbGFzc2VzL2ludGVyZmFjZS9TZXR0aW5ncy5qcyIsImNsaWVudC9kaXN0L2pzL2NsYXNzZXMvaW50ZXJmYWNlL3Jlc3VsdHMvTGl2ZVNpbXVsYXRpb24uanMiLCJjbGllbnQvZGlzdC9qcy9jbGFzc2VzL2ludGVyZmFjZS9zZXR0aW5ncy9maWxlcy9Mb2FkZXIuanMiLCJjbGllbnQvZGlzdC9qcy9jbGFzc2VzL2ludGVyZmFjZS9zZXR0aW5ncy9maWxlcy9TYXZlci5qcyIsImNsaWVudC9kaXN0L2pzL2NsYXNzZXMvaW50ZXJmYWNlL3NldHRpbmdzL3N1YnNldHRpbmdzL0dyYXBoLmpzIiwiY2xpZW50L2Rpc3QvanMvY2xhc3Nlcy9pbnRlcmZhY2Uvc2V0dGluZ3Mvc3Vic2V0dGluZ3MvUm9iYmVycy5qcyIsImNsaWVudC9kaXN0L2pzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9TZXR0aW5ncyA9IHJlcXVpcmUoJy4vaW50ZXJmYWNlL1NldHRpbmdzJyk7XG5cbnZhciBfU2V0dGluZ3MyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2V0dGluZ3MpO1xuXG52YXIgX1Jlc3VsdHMgPSByZXF1aXJlKCcuL2ludGVyZmFjZS9SZXN1bHRzJyk7XG5cbnZhciBfUmVzdWx0czIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9SZXN1bHRzKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLypcbipcdEludGVyZmFjZSBiZXR3ZWVuIHRoZSBjbGllbnQgc2lkZSBhbmQgdGhlIGJhY2stZW5kLlxuKlxuKlx0VGhlIGludGVyZmFjZSBoYXMgc2V0dGluZ3MgYW5kIGEgc29ja2V0IGVuYWJsaW5nIGl0IFxuKlx0dG8gc2VuZCBhbmQgcmVjZWl2ZSBkYXRhIGZyb20gdGhlIHNlcnZlciBydW5uaW5nIHRoZVxuKlx0SmF2YSBNQVMgc2ltdWxhdGlvbi5cbiovXG5cbnZhciBJbnRlcmZhY2UgPSBmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIEludGVyZmFjZSgpIHtcblx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgSW50ZXJmYWNlKTtcblxuXHRcdC8vIEZpZWxkc1xuXG5cdFx0dGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KCdodHRwOi8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSArICc6ODA4MycpO1xuXHRcdHRoaXMuc2V0dGluZ3MgPSBuZXcgX1NldHRpbmdzMi5kZWZhdWx0KHRoaXMpO1xuXHRcdHRoaXMucmVzdWx0cyA9IG5ldyBfUmVzdWx0czIuZGVmYXVsdCh0aGlzKTtcblx0XHR0aGlzLnNpbXVsYXRpb25SdW5uaW5nID0gZmFsc2U7XG5cblx0XHQvLyBTb2NrZXQgbGlzdGVuZXJzXG5cblx0XHR0aGlzLnNvY2tldC5vbignY29ubmVjdCcsIGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0Y29uc29sZS5pbmZvKCdDb25uZWN0aW9uIHRvIHRoZSByZW1vdGUgc2VydmVyIGVzdGFibGlzaGVkLicpO1xuXHRcdH0pO1xuXHR9XG5cblx0LypcbiAqXHRTdGFydCB0aGUgc2ltdWxhdGlvbiBieSBzZW5kaW5nIHRoZSBzZXR0aW5ncyB0byB0aGUgYmFjay1lbmRcbiAqXHRhbG9uZyB0aGUgbWVzc2FnZSAnc3RhcnRTaW11bGF0aW9uJy5cbiAqL1xuXG5cdF9jcmVhdGVDbGFzcyhJbnRlcmZhY2UsIFt7XG5cdFx0a2V5OiAnc3RhcnRTaW11bGF0aW9uJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gc3RhcnRTaW11bGF0aW9uKCkge1xuXHRcdFx0dmFyIF90aGlzID0gdGhpcztcblxuXHRcdFx0dGhpcy5zaW11bGF0aW9uUnVubmluZyA9IHRydWU7XG5cblx0XHRcdHRoaXMuc29ja2V0Lm9uKCdsb2FkaW5nJywgZnVuY3Rpb24gKGRhdGEpIHtcblx0XHRcdFx0cmV0dXJuIF90aGlzLnJlc3VsdHMubG9hZGluZyhkYXRhLnByb2dyZXNzaW9uKTtcblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLnJlc3VsdHMubG9hZGluZygwKTtcblxuXHRcdFx0dGhpcy5zb2NrZXQuZW1pdCgnc3RhcnRTaW11bGF0aW9uJywgdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5ncygpLCBmdW5jdGlvbiAocmVzdWx0cykge1xuXG5cdFx0XHRcdGlmICghX3RoaXMuc2ltdWxhdGlvblJ1bm5pbmcpIHJldHVybjtcblxuXHRcdFx0XHRpZiAocmVzdWx0cy5lcnJvcikgcmV0dXJuIF90aGlzLnJlc3VsdHMuZXJyb3IocmVzdWx0cy5lcnJvcik7XG5cblx0XHRcdFx0X3RoaXMucmVzdWx0cy5zaG93UmVzdWx0cyhyZXN1bHRzLmRhdGEpO1xuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdFN0b3AgdGhlIGNsaWVudC1zaWRlIHNpbXVsYXRpb24gYnkgcmVtb3ZpbmcgdGhlIGxvYWRpbmcgc2NyZWVuIGFuZFxuICAqXHRibG9ja2luZyByZXN1bHRzIGNhbGxiYWNrLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdzdG9wU2ltdWxhdGlvbicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHN0b3BTaW11bGF0aW9uKCkge1xuXHRcdFx0dGhpcy5zaW11bGF0aW9uUnVubmluZyA9IGZhbHNlO1xuXG5cdFx0XHR0aGlzLnNvY2tldC5yZW1vdmVMaXN0ZW5lcignbG9hZGluZycpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cdH1dKTtcblxuXHRyZXR1cm4gSW50ZXJmYWNlO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBJbnRlcmZhY2U7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcblx0dmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX0xpdmVTaW11bGF0aW9uID0gcmVxdWlyZSgnLi9yZXN1bHRzL0xpdmVTaW11bGF0aW9uJyk7XG5cbnZhciBfTGl2ZVNpbXVsYXRpb24yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfTGl2ZVNpbXVsYXRpb24pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vKlxuKlx0RGVhbHMgd2l0aCB0aGUgcmVzdWx0cyBzZW50IGJ5IHRoZSBzZXJ2ZXIuXG4qL1xudmFyIFJlc3VsdHMgPSBmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIFJlc3VsdHMoaWZhY2UpIHtcblx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgUmVzdWx0cyk7XG5cblx0XHR0aGlzLmludGVyZmFjZSA9IGlmYWNlO1xuXHRcdHdpbmRvdy5yZXN1bHRzID0gdGhpcztcblx0fVxuXG5cdC8qXG4gKlx0V2hlbiBhbiBlcnJvciBpcyByZWNlaXZlZCwgcHJpbnQgaXQgdG8gc2NyZWVuLlxuICovXG5cblxuXHRfY3JlYXRlQ2xhc3MoUmVzdWx0cywgW3tcblx0XHRrZXk6ICdlcnJvcicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGVycm9yKGVycikge1xuXG5cdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvcjogJyArIGVycik7XG5cblx0XHRcdCQoJyNtb2RhbC1yZXN1bHRzIHAnKS5odG1sKCdcXG5cXG5cXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiY2VudGVyXCI+XFxuXFx0XFx0XFx0XFx0RXJyb3IgZW5jb3VudGVyZWQgd2hpbGUgY29tcHV0aW5nIHRoZSByZXN1bHRzOiA8YnI+XFxuXFx0XFx0XFx0XFx0JyArIGVyciArICdcXG5cXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHQnKS5tb2RhbCgnb3BlbicpO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdFdoZW4gdGhlIHNlcnZlciBpcyBwcm9jZXNzaW5nLCBzaG93IHRoZSBwcm9ncmVzcy5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnbG9hZGluZycsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGxvYWRpbmcoKSB7XG5cdFx0XHR2YXIgcGVyY2VudCA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogZmFsc2U7XG5cblx0XHRcdCQoJyNtb2RhbC1yZXN1bHRzIHAnKS5odG1sKCdcXG5cXG5cXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiY2VudGVyXCI+XFxuXFx0XFx0XFx0XFx0UGxlYXNlIHdhaXQgd2hpbGUgb3VyIHNlcnZlciBpcyBjb21wdXRpbmcgdGhlIHJlc3VsdHMuXFxuXFx0XFx0XFx0PC9kaXY+XFxuXFxuXFx0XFx0XFx0PGRpdiBjbGFzcz1cInByb2dyZXNzXCI+XFxuXFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cIicgKyAocGVyY2VudCA/ICdkZXRlcm1pbmF0ZVwiIHN0eWxlPVwid2lkdGg6ICcgKyBwZXJjZW50ICsgJyVcIicgOiAnaW5kZXRlcm1pbmF0ZVwiJykgKyAnPjwvZGl2PlxcblxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdCcpLm1vZGFsKCdvcGVuJyk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdFdoZW4gZXZlcnl0aGluZyBpcyBva2F5LCBkaXNwbGF5IHBhdGhzLCBzdGF0cyBhbmQgc2hvdyBhIHNpbXVsYXRpb24uXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ3Nob3dSZXN1bHRzJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gc2hvd1Jlc3VsdHMoZGF0YSkge1xuXG5cdFx0XHRjb25zb2xlLmluZm8oJ1Jlc3VsdHMgcmVjZWl2ZWQuJyk7XG5cblx0XHRcdC8vIEJ1aWxkaW5nIHRoZSBsaXN0IG9mIHBhdHJvbHMuXG5cblx0XHRcdHZhciBwYXRyb2xzVGFibGVIVE1MID0gJ1xcblxcdFxcdFxcdDx0YWJsZSBjbGFzcz1cInN0cmlwZWQgY2VudGVyZWRcIj5cXG5cXHRcXHRcXHRcXHQ8dGhlYWQ+XFxuXFx0XFx0XFx0XFx0XFx0PHRyPlxcblxcdFxcdFxcdFxcdFxcdFxcdDx0aD5QYXRyb2wgSUQ8L3RoPlxcblxcdFxcdFxcdFxcdFxcdFxcdDx0aD5wYXRoPC90aD5cXG5cXHRcXHRcXHRcXHRcXHQ8L3RyPlxcblxcdFxcdFxcdFxcdDwvdGhlYWQ+XFxuXFxuXFx0XFx0XFx0XFx0PHRib2R5Pic7XG5cblx0XHRcdGRhdGEucGF0cm9scy5mb3JFYWNoKGZ1bmN0aW9uIChwYXRyb2wsIGluZGV4KSB7XG5cblx0XHRcdFx0cGF0cm9sc1RhYmxlSFRNTCArPSAnXFxuXFx0XFx0XFx0XFx0PHRyPlxcblxcdFxcdFxcdFxcdFxcdDx0ZD4nICsgaW5kZXggKyAnPC90ZD5cXG5cXHRcXHRcXHRcXHRcXHQ8dGQ+JyArIHBhdHJvbC5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgdGFyZ2V0KSB7XG5cdFx0XHRcdFx0cmV0dXJuICcnICsgc3VtICsgdGFyZ2V0ICsgJyBcXHUyMUQyICc7XG5cdFx0XHRcdH0sICcnKS5zbGljZSgwLCAtMykgKyAnPC90ZD5cXG5cXHRcXHRcXHRcXHQ8L3RyPic7XG5cdFx0XHR9KTtcblxuXHRcdFx0cGF0cm9sc1RhYmxlSFRNTCArPSAnXFxuXFx0XFx0XFx0XFx0PC90Ym9keT5cXG5cXHRcXHRcXHQ8L3RhYmxlPic7XG5cblx0XHRcdC8vIFdlIGhhdmUgdG8gZmluZCB0aGUgYmVzdCBzdHJhdGVneS5cblxuXHRcdFx0dmFyIHN0YXRpc3RpY3NUYWJsZSA9IFtdO1xuXG5cdFx0XHRkYXRhLnN0cmF0ZWdpZXMuZm9yRWFjaChmdW5jdGlvbiAoc3RyYXRlZ3kpIHtcblxuXHRcdFx0XHR2YXIgYXZlcmFnZUd1YXJkaWFuVXRpbGl0eSA9IHN0cmF0ZWd5Lml0ZXJhdGlvbnMucmVkdWNlKGZ1bmN0aW9uIChzdW0sIGl0ZXJhdGlvbikge1xuXHRcdFx0XHRcdHJldHVybiBzdW0gKyBpdGVyYXRpb24uZ3VhcmRpYW5VdGlsaXR5O1xuXHRcdFx0XHR9LCAwKSAvIHN0cmF0ZWd5Lml0ZXJhdGlvbnMubGVuZ3RoO1xuXHRcdFx0XHR2YXIgYXZlcmFnZVJvYmJlclV0aWxpdHkgPSBzdHJhdGVneS5pdGVyYXRpb25zLnJlZHVjZShmdW5jdGlvbiAoc3VtLCBpdGVyYXRpb24pIHtcblx0XHRcdFx0XHRyZXR1cm4gc3VtICsgaXRlcmF0aW9uLnJvYmJlclV0aWxpdHk7XG5cdFx0XHRcdH0sIDApIC8gc3RyYXRlZ3kuaXRlcmF0aW9ucy5sZW5ndGg7XG5cblx0XHRcdFx0c3RhdGlzdGljc1RhYmxlLnB1c2goe1xuXHRcdFx0XHRcdGl0ZXJhdGlvbnM6IHN0cmF0ZWd5Lml0ZXJhdGlvbnMsXG5cdFx0XHRcdFx0cHJvYmFiaWxpdGllczogc3RyYXRlZ3kucHJvYmFiaWxpdGllcy5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgcHJvYmFiaWxpdHkpIHtcblx0XHRcdFx0XHRcdHJldHVybiAnJyArIHN1bSArIHByb2JhYmlsaXR5LnRvRml4ZWQoMikgKyAnIHwgJztcblx0XHRcdFx0XHR9LCAnJykuc2xpY2UoMCwgLTMpLFxuXHRcdFx0XHRcdGd1YXJkaWFuVXRpbGl0eTogYXZlcmFnZUd1YXJkaWFuVXRpbGl0eSxcblx0XHRcdFx0XHRyb2JiZXJVdGlsaXR5OiBhdmVyYWdlUm9iYmVyVXRpbGl0eSxcblx0XHRcdFx0XHRzdHJhdGVneTogc3RyYXRlZ3lcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dmFyIHNvcnRlZFN0YXRpc3RpY3NUYWJsZSA9IHN0YXRpc3RpY3NUYWJsZS5zb3J0KGZ1bmN0aW9uIChzMSwgczIpIHtcblx0XHRcdFx0cmV0dXJuIHMyLmd1YXJkaWFuVXRpbGl0eSAtIHMxLmd1YXJkaWFuVXRpbGl0eTtcblx0XHRcdH0pO1xuXG5cdFx0XHR2YXIgYmVzdFN0cmVhdGVneSA9IHNvcnRlZFN0YXRpc3RpY3NUYWJsZVswXS5zdHJhdGVneTtcblxuXHRcdFx0Ly8gV2UgZmVlZCB0aGUgY2hhcnQgd2l0aCBhdmVyYWdlIGV2b2x1dGlvbiBmb3IgdGhlIGJlc3Qgc3RyYXRlZ3kuXG5cblx0XHRcdHZhciBjaGFydERhdGEgPSBbXTtcblx0XHRcdHZhciBzdW0gPSAwO1xuXG5cdFx0XHRzb3J0ZWRTdGF0aXN0aWNzVGFibGVbMF0uaXRlcmF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVyYXRpb24pIHtcblxuXHRcdFx0XHRjaGFydERhdGEucHVzaCh7XG5cdFx0XHRcdFx0eDogY2hhcnREYXRhLmxlbmd0aCxcblx0XHRcdFx0XHR5OiAoc3VtICs9IGl0ZXJhdGlvbi5ndWFyZGlhblV0aWxpdHkpIC8gKGNoYXJ0RGF0YS5sZW5ndGggKyAxKVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBCdWlsZGluZyB0aGUgbGlzdCBvZiBzdGF0aXN0aWNzLlxuXG5cdFx0XHR2YXIgc3RhdGlzdGljc1RhYmxlSFRNTCA9ICdcXG5cXHRcXHRcXHQ8dGFibGUgY2xhc3M9XCJzdHJpcGVkIGNlbnRlcmVkXCI+XFxuXFx0XFx0XFx0XFx0PHRoZWFkPlxcblxcdFxcdFxcdFxcdFxcdDx0cj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8dGg+UHJvYmFiaWxpdGllczwvdGg+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPkd1YXJkaWFuIHV0aWxpdHk8L3RoPlxcblxcdFxcdFxcdFxcdFxcdFxcdDx0aD5Sb2JiZXIgdXRpbGl0eTwvdGg+XFxuXFx0XFx0XFx0XFx0XFx0PC90cj5cXG5cXHRcXHRcXHRcXHQ8L3RoZWFkPlxcblxcblxcdFxcdFxcdFxcdDx0Ym9keT4nO1xuXG5cdFx0XHRzb3J0ZWRTdGF0aXN0aWNzVGFibGUuZm9yRWFjaChmdW5jdGlvbiAoc3RyYXRlZ3kpIHtcblxuXHRcdFx0XHRzdGF0aXN0aWNzVGFibGVIVE1MICs9ICdcXG5cXHRcXHRcXHRcXHQ8dHI+XFxuXFx0XFx0XFx0XFx0XFx0PHRkPicgKyBzdHJhdGVneS5wcm9iYWJpbGl0aWVzICsgJzwvdGQ+XFxuXFx0XFx0XFx0XFx0XFx0PHRkPicgKyBOdW1iZXIoc3RyYXRlZ3kuZ3VhcmRpYW5VdGlsaXR5KS50b0ZpeGVkKDQpICsgJzwvdGQ+XFxuXFx0XFx0XFx0XFx0XFx0PHRkPicgKyBOdW1iZXIoc3RyYXRlZ3kucm9iYmVyVXRpbGl0eSkudG9GaXhlZCg0KSArICc8L3RkPlxcblxcdFxcdFxcdFxcdDwvdHI+Jztcblx0XHRcdH0pO1xuXG5cdFx0XHRzdGF0aXN0aWNzVGFibGVIVE1MICs9ICdcXG5cXHRcXHRcXHRcXHQ8L3Rib2R5PlxcblxcdFxcdFxcdDwvdGFibGU+JztcblxuXHRcdFx0JCgnI21vZGFsLXJlc3VsdHMgcCcpLmh0bWwoJ1xcblxcblxcdFxcdFxcdDxkaXYgY2xhc3M9XCJyb3dcIj5cXG5cXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiY29sIHMxMlwiPlxcblxcdFxcdFxcdFxcdFxcdDx1bCBjbGFzcz1cInRhYnNcIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8bGkgY2xhc3M9XCJ0YWIgY29sIHMzXCI+PGEgY2xhc3M9XCJhY3RpdmVcIiBocmVmPVwiI2NoYXJ0XCI+Q2hhcnQ8L2E+PC9saT5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8bGkgY2xhc3M9XCJ0YWIgY29sIHMzXCI+PGEgaHJlZj1cIiN2aXN1YWxpemF0aW9uXCI+VmlzdWFsaXphdGlvbjwvYT48L2xpPlxcblxcdFxcdFxcdFxcdFxcdFxcdDxsaSBjbGFzcz1cInRhYiBjb2wgczNcIj48YSBocmVmPVwiI3BhdHJvbHNcIj5QYXRyb2xzPC9hPjwvbGk+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGxpIGNsYXNzPVwidGFiIGNvbCBzM1wiPjxhIGhyZWY9XCIjc3RhdGlzdGljc1wiPlN0YXRpc3RpY3M8L2E+PC9saT5cXG5cXHRcXHRcXHRcXHRcXHQ8L3VsPlxcblxcdFxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdFxcdFxcdDxkaXYgaWQ9XCJjaGFydFwiIGNsYXNzPVwiY29sIHMxMlwiPlxcblxcdFxcdFxcdFxcdFxcdDxjYW52YXMgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiNDAwXCIgaWQ9XCJsaW5lLWNoYXJ0XCI+PC9jYW52YXM+XFxuXFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0XFx0PGRpdiBpZD1cInZpc3VhbGl6YXRpb25cIiBjbGFzcz1cImNvbCBzMTJcIj5cXG5cXHRcXHRcXHRcXHRcXHQ8ZGl2IGlkPVwibGl2ZVNpbXVsYXRpb25Mb2dcIj5JdGVyYXRpb24gcnVubmluZy4uLjwvZGl2PlxcblxcdFxcdFxcdFxcdFxcdDxkaXYgaWQ9XCJsaXZlU2ltdWxhdGlvblwiIGNsYXNzPVwiczEyXCI+XFxuXFx0XFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0XFx0PGRpdiBpZD1cInBhdHJvbHNcIiBjbGFzcz1cImNvbCBzMTJcIj5cXG5cXHRcXHRcXHRcXHRcXHQnICsgcGF0cm9sc1RhYmxlSFRNTCArICdcXG5cXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHQ8ZGl2IGlkPVwic3RhdGlzdGljc1wiIGNsYXNzPVwiY29sIHMxMlwiPlxcblxcdFxcdFxcdFxcdFxcdCcgKyBzdGF0aXN0aWNzVGFibGVIVE1MICsgJ1xcblxcdFxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdFxcdDwvZGl2PlxcblxcblxcdFxcdCcpLm1vZGFsKCdvcGVuJyk7XG5cblx0XHRcdCQoJyNtb2RhbC1yZXN1bHRzIHAgdWwudGFicycpLnRhYnMoKTtcblxuXHRcdFx0dmFyIHNjYXR0ZXJDaGFydCA9IG5ldyBDaGFydChcImxpbmUtY2hhcnRcIiwge1xuXHRcdFx0XHR0eXBlOiAnbGluZScsXG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRkYXRhc2V0czogW3tcblx0XHRcdFx0XHRcdGxhYmVsOiAnQmVzdCBzdHJhdGVneSB1dGlsaXR5IG92ZXIgdGltZS4nLFxuXHRcdFx0XHRcdFx0ZGF0YTogY2hhcnREYXRhXG5cdFx0XHRcdFx0fV1cblx0XHRcdFx0fSxcblx0XHRcdFx0b3B0aW9uczoge1xuXHRcdFx0XHRcdG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlLFxuXHRcdFx0XHRcdHNjYWxlczoge1xuXHRcdFx0XHRcdFx0eEF4ZXM6IFt7XG5cdFx0XHRcdFx0XHRcdHR5cGU6ICdsaW5lYXInLFxuXHRcdFx0XHRcdFx0XHRwb3NpdGlvbjogJ2JvdHRvbSdcblx0XHRcdFx0XHRcdH1dXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0bmV3IF9MaXZlU2ltdWxhdGlvbjIuZGVmYXVsdCh0aGlzLCBkYXRhLCBiZXN0U3RyZWF0ZWd5LCAnI2xpdmVTaW11bGF0aW9uJykucnVuKCk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblx0fV0pO1xuXG5cdHJldHVybiBSZXN1bHRzO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBSZXN1bHRzOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9HcmFwaCA9IHJlcXVpcmUoJy4vc2V0dGluZ3Mvc3Vic2V0dGluZ3MvR3JhcGguanMnKTtcblxudmFyIF9HcmFwaDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9HcmFwaCk7XG5cbnZhciBfUm9iYmVycyA9IHJlcXVpcmUoJy4vc2V0dGluZ3Mvc3Vic2V0dGluZ3MvUm9iYmVycy5qcycpO1xuXG52YXIgX1JvYmJlcnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUm9iYmVycyk7XG5cbnZhciBfU2F2ZXIgPSByZXF1aXJlKCcuL3NldHRpbmdzL2ZpbGVzL1NhdmVyJyk7XG5cbnZhciBfU2F2ZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2F2ZXIpO1xuXG52YXIgX0xvYWRlciA9IHJlcXVpcmUoJy4vc2V0dGluZ3MvZmlsZXMvTG9hZGVyJyk7XG5cbnZhciBfTG9hZGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0xvYWRlcik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8qXG4qXHRTZXR0aW5ncyBvZiB0aGUgc2ltdWxhdGlvbi5cbipcbipcdEluaXRpYWxpemUgc2V0dGluZ3Mgd2l0aCBkZWZhdWx0IHZhbHVlcy5cbiovXG5cbnZhciBTZXR0aW5ncyA9IGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gU2V0dGluZ3MoaWZhY2UpIHtcblx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2V0dGluZ3MpO1xuXG5cdFx0dGhpcy5pbnRlcmZhY2UgPSBpZmFjZTtcblxuXHRcdC8vIEZpZWxkc1xuXG5cdFx0dGhpcy5ncmFwaCA9IG5ldyBfR3JhcGgyLmRlZmF1bHQodGhpcyk7XG5cblx0XHR0aGlzLnJvYmJlcnMgPSBuZXcgX1JvYmJlcnMyLmRlZmF1bHQodGhpcyk7XG5cblx0XHR0aGlzLnNhdmVyID0gbmV3IF9TYXZlcjIuZGVmYXVsdCh0aGlzKTtcblx0XHR0aGlzLmxvYWRlciA9IG5ldyBfTG9hZGVyMi5kZWZhdWx0KHRoaXMpO1xuXG5cdFx0Ly8gRGVmYXVsdCB2YWx1ZXNcblxuXHRcdHRoaXMuaW5pdCgpO1xuXHRcdHRoaXMubG9hZGVyLmxvYWREZWZhdWx0KCk7XG5cdH1cblxuXHRfY3JlYXRlQ2xhc3MoU2V0dGluZ3MsIFt7XG5cdFx0a2V5OiAnaW5pdCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGluaXQoKSB7XG5cdFx0XHR0aGlzLmdyYXBoLmluaXQoKTtcblx0XHRcdHRoaXMucm9iYmVycy5pbml0KCk7XG5cdFx0XHQkKCcjbnVtYmVyT2ZJdGVyYXRpb25zJykudmFsKDIwKTtcblx0XHR9XG5cblx0XHQvKlxuICAqXHRSZXR1cm4gc2V0dGluZ3MgYXMgYXMgSlNPTiBvYmplY3QuXG4gICpcbiAgKlx0VGhvc2Ugc2V0dGluZ3MgY2FuIGJlIHNlbmQgdG8gdGhlIGJhY2tlbmQuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ2dldFNldHRpbmdzJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gZ2V0U2V0dGluZ3MoKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRnZW5lcmFsOiB0aGlzLmdldEdlbmVyYWxTZXR0aW5ncygpLFxuXHRcdFx0XHRwYXRoczogdGhpcy5ncmFwaC5nZXRTZXR0aW5ncygpLFxuXHRcdFx0XHRyb2JiZXJzOiB0aGlzLnJvYmJlcnMuZ2V0U2V0dGluZ3MoKVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHQvKlxuICAqXHRDb25jYXRlbmF0ZSB0aGUgZ2VuZXJhbCBzZXR0aW5ncyBpbiBvbmUgXG4gICpcdEpTT04gb2JqZWN0LlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdnZXRHZW5lcmFsU2V0dGluZ3MnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBnZXRHZW5lcmFsU2V0dGluZ3MoKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRudW1iZXJPZkl0ZXJhdGlvbnM6IHBhcnNlSW50KCQoJyNudW1iZXJPZkl0ZXJhdGlvbnMnKS52YWwoKSlcblx0XHRcdH07XG5cdFx0fVxuXHR9XSk7XG5cblx0cmV0dXJuIFNldHRpbmdzO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBTZXR0aW5nczsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBMaXZlU2ltdWxhdGlvbiA9IGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gTGl2ZVNpbXVsYXRpb24ocmVzdWx0cywgY29tcHV0ZWREYXRhLCBiZXN0U3RyZWF0ZWd5LCBzZWxlY3Rvcikge1xuXHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgTGl2ZVNpbXVsYXRpb24pO1xuXG5cdFx0dGhpcy5yZXN1bHRzID0gcmVzdWx0cztcblx0XHR0aGlzLm9yaWdpbmFsQ3kgPSB0aGlzLnJlc3VsdHMuaW50ZXJmYWNlLnNldHRpbmdzLmdyYXBoLmN5O1xuXHRcdHdpbmRvdy5saXZlU2ltdWxhdGlvbiA9IHRoaXM7XG5cblx0XHR0aGlzLmNvbXB1dGVkRGF0YSA9IGNvbXB1dGVkRGF0YTtcblx0XHR0aGlzLmJlc3RTdHJlYXRlZ3kgPSBiZXN0U3RyZWF0ZWd5O1xuXHRcdHRoaXMuc2VsZWN0b3IgPSBzZWxlY3RvcjtcblxuXHRcdHRoaXMuc3R5bGVzaGVldCA9IFt7XG5cdFx0XHRzZWxlY3RvcjogJ25vZGUnLFxuXHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0aGVpZ2h0OiAyMCxcblx0XHRcdFx0d2lkdGg6IDIwXG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0c2VsZWN0b3I6ICdlZGdlJyxcblx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdCdjdXJ2ZS1zdHlsZSc6ICdoYXlzdGFjaycsXG5cdFx0XHRcdCdoYXlzdGFjay1yYWRpdXMnOiAwLFxuXHRcdFx0XHR3aWR0aDogNSxcblx0XHRcdFx0b3BhY2l0eTogMC41LFxuXHRcdFx0XHQnbGluZS1jb2xvcic6ICdncmV5J1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdHNlbGVjdG9yOiAnLmJhc2UnLFxuXHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0J2JhY2tncm91bmQtY29sb3InOiAnIzYxYmZmYydcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRzZWxlY3RvcjogJy5zZWN1cmVkJyxcblx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdCdiYWNrZ3JvdW5kLWNvbG9yJzogJyM4MWM3ODQnXG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0c2VsZWN0b3I6ICcucm9iYmVkJyxcblx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdCdiYWNrZ3JvdW5kLWNvbG9yJzogJyNlNTczNzMnXG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0c2VsZWN0b3I6ICcuY2F1Z2h0Jyxcblx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdCdiYWNrZ3JvdW5kLWNvbG9yJzogJyNFNTczNzMnXG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0c2VsZWN0b3I6ICcuZ3VhcmRpYW4nLFxuXHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0aGVpZ2h0OiA0MCxcblx0XHRcdFx0d2lkdGg6IDQwLFxuXHRcdFx0XHQnYmFja2dyb3VuZC1pbWFnZSc6ICcvaW1nL2d1YXJkaWFuLTQwLnBuZycsXG5cdFx0XHRcdCdiYWNrZ3JvdW5kLW9wYWNpdHknOiAwXG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0c2VsZWN0b3I6ICcucm9iYmVyJyxcblx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdGhlaWdodDogNDAsXG5cdFx0XHRcdHdpZHRoOiA0MCxcblx0XHRcdFx0J2JhY2tncm91bmQtaW1hZ2UnOiAnL2ltZy9yb2JiZXItNDAucG5nJyxcblx0XHRcdFx0J2JhY2tncm91bmQtb3BhY2l0eSc6IDBcblx0XHRcdH1cblx0XHR9XTtcblxuXHRcdHRoaXMuY3kgPSBjeXRvc2NhcGUoe1xuXHRcdFx0Y29udGFpbmVyOiAkKHRoaXMuc2VsZWN0b3IpLFxuXG5cdFx0XHRib3hTZWxlY3Rpb25FbmFibGVkOiBmYWxzZSxcblx0XHRcdGF1dG91bnNlbGVjdGlmeTogZmFsc2UsXG5cblx0XHRcdHN0eWxlOiB0aGlzLnN0eWxlc2hlZXRcblx0XHR9KTtcblxuXHRcdHRoaXMuY3kubWluWm9vbSgwLjUpO1xuXHRcdHRoaXMuY3kubWF4Wm9vbSgyKTtcblxuXHRcdC8vIEltcG9ydCBub2RlcyBhbmQgdmVydGljZXMgZnJvbSBjeSBvYmplY3QuXG5cblx0XHR0aGlzLm9yaWdpbmFsQ3kubm9kZXMoKS5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG5cdFx0XHRfdGhpcy5jeS5hZGQoe1xuXHRcdFx0XHRkYXRhOiB7IGlkOiBub2RlLmlkKCkgfSxcblx0XHRcdFx0cG9zaXRpb246IG5vZGUucG9zaXRpb24oKSxcblx0XHRcdFx0Z3JvdXA6ICdub2RlcycsXG5cdFx0XHRcdGNsYXNzZXM6ICdub2RlJyArIChub2RlLmlkKCkgPT09ICcwJyA/ICcgYmFzZScgOiAnJyksXG5cdFx0XHRcdHNlbGVjdGFibGU6IGZhbHNlLFxuXHRcdFx0XHRsb2NrZWQ6IHRydWUsXG5cdFx0XHRcdGdyYWJiYWJsZTogZmFsc2Vcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5iYXNlID0gdGhpcy5jeS5ub2RlcygnW2lkID0gXCIwXCJdJyk7XG5cblx0XHR0aGlzLm9yaWdpbmFsQ3kuZWRnZXMoKS5mb3JFYWNoKGZ1bmN0aW9uIChlZGdlKSB7XG5cdFx0XHRfdGhpcy5jeS5hZGQoe1xuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0aWQ6IGVkZ2UuaWQoKSxcblx0XHRcdFx0XHRzb3VyY2U6IGVkZ2Uuc291cmNlKCkuaWQoKSxcblx0XHRcdFx0XHR0YXJnZXQ6IGVkZ2UudGFyZ2V0KCkuaWQoKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRncm91cDogJ2VkZ2VzJyxcblx0XHRcdFx0c2VsZWN0YWJsZTogZmFsc2UsXG5cdFx0XHRcdGxvY2tlZDogdHJ1ZSxcblx0XHRcdFx0Z3JhYmJhYmxlOiBmYWxzZVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHQvLyBBZGQgcm9iYmVyIGFuZCBndWFyZGlhbi5cblxuXHRcdHRoaXMuY3kuYWRkKHtcblx0XHRcdGRhdGE6IHsgaWQ6ICdyb2JiZXInIH0sXG5cdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHR4OiBNYXRoLmNvcyhuZXcgRGF0ZSgpIC8gMTAwMCkgKiAyMCxcblx0XHRcdFx0eTogTWF0aC5zaW4obmV3IERhdGUoKSAvIDEwMDApICogMjBcblx0XHRcdH0sXG5cdFx0XHRjbGFzc2VzOiAncm9iYmVyJyxcblx0XHRcdHNlbGVjdGFibGU6IGZhbHNlLFxuXHRcdFx0bG9ja2VkOiBmYWxzZSxcblx0XHRcdGdyYWJiYWJsZTogZmFsc2Vcblx0XHR9KTtcblxuXHRcdHRoaXMuY3kuYWRkKHtcblx0XHRcdGRhdGE6IHsgaWQ6ICdndWFyZGlhbicgfSxcblx0XHRcdHBvc2l0aW9uOiBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmN5Lm5vZGVzKCdbaWQgPSBcIjBcIl0nKS5wb3NpdGlvbigpKSxcblx0XHRcdGNsYXNzZXM6ICdndWFyZGlhbicsXG5cdFx0XHRzZWxlY3RhYmxlOiBmYWxzZSxcblx0XHRcdGxvY2tlZDogZmFsc2UsXG5cdFx0XHRncmFiYmFibGU6IGZhbHNlXG5cdFx0fSk7XG5cblx0XHR0aGlzLnJvYmJlciA9IHRoaXMuY3kubm9kZXMoJyNyb2JiZXInKTtcblx0XHR0aGlzLmd1YXJkaWFuID0gdGhpcy5jeS5ub2RlcygnI2d1YXJkaWFuJyk7XG5cdH1cblxuXHRfY3JlYXRlQ2xhc3MoTGl2ZVNpbXVsYXRpb24sIFt7XG5cdFx0a2V5OiAnbmV3SXRlcmF0aW9uJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gbmV3SXRlcmF0aW9uKCkge1xuXHRcdFx0dGhpcy5yb2JiZXJUYXJnZXQgPSB0aGlzLnJhbmRvbVRhcmdldCgpO1xuXHRcdFx0dGhpcy5pdGVyYXRpb25TdGFydCA9IG5ldyBEYXRlKCk7XG5cdFx0XHR0aGlzLmNvdW50ZG93biA9IE1hdGgucmFuZG9tKCkgKiAyNTAwICogdGhpcy5jeS5maWx0ZXIoJy5ub2RlJykubGVuZ3RoICsgMjUwMDtcblx0XHRcdHRoaXMuZ3VhcmRpYW5QYXRoID0gdGhpcy5yYW5kb21QYXRoKCk7XG5cdFx0XHR0aGlzLmd1YXJkaWFuTGFzdFZpc2l0ID0gdGhpcy5iYXNlO1xuXHRcdFx0dGhpcy5ndWFyZGlhbi5wb3NpdGlvbihPYmplY3QuYXNzaWduKHt9LCB0aGlzLmJhc2UucG9zaXRpb24oKSkpO1xuXHRcdFx0dGhpcy5ndWFyZGlhblRhcmdldCA9IHRoaXMubmV4dEd1YXJkaWFuVGFyZ2V0KHRydWUpO1xuXHRcdH1cblx0fSwge1xuXHRcdGtleTogJ25leHRTdGVwJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gbmV4dFN0ZXAoKSB7XG5cdFx0XHR2YXIgX3RoaXMyID0gdGhpcztcblxuXHRcdFx0Ly8gZml4IGEgYnVnIHdoZW4gZ3JhcGggaXMgbm90IHNob3dpbmcgb24gcGFnZSBjaGFuZ2UuXG5cdFx0XHR0aGlzLmN5LnJlc2l6ZSgpO1xuXHRcdFx0dGhpcy5jeS5maXQodGhpcy5jeS5maWx0ZXIoJy5ub2RlJykpO1xuXG5cdFx0XHQvLyBJZiB0aGUgdXNlciBkaXNtaXNzIHRoZSByZXN1bHRzLCB3ZSBzdG9wIHRoZSBzaW11bGF0aW9uLlxuXHRcdFx0aWYgKCQodGhpcy5zZWxlY3RvcikubGVuZ3RoID09PSAwKSByZXR1cm4gY29uc29sZS5pbmZvKCdMaXZlIHNpbXVsYXRpb24gc3RvcHBlZC4nKTtcblxuXHRcdFx0dmFyIGRlbHRhID0gKHRoaXMuaXRlcmF0aW9uU3RhcnQudmFsdWVPZigpICsgdGhpcy5jb3VudGRvd24gLSBuZXcgRGF0ZSgpLnZhbHVlT2YoKSkgLyA1MDtcblxuXHRcdFx0aWYgKGRlbHRhIDw9IDApIHJldHVybiB0aGlzLnJvYmJlckhpdFRhcmdldCgpO1xuXG5cdFx0XHR0aGlzLnJvYmJlci5wb3NpdGlvbih7XG5cdFx0XHRcdHg6IE1hdGguY29zKG5ldyBEYXRlKCkgLyAxMDAwKSAqIGRlbHRhICsgdGhpcy5yb2JiZXJUYXJnZXQucG9zaXRpb24oKS54LFxuXHRcdFx0XHR5OiBNYXRoLnNpbihuZXcgRGF0ZSgpIC8gMTAwMCkgKiBkZWx0YSArIHRoaXMucm9iYmVyVGFyZ2V0LnBvc2l0aW9uKCkueVxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnJvYmJlci5kYXRhKCdyZWZyZXNoJywgTWF0aC5yYW5kb20oKSk7XG5cblx0XHRcdHZhciBndWFyZGlhblBvc2l0aW9uID0gdGhpcy5ndWFyZGlhbi5wb3NpdGlvbigpO1xuXHRcdFx0dmFyIHRhcmdldFBvc2l0aW9uID0gdGhpcy5ndWFyZGlhblRhcmdldC5wb3NpdGlvbigpO1xuXG5cdFx0XHRndWFyZGlhblBvc2l0aW9uLnggPSBndWFyZGlhblBvc2l0aW9uLnggKiAwLjk1ICsgdGFyZ2V0UG9zaXRpb24ueCAqIDAuMDU7XG5cdFx0XHRndWFyZGlhblBvc2l0aW9uLnkgPSBndWFyZGlhblBvc2l0aW9uLnkgKiAwLjk1ICsgdGFyZ2V0UG9zaXRpb24ueSAqIDAuMDU7XG5cdFx0XHR0aGlzLmd1YXJkaWFuLmRhdGEoJ3JlZnJlc2gnLCBNYXRoLnJhbmRvbSgpKTtcblxuXHRcdFx0aWYgKChndWFyZGlhblBvc2l0aW9uLnggLSB0YXJnZXRQb3NpdGlvbi54KSAqKiAyICsgKGd1YXJkaWFuUG9zaXRpb24ueSAtIHRhcmdldFBvc2l0aW9uLnkpICoqIDIgPCA1KSB7XG5cdFx0XHRcdHRoaXMuZ3VhcmRpYW5UYXJnZXQuYWRkQ2xhc3MoJ3NlY3VyZWQnKTtcblx0XHRcdFx0dGhpcy5ndWFyZGlhbkxhc3RWaXNpdCA9IHRoaXMuZ3VhcmRpYW5UYXJnZXQ7XG5cdFx0XHRcdHZhciBuZXdHdWFyZGlhblRhcmdldCA9IHRoaXMubmV4dEd1YXJkaWFuVGFyZ2V0KCk7XG5cdFx0XHRcdGlmIChuZXdHdWFyZGlhblRhcmdldCAhPT0gbnVsbCkgdGhpcy5ndWFyZGlhblRhcmdldCA9IG5ld0d1YXJkaWFuVGFyZ2V0O1xuXHRcdFx0XHQvL2Vsc2UgXG5cdFx0XHRcdC8vXHRyZXR1cm4gdGhpcy5ldmVyeVRhcmdldElzU2VjdXJlZCgpXG5cdFx0XHR9XG5cblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gX3RoaXMyLm5leHRTdGVwKCk7XG5cdFx0XHR9LCA1MCk7XG5cdFx0fVxuXHR9LCB7XG5cdFx0a2V5OiAncm9iYmVySGl0VGFyZ2V0Jyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gcm9iYmVySGl0VGFyZ2V0KCkge1xuXHRcdFx0aWYgKCF0aGlzLnJvYmJlclRhcmdldC5oYXNDbGFzcygnc2VjdXJlZCcpKSB7XG5cdFx0XHRcdHRoaXMucm9iYmVyVGFyZ2V0LmFkZENsYXNzKCdyb2JiZWQnKTtcblx0XHRcdFx0JCgnI2xpdmVTaW11bGF0aW9uTG9nJykudGV4dCgnUm9iYmVkIScpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5yb2JiZXJUYXJnZXQucmVtb3ZlQ2xhc3MoJ3NlY3VyZWQnKS5hZGRDbGFzcygnY2F1Z2h0Jyk7XG5cdFx0XHRcdCQoJyNsaXZlU2ltdWxhdGlvbkxvZycpLnRleHQoJ0NhdWdodCEnKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuaXRlcmF0aW9uRW5kKCk7XG5cdFx0fVxuXHR9LCB7XG5cdFx0a2V5OiAncmFuZG9tUGF0aCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHJhbmRvbVBhdGgoKSB7XG5cdFx0XHR2YXIgX3RoaXMzID0gdGhpcztcblxuXHRcdFx0dmFyIGZhaXJEaWNlUm9sbCA9IE1hdGgucmFuZG9tKCk7XG5cblx0XHRcdHZhciBwYXRoTnVtYmVyID0gLTE7XG5cblx0XHRcdHdoaWxlIChmYWlyRGljZVJvbGwgPiAwKSB7XG5cdFx0XHRcdHBhdGhOdW1iZXIrKztcblx0XHRcdFx0ZmFpckRpY2VSb2xsIC09IHRoaXMuYmVzdFN0cmVhdGVneS5wcm9iYWJpbGl0aWVzW3BhdGhOdW1iZXJdO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcy5jb21wdXRlZERhdGEucGF0cm9sc1twYXRoTnVtYmVyXS5zbGljZSgxKS5tYXAoZnVuY3Rpb24gKG5vZGVJZCkge1xuXHRcdFx0XHRyZXR1cm4gX3RoaXMzLmN5Lm5vZGVzKCdbaWQgPSBcIicgKyBub2RlSWQgKyAnXCJdJylbMF07XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sIHtcblx0XHRrZXk6ICdpdGVyYXRpb25FbmQnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBpdGVyYXRpb25FbmQoKSB7XG5cdFx0XHR2YXIgX3RoaXM0ID0gdGhpcztcblxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdF90aGlzNC5jeS5ub2RlcygpLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gbm9kZS5yZW1vdmVDbGFzcygnc2VjdXJlZCcpLnJlbW92ZUNsYXNzKCdyb2JiZWQnKS5yZW1vdmVDbGFzcygnY2F1Z2h0Jyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRfdGhpczQucnVuKCk7XG5cdFx0XHRcdCQoJyNsaXZlU2ltdWxhdGlvbkxvZycpLnRleHQoJ0l0ZXJhdGlvbiBydW5uaW5nLi4uJyk7XG5cdFx0XHR9LCAxMDAwKTtcblx0XHR9XG5cdH0sIHtcblx0XHRrZXk6ICduZXh0R3VhcmRpYW5UYXJnZXQnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBuZXh0R3VhcmRpYW5UYXJnZXQoaW5pdCkge1xuXHRcdFx0aWYgKGluaXQpIHJldHVybiB0aGlzLmd1YXJkaWFuUGF0aFswXTtcblxuXHRcdFx0dmFyIGluZGV4ID0gdGhpcy5ndWFyZGlhblBhdGguaW5kZXhPZih0aGlzLmd1YXJkaWFuVGFyZ2V0KTtcblx0XHRcdGlmIChpbmRleCArIDEgPT09IHRoaXMuZ3VhcmRpYW5QYXRoLmxlbmd0aCkgcmV0dXJuIG51bGw7XG5cblx0XHRcdHJldHVybiB0aGlzLmd1YXJkaWFuUGF0aFtpbmRleCArIDFdO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdFRhcmdldCBnZXQgYWNjb3JkaW5nIHRvIHRoZSBkaXN0cmlidXRpb24gKHNlZSBSb2JiZXJzSW50ZXJlc3QpXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ3JhbmRvbVRhcmdldCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHJhbmRvbVRhcmdldCgpIHtcblx0XHRcdHZhciBkaXN0cmlidXRpb24gPSBbXTtcblx0XHRcdHRoaXMub3JpZ2luYWxDeS5ub2RlcygnW2lkICE9IFwiMFwiXScpLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBub2RlLmRhdGEoJ3JvYmJlcnNJbnRlcmVzdCcpOyBpKyspIHtcblx0XHRcdFx0XHRkaXN0cmlidXRpb24ucHVzaChub2RlLmlkKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0dmFyIHJhbmRvbUlkID0gZGlzdHJpYnV0aW9uW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGRpc3RyaWJ1dGlvbi5sZW5ndGgpXTtcblxuXHRcdFx0cmV0dXJuIHRoaXMuY3kubm9kZXMoJyMnICsgcmFuZG9tSWQpWzBdO1xuXHRcdH1cblx0fSwge1xuXHRcdGtleTogJ3J1bicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHJ1bigpIHtcblx0XHRcdHRoaXMubmV3SXRlcmF0aW9uKCk7XG5cdFx0XHR0aGlzLm5leHRTdGVwKCk7XG5cdFx0fVxuXHR9XSk7XG5cblx0cmV0dXJuIExpdmVTaW11bGF0aW9uO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBMaXZlU2ltdWxhdGlvbjsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLypcbipcdExvYWRlciBlbmFibGVzIHVzIHRvIGxvYWQgc2V0dGluZ3MgZnJvbSBhbiBvYmplY3Qgb3IgZnJvbSBhIGZpbGUuXG4qL1xuXG52YXIgTG9hZGVyID0gZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBMb2FkZXIoc2V0dGluZ3MpIHtcblx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgTG9hZGVyKTtcblxuXHRcdHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcblxuXHRcdHRoaXMuZGVmYXVsdFNldHRpbmdzID0ge1xuXHRcdFx0XCJnZW5lcmFsXCI6IHtcblx0XHRcdFx0XCJudW1iZXJPZkl0ZXJhdGlvbnNcIjogMjBcblx0XHRcdH0sXG5cdFx0XHRcInBhdGhzXCI6IHtcblx0XHRcdFx0XCJ2ZXJ0aWNlc1wiOiBbe1xuXHRcdFx0XHRcdFwiaWRcIjogMCxcblx0XHRcdFx0XHRcInBvc2l0aW9uXCI6IHtcblx0XHRcdFx0XHRcdFwieFwiOiA5My43NDcyMzgyMjE4MDQwOCxcblx0XHRcdFx0XHRcdFwieVwiOiAyMFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJyb2JiZXJzSW50ZXJlc3RcIjogMSxcblx0XHRcdFx0XHRcImd1YXJkaWFuc0Nvc3RcIjogMixcblx0XHRcdFx0XHRcImd1YXJkaWFuc1Jld2FyZFwiOiAxLFxuXHRcdFx0XHRcdFwicm9iYmVyU2V0dGluZ3NcIjoge1xuXHRcdFx0XHRcdFx0XCIwXCI6IHtcblx0XHRcdFx0XHRcdFx0XCJjb3N0XCI6IDIsXG5cdFx0XHRcdFx0XHRcdFwicmV3YXJkXCI6IDFcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRcImlkXCI6IDEsXG5cdFx0XHRcdFx0XCJwb3NpdGlvblwiOiB7XG5cdFx0XHRcdFx0XHRcInhcIjogMjAuMjUyNzYxNzc4MTk1OTE4LFxuXHRcdFx0XHRcdFx0XCJ5XCI6IDIwXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcInJvYmJlcnNJbnRlcmVzdFwiOiAxLFxuXHRcdFx0XHRcdFwiZ3VhcmRpYW5zQ29zdFwiOiAyLFxuXHRcdFx0XHRcdFwiZ3VhcmRpYW5zUmV3YXJkXCI6IDEsXG5cdFx0XHRcdFx0XCJyb2JiZXJTZXR0aW5nc1wiOiB7XG5cdFx0XHRcdFx0XHRcIjBcIjoge1xuXHRcdFx0XHRcdFx0XHRcImNvc3RcIjogMixcblx0XHRcdFx0XHRcdFx0XCJyZXdhcmRcIjogMVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fV0sXG5cdFx0XHRcdFwiZWRnZXNcIjogW3tcblx0XHRcdFx0XHRcInNvdXJjZVwiOiAwLFxuXHRcdFx0XHRcdFwidGFyZ2V0XCI6IDEsXG5cdFx0XHRcdFx0XCJsZW5ndGhcIjogNzMuNDk0NDc2NDQzNjA4MTZcblx0XHRcdFx0fV1cblx0XHRcdH0sXG5cdFx0XHRcInJvYmJlcnNcIjoge1xuXHRcdFx0XHRcImxpc3RcIjogWzBdLFxuXHRcdFx0XHRcImNhdGNoUHJvYmFiaWxpdHlcIjoge1xuXHRcdFx0XHRcdFwiMFwiOiAwLjVcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHQvKlxuICpcdExvYWQgdGhlIHNldHRpbmdzIChPYmplY3QpIGFmdGVyIGNoZWNraW5nIGlmIHRoZXkgYXJlIGNvcnJ1cHRlZCBvciBub3QuXG4gKi9cblxuXG5cdF9jcmVhdGVDbGFzcyhMb2FkZXIsIFt7XG5cdFx0a2V5OiBcImxvYWRcIixcblx0XHR2YWx1ZTogZnVuY3Rpb24gbG9hZChzZXR0aW5ncykge1xuXHRcdFx0dmFyIF90aGlzID0gdGhpcztcblxuXHRcdFx0Ly8gVE9ETyA6IFZlcmlmeSBpbnRlZ3JpdHkuXG5cdFx0XHR0aGlzLnNldHRpbmdzLmluaXQoKTtcblxuXHRcdFx0JCgnI251bWJlck9mSXRlcmF0aW9ucycpLnZhbChzZXR0aW5ncy5nZW5lcmFsLm51bWJlck9mSXRlcmF0aW9ucyk7XG5cblx0XHRcdC8vIElkIG1hcHMgKGxvYWRlZCBpZHMgPT4gY3VycmVudCBpZHMpXG5cblx0XHRcdHZhciB2ZXJ0aWNlc0lkTWFwID0gbmV3IE1hcCgpO1xuXHRcdFx0dmFyIHJvYmJlcnNJZE1hcCA9IG5ldyBNYXAoKTtcblxuXHRcdFx0c2V0dGluZ3Mucm9iYmVycy5saXN0LmZvckVhY2goZnVuY3Rpb24gKHJvYmJlcklkKSB7XG5cdFx0XHRcdHJvYmJlcnNJZE1hcC5zZXQocm9iYmVySWQsIF90aGlzLnNldHRpbmdzLnJvYmJlcnMubmV3Um9iYmVyKDEgLSBzZXR0aW5ncy5yb2JiZXJzLmNhdGNoUHJvYmFiaWxpdHlbXCJcIiArIHJvYmJlcklkXSkpO1xuXHRcdFx0fSk7XG5cblx0XHRcdHNldHRpbmdzLnBhdGhzLnZlcnRpY2VzLmZvckVhY2goZnVuY3Rpb24gKHZlcnRleCkge1xuXG5cdFx0XHRcdHZlcnRpY2VzSWRNYXAuc2V0KHZlcnRleC5pZCwgX3RoaXMuc2V0dGluZ3MuZ3JhcGguYWRkTm9kZSh2ZXJ0ZXgucG9zaXRpb24sIHZlcnRleC5pZCA9PT0gMCwgdmVydGV4LnJvYmJlcnNJbnRlcmVzdCwgdmVydGV4Lmd1YXJkaWFuc0Nvc3QsIHZlcnRleC5ndWFyZGlhbnNSZXdhcmQpKTtcblxuXHRcdFx0XHR2YXIgbmV3Tm9kZUlkID0gdmVydGljZXNJZE1hcC5nZXQodmVydGV4LmlkKTtcblxuXHRcdFx0XHRzZXR0aW5ncy5yb2JiZXJzLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAocm9iYmVySWQpIHtcblx0XHRcdFx0XHR2YXIgbmV3Um9iYmVySWQgPSByb2JiZXJzSWRNYXAuZ2V0KHJvYmJlcklkKTtcblxuXHRcdFx0XHRcdF90aGlzLnNldHRpbmdzLmdyYXBoLmN5Lm5vZGVzKFwiW2lkID0gXFxcIlwiICsgbmV3Tm9kZUlkICsgXCJcXFwiXVwiKS5kYXRhKCdyb2JiZXJTZXR0aW5ncycpLnNldChuZXdSb2JiZXJJZCwgdmVydGV4LnJvYmJlclNldHRpbmdzW3JvYmJlcklkXSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdHNldHRpbmdzLnBhdGhzLmVkZ2VzLmZvckVhY2goZnVuY3Rpb24gKGVkZ2UpIHtcblx0XHRcdFx0X3RoaXMuc2V0dGluZ3MuZ3JhcGgubGluayh2ZXJ0aWNlc0lkTWFwLmdldChlZGdlLnNvdXJjZSksIHZlcnRpY2VzSWRNYXAuZ2V0KGVkZ2UudGFyZ2V0KSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5zZXR0aW5ncy5ncmFwaC5jeS5maXQoKTtcblxuXHRcdFx0Y29uc29sZS5sb2coJ1NldHRpbmdzIGxvYWRlZCcpO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdExvYWQgdGhlIHNldHRpbmdzIG9iamVjdCBmcm9tIGEgSlNPTiBmaWxlIG9uIGNsaWVudCdzIGNvbXB1dGVyLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6IFwiaW1wb3J0XCIsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIF9pbXBvcnQoKSB7XG5cdFx0XHR2YXIgX3RoaXMyID0gdGhpcztcblxuXHRcdFx0dmFyIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcblx0XHRcdGlucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsICdmaWxlJyk7XG5cblx0XHRcdGlucHV0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cblx0XHRcdGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uIChldmVudCkge1xuXG5cdFx0XHRcdHZhciBmaWxlID0gaW5wdXQuZmlsZXNbMF07XG5cblx0XHRcdFx0dmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0XHRcdHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdFx0XHRfdGhpczIubG9hZChKU09OLnBhcnNlKGF0b2IoZXZlbnQudGFyZ2V0LnJlc3VsdC5zcGxpdCgnLCcpLnBvcCgpKSkpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuXG5cdFx0XHRcdGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoaW5wdXQpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuXG5cdFx0XHRpbnB1dC5jbGljaygpO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdEluaXRpYWxpemUgdGhlIGdyYXBoIGJ5IHNldHRpbmcgZGVmYXVsdCB2YWx1ZXMuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogXCJsb2FkRGVmYXVsdFwiLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBsb2FkRGVmYXVsdCgpIHtcblx0XHRcdHRoaXMubG9hZCh0aGlzLmRlZmF1bHRTZXR0aW5ncyk7XG5cdFx0fVxuXHR9XSk7XG5cblx0cmV0dXJuIExvYWRlcjtcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gTG9hZGVyOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFNhdmVyID0gZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBTYXZlcihzZXR0aW5ncykge1xuXHRcdF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTYXZlcik7XG5cblx0XHR0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG5cdH1cblxuXHRfY3JlYXRlQ2xhc3MoU2F2ZXIsIFt7XG5cdFx0a2V5OiAnc2F2ZScsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHNhdmUoKSB7XG5cblx0XHRcdHZhciBkYXRlID0gbmV3IERhdGUoKTtcblxuXHRcdFx0dGhpcy5kb3dubG9hZChkYXRlLnRvTG9jYWxlRGF0ZVN0cmluZygpICsgJy0nICsgZGF0ZS50b0xvY2FsZVRpbWVTdHJpbmcoKS5yZXBsYWNlKCc6JywgJy0nKSArICcuanNvbicsIEpTT04uc3RyaW5naWZ5KHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZ3MoKSkpO1xuXHRcdH1cblx0fSwge1xuXHRcdGtleTogJ2Rvd25sb2FkJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gZG93bmxvYWQoZmlsZW5hbWUsIHRleHQpIHtcblx0XHRcdHZhciBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuXHRcdFx0bGluay5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCAnZGF0YTp0ZXh0L2pzb247Y2hhcnNldD11dGYtOCwnICsgZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpKTtcblx0XHRcdGxpbmsuc2V0QXR0cmlidXRlKCdkb3dubG9hZCcsIGZpbGVuYW1lKTtcblxuXHRcdFx0bGluay5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKTtcblxuXHRcdFx0bGluay5jbGljaygpO1xuXG5cdFx0XHRkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGxpbmspO1xuXHRcdH1cblx0fV0pO1xuXG5cdHJldHVybiBTYXZlcjtcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gU2F2ZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcblx0dmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7IHZhciBfYXJyID0gW107IHZhciBfbiA9IHRydWU7IHZhciBfZCA9IGZhbHNlOyB2YXIgX2UgPSB1bmRlZmluZWQ7IHRyeSB7IGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHsgX2Fyci5wdXNoKF9zLnZhbHVlKTsgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrOyB9IH0gY2F0Y2ggKGVycikgeyBfZCA9IHRydWU7IF9lID0gZXJyOyB9IGZpbmFsbHkgeyB0cnkgeyBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdKSBfaVtcInJldHVyblwiXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH0gcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGkpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyByZXR1cm4gYXJyOyB9IGVsc2UgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkgeyByZXR1cm4gc2xpY2VJdGVyYXRvcihhcnIsIGkpOyB9IGVsc2UgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTsgfSB9OyB9KCk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8qXG4qXHRDbGFzcyByZXByZXNlbnRpbmcgdGhlIGdyYXBoIG9mIHRoZSBzaW11bGF0aW9uLlxuKlxuKlx0WW91IGNhbiBhZGQgdGFyZ2V0cywgZGVsZXRlIHRhcmdldHMsIGFuZCBsaW5rXG4qXHR0aGVtIHRvZ2V0aGVyLlxuKlxuKlx0Rm9yIGVhY2ggdGFyZ2V0LCB5b3UgY2FuIHNldCA6XG4qXHRcdC0gcm9iYmVyc0ludGVyZXN0ICh0aGUgcHJvYmFiaWxpdHkgb2Ygcm9iYmVycyBhdHRhY2tpbmcgdGhpcyB0YXJnZXQpXG4qXHRcdC0gZ3VhcmRpYW5zQ29zdCAodGhlIGNvc3Qgd2hlbiBndWFyZGlhbnMgZmFpbCB0byBwcm90ZWN0IHRoZSB0YXJnZXQpXG4qXHRcdC0gZ3VhcmRpYW5zUmV3YXJkICh0aGUgcmV3YXJkIHdoZW4gZ3VhcmRpYW5zIG1hbmFnZSB0byBwcmV2ZW50IFxuKlx0XHRcdFx0XHRcdFx0YW4gYXR0YWNrKVxuKlx0XHQtIHJvYmJlclNldHRpbmdzICh0aGUgY29zdCwgcmV3YXJkIGFuZCBwcm9iYWJpbGl0eSBmb3IgZWFjaCByb2JiZXIpXG4qXHRcdFx0KFNldCB0aHJvdWdoIHRoZSBSb2JiZXJzIGNsYXNzKVxuKlxuKlx0Tm9kZXMgPSBBdHRhY2tzID0gVGFyZ2V0c1xuKi9cblxudmFyIEdyYXBoID0gZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBHcmFwaChzZXR0aW5ncykge1xuXHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgR3JhcGgpO1xuXG5cdFx0Ly8gRmllbGRzXG5cblx0XHR0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG5cblx0XHR0aGlzLnN0eWxlc2hlZXQgPSBbe1xuXHRcdFx0c2VsZWN0b3I6ICdub2RlJyxcblx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdGhlaWdodDogMjAsXG5cdFx0XHRcdHdpZHRoOiAyMCxcblx0XHRcdFx0J2JhY2tncm91bmQtY29sb3InOiAnbWFwRGF0YShyb2JiZXJzSW50ZXJlc3QsIDAsIDI1LCBncmVlbiwgcmVkKScsXG5cdFx0XHRcdGNvbnRlbnQ6IGZ1bmN0aW9uIGNvbnRlbnQobm9kZSkge1xuXHRcdFx0XHRcdHJldHVybiAnTicgKyBub2RlLmRhdGEoJ2lkJykgKyAnIEMnICsgbm9kZS5kYXRhKCdndWFyZGlhbnNDb3N0JykgKyAnL1InICsgbm9kZS5kYXRhKCdndWFyZGlhbnNSZXdhcmQnKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0Ly8ndGV4dC12YWxpZ24nOiAnY2VudGVyJyxcblx0XHRcdFx0J3RleHQtaGFsaWduJzogJ2NlbnRlcidcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRzZWxlY3RvcjogJ2VkZ2UnLFxuXHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0J2N1cnZlLXN0eWxlJzogJ2hheXN0YWNrJyxcblx0XHRcdFx0J2hheXN0YWNrLXJhZGl1cyc6IDAsXG5cdFx0XHRcdHdpZHRoOiA1LFxuXHRcdFx0XHRvcGFjaXR5OiAwLjUsXG5cdFx0XHRcdCdsaW5lLWNvbG9yJzogJyNhMmVmYTInLFxuXHRcdFx0XHRjb250ZW50OiBmdW5jdGlvbiBjb250ZW50KGVkZ2UpIHtcblx0XHRcdFx0XHRyZXR1cm4gTWF0aC5mbG9vcihfdGhpcy5sZW5ndGgoZWRnZSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0c2VsZWN0b3I6ICcuYmFzZScsXG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHQnYmFja2dyb3VuZC1jb2xvcic6ICcjNjFiZmZjJyxcblx0XHRcdFx0bGFiZWw6ICdCYXNlJ1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdHNlbGVjdG9yOiAnOnNlbGVjdGVkJyxcblx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdCdib3JkZXItd2lkdGgnOiA0LFxuXHRcdFx0XHQnYm9yZGVyLWNvbG9yJzogJ3B1cnBsZSdcblx0XHRcdH1cblx0XHR9XTtcblxuXHRcdHRoaXMuY3kgPSB3aW5kb3cuY3kgPSBjeXRvc2NhcGUoe1xuXHRcdFx0Y29udGFpbmVyOiAkKCcjZ3JhcGgnKSxcblxuXHRcdFx0Ym94U2VsZWN0aW9uRW5hYmxlZDogZmFsc2UsXG5cdFx0XHRhdXRvdW5zZWxlY3RpZnk6IGZhbHNlLFxuXG5cdFx0XHRzdHlsZTogdGhpcy5zdHlsZXNoZWV0XG5cdFx0fSk7XG5cblx0XHR0aGlzLmN5Lm1pblpvb20oMC41KTtcblx0XHR0aGlzLmN5Lm1heFpvb20oMik7XG5cblx0XHR3aW5kb3cuZ3JhcGggPSB0aGlzO1xuXG5cdFx0Ly8gUmVmcmVzaGluZyB0aGUgbGVuZ3RoXG5cblx0XHR0aGlzLnJlZnJlc2hJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBjeS5lZGdlcygpLmZvckVhY2goZnVuY3Rpb24gKGVkZ2UpIHtcblx0XHRcdFx0cmV0dXJuIGVkZ2UuZGF0YSgncmVmcmVzaCcsIE1hdGgucmFuZG9tKCkpO1xuXHRcdFx0fSk7XG5cdFx0fSwgMjUwKTtcblxuXHRcdC8vIERPTSBsaXN0ZW5lcnNcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucXRpcC1jb250ZW50IC5saW5rJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRjb25zb2xlLmluZm8oXCJMaW5raW5nIGEgdGFyZ2V0IHRvIGFub3RoZXIuLi5cIik7XG5cdFx0XHRfdGhpcy5jdXJyZW50QWN0aW9uID0gJ2xpbmtpbmcnO1xuXHRcdFx0JCgnLnF0aXAnKS5xdGlwKCdoaWRlJyk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnF0aXAtY29udGVudCAuZGVsZXRlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLnJlbW92ZSgpO1xuXHRcdFx0X3RoaXMucmVzZXQoKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucXRpcC1jb250ZW50IC5kaXNtaXNzJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRfdGhpcy5yZXNldCgpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5xdGlwLWNvbnRlbnQgLnBsdXNJbnRlcmVzdCcsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0X3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdyb2JiZXJzSW50ZXJlc3QnLCBNYXRoLm1pbihfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ3JvYmJlcnNJbnRlcmVzdCcpICsgMSwgMjUpKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucXRpcC1jb250ZW50IC5taW51c0ludGVyZXN0JywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ3JvYmJlcnNJbnRlcmVzdCcsIE1hdGgubWF4KF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgncm9iYmVyc0ludGVyZXN0JykgLSAxLCAwKSk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnF0aXAtY29udGVudCAucGx1c0Nvc3QnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgnZ3VhcmRpYW5zQ29zdCcsIE1hdGgubWluKF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgnZ3VhcmRpYW5zQ29zdCcpICsgMSwgMjUpKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucXRpcC1jb250ZW50IC5taW51c0Nvc3QnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgnZ3VhcmRpYW5zQ29zdCcsIE1hdGgubWF4KF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgnZ3VhcmRpYW5zQ29zdCcpIC0gMSwgMCkpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5xdGlwLWNvbnRlbnQgLnBsdXNSZXdhcmQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgnZ3VhcmRpYW5zUmV3YXJkJywgTWF0aC5taW4oX3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdndWFyZGlhbnNSZXdhcmQnKSArIDEsIDI1KSk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnF0aXAtY29udGVudCAubWludXNSZXdhcmQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgnZ3VhcmRpYW5zUmV3YXJkJywgTWF0aC5tYXgoX3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdndWFyZGlhbnNSZXdhcmQnKSAtIDEsIDApKTtcblx0XHR9KTtcblxuXHRcdC8vIEN5dG9zY2FwZSBsaXN0ZW5lcnNcblxuXHRcdHRoaXMuY3kub24oJ3RhcCcsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0aWYgKGV2ZW50LnRhcmdldCA9PT0gZXZlbnQuY3kpIF90aGlzLnJlc2V0KCk7XG5cdFx0XHQvLyBXaGVuIHlvdSB0YXAgb24gdGhlIGJhY2tncm91bmQgYW5kIHRoYXQgdGhlcmUgYXJlIG5vIHZpc2libGUgdGlwcywgeW91IGFkZCBhIG5ldyBub2RlIGF0IHRoaXMgcG9zaXRpb24uXG5cdFx0XHQvLyBJZiBhIHRpcCBpcyB2aXNpYmxlLCB5b3UgcHJvYmFibHkganVzdCB3YW50IHRvIGRpc21pc3MgaXRcblx0XHRcdGlmIChldmVudC50YXJnZXQgPT09IGV2ZW50LmN5ICYmICEkKCcucXRpcDp2aXNpYmxlJykubGVuZ3RoKSB7XG5cdFx0XHRcdHJldHVybiBfdGhpcy5hZGROb2RlKGV2ZW50LnBvc2l0aW9uKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHRoaXMuY3kub24oJ3RhcCcsICdub2RlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRpZiAoX3RoaXMuY3VycmVudEFjdGlvbiA9PT0gJ2xpbmtpbmcnKSB7XG5cdFx0XHRcdF90aGlzLmN1cnJlbnRBY3Rpb24gPSBudWxsO1xuXHRcdFx0XHR2YXIgc2Vjb25kTm9kZSA9IGV2ZW50LnRhcmdldDtcblx0XHRcdFx0Ly8gV2UgY2hlY2sgaWYgdGhhdCBlZGdlIGFsZWFkeSBleGlzdHMgb3IgaWYgdGhlIHNvdXJjZSBhbmQgdGFyZ2V0IGFyZSB0aGUgc2FtZSBub2RlLlxuXHRcdFx0XHRpZiAoIV90aGlzLmN5LmVsZW1lbnRzKCdlZGdlW3NvdXJjZSA9IFwiJyArIF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuaWQoKSArICdcIl1bdGFyZ2V0ID0gXCInICsgc2Vjb25kTm9kZS5pZCgpICsgJ1wiXScpLmxlbmd0aCAmJiAhX3RoaXMuY3kuZWxlbWVudHMoJ2VkZ2VbdGFyZ2V0ID0gXCInICsgX3RoaXMubGFzdFNlbGVjdGVkTm9kZS5pZCgpICsgJ1wiXVtzb3VyY2UgPSBcIicgKyBzZWNvbmROb2RlLmlkKCkgKyAnXCJdJykubGVuZ3RoICYmIHNlY29uZE5vZGUgIT0gX3RoaXMubGFzdFNlbGVjdGVkTm9kZSkge1xuXHRcdFx0XHRcdF90aGlzLmxpbmsoX3RoaXMubGFzdFNlbGVjdGVkTm9kZS5pZCgpLCBzZWNvbmROb2RlLmlkKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdF90aGlzLmxhc3RTZWxlY3RlZE5vZGUgPSBldmVudC50YXJnZXQ7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmN5Lm9uKCd0YXAnLCAnZWRnZScsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0ZXZlbnQudGFyZ2V0LnJlbW92ZSgpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gZml4IGEgYnVnIHdoZW4gdGFwIGRvZXNuJ3Qgd29yayBvbiBwYWdlIGNoYW5nZS5cblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0cmV0dXJuIF90aGlzLmN5LnJlc2l6ZSgpO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5pbml0KCk7XG5cdH1cblxuXHQvKlxuICpcdEluaXRpYWxpemUgdGhlIGdyYXBoIGJ5IHNldHRpbmcgZGVmYXVsdCB2YWx1ZXMuXG4gKi9cblxuXG5cdF9jcmVhdGVDbGFzcyhHcmFwaCwgW3tcblx0XHRrZXk6ICdpbml0Jyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gaW5pdCgpIHtcblx0XHRcdHRoaXMubmJyRWRnZXNDcmVhdGVkID0gMDtcblx0XHRcdHRoaXMubmJyTm9kZXNDcmVhdGVkID0gMDtcblxuXHRcdFx0dGhpcy5sYXN0U2VsZWN0ZWROb2RlID0gbnVsbDtcblx0XHRcdHRoaXMuY3VycmVudEFjdGlvbiA9IG51bGw7XG5cblx0XHRcdHRoaXMuY3kuZWxlbWVudHMoKS5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0XHRcdHJldHVybiBlbGVtZW50LnJlbW92ZSgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0U29ydCB0YXJnZXRzIHdpdGggdGhlIENvU0UgbGF5b3V0IChieSBCaWxrZW50IFVuaXZlcnNpdHkpLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdzb3J0Jyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gc29ydCgpIHtcblx0XHRcdHRoaXMuY3kubGF5b3V0KHtcblx0XHRcdFx0bmFtZTogJ2Nvc2UtYmlsa2VudCcsXG5cdFx0XHRcdGFuaW1hdGU6IHRydWVcblx0XHRcdH0pLnJ1bigpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRSZXNldCB0aGUgY3VycmVudCBhY3Rpb24sIHNlbGVjdGVkIHRhcmdldCBhbmQgaGlkZSB0aGUgdGlwcy5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAncmVzZXQnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiByZXNldCgpIHtcblx0XHRcdHRoaXMubGFzdFNlbGVjdGVkTm9kZSA9IG51bGw7XG5cdFx0XHR0aGlzLmN1cnJlbnRBY3Rpb24gPSBudWxsO1xuXHRcdFx0JCgnLnF0aXAnKS5xdGlwKCdoaWRlJyk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdExpbmsgdHdvIHRhcmdldHMgdG9nZXRoZXIuIFlvdSBoYXZlIHRvIHNwZWNpZnkgdGhlIGlkcy5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnbGluaycsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGxpbmsoc291cmNlLCB0YXJnZXQpIHtcblx0XHRcdHRoaXMuY3kuYWRkKHtcblx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdGlkOiAnZScgKyB0aGlzLm5ickVkZ2VzQ3JlYXRlZCsrLFxuXHRcdFx0XHRcdHNvdXJjZTogc291cmNlLFxuXHRcdFx0XHRcdHRhcmdldDogdGFyZ2V0XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGdyb3VwOiAnZWRnZXMnLFxuXHRcdFx0XHRzZWxlY3RhYmxlOiB0cnVlLFxuXHRcdFx0XHRsb2NrZWQ6IGZhbHNlLFxuXHRcdFx0XHRncmFiYmFibGU6IHRydWUsXG5cdFx0XHRcdGNsYXNzZXM6ICcnXG5cdFx0XHR9KTtcblx0XHRcdGNvbnNvbGUuaW5mbygnRWRnZSBhZGRlZCBsaW5raW5nICcgKyBzb3VyY2UgKyAnIHRvICcgKyB0YXJnZXQgKyAnLicpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRBZGQgYSBub2RlIHRvIHRoZSBncmFwaC5cbiAgKlx0XG4gICpcdEFyZ3VtZW50cyA6XG4gICpcdFx0LSBwb3NpdGlvbiBzaG91bGQgYmUgYW4gb2JqZWN0IHdpdGggZmllbGRzIHggYW5kIHkuXG4gICpcdFx0LSBiYXNlIGlzIGEgYm9vbGVhbiBkZWZpbmluZyBpZiB0aGUgbm9kZSBpcyB0aGUgYmFzZS5cbiAgKlxuICAqXHRCYXNlIG5vZGVzIGNhbiBub3QgYmVlbiBhdHRhY2tldCBub3IgZGVmZW5kZWQuXG4gICpcdFBhdHJvbHMgaGF2ZSB0byBzdGFydCBhbmQgZW5kIGF0IHRoZSBiYXNlLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdhZGROb2RlJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gYWRkTm9kZSgpIHtcblx0XHRcdHZhciBwb3NpdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogeyB4OiAwLCB5OiAwIH07XG5cdFx0XHR2YXIgYmFzZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZmFsc2U7XG5cdFx0XHR2YXIgcm9iYmVyc0ludGVyZXN0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiAxO1xuXHRcdFx0dmFyIGd1YXJkaWFuc0Nvc3QgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IDI7XG5cdFx0XHR2YXIgZ3VhcmRpYW5zUmV3YXJkID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiAxO1xuXG5cdFx0XHR2YXIgbmV3Tm9kZUlkID0gdGhpcy5jeS5ub2RlcygpLmxlbmd0aDtcblxuXHRcdFx0dmFyIG5ld05vZGUgPSB0aGlzLmN5LmFkZCh7XG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRpZDogbmV3Tm9kZUlkLFxuXHRcdFx0XHRcdHJvYmJlcnNJbnRlcmVzdDogcm9iYmVyc0ludGVyZXN0LFxuXHRcdFx0XHRcdGd1YXJkaWFuc0Nvc3Q6IGd1YXJkaWFuc0Nvc3QsXG5cdFx0XHRcdFx0Z3VhcmRpYW5zUmV3YXJkOiBndWFyZGlhbnNSZXdhcmQsXG5cdFx0XHRcdFx0cm9iYmVyU2V0dGluZ3M6IG5ldyBNYXAoKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwb3NpdGlvbjogcG9zaXRpb24sXG5cdFx0XHRcdGdyb3VwOiAnbm9kZXMnLFxuXHRcdFx0XHRzZWxlY3RhYmxlOiB0cnVlLFxuXHRcdFx0XHRsb2NrZWQ6IGZhbHNlLFxuXHRcdFx0XHRncmFiYmFibGU6IHRydWUsXG5cdFx0XHRcdGNsYXNzZXM6IGJhc2UgPyAnYmFzZScgOiAnJ1xuXHRcdFx0fSkucXRpcCh7XG5cdFx0XHRcdGNvbnRlbnQ6ICdcXG5cXHRcXHRcXHQ8ZGl2PlxcblxcdFxcdFxcdFxcdDxhIGNsYXNzPVwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biBibHVlIGxpbmtcIiBzdHlsZT1cIndpZHRoOjE2MHB4XCI+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29ucyByaWdodFwiPnRpbWVsaW5lPC9pPkxpbmsgdG8uLi48L2E+XFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIHJlZCBkZWxldGVcIiBzdHlsZT1cIndpZHRoOjE2MHB4OyBtYXJnaW4tdG9wOiAxMHB4XCIgJyArIChiYXNlID8gJ2Rpc2FibGVkJyA6ICcnKSArICc+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29ucyByaWdodFwiPmRlbGV0ZTwvaT5EZWxldGU8L2E+XFxuXFx0XFx0XFx0XFx0XFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIHJlZCBsaWdodGVuLTIgbWludXNJbnRlcmVzdCBjb2xcIiAnICsgKGJhc2UgPyAnZGlzYWJsZWQnIDogJycpICsgJz48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+cmVtb3ZlX2NpcmNsZTwvaT48L2E+XFxuXFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cImxhYmVsXCI+Um9iYmVycyBJbnRlcmVzdDwvZGl2PlxcblxcdFxcdFxcdFxcdDxhIGNsYXNzPVwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biBncmVlbiBsaWdodGVuLTIgcGx1c0ludGVyZXN0IGNvbFwiICcgKyAoYmFzZSA/ICdkaXNhYmxlZCcgOiAnJykgKyAnPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIj5hZGRfY2lyY2xlPC9pPjwvYT5cXG5cXG5cXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gcmVkIGxpZ2h0ZW4tMiBtaW51c0Nvc3QgY29sXCIgJyArIChiYXNlID8gJ2Rpc2FibGVkJyA6ICcnKSArICc+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPnJlbW92ZV9jaXJjbGU8L2k+PC9hPlxcblxcdFxcdFxcdFxcdDxkaXYgY2xhc3M9XCJsYWJlbFwiPkd1YXJkaWFucyBDb3N0PC9kaXY+XFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGdyZWVuIGxpZ2h0ZW4tMiBwbHVzQ29zdCBjb2xcIiAnICsgKGJhc2UgPyAnZGlzYWJsZWQnIDogJycpICsgJz48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+YWRkX2NpcmNsZTwvaT48L2E+XFxuXFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIHJlZCBsaWdodGVuLTIgbWludXNSZXdhcmQgY29sXCIgJyArIChiYXNlID8gJ2Rpc2FibGVkJyA6ICcnKSArICc+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPnJlbW92ZV9jaXJjbGU8L2k+PC9hPlxcblxcdFxcdFxcdFxcdDxkaXYgY2xhc3M9XCJsYWJlbFwiPkd1YXJkaWFucyBSZXdhcmQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gZ3JlZW4gbGlnaHRlbi0yIHBsdXNSZXdhcmQgY29sXCIgJyArIChiYXNlID8gJ2Rpc2FibGVkJyA6ICcnKSArICc+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPmFkZF9jaXJjbGU8L2k+PC9hPlxcblxcblxcdFxcdFxcdFxcdDxhIGNsYXNzPVwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biBncmVlbiBkaXNtaXNzXCIgc3R5bGU9XCJ3aWR0aDoxNjBweDsgbWFyZ2luLXRvcDogMTBweFwiPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnMgcmlnaHRcIj5jYW5jZWw8L2k+RGlzbWlzczwvYT5cXG5cXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHQnLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdG15OiAndG9wIGNlbnRlcicsXG5cdFx0XHRcdFx0YXQ6ICdib3R0b20gY2VudGVyJ1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdGNsYXNzZXM6ICdxdGlwLWJvb3RzdHJhcCcsXG5cdFx0XHRcdFx0d2lkdGg6IDE5NVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5zZXR0aW5ncy5yb2JiZXJzLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAocm9iYmVyKSB7XG5cdFx0XHRcdHJldHVybiBuZXdOb2RlLmRhdGEoJ3JvYmJlclNldHRpbmdzJykuc2V0KHJvYmJlciwge1xuXHRcdFx0XHRcdGNvc3Q6IDIsXG5cdFx0XHRcdFx0cmV3YXJkOiAxXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiBuZXdOb2RlSWQ7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0UmV0dXJuIHRoZSBsZW5ndGggb2YgYW4gZWRnZS5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnbGVuZ3RoJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gbGVuZ3RoKGVkZ2UpIHtcblx0XHRcdHJldHVybiB0aGlzLmRpc3RhbmNlKGVkZ2Uuc291cmNlKCksIGVkZ2UudGFyZ2V0KCkpO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdFJldHVybiB0aGUgZGlzdGFuY2UgYmV0d2VlbiBkd28gdmVydGljZXMuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ2Rpc3RhbmNlJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gZGlzdGFuY2Uobm9kZTEsIG5vZGUyKSB7XG5cdFx0XHRyZXR1cm4gKChub2RlMS5wb3NpdGlvbigpLnggLSBub2RlMi5wb3NpdGlvbigpLngpICoqIDIgKyAobm9kZTEucG9zaXRpb24oKS55IC0gbm9kZTIucG9zaXRpb24oKS55KSAqKiAyKSAqKiAwLjU7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0Q29uY2F0ZW5hdGUgc2V0dGluZ3MgaW50byBhIEpTT04gb2JqZWN0LlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdnZXRTZXR0aW5ncycsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGdldFNldHRpbmdzKCkge1xuXHRcdFx0dmFyIF90aGlzMiA9IHRoaXM7XG5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHZlcnRpY2VzOiBPYmplY3Qua2V5cyhjeS5ub2RlcygpKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRcdHJldHVybiAhaXNOYU4oa2V5KTtcblx0XHRcdFx0fSkubWFwKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0aWQ6IHBhcnNlSW50KGN5Lm5vZGVzKClba2V5XS5pZCgpKSxcblx0XHRcdFx0XHRcdHBvc2l0aW9uOiBjeS5ub2RlcygpW2tleV0ucG9zaXRpb24oKSxcblx0XHRcdFx0XHRcdHJvYmJlcnNJbnRlcmVzdDogY3kubm9kZXMoKVtrZXldLmRhdGEoJ3JvYmJlcnNJbnRlcmVzdCcpLFxuXHRcdFx0XHRcdFx0Z3VhcmRpYW5zQ29zdDogY3kubm9kZXMoKVtrZXldLmRhdGEoJ2d1YXJkaWFuc0Nvc3QnKSxcblx0XHRcdFx0XHRcdGd1YXJkaWFuc1Jld2FyZDogY3kubm9kZXMoKVtrZXldLmRhdGEoJ2d1YXJkaWFuc1Jld2FyZCcpLFxuXHRcdFx0XHRcdFx0cm9iYmVyU2V0dGluZ3M6IEFycmF5LmZyb20oY3kubm9kZXMoKVtrZXldLmRhdGEoJ3JvYmJlclNldHRpbmdzJykpLnJlZHVjZShmdW5jdGlvbiAob2JqLCBfcmVmKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBfcmVmMiA9IF9zbGljZWRUb0FycmF5KF9yZWYsIDIpLFxuXHRcdFx0XHRcdFx0XHQgICAga2V5ID0gX3JlZjJbMF0sXG5cdFx0XHRcdFx0XHRcdCAgICB2YWx1ZSA9IF9yZWYyWzFdO1xuXG5cdFx0XHRcdFx0XHRcdG9ialtrZXldID0gdmFsdWU7cmV0dXJuIG9iajtcblx0XHRcdFx0XHRcdH0sIHt9KVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0pLFxuXHRcdFx0XHRlZGdlczogT2JqZWN0LmtleXMoY3kuZWRnZXMoKSkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0XHRyZXR1cm4gIWlzTmFOKGtleSk7XG5cdFx0XHRcdH0pLm1hcChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHNvdXJjZTogcGFyc2VJbnQoY3kuZWRnZXMoKVtrZXldLnNvdXJjZSgpLmlkKCkpLFxuXHRcdFx0XHRcdFx0dGFyZ2V0OiBwYXJzZUludChjeS5lZGdlcygpW2tleV0udGFyZ2V0KCkuaWQoKSksXG5cdFx0XHRcdFx0XHRsZW5ndGg6IF90aGlzMi5sZW5ndGgoY3kuZWRnZXMoKVtrZXldKVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0pXG5cdFx0XHR9O1xuXHRcdH1cblx0fV0pO1xuXG5cdHJldHVybiBHcmFwaDtcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gR3JhcGg7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcblx0dmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7IHZhciBfYXJyID0gW107IHZhciBfbiA9IHRydWU7IHZhciBfZCA9IGZhbHNlOyB2YXIgX2UgPSB1bmRlZmluZWQ7IHRyeSB7IGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHsgX2Fyci5wdXNoKF9zLnZhbHVlKTsgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrOyB9IH0gY2F0Y2ggKGVycikgeyBfZCA9IHRydWU7IF9lID0gZXJyOyB9IGZpbmFsbHkgeyB0cnkgeyBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdKSBfaVtcInJldHVyblwiXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH0gcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGkpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyByZXR1cm4gYXJyOyB9IGVsc2UgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkgeyByZXR1cm4gc2xpY2VJdGVyYXRvcihhcnIsIGkpOyB9IGVsc2UgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTsgfSB9OyB9KCk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgUm9iYmVycyA9IGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gUm9iYmVycyhzZXR0aW5ncykge1xuXHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgUm9iYmVycyk7XG5cblx0XHQvLyBGaWVsZHNcblxuXHRcdHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcblxuXHRcdC8vIERPTSBsaXN0ZW5lcnNcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcjcm9iYmVycyAuZGVsZXRlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cblx0XHRcdF90aGlzLnJlbW92ZVJvYmJlcigkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLmRhdGEoJ3JvYmJlcmlkJykpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJyNyb2JiZXJzIC5jb25maWd1cmUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuXHRcdFx0X3RoaXMuY29uZmlndXJlUm9iYmVyKCQoZXZlbnQuY3VycmVudFRhcmdldCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkuZGF0YSgncm9iYmVyaWQnKSk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJyNyb2JiZXJzIGlucHV0LmRpc2NyZXRpb24nLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuXHRcdFx0dmFyIG5ld1ZhbHVlID0gMSAtIHBhcnNlRmxvYXQoJChldmVudC5jdXJyZW50VGFyZ2V0KS52YWwoKSk7XG5cblx0XHRcdGlmIChuZXdWYWx1ZSA8IDAgfHwgbmV3VmFsdWUgPiAxKSB7XG5cdFx0XHRcdHJldHVybiAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmNzcyh7XG5cdFx0XHRcdFx0Y29sb3I6ICdyZWQnXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmNzcyh7XG5cdFx0XHRcdGNvbG9yOiBcIiNmZmZcIlxuXHRcdFx0fSk7XG5cblx0XHRcdF90aGlzLmNhdGNoUHJvYmFiaWxpdHkuc2V0KCQoZXZlbnQuY3VycmVudFRhcmdldCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkuZGF0YSgncm9iYmVyaWQnKSwgbmV3VmFsdWUpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NoYW5nZScsICcjbW9kYWwtcm9iYmVyLWNvbmZpZyBpbnB1dCcsIGZ1bmN0aW9uIChldmVudCkge1xuXG5cdFx0XHR2YXIgcm93ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoKS5wYXJlbnQoKTtcblxuXHRcdFx0dmFyIG5vZGVJZCA9IHJvdy5kYXRhKCdub2RlaWQnKTtcblx0XHRcdHZhciByb2JiZXJJZCA9IHJvdy5kYXRhKCdyb2JiZXJpZCcpO1xuXG5cdFx0XHR2YXIgc2V0dGluZyA9ICQoZXZlbnQuY3VycmVudFRhcmdldCkuZGF0YSgnc2V0dGluZycpO1xuXHRcdFx0dmFyIG5ld1ZhbHVlID0gcGFyc2VGbG9hdCgkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnZhbCgpKTtcblxuXHRcdFx0Y29uc29sZS5pbmZvKHNldHRpbmcgKyAnIGNoYW5nZWQgZm9yIHRhcmdldCAnICsgbm9kZUlkICsgJywgbmV3IHZhbHVlIGlzICcgKyBuZXdWYWx1ZSArICcuJyk7XG5cblx0XHRcdF90aGlzLnNldHRpbmdzLmdyYXBoLmN5Lm5vZGVzKCdbaWQgPSBcIicgKyBub2RlSWQgKyAnXCJdJykuZGF0YSgncm9iYmVyU2V0dGluZ3MnKS5nZXQocm9iYmVySWQpW3NldHRpbmddID0gbmV3VmFsdWU7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmluaXQoKTtcblx0fVxuXG5cdC8qXG4gKlx0SW5pdGlhbGl6ZSB0aGUgcm9iYmVycyBieSBzZXR0aW5nIGRlZmF1bHQgdmFsdWVzLlxuICovXG5cblxuXHRfY3JlYXRlQ2xhc3MoUm9iYmVycywgW3tcblx0XHRrZXk6ICdpbml0Jyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gaW5pdCgpIHtcblx0XHRcdHZhciBfdGhpczIgPSB0aGlzO1xuXG5cdFx0XHRpZiAodHlwZW9mIHRoaXMubGlzdCAhPT0gJ3VuZGVmaW5lZCcpIFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5saXN0KSkuZm9yRWFjaChmdW5jdGlvbiAocm9iYmVySWQpIHtcblx0XHRcdFx0cmV0dXJuIF90aGlzMi5yZW1vdmVSb2JiZXIocm9iYmVySWQpO1xuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMubnVtYmVyT2ZSb2JiZXJzQ3JlYXRlZCA9IDA7XG5cblx0XHRcdHRoaXMubGlzdCA9IG5ldyBTZXQoKTtcblxuXHRcdFx0dGhpcy5jYXRjaFByb2JhYmlsaXR5ID0gbmV3IE1hcCgpO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdEFkZCBhIHJvYmJlciB0byB0aGUgc2V0dGluZ3MuXG4gICpcdEhpcyBjYXJkIGNhbiBiZSBzZWVuIGluIHRoZSBcIlJvYmJlcnNcIiB0YWIuXG4gICpcdEhpcyBzZXR0aW5ncyBhcmUgc2V0IHRvIGRlZmF1bHQgaW4gZXZlcnkgdGFyZ2V0LlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICduZXdSb2JiZXInLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBuZXdSb2JiZXIoKSB7XG5cdFx0XHR2YXIgY2F0Y2hQcm9iYWJpbGl0eSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogMC41O1xuXG5cblx0XHRcdHZhciByb2JiZXJJZCA9IHRoaXMubnVtYmVyT2ZSb2JiZXJzQ3JlYXRlZCsrO1xuXG5cdFx0XHR0aGlzLmxpc3QuYWRkKHJvYmJlcklkKTtcblxuXHRcdFx0dGhpcy5jYXRjaFByb2JhYmlsaXR5LnNldChyb2JiZXJJZCwgY2F0Y2hQcm9iYWJpbGl0eSk7XG5cblx0XHRcdHRoaXMuc2V0dGluZ3MuZ3JhcGguY3kubm9kZXMoKS5lYWNoKGZ1bmN0aW9uIChub2RlKSB7XG5cdFx0XHRcdHJldHVybiBub2RlLmRhdGEoJ3JvYmJlclNldHRpbmdzJykuc2V0KHJvYmJlcklkLCB7XG5cdFx0XHRcdFx0Y29zdDogMixcblx0XHRcdFx0XHRyZXdhcmQ6IDFcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI3JvYmJlcnMnKS5hcHBlbmQoJ1xcblxcdFxcdFxcdDxkaXYgY2xhc3M9XCJjb2wgczRcIiBkYXRhLXJvYmJlcmlkPVwiJyArIHJvYmJlcklkICsgJ1wiPlxcblxcdFxcdFxcdCAgICA8ZGl2IGNsYXNzPVwiY2FyZCBibHVlLWdyZXkgZGFya2VuLTFcIj5cXG5cXHRcXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiY2FyZC1jb250ZW50IHdoaXRlLXRleHRcIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8c3BhbiBjbGFzcz1cImNhcmQtdGl0bGVcIj5Sb2JiZXIgJyArIChyb2JiZXJJZCArIDEpICsgJzwvc3Bhbj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8IS0tPHA+U29tZSBiYWQgZ3V5LjwvcD4tLT5cXG5cXHRcXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiY2FyZC1hY3Rpb25cIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiZGlzY3JldGlvbkNvbnRhaW5lclwiPlxcblxcdFxcdFxcdFxcdFxcdFxcdFxcdDxzcGFuPkRpc2NyZXRpb248L3NwYW4+XFxuXFx0XFx0XFx0XFx0XFx0XFx0XFx0PGlucHV0IHR5cGU9XCJudW1iZXJcIiBzdGVwPVwiMC4wNVwiIGNsYXNzPVwiZGlzY3JldGlvblwiIG1pbj1cIjBcIiBtYXg9XCIxXCIgdmFsdWU9XCInICsgY2F0Y2hQcm9iYWJpbGl0eSArICdcIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gYmx1ZSBjb25maWd1cmVcIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBtYXJnaW4tdG9wOiAxMHB4O1wiPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnMgcmlnaHRcIj5tb2RlX2VkaXQ8L2k+UmV3YXJkczwvYT5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gcmVkIGRlbGV0ZVwiIHN0eWxlPVwid2lkdGg6IDEwMCU7IG1hcmdpbi10b3A6IDEwcHhcIiAnICsgKHJvYmJlcklkID09PSAwID8gJ2Rpc2FibGVkJyA6ICcnKSArICc+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29ucyByaWdodFwiPmRlbGV0ZTwvaT5EZWxldGU8L2E+XFxuXFx0XFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0Jyk7XG5cblx0XHRcdHJldHVybiByb2JiZXJJZDtcblx0XHR9XG5cblx0XHQvKlxuICAqXHRSZW1vdmUgYSByb2JiZXIgZnJvbSB0aGUgc2V0dGluZ3MuXG4gICpcdEhpcyBjYXJkIGdldHMgcmVtb3ZlZCBhbmQgcmVmZXJlbmNlcyB0byBoaXMgc2V0dGluZ3MgYXJlXG4gICpcdHJlbW92ZWQgZnJvbSBlYWNoIHRhcmdldC5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAncmVtb3ZlUm9iYmVyJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlUm9iYmVyKHJvYmJlcklkKSB7XG5cblx0XHRcdGNvbnNvbGUuaW5mbygnUmVtb3Zpbmcgcm9iYmVyICcgKyByb2JiZXJJZCArICcuLi4nKTtcblxuXHRcdFx0dGhpcy5saXN0LmRlbGV0ZShyb2JiZXJJZCk7XG5cblx0XHRcdHRoaXMuc2V0dGluZ3MuZ3JhcGguY3kubm9kZXMoKS5lYWNoKGZ1bmN0aW9uIChub2RlKSB7XG5cdFx0XHRcdHJldHVybiBub2RlLmRhdGEoJ3JvYmJlclNldHRpbmdzJykuZGVsZXRlKHJvYmJlcklkKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjcm9iYmVycycpLmZpbmQoJ1tkYXRhLXJvYmJlcmlkPScgKyByb2JiZXJJZCArICddJykucmVtb3ZlKCk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdERpc3BsYXkgYSBtb2RhbCBlbmFibGluZyB0aGUgdXNlciB0byBzZXQgdGhlXG4gICpcdHJvYmJlciBwcm9wZXJ0aWVzIGZvciBldmVyeSB0YXJnZXQuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ2NvbmZpZ3VyZVJvYmJlcicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGNvbmZpZ3VyZVJvYmJlcihyb2JiZXJJZCkge1xuXG5cdFx0XHRjb25zb2xlLmluZm8oJ0NvbmZpZ3VyaW5nIHJvYmJlciAnICsgKHJvYmJlcklkICsgMSkgKyAnLicpO1xuXG5cdFx0XHR2YXIgdGFibGUgPSAnXFxuXFx0XFx0XFx0PHRhYmxlIGNsYXNzPVwic3RyaXBlZCBjZW50ZXJlZFwiPlxcblxcdFxcdFxcdFxcdDx0aGVhZD5cXG5cXHRcXHRcXHRcXHRcXHQ8dHI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPlRhcmdldCBJRDwvdGg+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPkNvc3Q8L3RoPlxcblxcdFxcdFxcdFxcdFxcdFxcdDx0aD5SZXdhcmQ8L3RoPlxcblxcdFxcdFxcdFxcdFxcdDwvdHI+XFxuXFx0XFx0XFx0XFx0PC90aGVhZD5cXG5cXG5cXHRcXHRcXHRcXHQ8dGJvZHk+JztcblxuXHRcdFx0dGhpcy5zZXR0aW5ncy5ncmFwaC5jeS5ub2RlcygnW2lkICE9IFwiMFwiXScpLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcblxuXHRcdFx0XHR2YXIgc2V0dGluZ3MgPSBub2RlLmRhdGEoJ3JvYmJlclNldHRpbmdzJykuZ2V0KHJvYmJlcklkKTtcblxuXHRcdFx0XHR0YWJsZSArPSAnXFxuXFx0XFx0XFx0XFx0PHRyIGRhdGEtbm9kZWlkPVwiJyArIG5vZGUuaWQoKSArICdcIiBkYXRhLXJvYmJlcmlkPVwiJyArIHJvYmJlcklkICsgJ1wiPlxcblxcdFxcdFxcdFxcdFxcdDx0ZD4nICsgbm9kZS5pZCgpICsgJzwvdGQ+XFxuXFx0XFx0XFx0XFx0XFx0PHRkPjxpbnB1dCBkYXRhLXNldHRpbmc9XCJjb3N0XCIgdHlwZT1cIm51bWJlclwiIHZhbHVlPVwiJyArIHNldHRpbmdzLmNvc3QgKyAnXCIgbWluPVwiMFwiPjwvdGQ+XFxuXFx0XFx0XFx0XFx0XFx0PHRkPjxpbnB1dCBkYXRhLXNldHRpbmc9XCJyZXdhcmRcIiB0eXBlPVwibnVtYmVyXCIgdmFsdWU9XCInICsgc2V0dGluZ3MucmV3YXJkICsgJ1wiIG1pbj1cIjBcIj48L3RkPlxcblxcdFxcdFxcdFxcdDwvdHI+Jztcblx0XHRcdH0pO1xuXG5cdFx0XHR0YWJsZSArPSAnXFxuXFx0XFx0XFx0XFx0PC90Ym9keT5cXG5cXHRcXHRcXHQ8L3RhYmxlPic7XG5cblx0XHRcdCQoJyNtb2RhbC1yb2JiZXItY29uZmlnIGg0JykudGV4dCgnUm9iYmVyICcgKyAocm9iYmVySWQgKyAxKSArICcgY29uZmlndXJhdGlvbicpO1xuXG5cdFx0XHQkKCcjbW9kYWwtcm9iYmVyLWNvbmZpZyBwJykuaHRtbCh0YWJsZSk7XG5cblx0XHRcdCQoJyNtb2RhbC1yb2JiZXItY29uZmlnJykubW9kYWwoJ29wZW4nKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0UmV0dXJuIHRoZSBsaXN0IG9mIGV2ZXJ5IHJvYmJlci5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnZ2V0U2V0dGluZ3MnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBnZXRTZXR0aW5ncygpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGxpc3Q6IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5saXN0KSksXG5cdFx0XHRcdGNhdGNoUHJvYmFiaWxpdHk6IEFycmF5LmZyb20odGhpcy5jYXRjaFByb2JhYmlsaXR5KS5yZWR1Y2UoZnVuY3Rpb24gKG9iaiwgX3JlZikge1xuXHRcdFx0XHRcdHZhciBfcmVmMiA9IF9zbGljZWRUb0FycmF5KF9yZWYsIDIpLFxuXHRcdFx0XHRcdCAgICBrZXkgPSBfcmVmMlswXSxcblx0XHRcdFx0XHQgICAgdmFsdWUgPSBfcmVmMlsxXTtcblxuXHRcdFx0XHRcdG9ialtrZXldID0gdmFsdWU7cmV0dXJuIG9iajtcblx0XHRcdFx0fSwge30pXG5cdFx0XHR9O1xuXHRcdH1cblx0fV0pO1xuXG5cdHJldHVybiBSb2JiZXJzO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBSb2JiZXJzOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9JbnRlcmZhY2UgPSByZXF1aXJlKCcuL2NsYXNzZXMvSW50ZXJmYWNlJyk7XG5cbnZhciBfSW50ZXJmYWNlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0ludGVyZmFjZSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbi8qXG4qXHRDeXRvc2NhcGUgKHRoZSBncmFwaCBsaWJyYXJ5IHdlIGFyZSB1c2luZykgZG9lc24ndCB3b3JrIHNvXG4qXHR3ZWxsIHdoZW4gdGhlIHJlbmRlcmluZyBjYW52YXMgaXMgaGlkZGVuIHdoaWxlIHRoZSBncmFwaFxuKlx0aXMgaW5pdGlhbGl6ZWQuIFdlIGhhdmUgdG8gd2FpdCBmb3IgdGhlIGNhbnZhcyB0byBiZSBkaXNwbGF5ZWRcbipcdGJlZm9yZSBpbml0aWFsaXppbmcgaXQgYW5kIHRvIG9ubHkgZG8gc28gb25jZS5cbipcbipcdFRodXMsIHdlIHVzZSB0aGUgZ2xvYmFsIGZsYWcgZ3JhcGhJbml0aWFsaXplZC5cbiovXG5cbnZhciBncmFwaEluaXRpYWxpemVkID0gZmFsc2U7XG5cbi8qXG4qXHRGdW5jdGlvbiBjYWxsZWQgd2hlbmV2ZXIgdGhlIGhhc2ggaXMgdXBkYXRlZCB0byBkbyB0aGUgY29ycmVjdFxuKlx0YWN0aW9uLlxuKi9cblxudmFyIHVwZGF0ZUhhc2ggPSBmdW5jdGlvbiB1cGRhdGVIYXNoKGhhc2gpIHtcblxuXHQvLyBXZSByZW1vdmUgdGhlICcjJyBjaGFyYWN0ZXIgZnJvbSB0aGUgaGFzaC4gSnVzdCBpbiBjYXNlLlxuXHRoYXNoID0gaGFzaC5yZXBsYWNlKC9eIy8sICcnKTtcblxuXHQvKlxuICpcdFByZXZlbnRzICMgbGlua3MgZnJvbSBnb2luZyB0byB0aGUgZWxlbWVudC5cbiAqL1xuXHR2YXIgbm9kZSA9ICQoJyMnICsgaGFzaCk7XG5cdG5vZGUuYXR0cignaWQnLCAnJyk7XG5cdGRvY3VtZW50LmxvY2F0aW9uLmhhc2ggPSBoYXNoO1xuXHRub2RlLmF0dHIoJ2lkJywgaGFzaCk7XG5cblx0LypcbiAqXHRXZSBoYXZlIHRvIHNvcnQgdGhlIGdyYXBoIHdoZW4gaXQncyBkaXNwbGF5ZWRcbiAqXHRmb3IgdGhlIGZpcnN0IHRpbWUuXG4gKi9cblx0aWYgKCFncmFwaEluaXRpYWxpemVkICYmIGhhc2ggPT09ICdzaW11bGF0ZScpIHtcblx0XHR3aW5kb3cuZ3JhcGguc29ydCgpO1xuXHRcdGdyYXBoSW5pdGlhbGl6ZWQgPSB0cnVlO1xuXHR9XG5cblx0aWYgKHdpbmRvdy5jeSAhPT0gdW5kZWZpbmVkKSB3aW5kb3cuY3kucmVzaXplKCk7XG5cblx0LypcbiAqXHRGaXggYSBidWcgd2l0aCBwYXJhbGxheCBpbWFnZXMuXG4gKi9cblxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHQkKHdpbmRvdykuc2Nyb2xsKCk7XG5cdH0sIDI1KTtcbn07XG5cbi8qXG4qXHRTZXR1cCBub24tc3BlY2lmaWMgRE9NIGxpc3RlbmVycyBhbmQgaW5pdGlhbGl6ZSBtb2R1bGVzLlxuKi9cbnZhciBzZXR1cERPTSA9IGZ1bmN0aW9uIHNldHVwRE9NKCkge1xuXG5cdCQoJ1tkYXRhLWRlc3RdJykuY2xpY2soZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0d2luZG93LmxvY2F0aW9uLmhhc2ggPSAkKGV2ZW50LmV2ZW50VGFyZ2V0KS5kYXRhKCdkZXN0Jyk7XG5cdFx0JCgnbmF2IHVsLnRhYnMnKS50YWJzKCdzZWxlY3RfdGFiJywgJChldmVudC5jdXJyZW50VGFyZ2V0KS5kYXRhKCdkZXN0JykpO1xuXHRcdHVwZGF0ZUhhc2goJChldmVudC5jdXJyZW50VGFyZ2V0KS5kYXRhKCdkZXN0JykpO1xuXHR9KTtcblxuXHQkKCduYXYgdWwudGFicycpLm9uKCdjbGljaycsICdhJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0dXBkYXRlSGFzaCgkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmF0dHIoJ2hyZWYnKSk7XG5cdH0pO1xuXG5cdCQod2luZG93KS5vbignaGFzaGNoYW5nZScsIGZ1bmN0aW9uICgpIHtcblx0XHQkKCduYXYgdWwudGFicycpLnRhYnMoJ3NlbGVjdF90YWInLCB3aW5kb3cubG9jYXRpb24uaGFzaC5zbGljZSgxKSk7XG5cdFx0dXBkYXRlSGFzaCh3aW5kb3cubG9jYXRpb24uaGFzaCk7XG5cdH0pO1xuXG5cdCQoJy5wYXJhbGxheCcpLnBhcmFsbGF4KCk7XG5cblx0JCgnLm1vZGFsI21vZGFsLXJvYmJlci1jb25maWcnKS5tb2RhbCgpO1xuXG5cdENvbnNvbGVMb2dIVE1MLmNvbm5lY3QoJCgnI2NvbnNvbGUnKSk7XG59O1xuXG4vKlxuKlx0V2hlbmV2ZXIgdGhlIERPTSBjb250ZW50IGlzIHJlYWFkeSB0byBiZSBtYW5pcHVsYXRlZCxcbipcdHNldHVwZSB0aGUgc3BlY2lmaWMgRE9NIGFuZCBjcmVhdGUgYW4gSW50ZXJmYWNlIHdpdGggdGhlIHNlcnZlci5cbipcdFRoZW4sIHdlIGxpbmsgdGhlIFVJIGVsZW1lbnRzIHRvIHRoZSBzZXR0aW5ncyB0aGV5IG1hbmlwdWxhdGUuXG4qL1xuJChmdW5jdGlvbiAoKSB7XG5cdHNldHVwRE9NKCk7XG5cblx0dmFyIGlmYWNlID0gbmV3IF9JbnRlcmZhY2UyLmRlZmF1bHQoKTtcblx0JCgnI3NvcnROb2RlcycpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdHJldHVybiBpZmFjZS5zZXR0aW5ncy5ncmFwaC5zb3J0KCk7XG5cdH0pO1xuXHQkKCcjbmV3Um9iYmVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0cmV0dXJuIGlmYWNlLnNldHRpbmdzLnJvYmJlcnMubmV3Um9iYmVyKCk7XG5cdH0pO1xuXHQkKCcjbGF1bmNoQnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0cmV0dXJuIGlmYWNlLnN0YXJ0U2ltdWxhdGlvbigpO1xuXHR9KTtcblx0JCgnI2ltcG9ydEJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdHJldHVybiBpZmFjZS5zZXR0aW5ncy5sb2FkZXIuaW1wb3J0KCk7XG5cdH0pO1xuXHQkKCcjZXhwb3J0QnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0cmV0dXJuIGlmYWNlLnNldHRpbmdzLnNhdmVyLnNhdmUoKTtcblx0fSk7XG5cdCQoJy5tb2RhbCNtb2RhbC1yZXN1bHRzJykubW9kYWwoeyBjb21wbGV0ZTogZnVuY3Rpb24gY29tcGxldGUoKSB7XG5cdFx0XHRyZXR1cm4gaWZhY2Uuc3RvcFNpbXVsYXRpb24oKTtcblx0XHR9IH0pO1xufSk7Il19
