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
		this.settings = new _Settings2.default();
		this.results = new _Results2.default();
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
*	Deals with the results sent by the server.
*/
var Results = function () {
	function Results() {
		_classCallCheck(this, Results);

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
					return '' + sum + target + '=>';
				}, '').slice(0, -2) + '</td>\n\t\t\t\t</tr>';
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
					robberUtility: averageRobberUtility
				});
			});

			var sortedStatisticsTable = statisticsTable.sort(function (s1, s2) {
				return s2.guardianUtility - s1.guardianUtility;
			});

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

				statisticsTableHTML += '\n\t\t\t\t<tr>\n\t\t\t\t\t<td>' + strategy.probabilities + '</td>\n\t\t\t\t\t<td>' + strategy.guardianUtility + '</td>\n\t\t\t\t\t<td>' + strategy.robberUtility + '</td>\n\t\t\t\t</tr>';
			});

			statisticsTableHTML += '\n\t\t\t\t</tbody>\n\t\t\t</table>';

			$('#modal-results p').html('\n\n\t\t\t<div class="row">\n\t\t\t\t<div class="col s12">\n\t\t\t\t\t<ul class="tabs">\n\t\t\t\t\t\t<li class="tab col s3"><a class="active" href="#chart">Chart</a></li>\n\t\t\t\t\t\t<li class="tab col s3"><a href="#visualization">Visualization</a></li>\n\t\t\t\t\t\t<li class="tab col s3"><a href="#patrols">Patrols</a></li>\n\t\t\t\t\t\t<li class="tab col s3"><a href="#statistics">Statistics</a></li>\n\t\t\t\t\t</ul>\n\t\t\t\t</div>\n\t\t\t\t<div id="chart" class="col s12">\n\t\t\t\t\t<canvas width="100%" height="400" id="line-chart"></canvas>\n\t\t\t\t</div>\n\t\t\t\t<div id="visualization" class="col s12">\n\t\t\t\t\tSame graph as in settings with animation.\n\t\t\t\t</div>\n\t\t\t\t<div id="patrols" class="col s12">\n\t\t\t\t\t' + patrolsTableHTML + '\n\t\t\t\t</div>\n\t\t\t\t<div id="statistics" class="col s12">\n\t\t\t\t\t' + statisticsTableHTML + '\n\t\t\t\t</div>\n\t\t\t</div>\n\n\t\t').modal('open');

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

			return this;
		}
	}]);

	return Results;
}();

