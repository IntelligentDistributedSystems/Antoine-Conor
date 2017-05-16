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
  *	When everything is okay, display graphs, stats and show a simulation.
  */

	}, {
		key: 'showResults',
		value: function showResults(data) {

			console.info('Results received.');

			// Building the list of patrols.

			var patrolsTableHTML = '\n\t\t\t<table class="striped centered">\n\t\t\t\t<thead>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<th>Patrol ID</th>\n\t\t\t\t\t\t<th>Path</th>\n\t\t\t\t\t</tr>\n\t\t\t\t</thead>\n\n\t\t\t\t<tbody>';

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

			// We feed the graph with average evolution for the best strategy.

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

			$('#modal-results p').html('\n\n\t\t\t<div class="row">\n\t\t\t\t<div class="col s12">\n\t\t\t\t\t<ul class="tabs">\n\t\t\t\t\t\t<li class="tab col s3"><a class="active" href="#chart">Chart</a></li>\n\t\t\t\t\t\t<li class="tab col s3"><a href="#visualization">Visualization</a></li>\n\t\t\t\t\t\t<li class="tab col s3"><a href="#patrols">Patrols</a></li>\n\t\t\t\t\t\t<li class="tab col s3"><a href="#statistics">Statistics</a></li>\n\t\t\t\t\t</ul>\n\t\t\t\t</div>\n\t\t\t\t<div id="chart" class="col s12">\n\t\t\t\t\t<canvas width="100%" height="400" id="line-chart"></canvas>\n\t\t\t\t</div>\n\t\t\t\t<div id="visualization" class="col s12">\n\t\t\t\t\tSame path as in settings with animation.\n\t\t\t\t</div>\n\t\t\t\t<div id="patrols" class="col s12">\n\t\t\t\t\t' + patrolsTableHTML + '\n\t\t\t\t</div>\n\t\t\t\t<div id="statistics" class="col s12">\n\t\t\t\t\t' + statisticsTableHTML + '\n\t\t\t\t</div>\n\t\t\t</div>\n\n\t\t').modal('open');

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

		this.path = new _Graph2.default(this);

		this.robbers = new _Robbers2.default(this);

		// Default values

		this.initPath();

		this.initRobbers();
	}

	/*
 *	Create a default path and then sort the targets.
 */

	_createClass(Settings, [{
		key: 'initPath',
		value: function initPath() {

			this.path.addNode({
				x: 50,
				y: 45
			}, true).addNode({
				x: 150,
				y: 45
			}).link('0', '1').sort();

			return this;
		}

		/*
  *	Create the default robbers.
  */

	}, {
		key: 'initRobbers',
		value: function initRobbers() {

			this.robbers.newRobber();

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
				paths: this.path.getSettings(),
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
},{}],5:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
*	Graph representing the paths of the simulation.
*
*	You can add targets, deleted target, and link
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

		this.nbrEdgesCreated = 0;
		this.nbrNodesCreated = 0;

		this.lastSelectedNode = null;
		this.currentAction = null;

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
	}

	/*
 *	Sort targets with the CoSE layout (by Bilkent University).
 */


	_createClass(Graph, [{
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
  *	Add a node to the path.
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

			var newNode = this.cy.add({
				data: {
					id: this.cy.nodes().length,
					robbersInterest: 1,
					guardiansCost: 2,
					guardiansReward: 1,
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

			return this;
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
			return ((node1.position().x - node2.position().x) ** 2 + (node1.position().y - node2.position().y)) ** 0.5;
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

		this.numberOfRobbersCreated = 0;

		this.list = new Set();

		this.catchProbability = new Map();

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

			_this.settings.path.cy.nodes('[id = "' + nodeId + '"]').data('robberSettings').get(robberId)[setting] = newValue;
		});
	}

	/*
 *	Add a robber to the settings.
 *	His card can be seen in the "Robbers" tab.
 *	His settings are set to default in every target.
 */


	_createClass(Robbers, [{
		key: 'newRobber',
		value: function newRobber() {

			var robberId = this.numberOfRobbersCreated++;

			this.list.add(robberId);

			this.catchProbability.set(robberId, 0.5);

			this.settings.path.cy.nodes().each(function (node) {
				return node.data('robberSettings').set(robberId, {
					cost: 2,
					reward: 1
				});
			});

			$('#robbers').append('\n\t\t\t<div class="col s4" data-robberid="' + robberId + '">\n\t\t\t    <div class="card blue-grey darken-1">\n\t\t\t\t\t<div class="card-content white-text">\n\t\t\t\t\t\t<span class="card-title">Robber ' + robberId + '</span>\n\t\t\t\t\t\t<!--<p>Some bad guy.</p>-->\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="card-action">\n\t\t\t\t\t\t<div class="discretionContainer">\n\t\t\t\t\t\t\t<span>Discretion</span>\n\t\t\t\t\t\t\t<input type="number" step="0.05" class="discretion" min="0" max="1" value="0.5">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<a class="waves-effect waves-light btn blue configure" style="width: 100%; margin-top: 10px;"><i class="material-icons right">mode_edit</i>Rewards</a>\n\t\t\t\t\t\t<a class="waves-effect waves-light btn red delete" style="width: 100%; margin-top: 10px"><i class="material-icons right">delete</i>Delete</a>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t');

			return this;
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

			this.settings.path.cy.nodes().each(function (node) {
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

			this.settings.path.cy.nodes('[id != "0"]').forEach(function (node) {

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
		return iface.settings.path.sort();
	});
	$('#newRobber').on('click', function (event) {
		return iface.settings.robbers.newRobber();
	});
	$('#launchButton').on('click', function (event) {
		return iface.startSimulation();
	});
	$('.modal#modal-results').modal({ complete: function complete() {
			return iface.stopSimulation();
		} });
});
},{"./classes/Interface":1}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvZGlzdC9qcy9jbGFzc2VzL0ludGVyZmFjZS5qcyIsImNsaWVudC9kaXN0L2pzL2NsYXNzZXMvaW50ZXJmYWNlL1Jlc3VsdHMuanMiLCJjbGllbnQvZGlzdC9qcy9jbGFzc2VzL2ludGVyZmFjZS9TZXR0aW5ncy5qcyIsImNsaWVudC9kaXN0L2pzL2NsYXNzZXMvaW50ZXJmYWNlL3NldHRpbmdzL2ZpbGVzL0xvYWRlci5qcyIsImNsaWVudC9kaXN0L2pzL2NsYXNzZXMvaW50ZXJmYWNlL3NldHRpbmdzL3N1YnNldHRpbmdzL0dyYXBoLmpzIiwiY2xpZW50L2Rpc3QvanMvY2xhc3Nlcy9pbnRlcmZhY2Uvc2V0dGluZ3Mvc3Vic2V0dGluZ3MvUm9iYmVycy5qcyIsImNsaWVudC9kaXN0L2pzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBOzs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcblx0dmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX1NldHRpbmdzID0gcmVxdWlyZSgnLi9pbnRlcmZhY2UvU2V0dGluZ3MnKTtcblxudmFyIF9TZXR0aW5nczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TZXR0aW5ncyk7XG5cbnZhciBfUmVzdWx0cyA9IHJlcXVpcmUoJy4vaW50ZXJmYWNlL1Jlc3VsdHMnKTtcblxudmFyIF9SZXN1bHRzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1Jlc3VsdHMpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vKlxuKlx0SW50ZXJmYWNlIGJldHdlZW4gdGhlIGNsaWVudCBzaWRlIGFuZCB0aGUgYmFjay1lbmQuXG4qXG4qXHRUaGUgaW50ZXJmYWNlIGhhcyBzZXR0aW5ncyBhbmQgYSBzb2NrZXQgZW5hYmxpbmcgaXQgXG4qXHR0byBzZW5kIGFuZCByZWNlaXZlIGRhdGEgZnJvbSB0aGUgc2VydmVyIHJ1bm5pbmcgdGhlXG4qXHRKYXZhIE1BUyBzaW11bGF0aW9uLlxuKi9cblxudmFyIEludGVyZmFjZSA9IGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gSW50ZXJmYWNlKCkge1xuXHRcdF9jbGFzc0NhbGxDaGVjayh0aGlzLCBJbnRlcmZhY2UpO1xuXG5cdFx0Ly8gRmllbGRzXG5cblx0XHR0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3QoJ2h0dHA6Ly8nICsgd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lICsgJzo4MDgzJyk7XG5cdFx0dGhpcy5zZXR0aW5ncyA9IG5ldyBfU2V0dGluZ3MyLmRlZmF1bHQoKTtcblx0XHR0aGlzLnJlc3VsdHMgPSBuZXcgX1Jlc3VsdHMyLmRlZmF1bHQoKTtcblx0XHR0aGlzLnNpbXVsYXRpb25SdW5uaW5nID0gZmFsc2U7XG5cblx0XHQvLyBTb2NrZXQgbGlzdGVuZXJzXG5cblx0XHR0aGlzLnNvY2tldC5vbignY29ubmVjdCcsIGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0Y29uc29sZS5pbmZvKCdDb25uZWN0aW9uIHRvIHRoZSByZW1vdGUgc2VydmVyIGVzdGFibGlzaGVkLicpO1xuXHRcdH0pO1xuXHR9XG5cblx0LypcbiAqXHRTdGFydCB0aGUgc2ltdWxhdGlvbiBieSBzZW5kaW5nIHRoZSBzZXR0aW5ncyB0byB0aGUgYmFjay1lbmRcbiAqXHRhbG9uZyB0aGUgbWVzc2FnZSAnc3RhcnRTaW11bGF0aW9uJy5cbiAqL1xuXG5cdF9jcmVhdGVDbGFzcyhJbnRlcmZhY2UsIFt7XG5cdFx0a2V5OiAnc3RhcnRTaW11bGF0aW9uJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gc3RhcnRTaW11bGF0aW9uKCkge1xuXHRcdFx0dmFyIF90aGlzID0gdGhpcztcblxuXHRcdFx0dGhpcy5zaW11bGF0aW9uUnVubmluZyA9IHRydWU7XG5cblx0XHRcdHRoaXMuc29ja2V0Lm9uKCdsb2FkaW5nJywgZnVuY3Rpb24gKGRhdGEpIHtcblx0XHRcdFx0cmV0dXJuIF90aGlzLnJlc3VsdHMubG9hZGluZyhkYXRhLnByb2dyZXNzaW9uKTtcblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLnJlc3VsdHMubG9hZGluZygwKTtcblxuXHRcdFx0dGhpcy5zb2NrZXQuZW1pdCgnc3RhcnRTaW11bGF0aW9uJywgdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5ncygpLCBmdW5jdGlvbiAocmVzdWx0cykge1xuXG5cdFx0XHRcdGlmICghX3RoaXMuc2ltdWxhdGlvblJ1bm5pbmcpIHJldHVybjtcblxuXHRcdFx0XHRpZiAocmVzdWx0cy5lcnJvcikgcmV0dXJuIF90aGlzLnJlc3VsdHMuZXJyb3IocmVzdWx0cy5lcnJvcik7XG5cblx0XHRcdFx0X3RoaXMucmVzdWx0cy5zaG93UmVzdWx0cyhyZXN1bHRzLmRhdGEpO1xuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdFN0b3AgdGhlIGNsaWVudC1zaWRlIHNpbXVsYXRpb24gYnkgcmVtb3ZpbmcgdGhlIGxvYWRpbmcgc2NyZWVuIGFuZFxuICAqXHRibG9ja2luZyByZXN1bHRzIGNhbGxiYWNrLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdzdG9wU2ltdWxhdGlvbicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHN0b3BTaW11bGF0aW9uKCkge1xuXHRcdFx0dGhpcy5zaW11bGF0aW9uUnVubmluZyA9IGZhbHNlO1xuXG5cdFx0XHR0aGlzLnNvY2tldC5yZW1vdmVMaXN0ZW5lcignbG9hZGluZycpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cdH1dKTtcblxuXHRyZXR1cm4gSW50ZXJmYWNlO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBJbnRlcmZhY2U7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcblx0dmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vKlxuKlx0RGVhbHMgd2l0aCB0aGUgcmVzdWx0cyBzZW50IGJ5IHRoZSBzZXJ2ZXIuXG4qL1xudmFyIFJlc3VsdHMgPSBmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIFJlc3VsdHMoKSB7XG5cdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIFJlc3VsdHMpO1xuXG5cdFx0d2luZG93LnJlc3VsdHMgPSB0aGlzO1xuXHR9XG5cblx0LypcbiAqXHRXaGVuIGFuIGVycm9yIGlzIHJlY2VpdmVkLCBwcmludCBpdCB0byBzY3JlZW4uXG4gKi9cblxuXG5cdF9jcmVhdGVDbGFzcyhSZXN1bHRzLCBbe1xuXHRcdGtleTogJ2Vycm9yJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gZXJyb3IoZXJyKSB7XG5cblx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Vycm9yOiAnICsgZXJyKTtcblxuXHRcdFx0JCgnI21vZGFsLXJlc3VsdHMgcCcpLmh0bWwoJ1xcblxcblxcdFxcdFxcdDxkaXYgY2xhc3M9XCJjZW50ZXJcIj5cXG5cXHRcXHRcXHRcXHRFcnJvciBlbmNvdW50ZXJlZCB3aGlsZSBjb21wdXRpbmcgdGhlIHJlc3VsdHM6IDxicj5cXG5cXHRcXHRcXHRcXHQnICsgZXJyICsgJ1xcblxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdCcpLm1vZGFsKCdvcGVuJyk7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0V2hlbiB0aGUgc2VydmVyIGlzIHByb2Nlc3NpbmcsIHNob3cgdGhlIHByb2dyZXNzLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdsb2FkaW5nJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gbG9hZGluZygpIHtcblx0XHRcdHZhciBwZXJjZW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBmYWxzZTtcblxuXHRcdFx0JCgnI21vZGFsLXJlc3VsdHMgcCcpLmh0bWwoJ1xcblxcblxcdFxcdFxcdDxkaXYgY2xhc3M9XCJjZW50ZXJcIj5cXG5cXHRcXHRcXHRcXHRQbGVhc2Ugd2FpdCB3aGlsZSBvdXIgc2VydmVyIGlzIGNvbXB1dGluZyB0aGUgcmVzdWx0cy5cXG5cXHRcXHRcXHQ8L2Rpdj5cXG5cXG5cXHRcXHRcXHQ8ZGl2IGNsYXNzPVwicHJvZ3Jlc3NcIj5cXG5cXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiJyArIChwZXJjZW50ID8gJ2RldGVybWluYXRlXCIgc3R5bGU9XCJ3aWR0aDogJyArIHBlcmNlbnQgKyAnJVwiJyA6ICdpbmRldGVybWluYXRlXCInKSArICc+PC9kaXY+XFxuXFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0JykubW9kYWwoJ29wZW4nKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0V2hlbiBldmVyeXRoaW5nIGlzIG9rYXksIGRpc3BsYXkgZ3JhcGhzLCBzdGF0cyBhbmQgc2hvdyBhIHNpbXVsYXRpb24uXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ3Nob3dSZXN1bHRzJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gc2hvd1Jlc3VsdHMoZGF0YSkge1xuXG5cdFx0XHRjb25zb2xlLmluZm8oJ1Jlc3VsdHMgcmVjZWl2ZWQuJyk7XG5cblx0XHRcdC8vIEJ1aWxkaW5nIHRoZSBsaXN0IG9mIHBhdHJvbHMuXG5cblx0XHRcdHZhciBwYXRyb2xzVGFibGVIVE1MID0gJ1xcblxcdFxcdFxcdDx0YWJsZSBjbGFzcz1cInN0cmlwZWQgY2VudGVyZWRcIj5cXG5cXHRcXHRcXHRcXHQ8dGhlYWQ+XFxuXFx0XFx0XFx0XFx0XFx0PHRyPlxcblxcdFxcdFxcdFxcdFxcdFxcdDx0aD5QYXRyb2wgSUQ8L3RoPlxcblxcdFxcdFxcdFxcdFxcdFxcdDx0aD5QYXRoPC90aD5cXG5cXHRcXHRcXHRcXHRcXHQ8L3RyPlxcblxcdFxcdFxcdFxcdDwvdGhlYWQ+XFxuXFxuXFx0XFx0XFx0XFx0PHRib2R5Pic7XG5cblx0XHRcdGRhdGEucGF0cm9scy5mb3JFYWNoKGZ1bmN0aW9uIChwYXRyb2wsIGluZGV4KSB7XG5cblx0XHRcdFx0cGF0cm9sc1RhYmxlSFRNTCArPSAnXFxuXFx0XFx0XFx0XFx0PHRyPlxcblxcdFxcdFxcdFxcdFxcdDx0ZD4nICsgaW5kZXggKyAnPC90ZD5cXG5cXHRcXHRcXHRcXHRcXHQ8dGQ+JyArIHBhdHJvbC5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgdGFyZ2V0KSB7XG5cdFx0XHRcdFx0cmV0dXJuICcnICsgc3VtICsgdGFyZ2V0ICsgJz0+Jztcblx0XHRcdFx0fSwgJycpLnNsaWNlKDAsIC0yKSArICc8L3RkPlxcblxcdFxcdFxcdFxcdDwvdHI+Jztcblx0XHRcdH0pO1xuXG5cdFx0XHRwYXRyb2xzVGFibGVIVE1MICs9ICdcXG5cXHRcXHRcXHRcXHQ8L3Rib2R5PlxcblxcdFxcdFxcdDwvdGFibGU+JztcblxuXHRcdFx0Ly8gV2UgaGF2ZSB0byBmaW5kIHRoZSBiZXN0IHN0cmF0ZWd5LlxuXG5cdFx0XHR2YXIgc3RhdGlzdGljc1RhYmxlID0gW107XG5cblx0XHRcdGRhdGEuc3RyYXRlZ2llcy5mb3JFYWNoKGZ1bmN0aW9uIChzdHJhdGVneSkge1xuXG5cdFx0XHRcdHZhciBhdmVyYWdlR3VhcmRpYW5VdGlsaXR5ID0gc3RyYXRlZ3kuaXRlcmF0aW9ucy5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgaXRlcmF0aW9uKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHN1bSArIGl0ZXJhdGlvbi5ndWFyZGlhblV0aWxpdHk7XG5cdFx0XHRcdH0sIDApIC8gc3RyYXRlZ3kuaXRlcmF0aW9ucy5sZW5ndGg7XG5cdFx0XHRcdHZhciBhdmVyYWdlUm9iYmVyVXRpbGl0eSA9IHN0cmF0ZWd5Lml0ZXJhdGlvbnMucmVkdWNlKGZ1bmN0aW9uIChzdW0sIGl0ZXJhdGlvbikge1xuXHRcdFx0XHRcdHJldHVybiBzdW0gKyBpdGVyYXRpb24ucm9iYmVyVXRpbGl0eTtcblx0XHRcdFx0fSwgMCkgLyBzdHJhdGVneS5pdGVyYXRpb25zLmxlbmd0aDtcblxuXHRcdFx0XHRzdGF0aXN0aWNzVGFibGUucHVzaCh7XG5cdFx0XHRcdFx0aXRlcmF0aW9uczogc3RyYXRlZ3kuaXRlcmF0aW9ucyxcblx0XHRcdFx0XHRwcm9iYWJpbGl0aWVzOiBzdHJhdGVneS5wcm9iYWJpbGl0aWVzLnJlZHVjZShmdW5jdGlvbiAoc3VtLCBwcm9iYWJpbGl0eSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuICcnICsgc3VtICsgcHJvYmFiaWxpdHkudG9GaXhlZCgyKSArICcgfCAnO1xuXHRcdFx0XHRcdH0sICcnKS5zbGljZSgwLCAtMyksXG5cdFx0XHRcdFx0Z3VhcmRpYW5VdGlsaXR5OiBhdmVyYWdlR3VhcmRpYW5VdGlsaXR5LFxuXHRcdFx0XHRcdHJvYmJlclV0aWxpdHk6IGF2ZXJhZ2VSb2JiZXJVdGlsaXR5XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdHZhciBzb3J0ZWRTdGF0aXN0aWNzVGFibGUgPSBzdGF0aXN0aWNzVGFibGUuc29ydChmdW5jdGlvbiAoczEsIHMyKSB7XG5cdFx0XHRcdHJldHVybiBzMi5ndWFyZGlhblV0aWxpdHkgLSBzMS5ndWFyZGlhblV0aWxpdHk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gV2UgZmVlZCB0aGUgZ3JhcGggd2l0aCBhdmVyYWdlIGV2b2x1dGlvbiBmb3IgdGhlIGJlc3Qgc3RyYXRlZ3kuXG5cblx0XHRcdHZhciBjaGFydERhdGEgPSBbXTtcblx0XHRcdHZhciBzdW0gPSAwO1xuXG5cdFx0XHRzb3J0ZWRTdGF0aXN0aWNzVGFibGVbMF0uaXRlcmF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVyYXRpb24pIHtcblxuXHRcdFx0XHRjaGFydERhdGEucHVzaCh7XG5cdFx0XHRcdFx0eDogY2hhcnREYXRhLmxlbmd0aCxcblx0XHRcdFx0XHR5OiAoc3VtICs9IGl0ZXJhdGlvbi5ndWFyZGlhblV0aWxpdHkpIC8gKGNoYXJ0RGF0YS5sZW5ndGggKyAxKVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBCdWlsZGluZyB0aGUgbGlzdCBvZiBzdGF0aXN0aWNzLlxuXG5cdFx0XHR2YXIgc3RhdGlzdGljc1RhYmxlSFRNTCA9ICdcXG5cXHRcXHRcXHQ8dGFibGUgY2xhc3M9XCJzdHJpcGVkIGNlbnRlcmVkXCI+XFxuXFx0XFx0XFx0XFx0PHRoZWFkPlxcblxcdFxcdFxcdFxcdFxcdDx0cj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8dGg+UHJvYmFiaWxpdGllczwvdGg+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPkd1YXJkaWFuIHV0aWxpdHk8L3RoPlxcblxcdFxcdFxcdFxcdFxcdFxcdDx0aD5Sb2JiZXIgdXRpbGl0eTwvdGg+XFxuXFx0XFx0XFx0XFx0XFx0PC90cj5cXG5cXHRcXHRcXHRcXHQ8L3RoZWFkPlxcblxcblxcdFxcdFxcdFxcdDx0Ym9keT4nO1xuXG5cdFx0XHRzb3J0ZWRTdGF0aXN0aWNzVGFibGUuZm9yRWFjaChmdW5jdGlvbiAoc3RyYXRlZ3kpIHtcblxuXHRcdFx0XHRzdGF0aXN0aWNzVGFibGVIVE1MICs9ICdcXG5cXHRcXHRcXHRcXHQ8dHI+XFxuXFx0XFx0XFx0XFx0XFx0PHRkPicgKyBzdHJhdGVneS5wcm9iYWJpbGl0aWVzICsgJzwvdGQ+XFxuXFx0XFx0XFx0XFx0XFx0PHRkPicgKyBzdHJhdGVneS5ndWFyZGlhblV0aWxpdHkgKyAnPC90ZD5cXG5cXHRcXHRcXHRcXHRcXHQ8dGQ+JyArIHN0cmF0ZWd5LnJvYmJlclV0aWxpdHkgKyAnPC90ZD5cXG5cXHRcXHRcXHRcXHQ8L3RyPic7XG5cdFx0XHR9KTtcblxuXHRcdFx0c3RhdGlzdGljc1RhYmxlSFRNTCArPSAnXFxuXFx0XFx0XFx0XFx0PC90Ym9keT5cXG5cXHRcXHRcXHQ8L3RhYmxlPic7XG5cblx0XHRcdCQoJyNtb2RhbC1yZXN1bHRzIHAnKS5odG1sKCdcXG5cXG5cXHRcXHRcXHQ8ZGl2IGNsYXNzPVwicm93XCI+XFxuXFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cImNvbCBzMTJcIj5cXG5cXHRcXHRcXHRcXHRcXHQ8dWwgY2xhc3M9XCJ0YWJzXCI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGxpIGNsYXNzPVwidGFiIGNvbCBzM1wiPjxhIGNsYXNzPVwiYWN0aXZlXCIgaHJlZj1cIiNjaGFydFwiPkNoYXJ0PC9hPjwvbGk+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGxpIGNsYXNzPVwidGFiIGNvbCBzM1wiPjxhIGhyZWY9XCIjdmlzdWFsaXphdGlvblwiPlZpc3VhbGl6YXRpb248L2E+PC9saT5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8bGkgY2xhc3M9XCJ0YWIgY29sIHMzXCI+PGEgaHJlZj1cIiNwYXRyb2xzXCI+UGF0cm9sczwvYT48L2xpPlxcblxcdFxcdFxcdFxcdFxcdFxcdDxsaSBjbGFzcz1cInRhYiBjb2wgczNcIj48YSBocmVmPVwiI3N0YXRpc3RpY3NcIj5TdGF0aXN0aWNzPC9hPjwvbGk+XFxuXFx0XFx0XFx0XFx0XFx0PC91bD5cXG5cXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHQ8ZGl2IGlkPVwiY2hhcnRcIiBjbGFzcz1cImNvbCBzMTJcIj5cXG5cXHRcXHRcXHRcXHRcXHQ8Y2FudmFzIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjQwMFwiIGlkPVwibGluZS1jaGFydFwiPjwvY2FudmFzPlxcblxcdFxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdFxcdFxcdDxkaXYgaWQ9XCJ2aXN1YWxpemF0aW9uXCIgY2xhc3M9XCJjb2wgczEyXCI+XFxuXFx0XFx0XFx0XFx0XFx0U2FtZSBwYXRoIGFzIGluIHNldHRpbmdzIHdpdGggYW5pbWF0aW9uLlxcblxcdFxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdFxcdFxcdDxkaXYgaWQ9XCJwYXRyb2xzXCIgY2xhc3M9XCJjb2wgczEyXCI+XFxuXFx0XFx0XFx0XFx0XFx0JyArIHBhdHJvbHNUYWJsZUhUTUwgKyAnXFxuXFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0XFx0PGRpdiBpZD1cInN0YXRpc3RpY3NcIiBjbGFzcz1cImNvbCBzMTJcIj5cXG5cXHRcXHRcXHRcXHRcXHQnICsgc3RhdGlzdGljc1RhYmxlSFRNTCArICdcXG5cXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHQ8L2Rpdj5cXG5cXG5cXHRcXHQnKS5tb2RhbCgnb3BlbicpO1xuXG5cdFx0XHQkKCcjbW9kYWwtcmVzdWx0cyBwIHVsLnRhYnMnKS50YWJzKCk7XG5cblx0XHRcdHZhciBzY2F0dGVyQ2hhcnQgPSBuZXcgQ2hhcnQoXCJsaW5lLWNoYXJ0XCIsIHtcblx0XHRcdFx0dHlwZTogJ2xpbmUnLFxuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0ZGF0YXNldHM6IFt7XG5cdFx0XHRcdFx0XHRsYWJlbDogJ0Jlc3Qgc3RyYXRlZ3kgdXRpbGl0eSBvdmVyIHRpbWUuJyxcblx0XHRcdFx0XHRcdGRhdGE6IGNoYXJ0RGF0YVxuXHRcdFx0XHRcdH1dXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0XHRtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcblx0XHRcdFx0XHRzY2FsZXM6IHtcblx0XHRcdFx0XHRcdHhBeGVzOiBbe1xuXHRcdFx0XHRcdFx0XHR0eXBlOiAnbGluZWFyJyxcblx0XHRcdFx0XHRcdFx0cG9zaXRpb246ICdib3R0b20nXG5cdFx0XHRcdFx0XHR9XVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblx0fV0pO1xuXG5cdHJldHVybiBSZXN1bHRzO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBSZXN1bHRzOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9HcmFwaCA9IHJlcXVpcmUoJy4vc2V0dGluZ3Mvc3Vic2V0dGluZ3MvR3JhcGguanMnKTtcblxudmFyIF9HcmFwaDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9HcmFwaCk7XG5cbnZhciBfUm9iYmVycyA9IHJlcXVpcmUoJy4vc2V0dGluZ3Mvc3Vic2V0dGluZ3MvUm9iYmVycy5qcycpO1xuXG52YXIgX1JvYmJlcnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUm9iYmVycyk7XG5cbnZhciBfU2F2ZXIgPSByZXF1aXJlKCcuL3NldHRpbmdzL2ZpbGVzL1NhdmVyJyk7XG5cbnZhciBfU2F2ZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2F2ZXIpO1xuXG52YXIgX0xvYWRlciA9IHJlcXVpcmUoJy4vc2V0dGluZ3MvZmlsZXMvTG9hZGVyJyk7XG5cbnZhciBfTG9hZGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0xvYWRlcik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8qXG4qXHRTZXR0aW5ncyBvZiB0aGUgc2ltdWxhdGlvbi5cbipcbipcdEluaXRpYWxpemUgc2V0dGluZ3Mgd2l0aCBkZWZhdWx0IHZhbHVlcy5cbiovXG5cbnZhciBTZXR0aW5ncyA9IGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gU2V0dGluZ3MoKSB7XG5cdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNldHRpbmdzKTtcblxuXHRcdC8vIEZpZWxkc1xuXG5cdFx0dGhpcy5wYXRoID0gbmV3IF9HcmFwaDIuZGVmYXVsdCh0aGlzKTtcblxuXHRcdHRoaXMucm9iYmVycyA9IG5ldyBfUm9iYmVyczIuZGVmYXVsdCh0aGlzKTtcblxuXHRcdC8vIERlZmF1bHQgdmFsdWVzXG5cblx0XHR0aGlzLmluaXRQYXRoKCk7XG5cblx0XHR0aGlzLmluaXRSb2JiZXJzKCk7XG5cdH1cblxuXHQvKlxuICpcdENyZWF0ZSBhIGRlZmF1bHQgcGF0aCBhbmQgdGhlbiBzb3J0IHRoZSB0YXJnZXRzLlxuICovXG5cblx0X2NyZWF0ZUNsYXNzKFNldHRpbmdzLCBbe1xuXHRcdGtleTogJ2luaXRQYXRoJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gaW5pdFBhdGgoKSB7XG5cblx0XHRcdHRoaXMucGF0aC5hZGROb2RlKHtcblx0XHRcdFx0eDogNTAsXG5cdFx0XHRcdHk6IDQ1XG5cdFx0XHR9LCB0cnVlKS5hZGROb2RlKHtcblx0XHRcdFx0eDogMTUwLFxuXHRcdFx0XHR5OiA0NVxuXHRcdFx0fSkubGluaygnMCcsICcxJykuc29ydCgpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRDcmVhdGUgdGhlIGRlZmF1bHQgcm9iYmVycy5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnaW5pdFJvYmJlcnMnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBpbml0Um9iYmVycygpIHtcblxuXHRcdFx0dGhpcy5yb2JiZXJzLm5ld1JvYmJlcigpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRSZXR1cm4gc2V0dGluZ3MgYXMgYXMgSlNPTiBvYmplY3QuXG4gICpcbiAgKlx0VGhvc2Ugc2V0dGluZ3MgY2FuIGJlIHNlbmQgdG8gdGhlIGJhY2tlbmQuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ2dldFNldHRpbmdzJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gZ2V0U2V0dGluZ3MoKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRnZW5lcmFsOiB0aGlzLmdldEdlbmVyYWxTZXR0aW5ncygpLFxuXHRcdFx0XHRwYXRoczogdGhpcy5wYXRoLmdldFNldHRpbmdzKCksXG5cdFx0XHRcdHJvYmJlcnM6IHRoaXMucm9iYmVycy5nZXRTZXR0aW5ncygpXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdENvbmNhdGVuYXRlIHRoZSBnZW5lcmFsIHNldHRpbmdzIGluIG9uZSBcbiAgKlx0SlNPTiBvYmplY3QuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ2dldEdlbmVyYWxTZXR0aW5ncycsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGdldEdlbmVyYWxTZXR0aW5ncygpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdG51bWJlck9mSXRlcmF0aW9uczogcGFyc2VJbnQoJCgnI251bWJlck9mSXRlcmF0aW9ucycpLnZhbCgpKVxuXHRcdFx0fTtcblx0XHR9XG5cdH1dKTtcblxuXHRyZXR1cm4gU2V0dGluZ3M7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFNldHRpbmdzOyIsIlwidXNlIHN0cmljdFwiOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9zbGljZWRUb0FycmF5ID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkgeyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9IHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgcmV0dXJuIGFycjsgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHsgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTsgfSBlbHNlIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7IH0gfTsgfSgpO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vKlxuKlx0R3JhcGggcmVwcmVzZW50aW5nIHRoZSBwYXRocyBvZiB0aGUgc2ltdWxhdGlvbi5cbipcbipcdFlvdSBjYW4gYWRkIHRhcmdldHMsIGRlbGV0ZWQgdGFyZ2V0LCBhbmQgbGlua1xuKlx0dGhlbSB0b2dldGhlci5cbipcbipcdEZvciBlYWNoIHRhcmdldCwgeW91IGNhbiBzZXQgOlxuKlx0XHQtIHJvYmJlcnNJbnRlcmVzdCAodGhlIHByb2JhYmlsaXR5IG9mIHJvYmJlcnMgYXR0YWNraW5nIHRoaXMgdGFyZ2V0KVxuKlx0XHQtIGd1YXJkaWFuc0Nvc3QgKHRoZSBjb3N0IHdoZW4gZ3VhcmRpYW5zIGZhaWwgdG8gcHJvdGVjdCB0aGUgdGFyZ2V0KVxuKlx0XHQtIGd1YXJkaWFuc1Jld2FyZCAodGhlIHJld2FyZCB3aGVuIGd1YXJkaWFucyBtYW5hZ2UgdG8gcHJldmVudCBcbipcdFx0XHRcdFx0XHRcdGFuIGF0dGFjaylcbipcdFx0LSByb2JiZXJTZXR0aW5ncyAodGhlIGNvc3QsIHJld2FyZCBhbmQgcHJvYmFiaWxpdHkgZm9yIGVhY2ggcm9iYmVyKVxuKlx0XHRcdChTZXQgdGhyb3VnaCB0aGUgUm9iYmVycyBjbGFzcylcbipcbipcdE5vZGVzID0gQXR0YWNrcyA9IFRhcmdldHNcbiovXG5cbnZhciBHcmFwaCA9IGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gR3JhcGgoc2V0dGluZ3MpIHtcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIEdyYXBoKTtcblxuXHRcdC8vIEZpZWxkc1xuXG5cdFx0dGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXG5cdFx0dGhpcy5zdHlsZXNoZWV0ID0gW3tcblx0XHRcdHNlbGVjdG9yOiAnbm9kZScsXG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHRoZWlnaHQ6IDIwLFxuXHRcdFx0XHR3aWR0aDogMjAsXG5cdFx0XHRcdCdiYWNrZ3JvdW5kLWNvbG9yJzogJ21hcERhdGEocm9iYmVyc0ludGVyZXN0LCAwLCAyNSwgZ3JlZW4sIHJlZCknLFxuXHRcdFx0XHRjb250ZW50OiBmdW5jdGlvbiBjb250ZW50KG5vZGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gJ04nICsgbm9kZS5kYXRhKCdpZCcpICsgJyBDJyArIG5vZGUuZGF0YSgnZ3VhcmRpYW5zQ29zdCcpICsgJy9SJyArIG5vZGUuZGF0YSgnZ3VhcmRpYW5zUmV3YXJkJyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdC8vJ3RleHQtdmFsaWduJzogJ2NlbnRlcicsXG5cdFx0XHRcdCd0ZXh0LWhhbGlnbic6ICdjZW50ZXInXG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0c2VsZWN0b3I6ICdlZGdlJyxcblx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdCdjdXJ2ZS1zdHlsZSc6ICdoYXlzdGFjaycsXG5cdFx0XHRcdCdoYXlzdGFjay1yYWRpdXMnOiAwLFxuXHRcdFx0XHR3aWR0aDogNSxcblx0XHRcdFx0b3BhY2l0eTogMC41LFxuXHRcdFx0XHQnbGluZS1jb2xvcic6ICcjYTJlZmEyJyxcblx0XHRcdFx0Y29udGVudDogZnVuY3Rpb24gY29udGVudChlZGdlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIE1hdGguZmxvb3IoX3RoaXMubGVuZ3RoKGVkZ2UpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdHNlbGVjdG9yOiAnLmJhc2UnLFxuXHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0J2JhY2tncm91bmQtY29sb3InOiAnIzYxYmZmYycsXG5cdFx0XHRcdGxhYmVsOiAnQmFzZSdcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRzZWxlY3RvcjogJzpzZWxlY3RlZCcsXG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHQnYm9yZGVyLXdpZHRoJzogNCxcblx0XHRcdFx0J2JvcmRlci1jb2xvcic6ICdwdXJwbGUnXG5cdFx0XHR9XG5cdFx0fV07XG5cblx0XHR0aGlzLmN5ID0gd2luZG93LmN5ID0gY3l0b3NjYXBlKHtcblx0XHRcdGNvbnRhaW5lcjogJCgnI2dyYXBoJyksXG5cblx0XHRcdGJveFNlbGVjdGlvbkVuYWJsZWQ6IGZhbHNlLFxuXHRcdFx0YXV0b3Vuc2VsZWN0aWZ5OiBmYWxzZSxcblxuXHRcdFx0c3R5bGU6IHRoaXMuc3R5bGVzaGVldFxuXHRcdH0pO1xuXG5cdFx0dGhpcy5jeS5taW5ab29tKDAuNSk7XG5cdFx0dGhpcy5jeS5tYXhab29tKDIpO1xuXG5cdFx0d2luZG93LmdyYXBoID0gdGhpcztcblxuXHRcdHRoaXMubmJyRWRnZXNDcmVhdGVkID0gMDtcblx0XHR0aGlzLm5ick5vZGVzQ3JlYXRlZCA9IDA7XG5cblx0XHR0aGlzLmxhc3RTZWxlY3RlZE5vZGUgPSBudWxsO1xuXHRcdHRoaXMuY3VycmVudEFjdGlvbiA9IG51bGw7XG5cblx0XHQvLyBSZWZyZXNoaW5nIHRoZSBsZW5ndGhcblxuXHRcdHRoaXMucmVmcmVzaEludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGN5LmVkZ2VzKCkuZm9yRWFjaChmdW5jdGlvbiAoZWRnZSkge1xuXHRcdFx0XHRyZXR1cm4gZWRnZS5kYXRhKCdyZWZyZXNoJywgTWF0aC5yYW5kb20oKSk7XG5cdFx0XHR9KTtcblx0XHR9LCAyNTApO1xuXG5cdFx0Ly8gRE9NIGxpc3RlbmVyc1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5xdGlwLWNvbnRlbnQgLmxpbmsnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdGNvbnNvbGUuaW5mbyhcIkxpbmtpbmcgYSB0YXJnZXQgdG8gYW5vdGhlci4uLlwiKTtcblx0XHRcdF90aGlzLmN1cnJlbnRBY3Rpb24gPSAnbGlua2luZyc7XG5cdFx0XHQkKCcucXRpcCcpLnF0aXAoJ2hpZGUnKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucXRpcC1jb250ZW50IC5kZWxldGUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdF90aGlzLmxhc3RTZWxlY3RlZE5vZGUucmVtb3ZlKCk7XG5cdFx0XHRfdGhpcy5yZXNldCgpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5xdGlwLWNvbnRlbnQgLmRpc21pc3MnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdF90aGlzLnJlc2V0KCk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnF0aXAtY29udGVudCAucGx1c0ludGVyZXN0JywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ3JvYmJlcnNJbnRlcmVzdCcsIE1hdGgubWluKF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgncm9iYmVyc0ludGVyZXN0JykgKyAxLCAyNSkpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5xdGlwLWNvbnRlbnQgLm1pbnVzSW50ZXJlc3QnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgncm9iYmVyc0ludGVyZXN0JywgTWF0aC5tYXgoX3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdyb2JiZXJzSW50ZXJlc3QnKSAtIDEsIDApKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucXRpcC1jb250ZW50IC5wbHVzQ29zdCcsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0X3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdndWFyZGlhbnNDb3N0JywgTWF0aC5taW4oX3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdndWFyZGlhbnNDb3N0JykgKyAxLCAyNSkpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5xdGlwLWNvbnRlbnQgLm1pbnVzQ29zdCcsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0X3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdndWFyZGlhbnNDb3N0JywgTWF0aC5tYXgoX3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdndWFyZGlhbnNDb3N0JykgLSAxLCAwKSk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnF0aXAtY29udGVudCAucGx1c1Jld2FyZCcsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0X3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdndWFyZGlhbnNSZXdhcmQnLCBNYXRoLm1pbihfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ2d1YXJkaWFuc1Jld2FyZCcpICsgMSwgMjUpKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucXRpcC1jb250ZW50IC5taW51c1Jld2FyZCcsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0X3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdndWFyZGlhbnNSZXdhcmQnLCBNYXRoLm1heChfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ2d1YXJkaWFuc1Jld2FyZCcpIC0gMSwgMCkpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gQ3l0b3NjYXBlIGxpc3RlbmVyc1xuXG5cdFx0dGhpcy5jeS5vbigndGFwJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRpZiAoZXZlbnQudGFyZ2V0ID09PSBldmVudC5jeSkgX3RoaXMucmVzZXQoKTtcblx0XHRcdC8vIFdoZW4geW91IHRhcCBvbiB0aGUgYmFja2dyb3VuZCBhbmQgdGhhdCB0aGVyZSBhcmUgbm8gdmlzaWJsZSB0aXBzLCB5b3UgYWRkIGEgbmV3IG5vZGUgYXQgdGhpcyBwb3NpdGlvbi5cblx0XHRcdC8vIElmIGEgdGlwIGlzIHZpc2libGUsIHlvdSBwcm9iYWJseSBqdXN0IHdhbnQgdG8gZGlzbWlzcyBpdFxuXHRcdFx0aWYgKGV2ZW50LnRhcmdldCA9PT0gZXZlbnQuY3kgJiYgISQoJy5xdGlwOnZpc2libGUnKS5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIF90aGlzLmFkZE5vZGUoZXZlbnQucG9zaXRpb24pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5jeS5vbigndGFwJywgJ25vZGUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdGlmIChfdGhpcy5jdXJyZW50QWN0aW9uID09PSAnbGlua2luZycpIHtcblx0XHRcdFx0X3RoaXMuY3VycmVudEFjdGlvbiA9IG51bGw7XG5cdFx0XHRcdHZhciBzZWNvbmROb2RlID0gZXZlbnQudGFyZ2V0O1xuXHRcdFx0XHQvLyBXZSBjaGVjayBpZiB0aGF0IGVkZ2UgYWxlYWR5IGV4aXN0cyBvciBpZiB0aGUgc291cmNlIGFuZCB0YXJnZXQgYXJlIHRoZSBzYW1lIG5vZGUuXG5cdFx0XHRcdGlmICghX3RoaXMuY3kuZWxlbWVudHMoJ2VkZ2Vbc291cmNlID0gXCInICsgX3RoaXMubGFzdFNlbGVjdGVkTm9kZS5pZCgpICsgJ1wiXVt0YXJnZXQgPSBcIicgKyBzZWNvbmROb2RlLmlkKCkgKyAnXCJdJykubGVuZ3RoICYmICFfdGhpcy5jeS5lbGVtZW50cygnZWRnZVt0YXJnZXQgPSBcIicgKyBfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmlkKCkgKyAnXCJdW3NvdXJjZSA9IFwiJyArIHNlY29uZE5vZGUuaWQoKSArICdcIl0nKS5sZW5ndGggJiYgc2Vjb25kTm9kZSAhPSBfdGhpcy5sYXN0U2VsZWN0ZWROb2RlKSB7XG5cdFx0XHRcdFx0X3RoaXMubGluayhfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmlkKCksIHNlY29uZE5vZGUuaWQoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0X3RoaXMubGFzdFNlbGVjdGVkTm9kZSA9IGV2ZW50LnRhcmdldDtcblx0XHR9KTtcblxuXHRcdHRoaXMuY3kub24oJ3RhcCcsICdlZGdlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRldmVudC50YXJnZXQucmVtb3ZlKCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKlxuICpcdFNvcnQgdGFyZ2V0cyB3aXRoIHRoZSBDb1NFIGxheW91dCAoYnkgQmlsa2VudCBVbml2ZXJzaXR5KS5cbiAqL1xuXG5cblx0X2NyZWF0ZUNsYXNzKEdyYXBoLCBbe1xuXHRcdGtleTogJ3NvcnQnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBzb3J0KCkge1xuXHRcdFx0dGhpcy5jeS5sYXlvdXQoe1xuXHRcdFx0XHRuYW1lOiAnY29zZS1iaWxrZW50Jyxcblx0XHRcdFx0YW5pbWF0ZTogdHJ1ZVxuXHRcdFx0fSkucnVuKCk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdFJlc2V0IHRoZSBjdXJyZW50IGFjdGlvbiwgc2VsZWN0ZWQgdGFyZ2V0IGFuZCBoaWRlIHRoZSB0aXBzLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdyZXNldCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHJlc2V0KCkge1xuXHRcdFx0dGhpcy5sYXN0U2VsZWN0ZWROb2RlID0gbnVsbDtcblx0XHRcdHRoaXMuY3VycmVudEFjdGlvbiA9IG51bGw7XG5cdFx0XHQkKCcucXRpcCcpLnF0aXAoJ2hpZGUnKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0TGluayB0d28gdGFyZ2V0cyB0b2dldGhlci4gWW91IGhhdmUgdG8gc3BlY2lmeSB0aGUgaWRzLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdsaW5rJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gbGluayhzb3VyY2UsIHRhcmdldCkge1xuXHRcdFx0dGhpcy5jeS5hZGQoe1xuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0aWQ6ICdlJyArIHRoaXMubmJyRWRnZXNDcmVhdGVkKyssXG5cdFx0XHRcdFx0c291cmNlOiBzb3VyY2UsXG5cdFx0XHRcdFx0dGFyZ2V0OiB0YXJnZXRcblx0XHRcdFx0fSxcblx0XHRcdFx0Z3JvdXA6ICdlZGdlcycsXG5cdFx0XHRcdHNlbGVjdGFibGU6IHRydWUsXG5cdFx0XHRcdGxvY2tlZDogZmFsc2UsXG5cdFx0XHRcdGdyYWJiYWJsZTogdHJ1ZSxcblx0XHRcdFx0Y2xhc3NlczogJydcblx0XHRcdH0pO1xuXHRcdFx0Y29uc29sZS5pbmZvKCdFZGdlIGFkZGVkIGxpbmtpbmcgJyArIHNvdXJjZSArICcgdG8gJyArIHRhcmdldCArICcuJyk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdEFkZCBhIG5vZGUgdG8gdGhlIHBhdGguXG4gICpcdFxuICAqXHRBcmd1bWVudHMgOlxuICAqXHRcdC0gcG9zaXRpb24gc2hvdWxkIGJlIGFuIG9iamVjdCB3aXRoIGZpZWxkcyB4IGFuZCB5LlxuICAqXHRcdC0gYmFzZSBpcyBhIGJvb2xlYW4gZGVmaW5pbmcgaWYgdGhlIG5vZGUgaXMgdGhlIGJhc2UuXG4gICpcbiAgKlx0QmFzZSBub2RlcyBjYW4gbm90IGJlZW4gYXR0YWNrZXQgbm9yIGRlZmVuZGVkLlxuICAqXHRQYXRyb2xzIGhhdmUgdG8gc3RhcnQgYW5kIGVuZCBhdCB0aGUgYmFzZS5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnYWRkTm9kZScsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGFkZE5vZGUoKSB7XG5cdFx0XHR2YXIgcG9zaXRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHsgeDogMCwgeTogMCB9O1xuXHRcdFx0dmFyIGJhc2UgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuXG5cdFx0XHR2YXIgbmV3Tm9kZSA9IHRoaXMuY3kuYWRkKHtcblx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdGlkOiB0aGlzLmN5Lm5vZGVzKCkubGVuZ3RoLFxuXHRcdFx0XHRcdHJvYmJlcnNJbnRlcmVzdDogMSxcblx0XHRcdFx0XHRndWFyZGlhbnNDb3N0OiAyLFxuXHRcdFx0XHRcdGd1YXJkaWFuc1Jld2FyZDogMSxcblx0XHRcdFx0XHRyb2JiZXJTZXR0aW5nczogbmV3IE1hcCgpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHBvc2l0aW9uOiBwb3NpdGlvbixcblx0XHRcdFx0Z3JvdXA6ICdub2RlcycsXG5cdFx0XHRcdHNlbGVjdGFibGU6IHRydWUsXG5cdFx0XHRcdGxvY2tlZDogZmFsc2UsXG5cdFx0XHRcdGdyYWJiYWJsZTogdHJ1ZSxcblx0XHRcdFx0Y2xhc3NlczogYmFzZSA/ICdiYXNlJyA6ICcnXG5cdFx0XHR9KS5xdGlwKHtcblx0XHRcdFx0Y29udGVudDogJ1xcblxcdFxcdFxcdDxkaXY+XFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGJsdWUgbGlua1wiIHN0eWxlPVwid2lkdGg6MTYwcHhcIj48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zIHJpZ2h0XCI+dGltZWxpbmU8L2k+TGluayB0by4uLjwvYT5cXG5cXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gcmVkIGRlbGV0ZVwiIHN0eWxlPVwid2lkdGg6MTYwcHg7IG1hcmdpbi10b3A6IDEwcHhcIiAnICsgKGJhc2UgPyAnZGlzYWJsZWQnIDogJycpICsgJz48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zIHJpZ2h0XCI+ZGVsZXRlPC9pPkRlbGV0ZTwvYT5cXG5cXHRcXHRcXHRcXHRcXG5cXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gcmVkIGxpZ2h0ZW4tMiBtaW51c0ludGVyZXN0IGNvbFwiICcgKyAoYmFzZSA/ICdkaXNhYmxlZCcgOiAnJykgKyAnPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIj5yZW1vdmVfY2lyY2xlPC9pPjwvYT5cXG5cXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVwibGFiZWxcIj5Sb2JiZXJzIEludGVyZXN0PC9kaXY+XFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGdyZWVuIGxpZ2h0ZW4tMiBwbHVzSW50ZXJlc3QgY29sXCIgJyArIChiYXNlID8gJ2Rpc2FibGVkJyA6ICcnKSArICc+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPmFkZF9jaXJjbGU8L2k+PC9hPlxcblxcblxcdFxcdFxcdFxcdDxhIGNsYXNzPVwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biByZWQgbGlnaHRlbi0yIG1pbnVzQ29zdCBjb2xcIiAnICsgKGJhc2UgPyAnZGlzYWJsZWQnIDogJycpICsgJz48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+cmVtb3ZlX2NpcmNsZTwvaT48L2E+XFxuXFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cImxhYmVsXCI+R3VhcmRpYW5zIENvc3Q8L2Rpdj5cXG5cXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gZ3JlZW4gbGlnaHRlbi0yIHBsdXNDb3N0IGNvbFwiICcgKyAoYmFzZSA/ICdkaXNhYmxlZCcgOiAnJykgKyAnPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIj5hZGRfY2lyY2xlPC9pPjwvYT5cXG5cXG5cXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gcmVkIGxpZ2h0ZW4tMiBtaW51c1Jld2FyZCBjb2xcIiAnICsgKGJhc2UgPyAnZGlzYWJsZWQnIDogJycpICsgJz48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+cmVtb3ZlX2NpcmNsZTwvaT48L2E+XFxuXFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cImxhYmVsXCI+R3VhcmRpYW5zIFJld2FyZDwvZGl2PlxcblxcdFxcdFxcdFxcdDxhIGNsYXNzPVwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biBncmVlbiBsaWdodGVuLTIgcGx1c1Jld2FyZCBjb2xcIiAnICsgKGJhc2UgPyAnZGlzYWJsZWQnIDogJycpICsgJz48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+YWRkX2NpcmNsZTwvaT48L2E+XFxuXFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGdyZWVuIGRpc21pc3NcIiBzdHlsZT1cIndpZHRoOjE2MHB4OyBtYXJnaW4tdG9wOiAxMHB4XCI+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29ucyByaWdodFwiPmNhbmNlbDwvaT5EaXNtaXNzPC9hPlxcblxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdFxcdCcsXG5cdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0bXk6ICd0b3AgY2VudGVyJyxcblx0XHRcdFx0XHRhdDogJ2JvdHRvbSBjZW50ZXInXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0Y2xhc3NlczogJ3F0aXAtYm9vdHN0cmFwJyxcblx0XHRcdFx0XHR3aWR0aDogMTk1XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLnNldHRpbmdzLnJvYmJlcnMubGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChyb2JiZXIpIHtcblx0XHRcdFx0cmV0dXJuIG5ld05vZGUuZGF0YSgncm9iYmVyU2V0dGluZ3MnKS5zZXQocm9iYmVyLCB7XG5cdFx0XHRcdFx0Y29zdDogMixcblx0XHRcdFx0XHRyZXdhcmQ6IDFcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0UmV0dXJuIHRoZSBsZW5ndGggb2YgYW4gZWRnZS5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnbGVuZ3RoJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gbGVuZ3RoKGVkZ2UpIHtcblx0XHRcdHJldHVybiB0aGlzLmRpc3RhbmNlKGVkZ2Uuc291cmNlKCksIGVkZ2UudGFyZ2V0KCkpO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdFJldHVybiB0aGUgZGlzdGFuY2UgYmV0d2VlbiBkd28gdmVydGljZXMuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ2Rpc3RhbmNlJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gZGlzdGFuY2Uobm9kZTEsIG5vZGUyKSB7XG5cdFx0XHRyZXR1cm4gKChub2RlMS5wb3NpdGlvbigpLnggLSBub2RlMi5wb3NpdGlvbigpLngpICoqIDIgKyAobm9kZTEucG9zaXRpb24oKS55IC0gbm9kZTIucG9zaXRpb24oKS55KSkgKiogMC41O1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdENvbmNhdGVuYXRlIHNldHRpbmdzIGludG8gYSBKU09OIG9iamVjdC5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnZ2V0U2V0dGluZ3MnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBnZXRTZXR0aW5ncygpIHtcblx0XHRcdHZhciBfdGhpczIgPSB0aGlzO1xuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR2ZXJ0aWNlczogT2JqZWN0LmtleXMoY3kubm9kZXMoKSkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0XHRyZXR1cm4gIWlzTmFOKGtleSk7XG5cdFx0XHRcdH0pLm1hcChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdGlkOiBwYXJzZUludChjeS5ub2RlcygpW2tleV0uaWQoKSksXG5cdFx0XHRcdFx0XHRwb3NpdGlvbjogY3kubm9kZXMoKVtrZXldLnBvc2l0aW9uKCksXG5cdFx0XHRcdFx0XHRyb2JiZXJzSW50ZXJlc3Q6IGN5Lm5vZGVzKClba2V5XS5kYXRhKCdyb2JiZXJzSW50ZXJlc3QnKSxcblx0XHRcdFx0XHRcdGd1YXJkaWFuc0Nvc3Q6IGN5Lm5vZGVzKClba2V5XS5kYXRhKCdndWFyZGlhbnNDb3N0JyksXG5cdFx0XHRcdFx0XHRndWFyZGlhbnNSZXdhcmQ6IGN5Lm5vZGVzKClba2V5XS5kYXRhKCdndWFyZGlhbnNSZXdhcmQnKSxcblx0XHRcdFx0XHRcdHJvYmJlclNldHRpbmdzOiBBcnJheS5mcm9tKGN5Lm5vZGVzKClba2V5XS5kYXRhKCdyb2JiZXJTZXR0aW5ncycpKS5yZWR1Y2UoZnVuY3Rpb24gKG9iaiwgX3JlZikge1xuXHRcdFx0XHRcdFx0XHR2YXIgX3JlZjIgPSBfc2xpY2VkVG9BcnJheShfcmVmLCAyKSxcblx0XHRcdFx0XHRcdFx0ICAgIGtleSA9IF9yZWYyWzBdLFxuXHRcdFx0XHRcdFx0XHQgICAgdmFsdWUgPSBfcmVmMlsxXTtcblxuXHRcdFx0XHRcdFx0XHRvYmpba2V5XSA9IHZhbHVlO3JldHVybiBvYmo7XG5cdFx0XHRcdFx0XHR9LCB7fSlcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9KSxcblx0XHRcdFx0ZWRnZXM6IE9iamVjdC5rZXlzKGN5LmVkZ2VzKCkpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdFx0cmV0dXJuICFpc05hTihrZXkpO1xuXHRcdFx0XHR9KS5tYXAoZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRzb3VyY2U6IHBhcnNlSW50KGN5LmVkZ2VzKClba2V5XS5zb3VyY2UoKS5pZCgpKSxcblx0XHRcdFx0XHRcdHRhcmdldDogcGFyc2VJbnQoY3kuZWRnZXMoKVtrZXldLnRhcmdldCgpLmlkKCkpLFxuXHRcdFx0XHRcdFx0bGVuZ3RoOiBfdGhpczIubGVuZ3RoKGN5LmVkZ2VzKClba2V5XSlcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9KVxuXHRcdFx0fTtcblx0XHR9XG5cdH1dKTtcblxuXHRyZXR1cm4gR3JhcGg7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IEdyYXBoOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9zbGljZWRUb0FycmF5ID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkgeyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9IHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgcmV0dXJuIGFycjsgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHsgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTsgfSBlbHNlIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7IH0gfTsgfSgpO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFJvYmJlcnMgPSBmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIFJvYmJlcnMoc2V0dGluZ3MpIHtcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIFJvYmJlcnMpO1xuXG5cdFx0Ly8gRmllbGRzXG5cblx0XHR0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG5cblx0XHR0aGlzLm51bWJlck9mUm9iYmVyc0NyZWF0ZWQgPSAwO1xuXG5cdFx0dGhpcy5saXN0ID0gbmV3IFNldCgpO1xuXG5cdFx0dGhpcy5jYXRjaFByb2JhYmlsaXR5ID0gbmV3IE1hcCgpO1xuXG5cdFx0Ly8gRE9NIGxpc3RlbmVyc1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJyNyb2JiZXJzIC5kZWxldGUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuXHRcdFx0X3RoaXMucmVtb3ZlUm9iYmVyKCQoZXZlbnQuY3VycmVudFRhcmdldCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkuZGF0YSgncm9iYmVyaWQnKSk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnI3JvYmJlcnMgLmNvbmZpZ3VyZScsIGZ1bmN0aW9uIChldmVudCkge1xuXG5cdFx0XHRfdGhpcy5jb25maWd1cmVSb2JiZXIoJChldmVudC5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5kYXRhKCdyb2JiZXJpZCcpKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnI3JvYmJlcnMgaW5wdXQuZGlzY3JldGlvbicsIGZ1bmN0aW9uIChldmVudCkge1xuXG5cdFx0XHR2YXIgbmV3VmFsdWUgPSAxIC0gcGFyc2VGbG9hdCgkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnZhbCgpKTtcblxuXHRcdFx0aWYgKG5ld1ZhbHVlIDwgMCB8fCBuZXdWYWx1ZSA+IDEpIHtcblx0XHRcdFx0cmV0dXJuICQoZXZlbnQuY3VycmVudFRhcmdldCkuY3NzKHtcblx0XHRcdFx0XHRjb2xvcjogJ3JlZCdcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdCQoZXZlbnQuY3VycmVudFRhcmdldCkuY3NzKHtcblx0XHRcdFx0Y29sb3I6IFwiI2ZmZlwiXG5cdFx0XHR9KTtcblxuXHRcdFx0X3RoaXMuY2F0Y2hQcm9iYWJpbGl0eS5zZXQoJChldmVudC5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5kYXRhKCdyb2JiZXJpZCcpLCBuZXdWYWx1ZSk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJyNtb2RhbC1yb2JiZXItY29uZmlnIGlucHV0JywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cblx0XHRcdHZhciByb3cgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnBhcmVudCgpLnBhcmVudCgpO1xuXG5cdFx0XHR2YXIgbm9kZUlkID0gcm93LmRhdGEoJ25vZGVpZCcpO1xuXHRcdFx0dmFyIHJvYmJlcklkID0gcm93LmRhdGEoJ3JvYmJlcmlkJyk7XG5cblx0XHRcdHZhciBzZXR0aW5nID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5kYXRhKCdzZXR0aW5nJyk7XG5cdFx0XHR2YXIgbmV3VmFsdWUgPSBwYXJzZUZsb2F0KCQoZXZlbnQuY3VycmVudFRhcmdldCkudmFsKCkpO1xuXG5cdFx0XHRjb25zb2xlLmluZm8oc2V0dGluZyArICcgY2hhbmdlZCBmb3IgdGFyZ2V0ICcgKyBub2RlSWQgKyAnLCBuZXcgdmFsdWUgaXMgJyArIG5ld1ZhbHVlICsgJy4nKTtcblxuXHRcdFx0X3RoaXMuc2V0dGluZ3MucGF0aC5jeS5ub2RlcygnW2lkID0gXCInICsgbm9kZUlkICsgJ1wiXScpLmRhdGEoJ3JvYmJlclNldHRpbmdzJykuZ2V0KHJvYmJlcklkKVtzZXR0aW5nXSA9IG5ld1ZhbHVlO1xuXHRcdH0pO1xuXHR9XG5cblx0LypcbiAqXHRBZGQgYSByb2JiZXIgdG8gdGhlIHNldHRpbmdzLlxuICpcdEhpcyBjYXJkIGNhbiBiZSBzZWVuIGluIHRoZSBcIlJvYmJlcnNcIiB0YWIuXG4gKlx0SGlzIHNldHRpbmdzIGFyZSBzZXQgdG8gZGVmYXVsdCBpbiBldmVyeSB0YXJnZXQuXG4gKi9cblxuXG5cdF9jcmVhdGVDbGFzcyhSb2JiZXJzLCBbe1xuXHRcdGtleTogJ25ld1JvYmJlcicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIG5ld1JvYmJlcigpIHtcblxuXHRcdFx0dmFyIHJvYmJlcklkID0gdGhpcy5udW1iZXJPZlJvYmJlcnNDcmVhdGVkKys7XG5cblx0XHRcdHRoaXMubGlzdC5hZGQocm9iYmVySWQpO1xuXG5cdFx0XHR0aGlzLmNhdGNoUHJvYmFiaWxpdHkuc2V0KHJvYmJlcklkLCAwLjUpO1xuXG5cdFx0XHR0aGlzLnNldHRpbmdzLnBhdGguY3kubm9kZXMoKS5lYWNoKGZ1bmN0aW9uIChub2RlKSB7XG5cdFx0XHRcdHJldHVybiBub2RlLmRhdGEoJ3JvYmJlclNldHRpbmdzJykuc2V0KHJvYmJlcklkLCB7XG5cdFx0XHRcdFx0Y29zdDogMixcblx0XHRcdFx0XHRyZXdhcmQ6IDFcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI3JvYmJlcnMnKS5hcHBlbmQoJ1xcblxcdFxcdFxcdDxkaXYgY2xhc3M9XCJjb2wgczRcIiBkYXRhLXJvYmJlcmlkPVwiJyArIHJvYmJlcklkICsgJ1wiPlxcblxcdFxcdFxcdCAgICA8ZGl2IGNsYXNzPVwiY2FyZCBibHVlLWdyZXkgZGFya2VuLTFcIj5cXG5cXHRcXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiY2FyZC1jb250ZW50IHdoaXRlLXRleHRcIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8c3BhbiBjbGFzcz1cImNhcmQtdGl0bGVcIj5Sb2JiZXIgJyArIHJvYmJlcklkICsgJzwvc3Bhbj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8IS0tPHA+U29tZSBiYWQgZ3V5LjwvcD4tLT5cXG5cXHRcXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiY2FyZC1hY3Rpb25cIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiZGlzY3JldGlvbkNvbnRhaW5lclwiPlxcblxcdFxcdFxcdFxcdFxcdFxcdFxcdDxzcGFuPkRpc2NyZXRpb248L3NwYW4+XFxuXFx0XFx0XFx0XFx0XFx0XFx0XFx0PGlucHV0IHR5cGU9XCJudW1iZXJcIiBzdGVwPVwiMC4wNVwiIGNsYXNzPVwiZGlzY3JldGlvblwiIG1pbj1cIjBcIiBtYXg9XCIxXCIgdmFsdWU9XCIwLjVcIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gYmx1ZSBjb25maWd1cmVcIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBtYXJnaW4tdG9wOiAxMHB4O1wiPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnMgcmlnaHRcIj5tb2RlX2VkaXQ8L2k+UmV3YXJkczwvYT5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gcmVkIGRlbGV0ZVwiIHN0eWxlPVwid2lkdGg6IDEwMCU7IG1hcmdpbi10b3A6IDEwcHhcIj48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zIHJpZ2h0XCI+ZGVsZXRlPC9pPkRlbGV0ZTwvYT5cXG5cXHRcXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHQnKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0UmVtb3ZlIGEgcm9iYmVyIGZyb20gdGhlIHNldHRpbmdzLlxuICAqXHRIaXMgY2FyZCBnZXRzIHJlbW92ZWQgYW5kIHJlZmVyZW5jZXMgdG8gaGlzIHNldHRpbmdzIGFyZVxuICAqXHRyZW1vdmVkIGZyb20gZWFjaCB0YXJnZXQuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ3JlbW92ZVJvYmJlcicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHJlbW92ZVJvYmJlcihyb2JiZXJJZCkge1xuXG5cdFx0XHRjb25zb2xlLmluZm8oJ1JlbW92aW5nIHJvYmJlciAnICsgcm9iYmVySWQgKyAnLi4uJyk7XG5cblx0XHRcdHRoaXMubGlzdC5kZWxldGUocm9iYmVySWQpO1xuXG5cdFx0XHR0aGlzLnNldHRpbmdzLnBhdGguY3kubm9kZXMoKS5lYWNoKGZ1bmN0aW9uIChub2RlKSB7XG5cdFx0XHRcdHJldHVybiBub2RlLmRhdGEoJ3JvYmJlclNldHRpbmdzJykuZGVsZXRlKHJvYmJlcklkKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjcm9iYmVycycpLmZpbmQoJ1tkYXRhLXJvYmJlcmlkPScgKyByb2JiZXJJZCArICddJykucmVtb3ZlKCk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdERpc3BsYXkgYSBtb2RhbCBlbmFibGluZyB0aGUgdXNlciB0byBzZXQgdGhlXG4gICpcdHJvYmJlciBwcm9wZXJ0aWVzIGZvciBldmVyeSB0YXJnZXQuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ2NvbmZpZ3VyZVJvYmJlcicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGNvbmZpZ3VyZVJvYmJlcihyb2JiZXJJZCkge1xuXG5cdFx0XHRjb25zb2xlLmluZm8oJ0NvbmZpZ3VyaW5nIHJvYmJlciAnICsgcm9iYmVySWQgKyAnLicpO1xuXG5cdFx0XHR2YXIgdGFibGUgPSAnXFxuXFx0XFx0XFx0PHRhYmxlIGNsYXNzPVwic3RyaXBlZCBjZW50ZXJlZFwiPlxcblxcdFxcdFxcdFxcdDx0aGVhZD5cXG5cXHRcXHRcXHRcXHRcXHQ8dHI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPlRhcmdldCBJRDwvdGg+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPkNvc3Q8L3RoPlxcblxcdFxcdFxcdFxcdFxcdFxcdDx0aD5SZXdhcmQ8L3RoPlxcblxcdFxcdFxcdFxcdFxcdDwvdHI+XFxuXFx0XFx0XFx0XFx0PC90aGVhZD5cXG5cXG5cXHRcXHRcXHRcXHQ8dGJvZHk+JztcblxuXHRcdFx0dGhpcy5zZXR0aW5ncy5wYXRoLmN5Lm5vZGVzKCdbaWQgIT0gXCIwXCJdJykuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuXG5cdFx0XHRcdHZhciBzZXR0aW5ncyA9IG5vZGUuZGF0YSgncm9iYmVyU2V0dGluZ3MnKS5nZXQocm9iYmVySWQpO1xuXG5cdFx0XHRcdHRhYmxlICs9ICdcXG5cXHRcXHRcXHRcXHQ8dHIgZGF0YS1ub2RlaWQ9XCInICsgbm9kZS5pZCgpICsgJ1wiIGRhdGEtcm9iYmVyaWQ9XCInICsgcm9iYmVySWQgKyAnXCI+XFxuXFx0XFx0XFx0XFx0XFx0PHRkPicgKyBub2RlLmlkKCkgKyAnPC90ZD5cXG5cXHRcXHRcXHRcXHRcXHQ8dGQ+PGlucHV0IGRhdGEtc2V0dGluZz1cImNvc3RcIiB0eXBlPVwibnVtYmVyXCIgdmFsdWU9XCInICsgc2V0dGluZ3MuY29zdCArICdcIiBtaW49XCIwXCI+PC90ZD5cXG5cXHRcXHRcXHRcXHRcXHQ8dGQ+PGlucHV0IGRhdGEtc2V0dGluZz1cInJld2FyZFwiIHR5cGU9XCJudW1iZXJcIiB2YWx1ZT1cIicgKyBzZXR0aW5ncy5yZXdhcmQgKyAnXCIgbWluPVwiMFwiPjwvdGQ+XFxuXFx0XFx0XFx0XFx0PC90cj4nO1xuXHRcdFx0fSk7XG5cblx0XHRcdHRhYmxlICs9ICdcXG5cXHRcXHRcXHRcXHQ8L3Rib2R5PlxcblxcdFxcdFxcdDwvdGFibGU+JztcblxuXHRcdFx0JCgnI21vZGFsLXJvYmJlci1jb25maWcgaDQnKS50ZXh0KCdSb2JiZXIgJyArIHJvYmJlcklkICsgJyBjb25maWd1cmF0aW9uJyk7XG5cblx0XHRcdCQoJyNtb2RhbC1yb2JiZXItY29uZmlnIHAnKS5odG1sKHRhYmxlKTtcblxuXHRcdFx0JCgnI21vZGFsLXJvYmJlci1jb25maWcnKS5tb2RhbCgnb3BlbicpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRSZXR1cm4gdGhlIGxpc3Qgb2YgZXZlcnkgcm9iYmVyLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdnZXRTZXR0aW5ncycsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGdldFNldHRpbmdzKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0bGlzdDogW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLmxpc3QpKSxcblx0XHRcdFx0Y2F0Y2hQcm9iYWJpbGl0eTogQXJyYXkuZnJvbSh0aGlzLmNhdGNoUHJvYmFiaWxpdHkpLnJlZHVjZShmdW5jdGlvbiAob2JqLCBfcmVmKSB7XG5cdFx0XHRcdFx0dmFyIF9yZWYyID0gX3NsaWNlZFRvQXJyYXkoX3JlZiwgMiksXG5cdFx0XHRcdFx0ICAgIGtleSA9IF9yZWYyWzBdLFxuXHRcdFx0XHRcdCAgICB2YWx1ZSA9IF9yZWYyWzFdO1xuXG5cdFx0XHRcdFx0b2JqW2tleV0gPSB2YWx1ZTtyZXR1cm4gb2JqO1xuXHRcdFx0XHR9LCB7fSlcblx0XHRcdH07XG5cdFx0fVxuXHR9XSk7XG5cblx0cmV0dXJuIFJvYmJlcnM7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFJvYmJlcnM7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX0ludGVyZmFjZSA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9JbnRlcmZhY2UnKTtcblxudmFyIF9JbnRlcmZhY2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfSW50ZXJmYWNlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuLypcbipcdEN5dG9zY2FwZSAodGhlIGdyYXBoIGxpYnJhcnkgd2UgYXJlIHVzaW5nKSBkb2Vzbid0IHdvcmsgc29cbipcdHdlbGwgd2hlbiB0aGUgcmVuZGVyaW5nIGNhbnZhcyBpcyBoaWRkZW4gd2hpbGUgdGhlIGdyYXBoXG4qXHRpcyBpbml0aWFsaXplZC4gV2UgaGF2ZSB0byB3YWl0IGZvciB0aGUgY2FudmFzIHRvIGJlIGRpc3BsYXllZFxuKlx0YmVmb3JlIGluaXRpYWxpemluZyBpdCBhbmQgdG8gb25seSBkbyBzbyBvbmNlLlxuKlxuKlx0VGh1cywgd2UgdXNlIHRoZSBnbG9iYWwgZmxhZyBncmFwaEluaXRpYWxpemVkLlxuKi9cblxudmFyIGdyYXBoSW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuLypcbipcdEZ1bmN0aW9uIGNhbGxlZCB3aGVuZXZlciB0aGUgaGFzaCBpcyB1cGRhdGVkIHRvIGRvIHRoZSBjb3JyZWN0XG4qXHRhY3Rpb24uXG4qL1xuXG52YXIgdXBkYXRlSGFzaCA9IGZ1bmN0aW9uIHVwZGF0ZUhhc2goaGFzaCkge1xuXG5cdC8vIFdlIHJlbW92ZSB0aGUgJyMnIGNoYXJhY3RlciBmcm9tIHRoZSBoYXNoLiBKdXN0IGluIGNhc2UuXG5cdGhhc2ggPSBoYXNoLnJlcGxhY2UoL14jLywgJycpO1xuXG5cdC8qXG4gKlx0UHJldmVudHMgIyBsaW5rcyBmcm9tIGdvaW5nIHRvIHRoZSBlbGVtZW50LlxuICovXG5cdHZhciBub2RlID0gJCgnIycgKyBoYXNoKTtcblx0bm9kZS5hdHRyKCdpZCcsICcnKTtcblx0ZG9jdW1lbnQubG9jYXRpb24uaGFzaCA9IGhhc2g7XG5cdG5vZGUuYXR0cignaWQnLCBoYXNoKTtcblxuXHQvKlxuICpcdFdlIGhhdmUgdG8gc29ydCB0aGUgZ3JhcGggd2hlbiBpdCdzIGRpc3BsYXllZFxuICpcdGZvciB0aGUgZmlyc3QgdGltZS5cbiAqL1xuXHRpZiAoIWdyYXBoSW5pdGlhbGl6ZWQgJiYgaGFzaCA9PT0gJ3NpbXVsYXRlJykge1xuXHRcdHdpbmRvdy5ncmFwaC5zb3J0KCk7XG5cdFx0Z3JhcGhJbml0aWFsaXplZCA9IHRydWU7XG5cdH1cblxuXHRpZiAod2luZG93LmN5ICE9PSB1bmRlZmluZWQpIHdpbmRvdy5jeS5yZXNpemUoKTtcblxuXHQvKlxuICpcdEZpeCBhIGJ1ZyB3aXRoIHBhcmFsbGF4IGltYWdlcy5cbiAqL1xuXG5cdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdCQod2luZG93KS5zY3JvbGwoKTtcblx0fSwgMjUpO1xufTtcblxuLypcbipcdFNldHVwIG5vbi1zcGVjaWZpYyBET00gbGlzdGVuZXJzIGFuZCBpbml0aWFsaXplIG1vZHVsZXMuXG4qL1xudmFyIHNldHVwRE9NID0gZnVuY3Rpb24gc2V0dXBET00oKSB7XG5cblx0JCgnW2RhdGEtZGVzdF0nKS5jbGljayhmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQoZXZlbnQuZXZlbnRUYXJnZXQpLmRhdGEoJ2Rlc3QnKTtcblx0XHQkKCduYXYgdWwudGFicycpLnRhYnMoJ3NlbGVjdF90YWInLCAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2Rlc3QnKSk7XG5cdFx0dXBkYXRlSGFzaCgkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2Rlc3QnKSk7XG5cdH0pO1xuXG5cdCQoJ25hdiB1bC50YWJzJykub24oJ2NsaWNrJywgJ2EnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHR1cGRhdGVIYXNoKCQoZXZlbnQuY3VycmVudFRhcmdldCkuYXR0cignaHJlZicpKTtcblx0fSk7XG5cblx0JCh3aW5kb3cpLm9uKCdoYXNoY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuXHRcdCQoJ25hdiB1bC50YWJzJykudGFicygnc2VsZWN0X3RhYicsIHdpbmRvdy5sb2NhdGlvbi5oYXNoLnNsaWNlKDEpKTtcblx0XHR1cGRhdGVIYXNoKHdpbmRvdy5sb2NhdGlvbi5oYXNoKTtcblx0fSk7XG5cblx0JCgnLnBhcmFsbGF4JykucGFyYWxsYXgoKTtcblxuXHQkKCcubW9kYWwjbW9kYWwtcm9iYmVyLWNvbmZpZycpLm1vZGFsKCk7XG5cblx0Q29uc29sZUxvZ0hUTUwuY29ubmVjdCgkKCcjY29uc29sZScpKTtcbn07XG5cbi8qXG4qXHRXaGVuZXZlciB0aGUgRE9NIGNvbnRlbnQgaXMgcmVhYWR5IHRvIGJlIG1hbmlwdWxhdGVkLFxuKlx0c2V0dXBlIHRoZSBzcGVjaWZpYyBET00gYW5kIGNyZWF0ZSBhbiBJbnRlcmZhY2Ugd2l0aCB0aGUgc2VydmVyLlxuKlx0VGhlbiwgd2UgbGluayB0aGUgVUkgZWxlbWVudHMgdG8gdGhlIHNldHRpbmdzIHRoZXkgbWFuaXB1bGF0ZS5cbiovXG4kKGZ1bmN0aW9uICgpIHtcblx0c2V0dXBET00oKTtcblxuXHR2YXIgaWZhY2UgPSBuZXcgX0ludGVyZmFjZTIuZGVmYXVsdCgpO1xuXHQkKCcjc29ydE5vZGVzJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0cmV0dXJuIGlmYWNlLnNldHRpbmdzLnBhdGguc29ydCgpO1xuXHR9KTtcblx0JCgnI25ld1JvYmJlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdHJldHVybiBpZmFjZS5zZXR0aW5ncy5yb2JiZXJzLm5ld1JvYmJlcigpO1xuXHR9KTtcblx0JCgnI2xhdW5jaEJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdHJldHVybiBpZmFjZS5zdGFydFNpbXVsYXRpb24oKTtcblx0fSk7XG5cdCQoJy5tb2RhbCNtb2RhbC1yZXN1bHRzJykubW9kYWwoeyBjb21wbGV0ZTogZnVuY3Rpb24gY29tcGxldGUoKSB7XG5cdFx0XHRyZXR1cm4gaWZhY2Uuc3RvcFNpbXVsYXRpb24oKTtcblx0XHR9IH0pO1xufSk7Il19