exports.default = Results;
},{}],3:[function(require,module,exports){
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
	function Settings() {
		_classCallCheck(this, Settings);

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
},{"./settings/files/Loader":4,"./settings/files/Saver":5,"./settings/subsettings/Graph.js":6,"./settings/subsettings/Robbers.js":7}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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

			$('#robbers').append('\n\t\t\t<div class="col s4" data-robberid="' + robberId + '">\n\t\t\t    <div class="card blue-grey darken-1">\n\t\t\t\t\t<div class="card-content white-text">\n\t\t\t\t\t\t<span class="card-title">Robber ' + robberId + '</span>\n\t\t\t\t\t\t<!--<p>Some bad guy.</p>-->\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="card-action">\n\t\t\t\t\t\t<div class="discretionContainer">\n\t\t\t\t\t\t\t<span>Discretion</span>\n\t\t\t\t\t\t\t<input type="number" step="0.05" class="discretion" min="0" max="1" value="' + catchProbability + '">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<a class="waves-effect waves-light btn blue configure" style="width: 100%; margin-top: 10px;"><i class="material-icons right">mode_edit</i>Rewards</a>\n\t\t\t\t\t\t<a class="waves-effect waves-light btn red delete" style="width: 100%; margin-top: 10px"><i class="material-icons right">delete</i>Delete</a>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t');

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

			console.info('Configuring robber ' + robberId + '.');

			var table = '\n\t\t\t<table class="striped centered">\n\t\t\t\t<thead>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<th>Target ID</th>\n\t\t\t\t\t\t<th>Cost</th>\n\t\t\t\t\t\t<th>Reward</th>\n\t\t\t\t\t</tr>\n\t\t\t\t</thead>\n\n\t\t\t\t<tbody>';

			this.settings.graph.cy.nodes('[id != "0"]').forEach(function (node) {

				var settings = node.data('robberSettings').get(robberId);

				table += '\n\t\t\t\t<tr data-nodeid="' + node.id() + '" data-robberid="' + robberId + '">\n\t\t\t\t\t<td>' + node.id() + '</td>\n\t\t\t\t\t<td><input data-setting="cost" type="number" value="' + settings.cost + '" min="0"></td>\n\t\t\t\t\t<td><input data-setting="reward" type="number" value="' + settings.reward + '" min="0"></td>\n\t\t\t\t</tr>';
			});

			table += '\n\t\t\t\t</tbody>\n\t\t\t</table>';

			$('#modal-robber-config h4').text('Robber ' + robberId + ' configuration');

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
},{}],8:[function(require,module,exports){
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
},{"./classes/Interface":1}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvZGlzdC9qcy9jbGFzc2VzL0ludGVyZmFjZS5qcyIsImNsaWVudC9kaXN0L2pzL2NsYXNzZXMvaW50ZXJmYWNlL1Jlc3VsdHMuanMiLCJjbGllbnQvZGlzdC9qcy9jbGFzc2VzL2ludGVyZmFjZS9TZXR0aW5ncy5qcyIsImNsaWVudC9kaXN0L2pzL2NsYXNzZXMvaW50ZXJmYWNlL3NldHRpbmdzL2ZpbGVzL0xvYWRlci5qcyIsImNsaWVudC9kaXN0L2pzL2NsYXNzZXMvaW50ZXJmYWNlL3NldHRpbmdzL2ZpbGVzL1NhdmVyLmpzIiwiY2xpZW50L2Rpc3QvanMvY2xhc3Nlcy9pbnRlcmZhY2Uvc2V0dGluZ3Mvc3Vic2V0dGluZ3MvR3JhcGguanMiLCJjbGllbnQvZGlzdC9qcy9jbGFzc2VzL2ludGVyZmFjZS9zZXR0aW5ncy9zdWJzZXR0aW5ncy9Sb2JiZXJzLmpzIiwiY2xpZW50L2Rpc3QvanMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9TZXR0aW5ncyA9IHJlcXVpcmUoJy4vaW50ZXJmYWNlL1NldHRpbmdzJyk7XG5cbnZhciBfU2V0dGluZ3MyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2V0dGluZ3MpO1xuXG52YXIgX1Jlc3VsdHMgPSByZXF1aXJlKCcuL2ludGVyZmFjZS9SZXN1bHRzJyk7XG5cbnZhciBfUmVzdWx0czIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9SZXN1bHRzKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLypcbipcdEludGVyZmFjZSBiZXR3ZWVuIHRoZSBjbGllbnQgc2lkZSBhbmQgdGhlIGJhY2stZW5kLlxuKlxuKlx0VGhlIGludGVyZmFjZSBoYXMgc2V0dGluZ3MgYW5kIGEgc29ja2V0IGVuYWJsaW5nIGl0IFxuKlx0dG8gc2VuZCBhbmQgcmVjZWl2ZSBkYXRhIGZyb20gdGhlIHNlcnZlciBydW5uaW5nIHRoZVxuKlx0SmF2YSBNQVMgc2ltdWxhdGlvbi5cbiovXG5cbnZhciBJbnRlcmZhY2UgPSBmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIEludGVyZmFjZSgpIHtcblx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgSW50ZXJmYWNlKTtcblxuXHRcdC8vIEZpZWxkc1xuXG5cdFx0dGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KCdodHRwOi8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSArICc6ODA4MycpO1xuXHRcdHRoaXMuc2V0dGluZ3MgPSBuZXcgX1NldHRpbmdzMi5kZWZhdWx0KCk7XG5cdFx0dGhpcy5yZXN1bHRzID0gbmV3IF9SZXN1bHRzMi5kZWZhdWx0KCk7XG5cdFx0dGhpcy5zaW11bGF0aW9uUnVubmluZyA9IGZhbHNlO1xuXG5cdFx0Ly8gU29ja2V0IGxpc3RlbmVyc1xuXG5cdFx0dGhpcy5zb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdGNvbnNvbGUuaW5mbygnQ29ubmVjdGlvbiB0byB0aGUgcmVtb3RlIHNlcnZlciBlc3RhYmxpc2hlZC4nKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qXG4gKlx0U3RhcnQgdGhlIHNpbXVsYXRpb24gYnkgc2VuZGluZyB0aGUgc2V0dGluZ3MgdG8gdGhlIGJhY2stZW5kXG4gKlx0YWxvbmcgdGhlIG1lc3NhZ2UgJ3N0YXJ0U2ltdWxhdGlvbicuXG4gKi9cblxuXHRfY3JlYXRlQ2xhc3MoSW50ZXJmYWNlLCBbe1xuXHRcdGtleTogJ3N0YXJ0U2ltdWxhdGlvbicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHN0YXJ0U2ltdWxhdGlvbigpIHtcblx0XHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0XHRcdHRoaXMuc2ltdWxhdGlvblJ1bm5pbmcgPSB0cnVlO1xuXG5cdFx0XHR0aGlzLnNvY2tldC5vbignbG9hZGluZycsIGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0XHRcdHJldHVybiBfdGhpcy5yZXN1bHRzLmxvYWRpbmcoZGF0YS5wcm9ncmVzc2lvbik7XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5yZXN1bHRzLmxvYWRpbmcoMCk7XG5cblx0XHRcdHRoaXMuc29ja2V0LmVtaXQoJ3N0YXJ0U2ltdWxhdGlvbicsIHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZ3MoKSwgZnVuY3Rpb24gKHJlc3VsdHMpIHtcblxuXHRcdFx0XHRpZiAoIV90aGlzLnNpbXVsYXRpb25SdW5uaW5nKSByZXR1cm47XG5cblx0XHRcdFx0aWYgKHJlc3VsdHMuZXJyb3IpIHJldHVybiBfdGhpcy5yZXN1bHRzLmVycm9yKHJlc3VsdHMuZXJyb3IpO1xuXG5cdFx0XHRcdF90aGlzLnJlc3VsdHMuc2hvd1Jlc3VsdHMocmVzdWx0cy5kYXRhKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRTdG9wIHRoZSBjbGllbnQtc2lkZSBzaW11bGF0aW9uIGJ5IHJlbW92aW5nIHRoZSBsb2FkaW5nIHNjcmVlbiBhbmRcbiAgKlx0YmxvY2tpbmcgcmVzdWx0cyBjYWxsYmFjay5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnc3RvcFNpbXVsYXRpb24nLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBzdG9wU2ltdWxhdGlvbigpIHtcblx0XHRcdHRoaXMuc2ltdWxhdGlvblJ1bm5pbmcgPSBmYWxzZTtcblxuXHRcdFx0dGhpcy5zb2NrZXQucmVtb3ZlTGlzdGVuZXIoJ2xvYWRpbmcnKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXHR9XSk7XG5cblx0cmV0dXJuIEludGVyZmFjZTtcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gSW50ZXJmYWNlOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLypcbipcdERlYWxzIHdpdGggdGhlIHJlc3VsdHMgc2VudCBieSB0aGUgc2VydmVyLlxuKi9cbnZhciBSZXN1bHRzID0gZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBSZXN1bHRzKCkge1xuXHRcdF9jbGFzc0NhbGxDaGVjayh0aGlzLCBSZXN1bHRzKTtcblxuXHRcdHdpbmRvdy5yZXN1bHRzID0gdGhpcztcblx0fVxuXG5cdC8qXG4gKlx0V2hlbiBhbiBlcnJvciBpcyByZWNlaXZlZCwgcHJpbnQgaXQgdG8gc2NyZWVuLlxuICovXG5cblxuXHRfY3JlYXRlQ2xhc3MoUmVzdWx0cywgW3tcblx0XHRrZXk6ICdlcnJvcicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGVycm9yKGVycikge1xuXG5cdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvcjogJyArIGVycik7XG5cblx0XHRcdCQoJyNtb2RhbC1yZXN1bHRzIHAnKS5odG1sKCdcXG5cXG5cXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiY2VudGVyXCI+XFxuXFx0XFx0XFx0XFx0RXJyb3IgZW5jb3VudGVyZWQgd2hpbGUgY29tcHV0aW5nIHRoZSByZXN1bHRzOiA8YnI+XFxuXFx0XFx0XFx0XFx0JyArIGVyciArICdcXG5cXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHQnKS5tb2RhbCgnb3BlbicpO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdFdoZW4gdGhlIHNlcnZlciBpcyBwcm9jZXNzaW5nLCBzaG93IHRoZSBwcm9ncmVzcy5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnbG9hZGluZycsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGxvYWRpbmcoKSB7XG5cdFx0XHR2YXIgcGVyY2VudCA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogZmFsc2U7XG5cblx0XHRcdCQoJyNtb2RhbC1yZXN1bHRzIHAnKS5odG1sKCdcXG5cXG5cXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiY2VudGVyXCI+XFxuXFx0XFx0XFx0XFx0UGxlYXNlIHdhaXQgd2hpbGUgb3VyIHNlcnZlciBpcyBjb21wdXRpbmcgdGhlIHJlc3VsdHMuXFxuXFx0XFx0XFx0PC9kaXY+XFxuXFxuXFx0XFx0XFx0PGRpdiBjbGFzcz1cInByb2dyZXNzXCI+XFxuXFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cIicgKyAocGVyY2VudCA/ICdkZXRlcm1pbmF0ZVwiIHN0eWxlPVwid2lkdGg6ICcgKyBwZXJjZW50ICsgJyVcIicgOiAnaW5kZXRlcm1pbmF0ZVwiJykgKyAnPjwvZGl2PlxcblxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdCcpLm1vZGFsKCdvcGVuJyk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdFdoZW4gZXZlcnl0aGluZyBpcyBva2F5LCBkaXNwbGF5IHBhdGhzLCBzdGF0cyBhbmQgc2hvdyBhIHNpbXVsYXRpb24uXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ3Nob3dSZXN1bHRzJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gc2hvd1Jlc3VsdHMoZGF0YSkge1xuXG5cdFx0XHRjb25zb2xlLmluZm8oJ1Jlc3VsdHMgcmVjZWl2ZWQuJyk7XG5cblx0XHRcdC8vIEJ1aWxkaW5nIHRoZSBsaXN0IG9mIHBhdHJvbHMuXG5cblx0XHRcdHZhciBwYXRyb2xzVGFibGVIVE1MID0gJ1xcblxcdFxcdFxcdDx0YWJsZSBjbGFzcz1cInN0cmlwZWQgY2VudGVyZWRcIj5cXG5cXHRcXHRcXHRcXHQ8dGhlYWQ+XFxuXFx0XFx0XFx0XFx0XFx0PHRyPlxcblxcdFxcdFxcdFxcdFxcdFxcdDx0aD5QYXRyb2wgSUQ8L3RoPlxcblxcdFxcdFxcdFxcdFxcdFxcdDx0aD5wYXRoPC90aD5cXG5cXHRcXHRcXHRcXHRcXHQ8L3RyPlxcblxcdFxcdFxcdFxcdDwvdGhlYWQ+XFxuXFxuXFx0XFx0XFx0XFx0PHRib2R5Pic7XG5cblx0XHRcdGRhdGEucGF0cm9scy5mb3JFYWNoKGZ1bmN0aW9uIChwYXRyb2wsIGluZGV4KSB7XG5cblx0XHRcdFx0cGF0cm9sc1RhYmxlSFRNTCArPSAnXFxuXFx0XFx0XFx0XFx0PHRyPlxcblxcdFxcdFxcdFxcdFxcdDx0ZD4nICsgaW5kZXggKyAnPC90ZD5cXG5cXHRcXHRcXHRcXHRcXHQ8dGQ+JyArIHBhdHJvbC5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgdGFyZ2V0KSB7XG5cdFx0XHRcdFx0cmV0dXJuICcnICsgc3VtICsgdGFyZ2V0ICsgJz0+Jztcblx0XHRcdFx0fSwgJycpLnNsaWNlKDAsIC0yKSArICc8L3RkPlxcblxcdFxcdFxcdFxcdDwvdHI+Jztcblx0XHRcdH0pO1xuXG5cdFx0XHRwYXRyb2xzVGFibGVIVE1MICs9ICdcXG5cXHRcXHRcXHRcXHQ8L3Rib2R5PlxcblxcdFxcdFxcdDwvdGFibGU+JztcblxuXHRcdFx0Ly8gV2UgaGF2ZSB0byBmaW5kIHRoZSBiZXN0IHN0cmF0ZWd5LlxuXG5cdFx0XHR2YXIgc3RhdGlzdGljc1RhYmxlID0gW107XG5cblx0XHRcdGRhdGEuc3RyYXRlZ2llcy5mb3JFYWNoKGZ1bmN0aW9uIChzdHJhdGVneSkge1xuXG5cdFx0XHRcdHZhciBhdmVyYWdlR3VhcmRpYW5VdGlsaXR5ID0gc3RyYXRlZ3kuaXRlcmF0aW9ucy5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgaXRlcmF0aW9uKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHN1bSArIGl0ZXJhdGlvbi5ndWFyZGlhblV0aWxpdHk7XG5cdFx0XHRcdH0sIDApIC8gc3RyYXRlZ3kuaXRlcmF0aW9ucy5sZW5ndGg7XG5cdFx0XHRcdHZhciBhdmVyYWdlUm9iYmVyVXRpbGl0eSA9IHN0cmF0ZWd5Lml0ZXJhdGlvbnMucmVkdWNlKGZ1bmN0aW9uIChzdW0sIGl0ZXJhdGlvbikge1xuXHRcdFx0XHRcdHJldHVybiBzdW0gKyBpdGVyYXRpb24ucm9iYmVyVXRpbGl0eTtcblx0XHRcdFx0fSwgMCkgLyBzdHJhdGVneS5pdGVyYXRpb25zLmxlbmd0aDtcblxuXHRcdFx0XHRzdGF0aXN0aWNzVGFibGUucHVzaCh7XG5cdFx0XHRcdFx0aXRlcmF0aW9uczogc3RyYXRlZ3kuaXRlcmF0aW9ucyxcblx0XHRcdFx0XHRwcm9iYWJpbGl0aWVzOiBzdHJhdGVneS5wcm9iYWJpbGl0aWVzLnJlZHVjZShmdW5jdGlvbiAoc3VtLCBwcm9iYWJpbGl0eSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuICcnICsgc3VtICsgcHJvYmFiaWxpdHkudG9GaXhlZCgyKSArICcgfCAnO1xuXHRcdFx0XHRcdH0sICcnKS5zbGljZSgwLCAtMyksXG5cdFx0XHRcdFx0Z3VhcmRpYW5VdGlsaXR5OiBhdmVyYWdlR3VhcmRpYW5VdGlsaXR5LFxuXHRcdFx0XHRcdHJvYmJlclV0aWxpdHk6IGF2ZXJhZ2VSb2JiZXJVdGlsaXR5XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdHZhciBzb3J0ZWRTdGF0aXN0aWNzVGFibGUgPSBzdGF0aXN0aWNzVGFibGUuc29ydChmdW5jdGlvbiAoczEsIHMyKSB7XG5cdFx0XHRcdHJldHVybiBzMi5ndWFyZGlhblV0aWxpdHkgLSBzMS5ndWFyZGlhblV0aWxpdHk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gV2UgZmVlZCB0aGUgY2hhcnQgd2l0aCBhdmVyYWdlIGV2b2x1dGlvbiBmb3IgdGhlIGJlc3Qgc3RyYXRlZ3kuXG5cblx0XHRcdHZhciBjaGFydERhdGEgPSBbXTtcblx0XHRcdHZhciBzdW0gPSAwO1xuXG5cdFx0XHRzb3J0ZWRTdGF0aXN0aWNzVGFibGVbMF0uaXRlcmF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVyYXRpb24pIHtcblxuXHRcdFx0XHRjaGFydERhdGEucHVzaCh7XG5cdFx0XHRcdFx0eDogY2hhcnREYXRhLmxlbmd0aCxcblx0XHRcdFx0XHR5OiAoc3VtICs9IGl0ZXJhdGlvbi5ndWFyZGlhblV0aWxpdHkpIC8gKGNoYXJ0RGF0YS5sZW5ndGggKyAxKVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBCdWlsZGluZyB0aGUgbGlzdCBvZiBzdGF0aXN0aWNzLlxuXG5cdFx0XHR2YXIgc3RhdGlzdGljc1RhYmxlSFRNTCA9ICdcXG5cXHRcXHRcXHQ8dGFibGUgY2xhc3M9XCJzdHJpcGVkIGNlbnRlcmVkXCI+XFxuXFx0XFx0XFx0XFx0PHRoZWFkPlxcblxcdFxcdFxcdFxcdFxcdDx0cj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8dGg+UHJvYmFiaWxpdGllczwvdGg+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPkd1YXJkaWFuIHV0aWxpdHk8L3RoPlxcblxcdFxcdFxcdFxcdFxcdFxcdDx0aD5Sb2JiZXIgdXRpbGl0eTwvdGg+XFxuXFx0XFx0XFx0XFx0XFx0PC90cj5cXG5cXHRcXHRcXHRcXHQ8L3RoZWFkPlxcblxcblxcdFxcdFxcdFxcdDx0Ym9keT4nO1xuXG5cdFx0XHRzb3J0ZWRTdGF0aXN0aWNzVGFibGUuZm9yRWFjaChmdW5jdGlvbiAoc3RyYXRlZ3kpIHtcblxuXHRcdFx0XHRzdGF0aXN0aWNzVGFibGVIVE1MICs9ICdcXG5cXHRcXHRcXHRcXHQ8dHI+XFxuXFx0XFx0XFx0XFx0XFx0PHRkPicgKyBzdHJhdGVneS5wcm9iYWJpbGl0aWVzICsgJzwvdGQ+XFxuXFx0XFx0XFx0XFx0XFx0PHRkPicgKyBzdHJhdGVneS5ndWFyZGlhblV0aWxpdHkgKyAnPC90ZD5cXG5cXHRcXHRcXHRcXHRcXHQ8dGQ+JyArIHN0cmF0ZWd5LnJvYmJlclV0aWxpdHkgKyAnPC90ZD5cXG5cXHRcXHRcXHRcXHQ8L3RyPic7XG5cdFx0XHR9KTtcblxuXHRcdFx0c3RhdGlzdGljc1RhYmxlSFRNTCArPSAnXFxuXFx0XFx0XFx0XFx0PC90Ym9keT5cXG5cXHRcXHRcXHQ8L3RhYmxlPic7XG5cblx0XHRcdCQoJyNtb2RhbC1yZXN1bHRzIHAnKS5odG1sKCdcXG5cXG5cXHRcXHRcXHQ8ZGl2IGNsYXNzPVwicm93XCI+XFxuXFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cImNvbCBzMTJcIj5cXG5cXHRcXHRcXHRcXHRcXHQ8dWwgY2xhc3M9XCJ0YWJzXCI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGxpIGNsYXNzPVwidGFiIGNvbCBzM1wiPjxhIGNsYXNzPVwiYWN0aXZlXCIgaHJlZj1cIiNjaGFydFwiPkNoYXJ0PC9hPjwvbGk+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGxpIGNsYXNzPVwidGFiIGNvbCBzM1wiPjxhIGhyZWY9XCIjdmlzdWFsaXphdGlvblwiPlZpc3VhbGl6YXRpb248L2E+PC9saT5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8bGkgY2xhc3M9XCJ0YWIgY29sIHMzXCI+PGEgaHJlZj1cIiNwYXRyb2xzXCI+UGF0cm9sczwvYT48L2xpPlxcblxcdFxcdFxcdFxcdFxcdFxcdDxsaSBjbGFzcz1cInRhYiBjb2wgczNcIj48YSBocmVmPVwiI3N0YXRpc3RpY3NcIj5TdGF0aXN0aWNzPC9hPjwvbGk+XFxuXFx0XFx0XFx0XFx0XFx0PC91bD5cXG5cXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHQ8ZGl2IGlkPVwiY2hhcnRcIiBjbGFzcz1cImNvbCBzMTJcIj5cXG5cXHRcXHRcXHRcXHRcXHQ8Y2FudmFzIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjQwMFwiIGlkPVwibGluZS1jaGFydFwiPjwvY2FudmFzPlxcblxcdFxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdFxcdFxcdDxkaXYgaWQ9XCJ2aXN1YWxpemF0aW9uXCIgY2xhc3M9XCJjb2wgczEyXCI+XFxuXFx0XFx0XFx0XFx0XFx0U2FtZSBncmFwaCBhcyBpbiBzZXR0aW5ncyB3aXRoIGFuaW1hdGlvbi5cXG5cXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHQ8ZGl2IGlkPVwicGF0cm9sc1wiIGNsYXNzPVwiY29sIHMxMlwiPlxcblxcdFxcdFxcdFxcdFxcdCcgKyBwYXRyb2xzVGFibGVIVE1MICsgJ1xcblxcdFxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdFxcdFxcdDxkaXYgaWQ9XCJzdGF0aXN0aWNzXCIgY2xhc3M9XCJjb2wgczEyXCI+XFxuXFx0XFx0XFx0XFx0XFx0JyArIHN0YXRpc3RpY3NUYWJsZUhUTUwgKyAnXFxuXFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0PC9kaXY+XFxuXFxuXFx0XFx0JykubW9kYWwoJ29wZW4nKTtcblxuXHRcdFx0JCgnI21vZGFsLXJlc3VsdHMgcCB1bC50YWJzJykudGFicygpO1xuXG5cdFx0XHR2YXIgc2NhdHRlckNoYXJ0ID0gbmV3IENoYXJ0KFwibGluZS1jaGFydFwiLCB7XG5cdFx0XHRcdHR5cGU6ICdsaW5lJyxcblx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdGRhdGFzZXRzOiBbe1xuXHRcdFx0XHRcdFx0bGFiZWw6ICdCZXN0IHN0cmF0ZWd5IHV0aWxpdHkgb3ZlciB0aW1lLicsXG5cdFx0XHRcdFx0XHRkYXRhOiBjaGFydERhdGFcblx0XHRcdFx0XHR9XVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRvcHRpb25zOiB7XG5cdFx0XHRcdFx0bWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXG5cdFx0XHRcdFx0c2NhbGVzOiB7XG5cdFx0XHRcdFx0XHR4QXhlczogW3tcblx0XHRcdFx0XHRcdFx0dHlwZTogJ2xpbmVhcicsXG5cdFx0XHRcdFx0XHRcdHBvc2l0aW9uOiAnYm90dG9tJ1xuXHRcdFx0XHRcdFx0fV1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cdH1dKTtcblxuXHRyZXR1cm4gUmVzdWx0cztcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gUmVzdWx0czsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfR3JhcGggPSByZXF1aXJlKCcuL3NldHRpbmdzL3N1YnNldHRpbmdzL0dyYXBoLmpzJyk7XG5cbnZhciBfR3JhcGgyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfR3JhcGgpO1xuXG52YXIgX1JvYmJlcnMgPSByZXF1aXJlKCcuL3NldHRpbmdzL3N1YnNldHRpbmdzL1JvYmJlcnMuanMnKTtcblxudmFyIF9Sb2JiZXJzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1JvYmJlcnMpO1xuXG52YXIgX1NhdmVyID0gcmVxdWlyZSgnLi9zZXR0aW5ncy9maWxlcy9TYXZlcicpO1xuXG52YXIgX1NhdmVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NhdmVyKTtcblxudmFyIF9Mb2FkZXIgPSByZXF1aXJlKCcuL3NldHRpbmdzL2ZpbGVzL0xvYWRlcicpO1xuXG52YXIgX0xvYWRlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Mb2FkZXIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vKlxuKlx0U2V0dGluZ3Mgb2YgdGhlIHNpbXVsYXRpb24uXG4qXG4qXHRJbml0aWFsaXplIHNldHRpbmdzIHdpdGggZGVmYXVsdCB2YWx1ZXMuXG4qL1xuXG52YXIgU2V0dGluZ3MgPSBmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIFNldHRpbmdzKCkge1xuXHRcdF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTZXR0aW5ncyk7XG5cblx0XHQvLyBGaWVsZHNcblxuXHRcdHRoaXMuZ3JhcGggPSBuZXcgX0dyYXBoMi5kZWZhdWx0KHRoaXMpO1xuXG5cdFx0dGhpcy5yb2JiZXJzID0gbmV3IF9Sb2JiZXJzMi5kZWZhdWx0KHRoaXMpO1xuXG5cdFx0dGhpcy5zYXZlciA9IG5ldyBfU2F2ZXIyLmRlZmF1bHQodGhpcyk7XG5cdFx0dGhpcy5sb2FkZXIgPSBuZXcgX0xvYWRlcjIuZGVmYXVsdCh0aGlzKTtcblxuXHRcdC8vIERlZmF1bHQgdmFsdWVzXG5cblx0XHR0aGlzLmluaXQoKTtcblx0XHR0aGlzLmxvYWRlci5sb2FkRGVmYXVsdCgpO1xuXHR9XG5cblx0X2NyZWF0ZUNsYXNzKFNldHRpbmdzLCBbe1xuXHRcdGtleTogJ2luaXQnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBpbml0KCkge1xuXHRcdFx0dGhpcy5ncmFwaC5pbml0KCk7XG5cdFx0XHR0aGlzLnJvYmJlcnMuaW5pdCgpO1xuXHRcdFx0JCgnI251bWJlck9mSXRlcmF0aW9ucycpLnZhbCgyMCk7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0UmV0dXJuIHNldHRpbmdzIGFzIGFzIEpTT04gb2JqZWN0LlxuICAqXG4gICpcdFRob3NlIHNldHRpbmdzIGNhbiBiZSBzZW5kIHRvIHRoZSBiYWNrZW5kLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdnZXRTZXR0aW5ncycsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGdldFNldHRpbmdzKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Z2VuZXJhbDogdGhpcy5nZXRHZW5lcmFsU2V0dGluZ3MoKSxcblx0XHRcdFx0cGF0aHM6IHRoaXMuZ3JhcGguZ2V0U2V0dGluZ3MoKSxcblx0XHRcdFx0cm9iYmVyczogdGhpcy5yb2JiZXJzLmdldFNldHRpbmdzKClcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0Q29uY2F0ZW5hdGUgdGhlIGdlbmVyYWwgc2V0dGluZ3MgaW4gb25lIFxuICAqXHRKU09OIG9iamVjdC5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnZ2V0R2VuZXJhbFNldHRpbmdzJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gZ2V0R2VuZXJhbFNldHRpbmdzKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0bnVtYmVyT2ZJdGVyYXRpb25zOiBwYXJzZUludCgkKCcjbnVtYmVyT2ZJdGVyYXRpb25zJykudmFsKCkpXG5cdFx0XHR9O1xuXHRcdH1cblx0fV0pO1xuXG5cdHJldHVybiBTZXR0aW5ncztcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gU2V0dGluZ3M7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8qXG4qXHRMb2FkZXIgZW5hYmxlcyB1cyB0byBsb2FkIHNldHRpbmdzIGZyb20gYW4gb2JqZWN0IG9yIGZyb20gYSBmaWxlLlxuKi9cblxudmFyIExvYWRlciA9IGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gTG9hZGVyKHNldHRpbmdzKSB7XG5cdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIExvYWRlcik7XG5cblx0XHR0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG5cblx0XHR0aGlzLmRlZmF1bHRTZXR0aW5ncyA9IHtcblx0XHRcdFwiZ2VuZXJhbFwiOiB7XG5cdFx0XHRcdFwibnVtYmVyT2ZJdGVyYXRpb25zXCI6IDIwXG5cdFx0XHR9LFxuXHRcdFx0XCJwYXRoc1wiOiB7XG5cdFx0XHRcdFwidmVydGljZXNcIjogW3tcblx0XHRcdFx0XHRcImlkXCI6IDAsXG5cdFx0XHRcdFx0XCJwb3NpdGlvblwiOiB7XG5cdFx0XHRcdFx0XHRcInhcIjogOTMuNzQ3MjM4MjIxODA0MDgsXG5cdFx0XHRcdFx0XHRcInlcIjogMjBcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwicm9iYmVyc0ludGVyZXN0XCI6IDEsXG5cdFx0XHRcdFx0XCJndWFyZGlhbnNDb3N0XCI6IDIsXG5cdFx0XHRcdFx0XCJndWFyZGlhbnNSZXdhcmRcIjogMSxcblx0XHRcdFx0XHRcInJvYmJlclNldHRpbmdzXCI6IHtcblx0XHRcdFx0XHRcdFwiMFwiOiB7XG5cdFx0XHRcdFx0XHRcdFwiY29zdFwiOiAyLFxuXHRcdFx0XHRcdFx0XHRcInJld2FyZFwiOiAxXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0XCJpZFwiOiAxLFxuXHRcdFx0XHRcdFwicG9zaXRpb25cIjoge1xuXHRcdFx0XHRcdFx0XCJ4XCI6IDIwLjI1Mjc2MTc3ODE5NTkxOCxcblx0XHRcdFx0XHRcdFwieVwiOiAyMFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJyb2JiZXJzSW50ZXJlc3RcIjogMSxcblx0XHRcdFx0XHRcImd1YXJkaWFuc0Nvc3RcIjogMixcblx0XHRcdFx0XHRcImd1YXJkaWFuc1Jld2FyZFwiOiAxLFxuXHRcdFx0XHRcdFwicm9iYmVyU2V0dGluZ3NcIjoge1xuXHRcdFx0XHRcdFx0XCIwXCI6IHtcblx0XHRcdFx0XHRcdFx0XCJjb3N0XCI6IDIsXG5cdFx0XHRcdFx0XHRcdFwicmV3YXJkXCI6IDFcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1dLFxuXHRcdFx0XHRcImVkZ2VzXCI6IFt7XG5cdFx0XHRcdFx0XCJzb3VyY2VcIjogMCxcblx0XHRcdFx0XHRcInRhcmdldFwiOiAxLFxuXHRcdFx0XHRcdFwibGVuZ3RoXCI6IDczLjQ5NDQ3NjQ0MzYwODE2XG5cdFx0XHRcdH1dXG5cdFx0XHR9LFxuXHRcdFx0XCJyb2JiZXJzXCI6IHtcblx0XHRcdFx0XCJsaXN0XCI6IFswXSxcblx0XHRcdFx0XCJjYXRjaFByb2JhYmlsaXR5XCI6IHtcblx0XHRcdFx0XHRcIjBcIjogMC41XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0LypcbiAqXHRMb2FkIHRoZSBzZXR0aW5ncyAoT2JqZWN0KSBhZnRlciBjaGVja2luZyBpZiB0aGV5IGFyZSBjb3JydXB0ZWQgb3Igbm90LlxuICovXG5cblxuXHRfY3JlYXRlQ2xhc3MoTG9hZGVyLCBbe1xuXHRcdGtleTogXCJsb2FkXCIsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGxvYWQoc2V0dGluZ3MpIHtcblx0XHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0XHRcdC8vIFRPRE8gOiBWZXJpZnkgaW50ZWdyaXR5LlxuXHRcdFx0dGhpcy5zZXR0aW5ncy5pbml0KCk7XG5cblx0XHRcdCQoJyNudW1iZXJPZkl0ZXJhdGlvbnMnKS52YWwoc2V0dGluZ3MuZ2VuZXJhbC5udW1iZXJPZkl0ZXJhdGlvbnMpO1xuXG5cdFx0XHQvLyBJZCBtYXBzIChsb2FkZWQgaWRzID0+IGN1cnJlbnQgaWRzKVxuXG5cdFx0XHR2YXIgdmVydGljZXNJZE1hcCA9IG5ldyBNYXAoKTtcblx0XHRcdHZhciByb2JiZXJzSWRNYXAgPSBuZXcgTWFwKCk7XG5cblx0XHRcdHNldHRpbmdzLnJvYmJlcnMubGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChyb2JiZXJJZCkge1xuXHRcdFx0XHRyb2JiZXJzSWRNYXAuc2V0KHJvYmJlcklkLCBfdGhpcy5zZXR0aW5ncy5yb2JiZXJzLm5ld1JvYmJlcigxIC0gc2V0dGluZ3Mucm9iYmVycy5jYXRjaFByb2JhYmlsaXR5W1wiXCIgKyByb2JiZXJJZF0pKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRzZXR0aW5ncy5wYXRocy52ZXJ0aWNlcy5mb3JFYWNoKGZ1bmN0aW9uICh2ZXJ0ZXgpIHtcblxuXHRcdFx0XHR2ZXJ0aWNlc0lkTWFwLnNldCh2ZXJ0ZXguaWQsIF90aGlzLnNldHRpbmdzLmdyYXBoLmFkZE5vZGUodmVydGV4LnBvc2l0aW9uLCB2ZXJ0ZXguaWQgPT09IDAsIHZlcnRleC5yb2JiZXJzSW50ZXJlc3QsIHZlcnRleC5ndWFyZGlhbnNDb3N0LCB2ZXJ0ZXguZ3VhcmRpYW5zUmV3YXJkKSk7XG5cblx0XHRcdFx0dmFyIG5ld05vZGVJZCA9IHZlcnRpY2VzSWRNYXAuZ2V0KHZlcnRleC5pZCk7XG5cblx0XHRcdFx0c2V0dGluZ3Mucm9iYmVycy5saXN0LmZvckVhY2goZnVuY3Rpb24gKHJvYmJlcklkKSB7XG5cdFx0XHRcdFx0dmFyIG5ld1JvYmJlcklkID0gcm9iYmVyc0lkTWFwLmdldChyb2JiZXJJZCk7XG5cblx0XHRcdFx0XHRfdGhpcy5zZXR0aW5ncy5ncmFwaC5jeS5ub2RlcyhcIltpZCA9IFxcXCJcIiArIG5ld05vZGVJZCArIFwiXFxcIl1cIikuZGF0YSgncm9iYmVyU2V0dGluZ3MnKS5zZXQobmV3Um9iYmVySWQsIHZlcnRleC5yb2JiZXJTZXR0aW5nc1tyb2JiZXJJZF0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHRzZXR0aW5ncy5wYXRocy5lZGdlcy5mb3JFYWNoKGZ1bmN0aW9uIChlZGdlKSB7XG5cdFx0XHRcdF90aGlzLnNldHRpbmdzLmdyYXBoLmxpbmsodmVydGljZXNJZE1hcC5nZXQoZWRnZS5zb3VyY2UpLCB2ZXJ0aWNlc0lkTWFwLmdldChlZGdlLnRhcmdldCkpO1xuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMuc2V0dGluZ3MuZ3JhcGguY3kuZml0KCk7XG5cblx0XHRcdGNvbnNvbGUubG9nKCdTZXR0aW5ncyBsb2FkZWQnKTtcblx0XHR9XG5cblx0XHQvKlxuICAqXHRMb2FkIHRoZSBzZXR0aW5ncyBvYmplY3QgZnJvbSBhIEpTT04gZmlsZSBvbiBjbGllbnQncyBjb21wdXRlci5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiBcImltcG9ydFwiLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBfaW1wb3J0KCkge1xuXHRcdFx0dmFyIF90aGlzMiA9IHRoaXM7XG5cblx0XHRcdHZhciBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG5cdFx0XHRpbnB1dC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnZmlsZScpO1xuXG5cdFx0XHRpbnB1dC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG5cdFx0XHRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuXHRcdFx0XHR2YXIgZmlsZSA9IGlucHV0LmZpbGVzWzBdO1xuXG5cdFx0XHRcdHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXHRcdFx0XHRyZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRcdFx0X3RoaXMyLmxvYWQoSlNPTi5wYXJzZShhdG9iKGV2ZW50LnRhcmdldC5yZXN1bHQuc3BsaXQoJywnKS5wb3AoKSkpKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRyZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcblxuXHRcdFx0XHRkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGlucHV0KTtcblx0XHRcdH0pO1xuXG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGlucHV0KTtcblxuXHRcdFx0aW5wdXQuY2xpY2soKTtcblx0XHR9XG5cblx0XHQvKlxuICAqXHRJbml0aWFsaXplIHRoZSBncmFwaCBieSBzZXR0aW5nIGRlZmF1bHQgdmFsdWVzLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6IFwibG9hZERlZmF1bHRcIixcblx0XHR2YWx1ZTogZnVuY3Rpb24gbG9hZERlZmF1bHQoKSB7XG5cdFx0XHR0aGlzLmxvYWQodGhpcy5kZWZhdWx0U2V0dGluZ3MpO1xuXHRcdH1cblx0fV0pO1xuXG5cdHJldHVybiBMb2FkZXI7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IExvYWRlcjsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBTYXZlciA9IGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gU2F2ZXIoc2V0dGluZ3MpIHtcblx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2F2ZXIpO1xuXG5cdFx0dGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXHR9XG5cblx0X2NyZWF0ZUNsYXNzKFNhdmVyLCBbe1xuXHRcdGtleTogJ3NhdmUnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBzYXZlKCkge1xuXG5cdFx0XHR2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XG5cblx0XHRcdHRoaXMuZG93bmxvYWQoZGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoKSArICctJyArIGRhdGUudG9Mb2NhbGVUaW1lU3RyaW5nKCkucmVwbGFjZSgnOicsICctJykgKyAnLmpzb24nLCBKU09OLnN0cmluZ2lmeSh0aGlzLnNldHRpbmdzLmdldFNldHRpbmdzKCkpKTtcblx0XHR9XG5cdH0sIHtcblx0XHRrZXk6ICdkb3dubG9hZCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGRvd25sb2FkKGZpbGVuYW1lLCB0ZXh0KSB7XG5cdFx0XHR2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcblx0XHRcdGxpbmsuc2V0QXR0cmlidXRlKCdocmVmJywgJ2RhdGE6dGV4dC9qc29uO2NoYXJzZXQ9dXRmLTgsJyArIGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0KSk7XG5cdFx0XHRsaW5rLnNldEF0dHJpYnV0ZSgnZG93bmxvYWQnLCBmaWxlbmFtZSk7XG5cblx0XHRcdGxpbmsuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XG5cblx0XHRcdGxpbmsuY2xpY2soKTtcblxuXHRcdFx0ZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChsaW5rKTtcblx0XHR9XG5cdH1dKTtcblxuXHRyZXR1cm4gU2F2ZXI7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFNhdmVyOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9zbGljZWRUb0FycmF5ID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkgeyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9IHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgcmV0dXJuIGFycjsgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHsgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTsgfSBlbHNlIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7IH0gfTsgfSgpO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vKlxuKlx0Q2xhc3MgcmVwcmVzZW50aW5nIHRoZSBncmFwaCBvZiB0aGUgc2ltdWxhdGlvbi5cbipcbipcdFlvdSBjYW4gYWRkIHRhcmdldHMsIGRlbGV0ZSB0YXJnZXRzLCBhbmQgbGlua1xuKlx0dGhlbSB0b2dldGhlci5cbipcbipcdEZvciBlYWNoIHRhcmdldCwgeW91IGNhbiBzZXQgOlxuKlx0XHQtIHJvYmJlcnNJbnRlcmVzdCAodGhlIHByb2JhYmlsaXR5IG9mIHJvYmJlcnMgYXR0YWNraW5nIHRoaXMgdGFyZ2V0KVxuKlx0XHQtIGd1YXJkaWFuc0Nvc3QgKHRoZSBjb3N0IHdoZW4gZ3VhcmRpYW5zIGZhaWwgdG8gcHJvdGVjdCB0aGUgdGFyZ2V0KVxuKlx0XHQtIGd1YXJkaWFuc1Jld2FyZCAodGhlIHJld2FyZCB3aGVuIGd1YXJkaWFucyBtYW5hZ2UgdG8gcHJldmVudCBcbipcdFx0XHRcdFx0XHRcdGFuIGF0dGFjaylcbipcdFx0LSByb2JiZXJTZXR0aW5ncyAodGhlIGNvc3QsIHJld2FyZCBhbmQgcHJvYmFiaWxpdHkgZm9yIGVhY2ggcm9iYmVyKVxuKlx0XHRcdChTZXQgdGhyb3VnaCB0aGUgUm9iYmVycyBjbGFzcylcbipcbipcdE5vZGVzID0gQXR0YWNrcyA9IFRhcmdldHNcbiovXG5cbnZhciBHcmFwaCA9IGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gR3JhcGgoc2V0dGluZ3MpIHtcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIEdyYXBoKTtcblxuXHRcdC8vIEZpZWxkc1xuXG5cdFx0dGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXG5cdFx0dGhpcy5zdHlsZXNoZWV0ID0gW3tcblx0XHRcdHNlbGVjdG9yOiAnbm9kZScsXG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHRoZWlnaHQ6IDIwLFxuXHRcdFx0XHR3aWR0aDogMjAsXG5cdFx0XHRcdCdiYWNrZ3JvdW5kLWNvbG9yJzogJ21hcERhdGEocm9iYmVyc0ludGVyZXN0LCAwLCAyNSwgZ3JlZW4sIHJlZCknLFxuXHRcdFx0XHRjb250ZW50OiBmdW5jdGlvbiBjb250ZW50KG5vZGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gJ04nICsgbm9kZS5kYXRhKCdpZCcpICsgJyBDJyArIG5vZGUuZGF0YSgnZ3VhcmRpYW5zQ29zdCcpICsgJy9SJyArIG5vZGUuZGF0YSgnZ3VhcmRpYW5zUmV3YXJkJyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdC8vJ3RleHQtdmFsaWduJzogJ2NlbnRlcicsXG5cdFx0XHRcdCd0ZXh0LWhhbGlnbic6ICdjZW50ZXInXG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0c2VsZWN0b3I6ICdlZGdlJyxcblx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdCdjdXJ2ZS1zdHlsZSc6ICdoYXlzdGFjaycsXG5cdFx0XHRcdCdoYXlzdGFjay1yYWRpdXMnOiAwLFxuXHRcdFx0XHR3aWR0aDogNSxcblx0XHRcdFx0b3BhY2l0eTogMC41LFxuXHRcdFx0XHQnbGluZS1jb2xvcic6ICcjYTJlZmEyJyxcblx0XHRcdFx0Y29udGVudDogZnVuY3Rpb24gY29udGVudChlZGdlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIE1hdGguZmxvb3IoX3RoaXMubGVuZ3RoKGVkZ2UpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdHNlbGVjdG9yOiAnLmJhc2UnLFxuXHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0J2JhY2tncm91bmQtY29sb3InOiAnIzYxYmZmYycsXG5cdFx0XHRcdGxhYmVsOiAnQmFzZSdcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRzZWxlY3RvcjogJzpzZWxlY3RlZCcsXG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHQnYm9yZGVyLXdpZHRoJzogNCxcblx0XHRcdFx0J2JvcmRlci1jb2xvcic6ICdwdXJwbGUnXG5cdFx0XHR9XG5cdFx0fV07XG5cblx0XHR0aGlzLmN5ID0gd2luZG93LmN5ID0gY3l0b3NjYXBlKHtcblx0XHRcdGNvbnRhaW5lcjogJCgnI2dyYXBoJyksXG5cblx0XHRcdGJveFNlbGVjdGlvbkVuYWJsZWQ6IGZhbHNlLFxuXHRcdFx0YXV0b3Vuc2VsZWN0aWZ5OiBmYWxzZSxcblxuXHRcdFx0c3R5bGU6IHRoaXMuc3R5bGVzaGVldFxuXHRcdH0pO1xuXG5cdFx0dGhpcy5jeS5taW5ab29tKDAuNSk7XG5cdFx0dGhpcy5jeS5tYXhab29tKDIpO1xuXG5cdFx0d2luZG93LmdyYXBoID0gdGhpcztcblxuXHRcdC8vIFJlZnJlc2hpbmcgdGhlIGxlbmd0aFxuXG5cdFx0dGhpcy5yZWZyZXNoSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gY3kuZWRnZXMoKS5mb3JFYWNoKGZ1bmN0aW9uIChlZGdlKSB7XG5cdFx0XHRcdHJldHVybiBlZGdlLmRhdGEoJ3JlZnJlc2gnLCBNYXRoLnJhbmRvbSgpKTtcblx0XHRcdH0pO1xuXHRcdH0sIDI1MCk7XG5cblx0XHQvLyBET00gbGlzdGVuZXJzXG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnF0aXAtY29udGVudCAubGluaycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0Y29uc29sZS5pbmZvKFwiTGlua2luZyBhIHRhcmdldCB0byBhbm90aGVyLi4uXCIpO1xuXHRcdFx0X3RoaXMuY3VycmVudEFjdGlvbiA9ICdsaW5raW5nJztcblx0XHRcdCQoJy5xdGlwJykucXRpcCgnaGlkZScpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5xdGlwLWNvbnRlbnQgLmRlbGV0ZScsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0X3RoaXMubGFzdFNlbGVjdGVkTm9kZS5yZW1vdmUoKTtcblx0XHRcdF90aGlzLnJlc2V0KCk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnF0aXAtY29udGVudCAuZGlzbWlzcycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0X3RoaXMucmVzZXQoKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucXRpcC1jb250ZW50IC5wbHVzSW50ZXJlc3QnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgncm9iYmVyc0ludGVyZXN0JywgTWF0aC5taW4oX3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdyb2JiZXJzSW50ZXJlc3QnKSArIDEsIDI1KSk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnF0aXAtY29udGVudCAubWludXNJbnRlcmVzdCcsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0X3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdyb2JiZXJzSW50ZXJlc3QnLCBNYXRoLm1heChfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ3JvYmJlcnNJbnRlcmVzdCcpIC0gMSwgMCkpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5xdGlwLWNvbnRlbnQgLnBsdXNDb3N0JywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ2d1YXJkaWFuc0Nvc3QnLCBNYXRoLm1pbihfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ2d1YXJkaWFuc0Nvc3QnKSArIDEsIDI1KSk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnF0aXAtY29udGVudCAubWludXNDb3N0JywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ2d1YXJkaWFuc0Nvc3QnLCBNYXRoLm1heChfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ2d1YXJkaWFuc0Nvc3QnKSAtIDEsIDApKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucXRpcC1jb250ZW50IC5wbHVzUmV3YXJkJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ2d1YXJkaWFuc1Jld2FyZCcsIE1hdGgubWluKF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgnZ3VhcmRpYW5zUmV3YXJkJykgKyAxLCAyNSkpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5xdGlwLWNvbnRlbnQgLm1pbnVzUmV3YXJkJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ2d1YXJkaWFuc1Jld2FyZCcsIE1hdGgubWF4KF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgnZ3VhcmRpYW5zUmV3YXJkJykgLSAxLCAwKSk7XG5cdFx0fSk7XG5cblx0XHQvLyBDeXRvc2NhcGUgbGlzdGVuZXJzXG5cblx0XHR0aGlzLmN5Lm9uKCd0YXAnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdGlmIChldmVudC50YXJnZXQgPT09IGV2ZW50LmN5KSBfdGhpcy5yZXNldCgpO1xuXHRcdFx0Ly8gV2hlbiB5b3UgdGFwIG9uIHRoZSBiYWNrZ3JvdW5kIGFuZCB0aGF0IHRoZXJlIGFyZSBubyB2aXNpYmxlIHRpcHMsIHlvdSBhZGQgYSBuZXcgbm9kZSBhdCB0aGlzIHBvc2l0aW9uLlxuXHRcdFx0Ly8gSWYgYSB0aXAgaXMgdmlzaWJsZSwgeW91IHByb2JhYmx5IGp1c3Qgd2FudCB0byBkaXNtaXNzIGl0XG5cdFx0XHRpZiAoZXZlbnQudGFyZ2V0ID09PSBldmVudC5jeSAmJiAhJCgnLnF0aXA6dmlzaWJsZScpLmxlbmd0aCkge1xuXHRcdFx0XHRyZXR1cm4gX3RoaXMuYWRkTm9kZShldmVudC5wb3NpdGlvbik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR0aGlzLmN5Lm9uKCd0YXAnLCAnbm9kZScsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0aWYgKF90aGlzLmN1cnJlbnRBY3Rpb24gPT09ICdsaW5raW5nJykge1xuXHRcdFx0XHRfdGhpcy5jdXJyZW50QWN0aW9uID0gbnVsbDtcblx0XHRcdFx0dmFyIHNlY29uZE5vZGUgPSBldmVudC50YXJnZXQ7XG5cdFx0XHRcdC8vIFdlIGNoZWNrIGlmIHRoYXQgZWRnZSBhbGVhZHkgZXhpc3RzIG9yIGlmIHRoZSBzb3VyY2UgYW5kIHRhcmdldCBhcmUgdGhlIHNhbWUgbm9kZS5cblx0XHRcdFx0aWYgKCFfdGhpcy5jeS5lbGVtZW50cygnZWRnZVtzb3VyY2UgPSBcIicgKyBfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmlkKCkgKyAnXCJdW3RhcmdldCA9IFwiJyArIHNlY29uZE5vZGUuaWQoKSArICdcIl0nKS5sZW5ndGggJiYgIV90aGlzLmN5LmVsZW1lbnRzKCdlZGdlW3RhcmdldCA9IFwiJyArIF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuaWQoKSArICdcIl1bc291cmNlID0gXCInICsgc2Vjb25kTm9kZS5pZCgpICsgJ1wiXScpLmxlbmd0aCAmJiBzZWNvbmROb2RlICE9IF90aGlzLmxhc3RTZWxlY3RlZE5vZGUpIHtcblx0XHRcdFx0XHRfdGhpcy5saW5rKF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuaWQoKSwgc2Vjb25kTm9kZS5pZCgpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRfdGhpcy5sYXN0U2VsZWN0ZWROb2RlID0gZXZlbnQudGFyZ2V0O1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5jeS5vbigndGFwJywgJ2VkZ2UnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdGV2ZW50LnRhcmdldC5yZW1vdmUoKTtcblx0XHR9KTtcblxuXHRcdHRoaXMuaW5pdCgpO1xuXHR9XG5cblx0LypcbiAqXHRJbml0aWFsaXplIHRoZSBncmFwaCBieSBzZXR0aW5nIGRlZmF1bHQgdmFsdWVzLlxuICovXG5cblxuXHRfY3JlYXRlQ2xhc3MoR3JhcGgsIFt7XG5cdFx0a2V5OiAnaW5pdCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGluaXQoKSB7XG5cdFx0XHR0aGlzLm5ickVkZ2VzQ3JlYXRlZCA9IDA7XG5cdFx0XHR0aGlzLm5ick5vZGVzQ3JlYXRlZCA9IDA7XG5cblx0XHRcdHRoaXMubGFzdFNlbGVjdGVkTm9kZSA9IG51bGw7XG5cdFx0XHR0aGlzLmN1cnJlbnRBY3Rpb24gPSBudWxsO1xuXG5cdFx0XHR0aGlzLmN5LmVsZW1lbnRzKCkuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0XHRyZXR1cm4gZWxlbWVudC5yZW1vdmUoKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdFNvcnQgdGFyZ2V0cyB3aXRoIHRoZSBDb1NFIGxheW91dCAoYnkgQmlsa2VudCBVbml2ZXJzaXR5KS5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnc29ydCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHNvcnQoKSB7XG5cdFx0XHR0aGlzLmN5LmxheW91dCh7XG5cdFx0XHRcdG5hbWU6ICdjb3NlLWJpbGtlbnQnLFxuXHRcdFx0XHRhbmltYXRlOiB0cnVlXG5cdFx0XHR9KS5ydW4oKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0UmVzZXQgdGhlIGN1cnJlbnQgYWN0aW9uLCBzZWxlY3RlZCB0YXJnZXQgYW5kIGhpZGUgdGhlIHRpcHMuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ3Jlc2V0Jyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gcmVzZXQoKSB7XG5cdFx0XHR0aGlzLmxhc3RTZWxlY3RlZE5vZGUgPSBudWxsO1xuXHRcdFx0dGhpcy5jdXJyZW50QWN0aW9uID0gbnVsbDtcblx0XHRcdCQoJy5xdGlwJykucXRpcCgnaGlkZScpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRMaW5rIHR3byB0YXJnZXRzIHRvZ2V0aGVyLiBZb3UgaGF2ZSB0byBzcGVjaWZ5IHRoZSBpZHMuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ2xpbmsnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBsaW5rKHNvdXJjZSwgdGFyZ2V0KSB7XG5cdFx0XHR0aGlzLmN5LmFkZCh7XG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRpZDogJ2UnICsgdGhpcy5uYnJFZGdlc0NyZWF0ZWQrKyxcblx0XHRcdFx0XHRzb3VyY2U6IHNvdXJjZSxcblx0XHRcdFx0XHR0YXJnZXQ6IHRhcmdldFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRncm91cDogJ2VkZ2VzJyxcblx0XHRcdFx0c2VsZWN0YWJsZTogdHJ1ZSxcblx0XHRcdFx0bG9ja2VkOiBmYWxzZSxcblx0XHRcdFx0Z3JhYmJhYmxlOiB0cnVlLFxuXHRcdFx0XHRjbGFzc2VzOiAnJ1xuXHRcdFx0fSk7XG5cdFx0XHRjb25zb2xlLmluZm8oJ0VkZ2UgYWRkZWQgbGlua2luZyAnICsgc291cmNlICsgJyB0byAnICsgdGFyZ2V0ICsgJy4nKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0QWRkIGEgbm9kZSB0byB0aGUgZ3JhcGguXG4gICpcdFxuICAqXHRBcmd1bWVudHMgOlxuICAqXHRcdC0gcG9zaXRpb24gc2hvdWxkIGJlIGFuIG9iamVjdCB3aXRoIGZpZWxkcyB4IGFuZCB5LlxuICAqXHRcdC0gYmFzZSBpcyBhIGJvb2xlYW4gZGVmaW5pbmcgaWYgdGhlIG5vZGUgaXMgdGhlIGJhc2UuXG4gICpcbiAgKlx0QmFzZSBub2RlcyBjYW4gbm90IGJlZW4gYXR0YWNrZXQgbm9yIGRlZmVuZGVkLlxuICAqXHRQYXRyb2xzIGhhdmUgdG8gc3RhcnQgYW5kIGVuZCBhdCB0aGUgYmFzZS5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnYWRkTm9kZScsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGFkZE5vZGUoKSB7XG5cdFx0XHR2YXIgcG9zaXRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHsgeDogMCwgeTogMCB9O1xuXHRcdFx0dmFyIGJhc2UgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuXHRcdFx0dmFyIHJvYmJlcnNJbnRlcmVzdCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogMTtcblx0XHRcdHZhciBndWFyZGlhbnNDb3N0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiAyO1xuXHRcdFx0dmFyIGd1YXJkaWFuc1Jld2FyZCA9IGFyZ3VtZW50cy5sZW5ndGggPiA0ICYmIGFyZ3VtZW50c1s0XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzRdIDogMTtcblxuXHRcdFx0dmFyIG5ld05vZGVJZCA9IHRoaXMuY3kubm9kZXMoKS5sZW5ndGg7XG5cblx0XHRcdHZhciBuZXdOb2RlID0gdGhpcy5jeS5hZGQoe1xuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0aWQ6IG5ld05vZGVJZCxcblx0XHRcdFx0XHRyb2JiZXJzSW50ZXJlc3Q6IHJvYmJlcnNJbnRlcmVzdCxcblx0XHRcdFx0XHRndWFyZGlhbnNDb3N0OiBndWFyZGlhbnNDb3N0LFxuXHRcdFx0XHRcdGd1YXJkaWFuc1Jld2FyZDogZ3VhcmRpYW5zUmV3YXJkLFxuXHRcdFx0XHRcdHJvYmJlclNldHRpbmdzOiBuZXcgTWFwKClcblx0XHRcdFx0fSxcblx0XHRcdFx0cG9zaXRpb246IHBvc2l0aW9uLFxuXHRcdFx0XHRncm91cDogJ25vZGVzJyxcblx0XHRcdFx0c2VsZWN0YWJsZTogdHJ1ZSxcblx0XHRcdFx0bG9ja2VkOiBmYWxzZSxcblx0XHRcdFx0Z3JhYmJhYmxlOiB0cnVlLFxuXHRcdFx0XHRjbGFzc2VzOiBiYXNlID8gJ2Jhc2UnIDogJydcblx0XHRcdH0pLnF0aXAoe1xuXHRcdFx0XHRjb250ZW50OiAnXFxuXFx0XFx0XFx0PGRpdj5cXG5cXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gYmx1ZSBsaW5rXCIgc3R5bGU9XCJ3aWR0aDoxNjBweFwiPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnMgcmlnaHRcIj50aW1lbGluZTwvaT5MaW5rIHRvLi4uPC9hPlxcblxcdFxcdFxcdFxcdDxhIGNsYXNzPVwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biByZWQgZGVsZXRlXCIgc3R5bGU9XCJ3aWR0aDoxNjBweDsgbWFyZ2luLXRvcDogMTBweFwiICcgKyAoYmFzZSA/ICdkaXNhYmxlZCcgOiAnJykgKyAnPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnMgcmlnaHRcIj5kZWxldGU8L2k+RGVsZXRlPC9hPlxcblxcdFxcdFxcdFxcdFxcblxcdFxcdFxcdFxcdDxhIGNsYXNzPVwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biByZWQgbGlnaHRlbi0yIG1pbnVzSW50ZXJlc3QgY29sXCIgJyArIChiYXNlID8gJ2Rpc2FibGVkJyA6ICcnKSArICc+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPnJlbW92ZV9jaXJjbGU8L2k+PC9hPlxcblxcdFxcdFxcdFxcdDxkaXYgY2xhc3M9XCJsYWJlbFwiPlJvYmJlcnMgSW50ZXJlc3Q8L2Rpdj5cXG5cXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gZ3JlZW4gbGlnaHRlbi0yIHBsdXNJbnRlcmVzdCBjb2xcIiAnICsgKGJhc2UgPyAnZGlzYWJsZWQnIDogJycpICsgJz48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+YWRkX2NpcmNsZTwvaT48L2E+XFxuXFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIHJlZCBsaWdodGVuLTIgbWludXNDb3N0IGNvbFwiICcgKyAoYmFzZSA/ICdkaXNhYmxlZCcgOiAnJykgKyAnPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIj5yZW1vdmVfY2lyY2xlPC9pPjwvYT5cXG5cXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVwibGFiZWxcIj5HdWFyZGlhbnMgQ29zdDwvZGl2PlxcblxcdFxcdFxcdFxcdDxhIGNsYXNzPVwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biBncmVlbiBsaWdodGVuLTIgcGx1c0Nvc3QgY29sXCIgJyArIChiYXNlID8gJ2Rpc2FibGVkJyA6ICcnKSArICc+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPmFkZF9jaXJjbGU8L2k+PC9hPlxcblxcblxcdFxcdFxcdFxcdDxhIGNsYXNzPVwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biByZWQgbGlnaHRlbi0yIG1pbnVzUmV3YXJkIGNvbFwiICcgKyAoYmFzZSA/ICdkaXNhYmxlZCcgOiAnJykgKyAnPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIj5yZW1vdmVfY2lyY2xlPC9pPjwvYT5cXG5cXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVwibGFiZWxcIj5HdWFyZGlhbnMgUmV3YXJkPC9kaXY+XFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGdyZWVuIGxpZ2h0ZW4tMiBwbHVzUmV3YXJkIGNvbFwiICcgKyAoYmFzZSA/ICdkaXNhYmxlZCcgOiAnJykgKyAnPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIj5hZGRfY2lyY2xlPC9pPjwvYT5cXG5cXG5cXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gZ3JlZW4gZGlzbWlzc1wiIHN0eWxlPVwid2lkdGg6MTYwcHg7IG1hcmdpbi10b3A6IDEwcHhcIj48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zIHJpZ2h0XCI+Y2FuY2VsPC9pPkRpc21pc3M8L2E+XFxuXFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0Jyxcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRteTogJ3RvcCBjZW50ZXInLFxuXHRcdFx0XHRcdGF0OiAnYm90dG9tIGNlbnRlcidcblx0XHRcdFx0fSxcblx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRjbGFzc2VzOiAncXRpcC1ib290c3RyYXAnLFxuXHRcdFx0XHRcdHdpZHRoOiAxOTVcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMuc2V0dGluZ3Mucm9iYmVycy5saXN0LmZvckVhY2goZnVuY3Rpb24gKHJvYmJlcikge1xuXHRcdFx0XHRyZXR1cm4gbmV3Tm9kZS5kYXRhKCdyb2JiZXJTZXR0aW5ncycpLnNldChyb2JiZXIsIHtcblx0XHRcdFx0XHRjb3N0OiAyLFxuXHRcdFx0XHRcdHJld2FyZDogMVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gbmV3Tm9kZUlkO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdFJldHVybiB0aGUgbGVuZ3RoIG9mIGFuIGVkZ2UuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ2xlbmd0aCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGxlbmd0aChlZGdlKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5kaXN0YW5jZShlZGdlLnNvdXJjZSgpLCBlZGdlLnRhcmdldCgpKTtcblx0XHR9XG5cblx0XHQvKlxuICAqXHRSZXR1cm4gdGhlIGRpc3RhbmNlIGJldHdlZW4gZHdvIHZlcnRpY2VzLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdkaXN0YW5jZScsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGRpc3RhbmNlKG5vZGUxLCBub2RlMikge1xuXHRcdFx0cmV0dXJuICgobm9kZTEucG9zaXRpb24oKS54IC0gbm9kZTIucG9zaXRpb24oKS54KSAqKiAyICsgKG5vZGUxLnBvc2l0aW9uKCkueSAtIG5vZGUyLnBvc2l0aW9uKCkueSkgKiogMikgKiogMC41O1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdENvbmNhdGVuYXRlIHNldHRpbmdzIGludG8gYSBKU09OIG9iamVjdC5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnZ2V0U2V0dGluZ3MnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBnZXRTZXR0aW5ncygpIHtcblx0XHRcdHZhciBfdGhpczIgPSB0aGlzO1xuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR2ZXJ0aWNlczogT2JqZWN0LmtleXMoY3kubm9kZXMoKSkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0XHRyZXR1cm4gIWlzTmFOKGtleSk7XG5cdFx0XHRcdH0pLm1hcChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdGlkOiBwYXJzZUludChjeS5ub2RlcygpW2tleV0uaWQoKSksXG5cdFx0XHRcdFx0XHRwb3NpdGlvbjogY3kubm9kZXMoKVtrZXldLnBvc2l0aW9uKCksXG5cdFx0XHRcdFx0XHRyb2JiZXJzSW50ZXJlc3Q6IGN5Lm5vZGVzKClba2V5XS5kYXRhKCdyb2JiZXJzSW50ZXJlc3QnKSxcblx0XHRcdFx0XHRcdGd1YXJkaWFuc0Nvc3Q6IGN5Lm5vZGVzKClba2V5XS5kYXRhKCdndWFyZGlhbnNDb3N0JyksXG5cdFx0XHRcdFx0XHRndWFyZGlhbnNSZXdhcmQ6IGN5Lm5vZGVzKClba2V5XS5kYXRhKCdndWFyZGlhbnNSZXdhcmQnKSxcblx0XHRcdFx0XHRcdHJvYmJlclNldHRpbmdzOiBBcnJheS5mcm9tKGN5Lm5vZGVzKClba2V5XS5kYXRhKCdyb2JiZXJTZXR0aW5ncycpKS5yZWR1Y2UoZnVuY3Rpb24gKG9iaiwgX3JlZikge1xuXHRcdFx0XHRcdFx0XHR2YXIgX3JlZjIgPSBfc2xpY2VkVG9BcnJheShfcmVmLCAyKSxcblx0XHRcdFx0XHRcdFx0ICAgIGtleSA9IF9yZWYyWzBdLFxuXHRcdFx0XHRcdFx0XHQgICAgdmFsdWUgPSBfcmVmMlsxXTtcblxuXHRcdFx0XHRcdFx0XHRvYmpba2V5XSA9IHZhbHVlO3JldHVybiBvYmo7XG5cdFx0XHRcdFx0XHR9LCB7fSlcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9KSxcblx0XHRcdFx0ZWRnZXM6IE9iamVjdC5rZXlzKGN5LmVkZ2VzKCkpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdFx0cmV0dXJuICFpc05hTihrZXkpO1xuXHRcdFx0XHR9KS5tYXAoZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRzb3VyY2U6IHBhcnNlSW50KGN5LmVkZ2VzKClba2V5XS5zb3VyY2UoKS5pZCgpKSxcblx0XHRcdFx0XHRcdHRhcmdldDogcGFyc2VJbnQoY3kuZWRnZXMoKVtrZXldLnRhcmdldCgpLmlkKCkpLFxuXHRcdFx0XHRcdFx0bGVuZ3RoOiBfdGhpczIubGVuZ3RoKGN5LmVkZ2VzKClba2V5XSlcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9KVxuXHRcdFx0fTtcblx0XHR9XG5cdH1dKTtcblxuXHRyZXR1cm4gR3JhcGg7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IEdyYXBoOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9zbGljZWRUb0FycmF5ID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkgeyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9IHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgcmV0dXJuIGFycjsgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHsgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTsgfSBlbHNlIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7IH0gfTsgfSgpO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFJvYmJlcnMgPSBmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIFJvYmJlcnMoc2V0dGluZ3MpIHtcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIFJvYmJlcnMpO1xuXG5cdFx0Ly8gRmllbGRzXG5cblx0XHR0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG5cblx0XHQvLyBET00gbGlzdGVuZXJzXG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnI3JvYmJlcnMgLmRlbGV0ZScsIGZ1bmN0aW9uIChldmVudCkge1xuXG5cdFx0XHRfdGhpcy5yZW1vdmVSb2JiZXIoJChldmVudC5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5kYXRhKCdyb2JiZXJpZCcpKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcjcm9iYmVycyAuY29uZmlndXJlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cblx0XHRcdF90aGlzLmNvbmZpZ3VyZVJvYmJlcigkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLmRhdGEoJ3JvYmJlcmlkJykpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NoYW5nZScsICcjcm9iYmVycyBpbnB1dC5kaXNjcmV0aW9uJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cblx0XHRcdHZhciBuZXdWYWx1ZSA9IDEgLSBwYXJzZUZsb2F0KCQoZXZlbnQuY3VycmVudFRhcmdldCkudmFsKCkpO1xuXG5cdFx0XHRpZiAobmV3VmFsdWUgPCAwIHx8IG5ld1ZhbHVlID4gMSkge1xuXHRcdFx0XHRyZXR1cm4gJChldmVudC5jdXJyZW50VGFyZ2V0KS5jc3Moe1xuXHRcdFx0XHRcdGNvbG9yOiAncmVkJ1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0JChldmVudC5jdXJyZW50VGFyZ2V0KS5jc3Moe1xuXHRcdFx0XHRjb2xvcjogXCIjZmZmXCJcblx0XHRcdH0pO1xuXG5cdFx0XHRfdGhpcy5jYXRjaFByb2JhYmlsaXR5LnNldCgkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpLmRhdGEoJ3JvYmJlcmlkJyksIG5ld1ZhbHVlKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnI21vZGFsLXJvYmJlci1jb25maWcgaW5wdXQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuXHRcdFx0dmFyIHJvdyA9ICQoZXZlbnQuY3VycmVudFRhcmdldCkucGFyZW50KCkucGFyZW50KCk7XG5cblx0XHRcdHZhciBub2RlSWQgPSByb3cuZGF0YSgnbm9kZWlkJyk7XG5cdFx0XHR2YXIgcm9iYmVySWQgPSByb3cuZGF0YSgncm9iYmVyaWQnKTtcblxuXHRcdFx0dmFyIHNldHRpbmcgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmRhdGEoJ3NldHRpbmcnKTtcblx0XHRcdHZhciBuZXdWYWx1ZSA9IHBhcnNlRmxvYXQoJChldmVudC5jdXJyZW50VGFyZ2V0KS52YWwoKSk7XG5cblx0XHRcdGNvbnNvbGUuaW5mbyhzZXR0aW5nICsgJyBjaGFuZ2VkIGZvciB0YXJnZXQgJyArIG5vZGVJZCArICcsIG5ldyB2YWx1ZSBpcyAnICsgbmV3VmFsdWUgKyAnLicpO1xuXG5cdFx0XHRfdGhpcy5zZXR0aW5ncy5ncmFwaC5jeS5ub2RlcygnW2lkID0gXCInICsgbm9kZUlkICsgJ1wiXScpLmRhdGEoJ3JvYmJlclNldHRpbmdzJykuZ2V0KHJvYmJlcklkKVtzZXR0aW5nXSA9IG5ld1ZhbHVlO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5pbml0KCk7XG5cdH1cblxuXHQvKlxuICpcdEluaXRpYWxpemUgdGhlIHJvYmJlcnMgYnkgc2V0dGluZyBkZWZhdWx0IHZhbHVlcy5cbiAqL1xuXG5cblx0X2NyZWF0ZUNsYXNzKFJvYmJlcnMsIFt7XG5cdFx0a2V5OiAnaW5pdCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGluaXQoKSB7XG5cdFx0XHR2YXIgX3RoaXMyID0gdGhpcztcblxuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLmxpc3QgIT09ICd1bmRlZmluZWQnKSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMubGlzdCkpLmZvckVhY2goZnVuY3Rpb24gKHJvYmJlcklkKSB7XG5cdFx0XHRcdHJldHVybiBfdGhpczIucmVtb3ZlUm9iYmVyKHJvYmJlcklkKTtcblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLm51bWJlck9mUm9iYmVyc0NyZWF0ZWQgPSAwO1xuXG5cdFx0XHR0aGlzLmxpc3QgPSBuZXcgU2V0KCk7XG5cblx0XHRcdHRoaXMuY2F0Y2hQcm9iYWJpbGl0eSA9IG5ldyBNYXAoKTtcblx0XHR9XG5cblx0XHQvKlxuICAqXHRBZGQgYSByb2JiZXIgdG8gdGhlIHNldHRpbmdzLlxuICAqXHRIaXMgY2FyZCBjYW4gYmUgc2VlbiBpbiB0aGUgXCJSb2JiZXJzXCIgdGFiLlxuICAqXHRIaXMgc2V0dGluZ3MgYXJlIHNldCB0byBkZWZhdWx0IGluIGV2ZXJ5IHRhcmdldC5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnbmV3Um9iYmVyJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gbmV3Um9iYmVyKCkge1xuXHRcdFx0dmFyIGNhdGNoUHJvYmFiaWxpdHkgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDAuNTtcblxuXG5cdFx0XHR2YXIgcm9iYmVySWQgPSB0aGlzLm51bWJlck9mUm9iYmVyc0NyZWF0ZWQrKztcblxuXHRcdFx0dGhpcy5saXN0LmFkZChyb2JiZXJJZCk7XG5cblx0XHRcdHRoaXMuY2F0Y2hQcm9iYWJpbGl0eS5zZXQocm9iYmVySWQsIGNhdGNoUHJvYmFiaWxpdHkpO1xuXG5cdFx0XHR0aGlzLnNldHRpbmdzLmdyYXBoLmN5Lm5vZGVzKCkuZWFjaChmdW5jdGlvbiAobm9kZSkge1xuXHRcdFx0XHRyZXR1cm4gbm9kZS5kYXRhKCdyb2JiZXJTZXR0aW5ncycpLnNldChyb2JiZXJJZCwge1xuXHRcdFx0XHRcdGNvc3Q6IDIsXG5cdFx0XHRcdFx0cmV3YXJkOiAxXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNyb2JiZXJzJykuYXBwZW5kKCdcXG5cXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiY29sIHM0XCIgZGF0YS1yb2JiZXJpZD1cIicgKyByb2JiZXJJZCArICdcIj5cXG5cXHRcXHRcXHQgICAgPGRpdiBjbGFzcz1cImNhcmQgYmx1ZS1ncmV5IGRhcmtlbi0xXCI+XFxuXFx0XFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cImNhcmQtY29udGVudCB3aGl0ZS10ZXh0XCI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHNwYW4gY2xhc3M9XCJjYXJkLXRpdGxlXCI+Um9iYmVyICcgKyByb2JiZXJJZCArICc8L3NwYW4+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PCEtLTxwPlNvbWUgYmFkIGd1eS48L3A+LS0+XFxuXFx0XFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cImNhcmQtYWN0aW9uXCI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cImRpc2NyZXRpb25Db250YWluZXJcIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHRcXHQ8c3Bhbj5EaXNjcmV0aW9uPC9zcGFuPlxcblxcdFxcdFxcdFxcdFxcdFxcdFxcdDxpbnB1dCB0eXBlPVwibnVtYmVyXCIgc3RlcD1cIjAuMDVcIiBjbGFzcz1cImRpc2NyZXRpb25cIiBtaW49XCIwXCIgbWF4PVwiMVwiIHZhbHVlPVwiJyArIGNhdGNoUHJvYmFiaWxpdHkgKyAnXCI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGJsdWUgY29uZmlndXJlXCIgc3R5bGU9XCJ3aWR0aDogMTAwJTsgbWFyZ2luLXRvcDogMTBweDtcIj48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zIHJpZ2h0XCI+bW9kZV9lZGl0PC9pPlJld2FyZHM8L2E+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIHJlZCBkZWxldGVcIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBtYXJnaW4tdG9wOiAxMHB4XCI+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29ucyByaWdodFwiPmRlbGV0ZTwvaT5EZWxldGU8L2E+XFxuXFx0XFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0Jyk7XG5cblx0XHRcdHJldHVybiByb2JiZXJJZDtcblx0XHR9XG5cblx0XHQvKlxuICAqXHRSZW1vdmUgYSByb2JiZXIgZnJvbSB0aGUgc2V0dGluZ3MuXG4gICpcdEhpcyBjYXJkIGdldHMgcmVtb3ZlZCBhbmQgcmVmZXJlbmNlcyB0byBoaXMgc2V0dGluZ3MgYXJlXG4gICpcdHJlbW92ZWQgZnJvbSBlYWNoIHRhcmdldC5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAncmVtb3ZlUm9iYmVyJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlUm9iYmVyKHJvYmJlcklkKSB7XG5cblx0XHRcdGNvbnNvbGUuaW5mbygnUmVtb3Zpbmcgcm9iYmVyICcgKyByb2JiZXJJZCArICcuLi4nKTtcblxuXHRcdFx0dGhpcy5saXN0LmRlbGV0ZShyb2JiZXJJZCk7XG5cblx0XHRcdHRoaXMuc2V0dGluZ3MuZ3JhcGguY3kubm9kZXMoKS5lYWNoKGZ1bmN0aW9uIChub2RlKSB7XG5cdFx0XHRcdHJldHVybiBub2RlLmRhdGEoJ3JvYmJlclNldHRpbmdzJykuZGVsZXRlKHJvYmJlcklkKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjcm9iYmVycycpLmZpbmQoJ1tkYXRhLXJvYmJlcmlkPScgKyByb2JiZXJJZCArICddJykucmVtb3ZlKCk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdERpc3BsYXkgYSBtb2RhbCBlbmFibGluZyB0aGUgdXNlciB0byBzZXQgdGhlXG4gICpcdHJvYmJlciBwcm9wZXJ0aWVzIGZvciBldmVyeSB0YXJnZXQuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ2NvbmZpZ3VyZVJvYmJlcicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGNvbmZpZ3VyZVJvYmJlcihyb2JiZXJJZCkge1xuXG5cdFx0XHRjb25zb2xlLmluZm8oJ0NvbmZpZ3VyaW5nIHJvYmJlciAnICsgcm9iYmVySWQgKyAnLicpO1xuXG5cdFx0XHR2YXIgdGFibGUgPSAnXFxuXFx0XFx0XFx0PHRhYmxlIGNsYXNzPVwic3RyaXBlZCBjZW50ZXJlZFwiPlxcblxcdFxcdFxcdFxcdDx0aGVhZD5cXG5cXHRcXHRcXHRcXHRcXHQ8dHI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPlRhcmdldCBJRDwvdGg+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPkNvc3Q8L3RoPlxcblxcdFxcdFxcdFxcdFxcdFxcdDx0aD5SZXdhcmQ8L3RoPlxcblxcdFxcdFxcdFxcdFxcdDwvdHI+XFxuXFx0XFx0XFx0XFx0PC90aGVhZD5cXG5cXG5cXHRcXHRcXHRcXHQ8dGJvZHk+JztcblxuXHRcdFx0dGhpcy5zZXR0aW5ncy5ncmFwaC5jeS5ub2RlcygnW2lkICE9IFwiMFwiXScpLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcblxuXHRcdFx0XHR2YXIgc2V0dGluZ3MgPSBub2RlLmRhdGEoJ3JvYmJlclNldHRpbmdzJykuZ2V0KHJvYmJlcklkKTtcblxuXHRcdFx0XHR0YWJsZSArPSAnXFxuXFx0XFx0XFx0XFx0PHRyIGRhdGEtbm9kZWlkPVwiJyArIG5vZGUuaWQoKSArICdcIiBkYXRhLXJvYmJlcmlkPVwiJyArIHJvYmJlcklkICsgJ1wiPlxcblxcdFxcdFxcdFxcdFxcdDx0ZD4nICsgbm9kZS5pZCgpICsgJzwvdGQ+XFxuXFx0XFx0XFx0XFx0XFx0PHRkPjxpbnB1dCBkYXRhLXNldHRpbmc9XCJjb3N0XCIgdHlwZT1cIm51bWJlclwiIHZhbHVlPVwiJyArIHNldHRpbmdzLmNvc3QgKyAnXCIgbWluPVwiMFwiPjwvdGQ+XFxuXFx0XFx0XFx0XFx0XFx0PHRkPjxpbnB1dCBkYXRhLXNldHRpbmc9XCJyZXdhcmRcIiB0eXBlPVwibnVtYmVyXCIgdmFsdWU9XCInICsgc2V0dGluZ3MucmV3YXJkICsgJ1wiIG1pbj1cIjBcIj48L3RkPlxcblxcdFxcdFxcdFxcdDwvdHI+Jztcblx0XHRcdH0pO1xuXG5cdFx0XHR0YWJsZSArPSAnXFxuXFx0XFx0XFx0XFx0PC90Ym9keT5cXG5cXHRcXHRcXHQ8L3RhYmxlPic7XG5cblx0XHRcdCQoJyNtb2RhbC1yb2JiZXItY29uZmlnIGg0JykudGV4dCgnUm9iYmVyICcgKyByb2JiZXJJZCArICcgY29uZmlndXJhdGlvbicpO1xuXG5cdFx0XHQkKCcjbW9kYWwtcm9iYmVyLWNvbmZpZyBwJykuaHRtbCh0YWJsZSk7XG5cblx0XHRcdCQoJyNtb2RhbC1yb2JiZXItY29uZmlnJykubW9kYWwoJ29wZW4nKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0UmV0dXJuIHRoZSBsaXN0IG9mIGV2ZXJ5IHJvYmJlci5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnZ2V0U2V0dGluZ3MnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBnZXRTZXR0aW5ncygpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGxpc3Q6IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5saXN0KSksXG5cdFx0XHRcdGNhdGNoUHJvYmFiaWxpdHk6IEFycmF5LmZyb20odGhpcy5jYXRjaFByb2JhYmlsaXR5KS5yZWR1Y2UoZnVuY3Rpb24gKG9iaiwgX3JlZikge1xuXHRcdFx0XHRcdHZhciBfcmVmMiA9IF9zbGljZWRUb0FycmF5KF9yZWYsIDIpLFxuXHRcdFx0XHRcdCAgICBrZXkgPSBfcmVmMlswXSxcblx0XHRcdFx0XHQgICAgdmFsdWUgPSBfcmVmMlsxXTtcblxuXHRcdFx0XHRcdG9ialtrZXldID0gdmFsdWU7cmV0dXJuIG9iajtcblx0XHRcdFx0fSwge30pXG5cdFx0XHR9O1xuXHRcdH1cblx0fV0pO1xuXG5cdHJldHVybiBSb2JiZXJzO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBSb2JiZXJzOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9JbnRlcmZhY2UgPSByZXF1aXJlKCcuL2NsYXNzZXMvSW50ZXJmYWNlJyk7XG5cbnZhciBfSW50ZXJmYWNlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0ludGVyZmFjZSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbi8qXG4qXHRDeXRvc2NhcGUgKHRoZSBncmFwaCBsaWJyYXJ5IHdlIGFyZSB1c2luZykgZG9lc24ndCB3b3JrIHNvXG4qXHR3ZWxsIHdoZW4gdGhlIHJlbmRlcmluZyBjYW52YXMgaXMgaGlkZGVuIHdoaWxlIHRoZSBncmFwaFxuKlx0aXMgaW5pdGlhbGl6ZWQuIFdlIGhhdmUgdG8gd2FpdCBmb3IgdGhlIGNhbnZhcyB0byBiZSBkaXNwbGF5ZWRcbipcdGJlZm9yZSBpbml0aWFsaXppbmcgaXQgYW5kIHRvIG9ubHkgZG8gc28gb25jZS5cbipcbipcdFRodXMsIHdlIHVzZSB0aGUgZ2xvYmFsIGZsYWcgZ3JhcGhJbml0aWFsaXplZC5cbiovXG5cbnZhciBncmFwaEluaXRpYWxpemVkID0gZmFsc2U7XG5cbi8qXG4qXHRGdW5jdGlvbiBjYWxsZWQgd2hlbmV2ZXIgdGhlIGhhc2ggaXMgdXBkYXRlZCB0byBkbyB0aGUgY29ycmVjdFxuKlx0YWN0aW9uLlxuKi9cblxudmFyIHVwZGF0ZUhhc2ggPSBmdW5jdGlvbiB1cGRhdGVIYXNoKGhhc2gpIHtcblxuXHQvLyBXZSByZW1vdmUgdGhlICcjJyBjaGFyYWN0ZXIgZnJvbSB0aGUgaGFzaC4gSnVzdCBpbiBjYXNlLlxuXHRoYXNoID0gaGFzaC5yZXBsYWNlKC9eIy8sICcnKTtcblxuXHQvKlxuICpcdFByZXZlbnRzICMgbGlua3MgZnJvbSBnb2luZyB0byB0aGUgZWxlbWVudC5cbiAqL1xuXHR2YXIgbm9kZSA9ICQoJyMnICsgaGFzaCk7XG5cdG5vZGUuYXR0cignaWQnLCAnJyk7XG5cdGRvY3VtZW50LmxvY2F0aW9uLmhhc2ggPSBoYXNoO1xuXHRub2RlLmF0dHIoJ2lkJywgaGFzaCk7XG5cblx0LypcbiAqXHRXZSBoYXZlIHRvIHNvcnQgdGhlIGdyYXBoIHdoZW4gaXQncyBkaXNwbGF5ZWRcbiAqXHRmb3IgdGhlIGZpcnN0IHRpbWUuXG4gKi9cblx0aWYgKCFncmFwaEluaXRpYWxpemVkICYmIGhhc2ggPT09ICdzaW11bGF0ZScpIHtcblx0XHR3aW5kb3cuZ3JhcGguc29ydCgpO1xuXHRcdGdyYXBoSW5pdGlhbGl6ZWQgPSB0cnVlO1xuXHR9XG5cblx0aWYgKHdpbmRvdy5jeSAhPT0gdW5kZWZpbmVkKSB3aW5kb3cuY3kucmVzaXplKCk7XG5cblx0LypcbiAqXHRGaXggYSBidWcgd2l0aCBwYXJhbGxheCBpbWFnZXMuXG4gKi9cblxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHQkKHdpbmRvdykuc2Nyb2xsKCk7XG5cdH0sIDI1KTtcbn07XG5cbi8qXG4qXHRTZXR1cCBub24tc3BlY2lmaWMgRE9NIGxpc3RlbmVycyBhbmQgaW5pdGlhbGl6ZSBtb2R1bGVzLlxuKi9cbnZhciBzZXR1cERPTSA9IGZ1bmN0aW9uIHNldHVwRE9NKCkge1xuXG5cdCQoJ1tkYXRhLWRlc3RdJykuY2xpY2soZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0d2luZG93LmxvY2F0aW9uLmhhc2ggPSAkKGV2ZW50LmV2ZW50VGFyZ2V0KS5kYXRhKCdkZXN0Jyk7XG5cdFx0JCgnbmF2IHVsLnRhYnMnKS50YWJzKCdzZWxlY3RfdGFiJywgJChldmVudC5jdXJyZW50VGFyZ2V0KS5kYXRhKCdkZXN0JykpO1xuXHRcdHVwZGF0ZUhhc2goJChldmVudC5jdXJyZW50VGFyZ2V0KS5kYXRhKCdkZXN0JykpO1xuXHR9KTtcblxuXHQkKCduYXYgdWwudGFicycpLm9uKCdjbGljaycsICdhJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0dXBkYXRlSGFzaCgkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmF0dHIoJ2hyZWYnKSk7XG5cdH0pO1xuXG5cdCQod2luZG93KS5vbignaGFzaGNoYW5nZScsIGZ1bmN0aW9uICgpIHtcblx0XHQkKCduYXYgdWwudGFicycpLnRhYnMoJ3NlbGVjdF90YWInLCB3aW5kb3cubG9jYXRpb24uaGFzaC5zbGljZSgxKSk7XG5cdFx0dXBkYXRlSGFzaCh3aW5kb3cubG9jYXRpb24uaGFzaCk7XG5cdH0pO1xuXG5cdCQoJy5wYXJhbGxheCcpLnBhcmFsbGF4KCk7XG5cblx0JCgnLm1vZGFsI21vZGFsLXJvYmJlci1jb25maWcnKS5tb2RhbCgpO1xuXG5cdENvbnNvbGVMb2dIVE1MLmNvbm5lY3QoJCgnI2NvbnNvbGUnKSk7XG59O1xuXG4vKlxuKlx0V2hlbmV2ZXIgdGhlIERPTSBjb250ZW50IGlzIHJlYWFkeSB0byBiZSBtYW5pcHVsYXRlZCxcbipcdHNldHVwZSB0aGUgc3BlY2lmaWMgRE9NIGFuZCBjcmVhdGUgYW4gSW50ZXJmYWNlIHdpdGggdGhlIHNlcnZlci5cbipcdFRoZW4sIHdlIGxpbmsgdGhlIFVJIGVsZW1lbnRzIHRvIHRoZSBzZXR0aW5ncyB0aGV5IG1hbmlwdWxhdGUuXG4qL1xuJChmdW5jdGlvbiAoKSB7XG5cdHNldHVwRE9NKCk7XG5cblx0dmFyIGlmYWNlID0gbmV3IF9JbnRlcmZhY2UyLmRlZmF1bHQoKTtcblx0JCgnI3NvcnROb2RlcycpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdHJldHVybiBpZmFjZS5zZXR0aW5ncy5ncmFwaC5zb3J0KCk7XG5cdH0pO1xuXHQkKCcjbmV3Um9iYmVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0cmV0dXJuIGlmYWNlLnNldHRpbmdzLnJvYmJlcnMubmV3Um9iYmVyKCk7XG5cdH0pO1xuXHQkKCcjbGF1bmNoQnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0cmV0dXJuIGlmYWNlLnN0YXJ0U2ltdWxhdGlvbigpO1xuXHR9KTtcblx0JCgnI2ltcG9ydEJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdHJldHVybiBpZmFjZS5zZXR0aW5ncy5sb2FkZXIuaW1wb3J0KCk7XG5cdH0pO1xuXHQkKCcjZXhwb3J0QnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0cmV0dXJuIGlmYWNlLnNldHRpbmdzLnNhdmVyLnNhdmUoKTtcblx0fSk7XG5cdCQoJy5tb2RhbCNtb2RhbC1yZXN1bHRzJykubW9kYWwoeyBjb21wbGV0ZTogZnVuY3Rpb24gY29tcGxldGUoKSB7XG5cdFx0XHRyZXR1cm4gaWZhY2Uuc3RvcFNpbXVsYXRpb24oKTtcblx0XHR9IH0pO1xufSk7Il19
