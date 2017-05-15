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
				'line-color': '#a2efa2'
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
  *	Concatenate settings into a JSON object.
  */

	}, {
		key: 'getSettings',
		value: function getSettings() {
			return {
				vertices: Object.keys(cy.nodes()).filter(function (key) {
					return !isNaN(key);
				}).map(function (key) {
					return {
						id: parseInt(cy.nodes()[key].id()),
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
						target: parseInt(cy.edges()[key].target().id())
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvZGlzdC9qcy9jbGFzc2VzL0ludGVyZmFjZS5qcyIsImNsaWVudC9kaXN0L2pzL2NsYXNzZXMvaW50ZXJmYWNlL1Jlc3VsdHMuanMiLCJjbGllbnQvZGlzdC9qcy9jbGFzc2VzL2ludGVyZmFjZS9TZXR0aW5ncy5qcyIsImNsaWVudC9kaXN0L2pzL2NsYXNzZXMvaW50ZXJmYWNlL3NldHRpbmdzL2ZpbGVzL0xvYWRlci5qcyIsImNsaWVudC9kaXN0L2pzL2NsYXNzZXMvaW50ZXJmYWNlL3NldHRpbmdzL3N1YnNldHRpbmdzL0dyYXBoLmpzIiwiY2xpZW50L2Rpc3QvanMvY2xhc3Nlcy9pbnRlcmZhY2Uvc2V0dGluZ3Mvc3Vic2V0dGluZ3MvUm9iYmVycy5qcyIsImNsaWVudC9kaXN0L2pzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBOzs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfU2V0dGluZ3MgPSByZXF1aXJlKCcuL2ludGVyZmFjZS9TZXR0aW5ncycpO1xuXG52YXIgX1NldHRpbmdzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NldHRpbmdzKTtcblxudmFyIF9SZXN1bHRzID0gcmVxdWlyZSgnLi9pbnRlcmZhY2UvUmVzdWx0cycpO1xuXG52YXIgX1Jlc3VsdHMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUmVzdWx0cyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8qXG4qXHRJbnRlcmZhY2UgYmV0d2VlbiB0aGUgY2xpZW50IHNpZGUgYW5kIHRoZSBiYWNrLWVuZC5cbipcbipcdFRoZSBpbnRlcmZhY2UgaGFzIHNldHRpbmdzIGFuZCBhIHNvY2tldCBlbmFibGluZyBpdCBcbipcdHRvIHNlbmQgYW5kIHJlY2VpdmUgZGF0YSBmcm9tIHRoZSBzZXJ2ZXIgcnVubmluZyB0aGVcbipcdEphdmEgTUFTIHNpbXVsYXRpb24uXG4qL1xuXG52YXIgSW50ZXJmYWNlID0gZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBJbnRlcmZhY2UoKSB7XG5cdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIEludGVyZmFjZSk7XG5cblx0XHQvLyBGaWVsZHNcblxuXHRcdHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgnaHR0cDovLycgKyB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgKyAnOjgwODMnKTtcblx0XHR0aGlzLnNldHRpbmdzID0gbmV3IF9TZXR0aW5nczIuZGVmYXVsdCgpO1xuXHRcdHRoaXMucmVzdWx0cyA9IG5ldyBfUmVzdWx0czIuZGVmYXVsdCgpO1xuXHRcdHRoaXMuc2ltdWxhdGlvblJ1bm5pbmcgPSBmYWxzZTtcblxuXHRcdC8vIFNvY2tldCBsaXN0ZW5lcnNcblxuXHRcdHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRjb25zb2xlLmluZm8oJ0Nvbm5lY3Rpb24gdG8gdGhlIHJlbW90ZSBzZXJ2ZXIgZXN0YWJsaXNoZWQuJyk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKlxuICpcdFN0YXJ0IHRoZSBzaW11bGF0aW9uIGJ5IHNlbmRpbmcgdGhlIHNldHRpbmdzIHRvIHRoZSBiYWNrLWVuZFxuICpcdGFsb25nIHRoZSBtZXNzYWdlICdzdGFydFNpbXVsYXRpb24nLlxuICovXG5cblx0X2NyZWF0ZUNsYXNzKEludGVyZmFjZSwgW3tcblx0XHRrZXk6ICdzdGFydFNpbXVsYXRpb24nLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBzdGFydFNpbXVsYXRpb24oKSB7XG5cdFx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdFx0XHR0aGlzLnNpbXVsYXRpb25SdW5uaW5nID0gdHJ1ZTtcblxuXHRcdFx0dGhpcy5zb2NrZXQub24oJ2xvYWRpbmcnLCBmdW5jdGlvbiAoZGF0YSkge1xuXHRcdFx0XHRyZXR1cm4gX3RoaXMucmVzdWx0cy5sb2FkaW5nKGRhdGEucHJvZ3Jlc3Npb24pO1xuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMucmVzdWx0cy5sb2FkaW5nKDApO1xuXG5cdFx0XHR0aGlzLnNvY2tldC5lbWl0KCdzdGFydFNpbXVsYXRpb24nLCB0aGlzLnNldHRpbmdzLmdldFNldHRpbmdzKCksIGZ1bmN0aW9uIChyZXN1bHRzKSB7XG5cblx0XHRcdFx0aWYgKCFfdGhpcy5zaW11bGF0aW9uUnVubmluZykgcmV0dXJuO1xuXG5cdFx0XHRcdGlmIChyZXN1bHRzLmVycm9yKSByZXR1cm4gX3RoaXMucmVzdWx0cy5lcnJvcihyZXN1bHRzLmVycm9yKTtcblxuXHRcdFx0XHRfdGhpcy5yZXN1bHRzLnNob3dSZXN1bHRzKHJlc3VsdHMuZGF0YSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0U3RvcCB0aGUgY2xpZW50LXNpZGUgc2ltdWxhdGlvbiBieSByZW1vdmluZyB0aGUgbG9hZGluZyBzY3JlZW4gYW5kXG4gICpcdGJsb2NraW5nIHJlc3VsdHMgY2FsbGJhY2suXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ3N0b3BTaW11bGF0aW9uJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gc3RvcFNpbXVsYXRpb24oKSB7XG5cdFx0XHR0aGlzLnNpbXVsYXRpb25SdW5uaW5nID0gZmFsc2U7XG5cblx0XHRcdHRoaXMuc29ja2V0LnJlbW92ZUxpc3RlbmVyKCdsb2FkaW5nJyk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblx0fV0pO1xuXG5cdHJldHVybiBJbnRlcmZhY2U7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IEludGVyZmFjZTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8qXG4qXHREZWFscyB3aXRoIHRoZSByZXN1bHRzIHNlbnQgYnkgdGhlIHNlcnZlci5cbiovXG52YXIgUmVzdWx0cyA9IGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gUmVzdWx0cygpIHtcblx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgUmVzdWx0cyk7XG5cblx0XHR3aW5kb3cucmVzdWx0cyA9IHRoaXM7XG5cdH1cblxuXHQvKlxuICpcdFdoZW4gYW4gZXJyb3IgaXMgcmVjZWl2ZWQsIHByaW50IGl0IHRvIHNjcmVlbi5cbiAqL1xuXG5cblx0X2NyZWF0ZUNsYXNzKFJlc3VsdHMsIFt7XG5cdFx0a2V5OiAnZXJyb3InLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBlcnJvcihlcnIpIHtcblxuXHRcdFx0Y29uc29sZS5lcnJvcignRXJyb3I6ICcgKyBlcnIpO1xuXG5cdFx0XHQkKCcjbW9kYWwtcmVzdWx0cyBwJykuaHRtbCgnXFxuXFxuXFx0XFx0XFx0PGRpdiBjbGFzcz1cImNlbnRlclwiPlxcblxcdFxcdFxcdFxcdEVycm9yIGVuY291bnRlcmVkIHdoaWxlIGNvbXB1dGluZyB0aGUgcmVzdWx0czogPGJyPlxcblxcdFxcdFxcdFxcdCcgKyBlcnIgKyAnXFxuXFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0JykubW9kYWwoJ29wZW4nKTtcblx0XHR9XG5cblx0XHQvKlxuICAqXHRXaGVuIHRoZSBzZXJ2ZXIgaXMgcHJvY2Vzc2luZywgc2hvdyB0aGUgcHJvZ3Jlc3MuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ2xvYWRpbmcnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBsb2FkaW5nKCkge1xuXHRcdFx0dmFyIHBlcmNlbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IGZhbHNlO1xuXG5cdFx0XHQkKCcjbW9kYWwtcmVzdWx0cyBwJykuaHRtbCgnXFxuXFxuXFx0XFx0XFx0PGRpdiBjbGFzcz1cImNlbnRlclwiPlxcblxcdFxcdFxcdFxcdFBsZWFzZSB3YWl0IHdoaWxlIG91ciBzZXJ2ZXIgaXMgY29tcHV0aW5nIHRoZSByZXN1bHRzLlxcblxcdFxcdFxcdDwvZGl2PlxcblxcblxcdFxcdFxcdDxkaXYgY2xhc3M9XCJwcm9ncmVzc1wiPlxcblxcdFxcdFxcdFxcdDxkaXYgY2xhc3M9XCInICsgKHBlcmNlbnQgPyAnZGV0ZXJtaW5hdGVcIiBzdHlsZT1cIndpZHRoOiAnICsgcGVyY2VudCArICclXCInIDogJ2luZGV0ZXJtaW5hdGVcIicpICsgJz48L2Rpdj5cXG5cXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHQnKS5tb2RhbCgnb3BlbicpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRXaGVuIGV2ZXJ5dGhpbmcgaXMgb2theSwgZGlzcGxheSBncmFwaHMsIHN0YXRzIGFuZCBzaG93IGEgc2ltdWxhdGlvbi5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnc2hvd1Jlc3VsdHMnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBzaG93UmVzdWx0cyhkYXRhKSB7XG5cblx0XHRcdGNvbnNvbGUuaW5mbygnUmVzdWx0cyByZWNlaXZlZC4nKTtcblxuXHRcdFx0Ly8gQnVpbGRpbmcgdGhlIGxpc3Qgb2YgcGF0cm9scy5cblxuXHRcdFx0dmFyIHBhdHJvbHNUYWJsZUhUTUwgPSAnXFxuXFx0XFx0XFx0PHRhYmxlIGNsYXNzPVwic3RyaXBlZCBjZW50ZXJlZFwiPlxcblxcdFxcdFxcdFxcdDx0aGVhZD5cXG5cXHRcXHRcXHRcXHRcXHQ8dHI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPlBhdHJvbCBJRDwvdGg+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPlBhdGg8L3RoPlxcblxcdFxcdFxcdFxcdFxcdDwvdHI+XFxuXFx0XFx0XFx0XFx0PC90aGVhZD5cXG5cXG5cXHRcXHRcXHRcXHQ8dGJvZHk+JztcblxuXHRcdFx0ZGF0YS5wYXRyb2xzLmZvckVhY2goZnVuY3Rpb24gKHBhdHJvbCwgaW5kZXgpIHtcblxuXHRcdFx0XHRwYXRyb2xzVGFibGVIVE1MICs9ICdcXG5cXHRcXHRcXHRcXHQ8dHI+XFxuXFx0XFx0XFx0XFx0XFx0PHRkPicgKyBpbmRleCArICc8L3RkPlxcblxcdFxcdFxcdFxcdFxcdDx0ZD4nICsgcGF0cm9sLnJlZHVjZShmdW5jdGlvbiAoc3VtLCB0YXJnZXQpIHtcblx0XHRcdFx0XHRyZXR1cm4gJycgKyBzdW0gKyB0YXJnZXQgKyAnPT4nO1xuXHRcdFx0XHR9LCAnJykuc2xpY2UoMCwgLTIpICsgJzwvdGQ+XFxuXFx0XFx0XFx0XFx0PC90cj4nO1xuXHRcdFx0fSk7XG5cblx0XHRcdHBhdHJvbHNUYWJsZUhUTUwgKz0gJ1xcblxcdFxcdFxcdFxcdDwvdGJvZHk+XFxuXFx0XFx0XFx0PC90YWJsZT4nO1xuXG5cdFx0XHQvLyBXZSBoYXZlIHRvIGZpbmQgdGhlIGJlc3Qgc3RyYXRlZ3kuXG5cblx0XHRcdHZhciBzdGF0aXN0aWNzVGFibGUgPSBbXTtcblxuXHRcdFx0ZGF0YS5zdHJhdGVnaWVzLmZvckVhY2goZnVuY3Rpb24gKHN0cmF0ZWd5KSB7XG5cblx0XHRcdFx0dmFyIGF2ZXJhZ2VHdWFyZGlhblV0aWxpdHkgPSBzdHJhdGVneS5pdGVyYXRpb25zLnJlZHVjZShmdW5jdGlvbiAoc3VtLCBpdGVyYXRpb24pIHtcblx0XHRcdFx0XHRyZXR1cm4gc3VtICsgaXRlcmF0aW9uLmd1YXJkaWFuVXRpbGl0eTtcblx0XHRcdFx0fSwgMCkgLyBzdHJhdGVneS5pdGVyYXRpb25zLmxlbmd0aDtcblx0XHRcdFx0dmFyIGF2ZXJhZ2VSb2JiZXJVdGlsaXR5ID0gc3RyYXRlZ3kuaXRlcmF0aW9ucy5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgaXRlcmF0aW9uKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHN1bSArIGl0ZXJhdGlvbi5yb2JiZXJVdGlsaXR5O1xuXHRcdFx0XHR9LCAwKSAvIHN0cmF0ZWd5Lml0ZXJhdGlvbnMubGVuZ3RoO1xuXG5cdFx0XHRcdHN0YXRpc3RpY3NUYWJsZS5wdXNoKHtcblx0XHRcdFx0XHRpdGVyYXRpb25zOiBzdHJhdGVneS5pdGVyYXRpb25zLFxuXHRcdFx0XHRcdHByb2JhYmlsaXRpZXM6IHN0cmF0ZWd5LnByb2JhYmlsaXRpZXMucmVkdWNlKGZ1bmN0aW9uIChzdW0sIHByb2JhYmlsaXR5KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gJycgKyBzdW0gKyBwcm9iYWJpbGl0eS50b0ZpeGVkKDIpICsgJyB8ICc7XG5cdFx0XHRcdFx0fSwgJycpLnNsaWNlKDAsIC0zKSxcblx0XHRcdFx0XHRndWFyZGlhblV0aWxpdHk6IGF2ZXJhZ2VHdWFyZGlhblV0aWxpdHksXG5cdFx0XHRcdFx0cm9iYmVyVXRpbGl0eTogYXZlcmFnZVJvYmJlclV0aWxpdHlcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dmFyIHNvcnRlZFN0YXRpc3RpY3NUYWJsZSA9IHN0YXRpc3RpY3NUYWJsZS5zb3J0KGZ1bmN0aW9uIChzMSwgczIpIHtcblx0XHRcdFx0cmV0dXJuIHMyLmd1YXJkaWFuVXRpbGl0eSAtIHMxLmd1YXJkaWFuVXRpbGl0eTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBXZSBmZWVkIHRoZSBncmFwaCB3aXRoIGF2ZXJhZ2UgZXZvbHV0aW9uIGZvciB0aGUgYmVzdCBzdHJhdGVneS5cblxuXHRcdFx0dmFyIGNoYXJ0RGF0YSA9IFtdO1xuXHRcdFx0dmFyIHN1bSA9IDA7XG5cblx0XHRcdHNvcnRlZFN0YXRpc3RpY3NUYWJsZVswXS5pdGVyYXRpb25zLmZvckVhY2goZnVuY3Rpb24gKGl0ZXJhdGlvbikge1xuXG5cdFx0XHRcdGNoYXJ0RGF0YS5wdXNoKHtcblx0XHRcdFx0XHR4OiBjaGFydERhdGEubGVuZ3RoLFxuXHRcdFx0XHRcdHk6IChzdW0gKz0gaXRlcmF0aW9uLmd1YXJkaWFuVXRpbGl0eSkgLyAoY2hhcnREYXRhLmxlbmd0aCArIDEpXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIEJ1aWxkaW5nIHRoZSBsaXN0IG9mIHN0YXRpc3RpY3MuXG5cblx0XHRcdHZhciBzdGF0aXN0aWNzVGFibGVIVE1MID0gJ1xcblxcdFxcdFxcdDx0YWJsZSBjbGFzcz1cInN0cmlwZWQgY2VudGVyZWRcIj5cXG5cXHRcXHRcXHRcXHQ8dGhlYWQ+XFxuXFx0XFx0XFx0XFx0XFx0PHRyPlxcblxcdFxcdFxcdFxcdFxcdFxcdDx0aD5Qcm9iYWJpbGl0aWVzPC90aD5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8dGg+R3VhcmRpYW4gdXRpbGl0eTwvdGg+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPlJvYmJlciB1dGlsaXR5PC90aD5cXG5cXHRcXHRcXHRcXHRcXHQ8L3RyPlxcblxcdFxcdFxcdFxcdDwvdGhlYWQ+XFxuXFxuXFx0XFx0XFx0XFx0PHRib2R5Pic7XG5cblx0XHRcdHNvcnRlZFN0YXRpc3RpY3NUYWJsZS5mb3JFYWNoKGZ1bmN0aW9uIChzdHJhdGVneSkge1xuXG5cdFx0XHRcdHN0YXRpc3RpY3NUYWJsZUhUTUwgKz0gJ1xcblxcdFxcdFxcdFxcdDx0cj5cXG5cXHRcXHRcXHRcXHRcXHQ8dGQ+JyArIHN0cmF0ZWd5LnByb2JhYmlsaXRpZXMgKyAnPC90ZD5cXG5cXHRcXHRcXHRcXHRcXHQ8dGQ+JyArIHN0cmF0ZWd5Lmd1YXJkaWFuVXRpbGl0eSArICc8L3RkPlxcblxcdFxcdFxcdFxcdFxcdDx0ZD4nICsgc3RyYXRlZ3kucm9iYmVyVXRpbGl0eSArICc8L3RkPlxcblxcdFxcdFxcdFxcdDwvdHI+Jztcblx0XHRcdH0pO1xuXG5cdFx0XHRzdGF0aXN0aWNzVGFibGVIVE1MICs9ICdcXG5cXHRcXHRcXHRcXHQ8L3Rib2R5PlxcblxcdFxcdFxcdDwvdGFibGU+JztcblxuXHRcdFx0JCgnI21vZGFsLXJlc3VsdHMgcCcpLmh0bWwoJ1xcblxcblxcdFxcdFxcdDxkaXYgY2xhc3M9XCJyb3dcIj5cXG5cXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiY29sIHMxMlwiPlxcblxcdFxcdFxcdFxcdFxcdDx1bCBjbGFzcz1cInRhYnNcIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8bGkgY2xhc3M9XCJ0YWIgY29sIHMzXCI+PGEgY2xhc3M9XCJhY3RpdmVcIiBocmVmPVwiI2NoYXJ0XCI+Q2hhcnQ8L2E+PC9saT5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8bGkgY2xhc3M9XCJ0YWIgY29sIHMzXCI+PGEgaHJlZj1cIiN2aXN1YWxpemF0aW9uXCI+VmlzdWFsaXphdGlvbjwvYT48L2xpPlxcblxcdFxcdFxcdFxcdFxcdFxcdDxsaSBjbGFzcz1cInRhYiBjb2wgczNcIj48YSBocmVmPVwiI3BhdHJvbHNcIj5QYXRyb2xzPC9hPjwvbGk+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGxpIGNsYXNzPVwidGFiIGNvbCBzM1wiPjxhIGhyZWY9XCIjc3RhdGlzdGljc1wiPlN0YXRpc3RpY3M8L2E+PC9saT5cXG5cXHRcXHRcXHRcXHRcXHQ8L3VsPlxcblxcdFxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdFxcdFxcdDxkaXYgaWQ9XCJjaGFydFwiIGNsYXNzPVwiY29sIHMxMlwiPlxcblxcdFxcdFxcdFxcdFxcdDxjYW52YXMgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiNDAwXCIgaWQ9XCJsaW5lLWNoYXJ0XCI+PC9jYW52YXM+XFxuXFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0XFx0PGRpdiBpZD1cInZpc3VhbGl6YXRpb25cIiBjbGFzcz1cImNvbCBzMTJcIj5cXG5cXHRcXHRcXHRcXHRcXHRTYW1lIHBhdGggYXMgaW4gc2V0dGluZ3Mgd2l0aCBhbmltYXRpb24uXFxuXFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0XFx0PGRpdiBpZD1cInBhdHJvbHNcIiBjbGFzcz1cImNvbCBzMTJcIj5cXG5cXHRcXHRcXHRcXHRcXHQnICsgcGF0cm9sc1RhYmxlSFRNTCArICdcXG5cXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHQ8ZGl2IGlkPVwic3RhdGlzdGljc1wiIGNsYXNzPVwiY29sIHMxMlwiPlxcblxcdFxcdFxcdFxcdFxcdCcgKyBzdGF0aXN0aWNzVGFibGVIVE1MICsgJ1xcblxcdFxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdFxcdDwvZGl2PlxcblxcblxcdFxcdCcpLm1vZGFsKCdvcGVuJyk7XG5cblx0XHRcdCQoJyNtb2RhbC1yZXN1bHRzIHAgdWwudGFicycpLnRhYnMoKTtcblxuXHRcdFx0dmFyIHNjYXR0ZXJDaGFydCA9IG5ldyBDaGFydChcImxpbmUtY2hhcnRcIiwge1xuXHRcdFx0XHR0eXBlOiAnbGluZScsXG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRkYXRhc2V0czogW3tcblx0XHRcdFx0XHRcdGxhYmVsOiAnQmVzdCBzdHJhdGVneSB1dGlsaXR5IG92ZXIgdGltZS4nLFxuXHRcdFx0XHRcdFx0ZGF0YTogY2hhcnREYXRhXG5cdFx0XHRcdFx0fV1cblx0XHRcdFx0fSxcblx0XHRcdFx0b3B0aW9uczoge1xuXHRcdFx0XHRcdG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlLFxuXHRcdFx0XHRcdHNjYWxlczoge1xuXHRcdFx0XHRcdFx0eEF4ZXM6IFt7XG5cdFx0XHRcdFx0XHRcdHR5cGU6ICdsaW5lYXInLFxuXHRcdFx0XHRcdFx0XHRwb3NpdGlvbjogJ2JvdHRvbSdcblx0XHRcdFx0XHRcdH1dXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXHR9XSk7XG5cblx0cmV0dXJuIFJlc3VsdHM7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFJlc3VsdHM7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcblx0dmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX0dyYXBoID0gcmVxdWlyZSgnLi9zZXR0aW5ncy9zdWJzZXR0aW5ncy9HcmFwaC5qcycpO1xuXG52YXIgX0dyYXBoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0dyYXBoKTtcblxudmFyIF9Sb2JiZXJzID0gcmVxdWlyZSgnLi9zZXR0aW5ncy9zdWJzZXR0aW5ncy9Sb2JiZXJzLmpzJyk7XG5cbnZhciBfUm9iYmVyczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Sb2JiZXJzKTtcblxudmFyIF9TYXZlciA9IHJlcXVpcmUoJy4vc2V0dGluZ3MvZmlsZXMvU2F2ZXInKTtcblxudmFyIF9TYXZlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TYXZlcik7XG5cbnZhciBfTG9hZGVyID0gcmVxdWlyZSgnLi9zZXR0aW5ncy9maWxlcy9Mb2FkZXInKTtcblxudmFyIF9Mb2FkZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfTG9hZGVyKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLypcbipcdFNldHRpbmdzIG9mIHRoZSBzaW11bGF0aW9uLlxuKlxuKlx0SW5pdGlhbGl6ZSBzZXR0aW5ncyB3aXRoIGRlZmF1bHQgdmFsdWVzLlxuKi9cblxudmFyIFNldHRpbmdzID0gZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBTZXR0aW5ncygpIHtcblx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2V0dGluZ3MpO1xuXG5cdFx0Ly8gRmllbGRzXG5cblx0XHR0aGlzLnBhdGggPSBuZXcgX0dyYXBoMi5kZWZhdWx0KHRoaXMpO1xuXG5cdFx0dGhpcy5yb2JiZXJzID0gbmV3IF9Sb2JiZXJzMi5kZWZhdWx0KHRoaXMpO1xuXG5cdFx0Ly8gRGVmYXVsdCB2YWx1ZXNcblxuXHRcdHRoaXMuaW5pdFBhdGgoKTtcblxuXHRcdHRoaXMuaW5pdFJvYmJlcnMoKTtcblx0fVxuXG5cdC8qXG4gKlx0Q3JlYXRlIGEgZGVmYXVsdCBwYXRoIGFuZCB0aGVuIHNvcnQgdGhlIHRhcmdldHMuXG4gKi9cblxuXHRfY3JlYXRlQ2xhc3MoU2V0dGluZ3MsIFt7XG5cdFx0a2V5OiAnaW5pdFBhdGgnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBpbml0UGF0aCgpIHtcblxuXHRcdFx0dGhpcy5wYXRoLmFkZE5vZGUoe1xuXHRcdFx0XHR4OiA1MCxcblx0XHRcdFx0eTogNDVcblx0XHRcdH0sIHRydWUpLmFkZE5vZGUoe1xuXHRcdFx0XHR4OiAxNTAsXG5cdFx0XHRcdHk6IDQ1XG5cdFx0XHR9KS5saW5rKCcwJywgJzEnKS5zb3J0KCk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdENyZWF0ZSB0aGUgZGVmYXVsdCByb2JiZXJzLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdpbml0Um9iYmVycycsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGluaXRSb2JiZXJzKCkge1xuXG5cdFx0XHR0aGlzLnJvYmJlcnMubmV3Um9iYmVyKCk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdFJldHVybiBzZXR0aW5ncyBhcyBhcyBKU09OIG9iamVjdC5cbiAgKlxuICAqXHRUaG9zZSBzZXR0aW5ncyBjYW4gYmUgc2VuZCB0byB0aGUgYmFja2VuZC5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnZ2V0U2V0dGluZ3MnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBnZXRTZXR0aW5ncygpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGdlbmVyYWw6IHRoaXMuZ2V0R2VuZXJhbFNldHRpbmdzKCksXG5cdFx0XHRcdHBhdGhzOiB0aGlzLnBhdGguZ2V0U2V0dGluZ3MoKSxcblx0XHRcdFx0cm9iYmVyczogdGhpcy5yb2JiZXJzLmdldFNldHRpbmdzKClcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0Q29uY2F0ZW5hdGUgdGhlIGdlbmVyYWwgc2V0dGluZ3MgaW4gb25lIFxuICAqXHRKU09OIG9iamVjdC5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnZ2V0R2VuZXJhbFNldHRpbmdzJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gZ2V0R2VuZXJhbFNldHRpbmdzKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0bnVtYmVyT2ZJdGVyYXRpb25zOiBwYXJzZUludCgkKCcjbnVtYmVyT2ZJdGVyYXRpb25zJykudmFsKCkpXG5cdFx0XHR9O1xuXHRcdH1cblx0fV0pO1xuXG5cdHJldHVybiBTZXR0aW5ncztcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gU2V0dGluZ3M7IiwiXCJ1c2Ugc3RyaWN0XCI7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcblx0dmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7IHZhciBfYXJyID0gW107IHZhciBfbiA9IHRydWU7IHZhciBfZCA9IGZhbHNlOyB2YXIgX2UgPSB1bmRlZmluZWQ7IHRyeSB7IGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHsgX2Fyci5wdXNoKF9zLnZhbHVlKTsgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrOyB9IH0gY2F0Y2ggKGVycikgeyBfZCA9IHRydWU7IF9lID0gZXJyOyB9IGZpbmFsbHkgeyB0cnkgeyBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdKSBfaVtcInJldHVyblwiXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH0gcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGkpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyByZXR1cm4gYXJyOyB9IGVsc2UgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkgeyByZXR1cm4gc2xpY2VJdGVyYXRvcihhcnIsIGkpOyB9IGVsc2UgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTsgfSB9OyB9KCk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8qXG4qXHRHcmFwaCByZXByZXNlbnRpbmcgdGhlIHBhdGhzIG9mIHRoZSBzaW11bGF0aW9uLlxuKlxuKlx0WW91IGNhbiBhZGQgdGFyZ2V0cywgZGVsZXRlZCB0YXJnZXQsIGFuZCBsaW5rXG4qXHR0aGVtIHRvZ2V0aGVyLlxuKlxuKlx0Rm9yIGVhY2ggdGFyZ2V0LCB5b3UgY2FuIHNldCA6XG4qXHRcdC0gcm9iYmVyc0ludGVyZXN0ICh0aGUgcHJvYmFiaWxpdHkgb2Ygcm9iYmVycyBhdHRhY2tpbmcgdGhpcyB0YXJnZXQpXG4qXHRcdC0gZ3VhcmRpYW5zQ29zdCAodGhlIGNvc3Qgd2hlbiBndWFyZGlhbnMgZmFpbCB0byBwcm90ZWN0IHRoZSB0YXJnZXQpXG4qXHRcdC0gZ3VhcmRpYW5zUmV3YXJkICh0aGUgcmV3YXJkIHdoZW4gZ3VhcmRpYW5zIG1hbmFnZSB0byBwcmV2ZW50IFxuKlx0XHRcdFx0XHRcdFx0YW4gYXR0YWNrKVxuKlx0XHQtIHJvYmJlclNldHRpbmdzICh0aGUgY29zdCwgcmV3YXJkIGFuZCBwcm9iYWJpbGl0eSBmb3IgZWFjaCByb2JiZXIpXG4qXHRcdFx0KFNldCB0aHJvdWdoIHRoZSBSb2JiZXJzIGNsYXNzKVxuKlxuKlx0Tm9kZXMgPSBBdHRhY2tzID0gVGFyZ2V0c1xuKi9cblxudmFyIEdyYXBoID0gZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBHcmFwaChzZXR0aW5ncykge1xuXHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0XHRfY2xhc3NDYWxsQ2hlY2sodGhpcywgR3JhcGgpO1xuXG5cdFx0Ly8gRmllbGRzXG5cblx0XHR0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG5cblx0XHR0aGlzLnN0eWxlc2hlZXQgPSBbe1xuXHRcdFx0c2VsZWN0b3I6ICdub2RlJyxcblx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdGhlaWdodDogMjAsXG5cdFx0XHRcdHdpZHRoOiAyMCxcblx0XHRcdFx0J2JhY2tncm91bmQtY29sb3InOiAnbWFwRGF0YShyb2JiZXJzSW50ZXJlc3QsIDAsIDI1LCBncmVlbiwgcmVkKScsXG5cdFx0XHRcdGNvbnRlbnQ6IGZ1bmN0aW9uIGNvbnRlbnQobm9kZSkge1xuXHRcdFx0XHRcdHJldHVybiAnTicgKyBub2RlLmRhdGEoJ2lkJykgKyAnIEMnICsgbm9kZS5kYXRhKCdndWFyZGlhbnNDb3N0JykgKyAnL1InICsgbm9kZS5kYXRhKCdndWFyZGlhbnNSZXdhcmQnKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0Ly8ndGV4dC12YWxpZ24nOiAnY2VudGVyJyxcblx0XHRcdFx0J3RleHQtaGFsaWduJzogJ2NlbnRlcidcblx0XHRcdH1cblx0XHR9LCB7XG5cdFx0XHRzZWxlY3RvcjogJ2VkZ2UnLFxuXHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0J2N1cnZlLXN0eWxlJzogJ2hheXN0YWNrJyxcblx0XHRcdFx0J2hheXN0YWNrLXJhZGl1cyc6IDAsXG5cdFx0XHRcdHdpZHRoOiA1LFxuXHRcdFx0XHRvcGFjaXR5OiAwLjUsXG5cdFx0XHRcdCdsaW5lLWNvbG9yJzogJyNhMmVmYTInXG5cdFx0XHR9XG5cdFx0fSwge1xuXHRcdFx0c2VsZWN0b3I6ICcuYmFzZScsXG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHQnYmFja2dyb3VuZC1jb2xvcic6ICcjNjFiZmZjJyxcblx0XHRcdFx0bGFiZWw6ICdCYXNlJ1xuXHRcdFx0fVxuXHRcdH0sIHtcblx0XHRcdHNlbGVjdG9yOiAnOnNlbGVjdGVkJyxcblx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdCdib3JkZXItd2lkdGgnOiA0LFxuXHRcdFx0XHQnYm9yZGVyLWNvbG9yJzogJ3B1cnBsZSdcblx0XHRcdH1cblx0XHR9XTtcblxuXHRcdHRoaXMuY3kgPSB3aW5kb3cuY3kgPSBjeXRvc2NhcGUoe1xuXHRcdFx0Y29udGFpbmVyOiAkKCcjZ3JhcGgnKSxcblxuXHRcdFx0Ym94U2VsZWN0aW9uRW5hYmxlZDogZmFsc2UsXG5cdFx0XHRhdXRvdW5zZWxlY3RpZnk6IGZhbHNlLFxuXG5cdFx0XHRzdHlsZTogdGhpcy5zdHlsZXNoZWV0XG5cdFx0fSk7XG5cblx0XHR0aGlzLmN5Lm1pblpvb20oMC41KTtcblx0XHR0aGlzLmN5Lm1heFpvb20oMik7XG5cblx0XHR3aW5kb3cuZ3JhcGggPSB0aGlzO1xuXG5cdFx0dGhpcy5uYnJFZGdlc0NyZWF0ZWQgPSAwO1xuXHRcdHRoaXMubmJyTm9kZXNDcmVhdGVkID0gMDtcblxuXHRcdHRoaXMubGFzdFNlbGVjdGVkTm9kZSA9IG51bGw7XG5cdFx0dGhpcy5jdXJyZW50QWN0aW9uID0gbnVsbDtcblxuXHRcdC8vIERPTSBsaXN0ZW5lcnNcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucXRpcC1jb250ZW50IC5saW5rJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRjb25zb2xlLmluZm8oXCJMaW5raW5nIGEgdGFyZ2V0IHRvIGFub3RoZXIuLi5cIik7XG5cdFx0XHRfdGhpcy5jdXJyZW50QWN0aW9uID0gJ2xpbmtpbmcnO1xuXHRcdFx0JCgnLnF0aXAnKS5xdGlwKCdoaWRlJyk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnF0aXAtY29udGVudCAuZGVsZXRlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLnJlbW92ZSgpO1xuXHRcdFx0X3RoaXMucmVzZXQoKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucXRpcC1jb250ZW50IC5kaXNtaXNzJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRfdGhpcy5yZXNldCgpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5xdGlwLWNvbnRlbnQgLnBsdXNJbnRlcmVzdCcsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0X3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdyb2JiZXJzSW50ZXJlc3QnLCBNYXRoLm1pbihfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ3JvYmJlcnNJbnRlcmVzdCcpICsgMSwgMjUpKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucXRpcC1jb250ZW50IC5taW51c0ludGVyZXN0JywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRfdGhpcy5sYXN0U2VsZWN0ZWROb2RlLmRhdGEoJ3JvYmJlcnNJbnRlcmVzdCcsIE1hdGgubWF4KF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgncm9iYmVyc0ludGVyZXN0JykgLSAxLCAwKSk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnF0aXAtY29udGVudCAucGx1c0Nvc3QnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgnZ3VhcmRpYW5zQ29zdCcsIE1hdGgubWluKF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgnZ3VhcmRpYW5zQ29zdCcpICsgMSwgMjUpKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucXRpcC1jb250ZW50IC5taW51c0Nvc3QnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgnZ3VhcmRpYW5zQ29zdCcsIE1hdGgubWF4KF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgnZ3VhcmRpYW5zQ29zdCcpIC0gMSwgMCkpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5xdGlwLWNvbnRlbnQgLnBsdXNSZXdhcmQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgnZ3VhcmRpYW5zUmV3YXJkJywgTWF0aC5taW4oX3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdndWFyZGlhbnNSZXdhcmQnKSArIDEsIDI1KSk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnF0aXAtY29udGVudCAubWludXNSZXdhcmQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuZGF0YSgnZ3VhcmRpYW5zUmV3YXJkJywgTWF0aC5tYXgoX3RoaXMubGFzdFNlbGVjdGVkTm9kZS5kYXRhKCdndWFyZGlhbnNSZXdhcmQnKSAtIDEsIDApKTtcblx0XHR9KTtcblxuXHRcdC8vIEN5dG9zY2FwZSBsaXN0ZW5lcnNcblxuXHRcdHRoaXMuY3kub24oJ3RhcCcsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0aWYgKGV2ZW50LnRhcmdldCA9PT0gZXZlbnQuY3kpIF90aGlzLnJlc2V0KCk7XG5cdFx0XHQvLyBXaGVuIHlvdSB0YXAgb24gdGhlIGJhY2tncm91bmQgYW5kIHRoYXQgdGhlcmUgYXJlIG5vIHZpc2libGUgdGlwcywgeW91IGFkZCBhIG5ldyBub2RlIGF0IHRoaXMgcG9zaXRpb24uXG5cdFx0XHQvLyBJZiBhIHRpcCBpcyB2aXNpYmxlLCB5b3UgcHJvYmFibHkganVzdCB3YW50IHRvIGRpc21pc3MgaXRcblx0XHRcdGlmIChldmVudC50YXJnZXQgPT09IGV2ZW50LmN5ICYmICEkKCcucXRpcDp2aXNpYmxlJykubGVuZ3RoKSB7XG5cdFx0XHRcdHJldHVybiBfdGhpcy5hZGROb2RlKGV2ZW50LnBvc2l0aW9uKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHRoaXMuY3kub24oJ3RhcCcsICdub2RlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRpZiAoX3RoaXMuY3VycmVudEFjdGlvbiA9PT0gJ2xpbmtpbmcnKSB7XG5cdFx0XHRcdF90aGlzLmN1cnJlbnRBY3Rpb24gPSBudWxsO1xuXHRcdFx0XHR2YXIgc2Vjb25kTm9kZSA9IGV2ZW50LnRhcmdldDtcblx0XHRcdFx0Ly8gV2UgY2hlY2sgaWYgdGhhdCBlZGdlIGFsZWFkeSBleGlzdHMgb3IgaWYgdGhlIHNvdXJjZSBhbmQgdGFyZ2V0IGFyZSB0aGUgc2FtZSBub2RlLlxuXHRcdFx0XHRpZiAoIV90aGlzLmN5LmVsZW1lbnRzKCdlZGdlW3NvdXJjZSA9IFwiJyArIF90aGlzLmxhc3RTZWxlY3RlZE5vZGUuaWQoKSArICdcIl1bdGFyZ2V0ID0gXCInICsgc2Vjb25kTm9kZS5pZCgpICsgJ1wiXScpLmxlbmd0aCAmJiAhX3RoaXMuY3kuZWxlbWVudHMoJ2VkZ2VbdGFyZ2V0ID0gXCInICsgX3RoaXMubGFzdFNlbGVjdGVkTm9kZS5pZCgpICsgJ1wiXVtzb3VyY2UgPSBcIicgKyBzZWNvbmROb2RlLmlkKCkgKyAnXCJdJykubGVuZ3RoICYmIHNlY29uZE5vZGUgIT0gX3RoaXMubGFzdFNlbGVjdGVkTm9kZSkge1xuXHRcdFx0XHRcdF90aGlzLmxpbmsoX3RoaXMubGFzdFNlbGVjdGVkTm9kZS5pZCgpLCBzZWNvbmROb2RlLmlkKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdF90aGlzLmxhc3RTZWxlY3RlZE5vZGUgPSBldmVudC50YXJnZXQ7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmN5Lm9uKCd0YXAnLCAnZWRnZScsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0ZXZlbnQudGFyZ2V0LnJlbW92ZSgpO1xuXHRcdH0pO1xuXHR9XG5cblx0LypcbiAqXHRTb3J0IHRhcmdldHMgd2l0aCB0aGUgQ29TRSBsYXlvdXQgKGJ5IEJpbGtlbnQgVW5pdmVyc2l0eSkuXG4gKi9cblxuXG5cdF9jcmVhdGVDbGFzcyhHcmFwaCwgW3tcblx0XHRrZXk6ICdzb3J0Jyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gc29ydCgpIHtcblx0XHRcdHRoaXMuY3kubGF5b3V0KHtcblx0XHRcdFx0bmFtZTogJ2Nvc2UtYmlsa2VudCcsXG5cdFx0XHRcdGFuaW1hdGU6IHRydWVcblx0XHRcdH0pLnJ1bigpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRSZXNldCB0aGUgY3VycmVudCBhY3Rpb24sIHNlbGVjdGVkIHRhcmdldCBhbmQgaGlkZSB0aGUgdGlwcy5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAncmVzZXQnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiByZXNldCgpIHtcblx0XHRcdHRoaXMubGFzdFNlbGVjdGVkTm9kZSA9IG51bGw7XG5cdFx0XHR0aGlzLmN1cnJlbnRBY3Rpb24gPSBudWxsO1xuXHRcdFx0JCgnLnF0aXAnKS5xdGlwKCdoaWRlJyk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdExpbmsgdHdvIHRhcmdldHMgdG9nZXRoZXIuIFlvdSBoYXZlIHRvIHNwZWNpZnkgdGhlIGlkcy5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnbGluaycsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGxpbmsoc291cmNlLCB0YXJnZXQpIHtcblx0XHRcdHRoaXMuY3kuYWRkKHtcblx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdGlkOiAnZScgKyB0aGlzLm5ickVkZ2VzQ3JlYXRlZCsrLFxuXHRcdFx0XHRcdHNvdXJjZTogc291cmNlLFxuXHRcdFx0XHRcdHRhcmdldDogdGFyZ2V0XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGdyb3VwOiAnZWRnZXMnLFxuXHRcdFx0XHRzZWxlY3RhYmxlOiB0cnVlLFxuXHRcdFx0XHRsb2NrZWQ6IGZhbHNlLFxuXHRcdFx0XHRncmFiYmFibGU6IHRydWUsXG5cdFx0XHRcdGNsYXNzZXM6ICcnXG5cdFx0XHR9KTtcblx0XHRcdGNvbnNvbGUuaW5mbygnRWRnZSBhZGRlZCBsaW5raW5nICcgKyBzb3VyY2UgKyAnIHRvICcgKyB0YXJnZXQgKyAnLicpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRBZGQgYSBub2RlIHRvIHRoZSBwYXRoLlxuICAqXHRcbiAgKlx0QXJndW1lbnRzIDpcbiAgKlx0XHQtIHBvc2l0aW9uIHNob3VsZCBiZSBhbiBvYmplY3Qgd2l0aCBmaWVsZHMgeCBhbmQgeS5cbiAgKlx0XHQtIGJhc2UgaXMgYSBib29sZWFuIGRlZmluaW5nIGlmIHRoZSBub2RlIGlzIHRoZSBiYXNlLlxuICAqXG4gICpcdEJhc2Ugbm9kZXMgY2FuIG5vdCBiZWVuIGF0dGFja2V0IG5vciBkZWZlbmRlZC5cbiAgKlx0UGF0cm9scyBoYXZlIHRvIHN0YXJ0IGFuZCBlbmQgYXQgdGhlIGJhc2UuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ2FkZE5vZGUnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBhZGROb2RlKCkge1xuXHRcdFx0dmFyIHBvc2l0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7IHg6IDAsIHk6IDAgfTtcblx0XHRcdHZhciBiYXNlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmYWxzZTtcblxuXHRcdFx0dmFyIG5ld05vZGUgPSB0aGlzLmN5LmFkZCh7XG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRpZDogdGhpcy5jeS5ub2RlcygpLmxlbmd0aCxcblx0XHRcdFx0XHRyb2JiZXJzSW50ZXJlc3Q6IDEsXG5cdFx0XHRcdFx0Z3VhcmRpYW5zQ29zdDogMixcblx0XHRcdFx0XHRndWFyZGlhbnNSZXdhcmQ6IDEsXG5cdFx0XHRcdFx0cm9iYmVyU2V0dGluZ3M6IG5ldyBNYXAoKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwb3NpdGlvbjogcG9zaXRpb24sXG5cdFx0XHRcdGdyb3VwOiAnbm9kZXMnLFxuXHRcdFx0XHRzZWxlY3RhYmxlOiB0cnVlLFxuXHRcdFx0XHRsb2NrZWQ6IGZhbHNlLFxuXHRcdFx0XHRncmFiYmFibGU6IHRydWUsXG5cdFx0XHRcdGNsYXNzZXM6IGJhc2UgPyAnYmFzZScgOiAnJ1xuXHRcdFx0fSkucXRpcCh7XG5cdFx0XHRcdGNvbnRlbnQ6ICdcXG5cXHRcXHRcXHQ8ZGl2PlxcblxcdFxcdFxcdFxcdDxhIGNsYXNzPVwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biBibHVlIGxpbmtcIiBzdHlsZT1cIndpZHRoOjE2MHB4XCI+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29ucyByaWdodFwiPnRpbWVsaW5lPC9pPkxpbmsgdG8uLi48L2E+XFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIHJlZCBkZWxldGVcIiBzdHlsZT1cIndpZHRoOjE2MHB4OyBtYXJnaW4tdG9wOiAxMHB4XCIgJyArIChiYXNlID8gJ2Rpc2FibGVkJyA6ICcnKSArICc+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29ucyByaWdodFwiPmRlbGV0ZTwvaT5EZWxldGU8L2E+XFxuXFx0XFx0XFx0XFx0XFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIHJlZCBsaWdodGVuLTIgbWludXNJbnRlcmVzdCBjb2xcIiAnICsgKGJhc2UgPyAnZGlzYWJsZWQnIDogJycpICsgJz48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+cmVtb3ZlX2NpcmNsZTwvaT48L2E+XFxuXFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cImxhYmVsXCI+Um9iYmVycyBJbnRlcmVzdDwvZGl2PlxcblxcdFxcdFxcdFxcdDxhIGNsYXNzPVwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biBncmVlbiBsaWdodGVuLTIgcGx1c0ludGVyZXN0IGNvbFwiICcgKyAoYmFzZSA/ICdkaXNhYmxlZCcgOiAnJykgKyAnPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIj5hZGRfY2lyY2xlPC9pPjwvYT5cXG5cXG5cXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gcmVkIGxpZ2h0ZW4tMiBtaW51c0Nvc3QgY29sXCIgJyArIChiYXNlID8gJ2Rpc2FibGVkJyA6ICcnKSArICc+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPnJlbW92ZV9jaXJjbGU8L2k+PC9hPlxcblxcdFxcdFxcdFxcdDxkaXYgY2xhc3M9XCJsYWJlbFwiPkd1YXJkaWFucyBDb3N0PC9kaXY+XFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGdyZWVuIGxpZ2h0ZW4tMiBwbHVzQ29zdCBjb2xcIiAnICsgKGJhc2UgPyAnZGlzYWJsZWQnIDogJycpICsgJz48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+YWRkX2NpcmNsZTwvaT48L2E+XFxuXFxuXFx0XFx0XFx0XFx0PGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIHJlZCBsaWdodGVuLTIgbWludXNSZXdhcmQgY29sXCIgJyArIChiYXNlID8gJ2Rpc2FibGVkJyA6ICcnKSArICc+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPnJlbW92ZV9jaXJjbGU8L2k+PC9hPlxcblxcdFxcdFxcdFxcdDxkaXYgY2xhc3M9XCJsYWJlbFwiPkd1YXJkaWFucyBSZXdhcmQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gZ3JlZW4gbGlnaHRlbi0yIHBsdXNSZXdhcmQgY29sXCIgJyArIChiYXNlID8gJ2Rpc2FibGVkJyA6ICcnKSArICc+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPmFkZF9jaXJjbGU8L2k+PC9hPlxcblxcblxcdFxcdFxcdFxcdDxhIGNsYXNzPVwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biBncmVlbiBkaXNtaXNzXCIgc3R5bGU9XCJ3aWR0aDoxNjBweDsgbWFyZ2luLXRvcDogMTBweFwiPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnMgcmlnaHRcIj5jYW5jZWw8L2k+RGlzbWlzczwvYT5cXG5cXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHQnLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdG15OiAndG9wIGNlbnRlcicsXG5cdFx0XHRcdFx0YXQ6ICdib3R0b20gY2VudGVyJ1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdGNsYXNzZXM6ICdxdGlwLWJvb3RzdHJhcCcsXG5cdFx0XHRcdFx0d2lkdGg6IDE5NVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5zZXR0aW5ncy5yb2JiZXJzLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAocm9iYmVyKSB7XG5cdFx0XHRcdHJldHVybiBuZXdOb2RlLmRhdGEoJ3JvYmJlclNldHRpbmdzJykuc2V0KHJvYmJlciwge1xuXHRcdFx0XHRcdGNvc3Q6IDIsXG5cdFx0XHRcdFx0cmV3YXJkOiAxXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdENvbmNhdGVuYXRlIHNldHRpbmdzIGludG8gYSBKU09OIG9iamVjdC5cbiAgKi9cblxuXHR9LCB7XG5cdFx0a2V5OiAnZ2V0U2V0dGluZ3MnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBnZXRTZXR0aW5ncygpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHZlcnRpY2VzOiBPYmplY3Qua2V5cyhjeS5ub2RlcygpKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRcdHJldHVybiAhaXNOYU4oa2V5KTtcblx0XHRcdFx0fSkubWFwKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0aWQ6IHBhcnNlSW50KGN5Lm5vZGVzKClba2V5XS5pZCgpKSxcblx0XHRcdFx0XHRcdHJvYmJlcnNJbnRlcmVzdDogY3kubm9kZXMoKVtrZXldLmRhdGEoJ3JvYmJlcnNJbnRlcmVzdCcpLFxuXHRcdFx0XHRcdFx0Z3VhcmRpYW5zQ29zdDogY3kubm9kZXMoKVtrZXldLmRhdGEoJ2d1YXJkaWFuc0Nvc3QnKSxcblx0XHRcdFx0XHRcdGd1YXJkaWFuc1Jld2FyZDogY3kubm9kZXMoKVtrZXldLmRhdGEoJ2d1YXJkaWFuc1Jld2FyZCcpLFxuXHRcdFx0XHRcdFx0cm9iYmVyU2V0dGluZ3M6IEFycmF5LmZyb20oY3kubm9kZXMoKVtrZXldLmRhdGEoJ3JvYmJlclNldHRpbmdzJykpLnJlZHVjZShmdW5jdGlvbiAob2JqLCBfcmVmKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBfcmVmMiA9IF9zbGljZWRUb0FycmF5KF9yZWYsIDIpLFxuXHRcdFx0XHRcdFx0XHQgICAga2V5ID0gX3JlZjJbMF0sXG5cdFx0XHRcdFx0XHRcdCAgICB2YWx1ZSA9IF9yZWYyWzFdO1xuXG5cdFx0XHRcdFx0XHRcdG9ialtrZXldID0gdmFsdWU7cmV0dXJuIG9iajtcblx0XHRcdFx0XHRcdH0sIHt9KVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0pLFxuXHRcdFx0XHRlZGdlczogT2JqZWN0LmtleXMoY3kuZWRnZXMoKSkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0XHRyZXR1cm4gIWlzTmFOKGtleSk7XG5cdFx0XHRcdH0pLm1hcChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHNvdXJjZTogcGFyc2VJbnQoY3kuZWRnZXMoKVtrZXldLnNvdXJjZSgpLmlkKCkpLFxuXHRcdFx0XHRcdFx0dGFyZ2V0OiBwYXJzZUludChjeS5lZGdlcygpW2tleV0udGFyZ2V0KCkuaWQoKSlcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9KVxuXHRcdFx0fTtcblx0XHR9XG5cdH1dKTtcblxuXHRyZXR1cm4gR3JhcGg7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IEdyYXBoOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9zbGljZWRUb0FycmF5ID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkgeyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9IHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgcmV0dXJuIGFycjsgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHsgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTsgfSBlbHNlIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7IH0gfTsgfSgpO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFJvYmJlcnMgPSBmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIFJvYmJlcnMoc2V0dGluZ3MpIHtcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIFJvYmJlcnMpO1xuXG5cdFx0Ly8gRmllbGRzXG5cblx0XHR0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG5cblx0XHR0aGlzLm51bWJlck9mUm9iYmVyc0NyZWF0ZWQgPSAwO1xuXG5cdFx0dGhpcy5saXN0ID0gbmV3IFNldCgpO1xuXG5cdFx0dGhpcy5jYXRjaFByb2JhYmlsaXR5ID0gbmV3IE1hcCgpO1xuXG5cdFx0Ly8gRE9NIGxpc3RlbmVyc1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJyNyb2JiZXJzIC5kZWxldGUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuXHRcdFx0X3RoaXMucmVtb3ZlUm9iYmVyKCQoZXZlbnQuY3VycmVudFRhcmdldCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkuZGF0YSgncm9iYmVyaWQnKSk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnI3JvYmJlcnMgLmNvbmZpZ3VyZScsIGZ1bmN0aW9uIChldmVudCkge1xuXG5cdFx0XHRfdGhpcy5jb25maWd1cmVSb2JiZXIoJChldmVudC5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5kYXRhKCdyb2JiZXJpZCcpKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnI3JvYmJlcnMgaW5wdXQuZGlzY3JldGlvbicsIGZ1bmN0aW9uIChldmVudCkge1xuXG5cdFx0XHR2YXIgbmV3VmFsdWUgPSAxIC0gcGFyc2VGbG9hdCgkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnZhbCgpKTtcblxuXHRcdFx0aWYgKG5ld1ZhbHVlIDwgMCB8fCBuZXdWYWx1ZSA+IDEpIHtcblx0XHRcdFx0cmV0dXJuICQoZXZlbnQuY3VycmVudFRhcmdldCkuY3NzKHtcblx0XHRcdFx0XHRjb2xvcjogJ3JlZCdcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdCQoZXZlbnQuY3VycmVudFRhcmdldCkuY3NzKHtcblx0XHRcdFx0Y29sb3I6IFwiI2ZmZlwiXG5cdFx0XHR9KTtcblxuXHRcdFx0X3RoaXMuY2F0Y2hQcm9iYWJpbGl0eS5zZXQoJChldmVudC5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5kYXRhKCdyb2JiZXJpZCcpLCBuZXdWYWx1ZSk7XG5cdFx0fSk7XG5cblx0XHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJyNtb2RhbC1yb2JiZXItY29uZmlnIGlucHV0JywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cblx0XHRcdHZhciByb3cgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnBhcmVudCgpLnBhcmVudCgpO1xuXG5cdFx0XHR2YXIgbm9kZUlkID0gcm93LmRhdGEoJ25vZGVpZCcpO1xuXHRcdFx0dmFyIHJvYmJlcklkID0gcm93LmRhdGEoJ3JvYmJlcmlkJyk7XG5cblx0XHRcdHZhciBzZXR0aW5nID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5kYXRhKCdzZXR0aW5nJyk7XG5cdFx0XHR2YXIgbmV3VmFsdWUgPSBwYXJzZUZsb2F0KCQoZXZlbnQuY3VycmVudFRhcmdldCkudmFsKCkpO1xuXG5cdFx0XHRjb25zb2xlLmluZm8oc2V0dGluZyArICcgY2hhbmdlZCBmb3IgdGFyZ2V0ICcgKyBub2RlSWQgKyAnLCBuZXcgdmFsdWUgaXMgJyArIG5ld1ZhbHVlICsgJy4nKTtcblxuXHRcdFx0X3RoaXMuc2V0dGluZ3MucGF0aC5jeS5ub2RlcygnW2lkID0gXCInICsgbm9kZUlkICsgJ1wiXScpLmRhdGEoJ3JvYmJlclNldHRpbmdzJykuZ2V0KHJvYmJlcklkKVtzZXR0aW5nXSA9IG5ld1ZhbHVlO1xuXHRcdH0pO1xuXHR9XG5cblx0LypcbiAqXHRBZGQgYSByb2JiZXIgdG8gdGhlIHNldHRpbmdzLlxuICpcdEhpcyBjYXJkIGNhbiBiZSBzZWVuIGluIHRoZSBcIlJvYmJlcnNcIiB0YWIuXG4gKlx0SGlzIHNldHRpbmdzIGFyZSBzZXQgdG8gZGVmYXVsdCBpbiBldmVyeSB0YXJnZXQuXG4gKi9cblxuXG5cdF9jcmVhdGVDbGFzcyhSb2JiZXJzLCBbe1xuXHRcdGtleTogJ25ld1JvYmJlcicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIG5ld1JvYmJlcigpIHtcblxuXHRcdFx0dmFyIHJvYmJlcklkID0gdGhpcy5udW1iZXJPZlJvYmJlcnNDcmVhdGVkKys7XG5cblx0XHRcdHRoaXMubGlzdC5hZGQocm9iYmVySWQpO1xuXG5cdFx0XHR0aGlzLmNhdGNoUHJvYmFiaWxpdHkuc2V0KHJvYmJlcklkLCAwLjUpO1xuXG5cdFx0XHR0aGlzLnNldHRpbmdzLnBhdGguY3kubm9kZXMoKS5lYWNoKGZ1bmN0aW9uIChub2RlKSB7XG5cdFx0XHRcdHJldHVybiBub2RlLmRhdGEoJ3JvYmJlclNldHRpbmdzJykuc2V0KHJvYmJlcklkLCB7XG5cdFx0XHRcdFx0Y29zdDogMixcblx0XHRcdFx0XHRyZXdhcmQ6IDFcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI3JvYmJlcnMnKS5hcHBlbmQoJ1xcblxcdFxcdFxcdDxkaXYgY2xhc3M9XCJjb2wgczRcIiBkYXRhLXJvYmJlcmlkPVwiJyArIHJvYmJlcklkICsgJ1wiPlxcblxcdFxcdFxcdCAgICA8ZGl2IGNsYXNzPVwiY2FyZCBibHVlLWdyZXkgZGFya2VuLTFcIj5cXG5cXHRcXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiY2FyZC1jb250ZW50IHdoaXRlLXRleHRcIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8c3BhbiBjbGFzcz1cImNhcmQtdGl0bGVcIj5Sb2JiZXIgJyArIHJvYmJlcklkICsgJzwvc3Bhbj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8IS0tPHA+U29tZSBiYWQgZ3V5LjwvcD4tLT5cXG5cXHRcXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiY2FyZC1hY3Rpb25cIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVwiZGlzY3JldGlvbkNvbnRhaW5lclwiPlxcblxcdFxcdFxcdFxcdFxcdFxcdFxcdDxzcGFuPkRpc2NyZXRpb248L3NwYW4+XFxuXFx0XFx0XFx0XFx0XFx0XFx0XFx0PGlucHV0IHR5cGU9XCJudW1iZXJcIiBzdGVwPVwiMC4wNVwiIGNsYXNzPVwiZGlzY3JldGlvblwiIG1pbj1cIjBcIiBtYXg9XCIxXCIgdmFsdWU9XCIwLjVcIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gYmx1ZSBjb25maWd1cmVcIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBtYXJnaW4tdG9wOiAxMHB4O1wiPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnMgcmlnaHRcIj5tb2RlX2VkaXQ8L2k+UmV3YXJkczwvYT5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gcmVkIGRlbGV0ZVwiIHN0eWxlPVwid2lkdGg6IDEwMCU7IG1hcmdpbi10b3A6IDEwcHhcIj48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zIHJpZ2h0XCI+ZGVsZXRlPC9pPkRlbGV0ZTwvYT5cXG5cXHRcXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHQnKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0LypcbiAgKlx0UmVtb3ZlIGEgcm9iYmVyIGZyb20gdGhlIHNldHRpbmdzLlxuICAqXHRIaXMgY2FyZCBnZXRzIHJlbW92ZWQgYW5kIHJlZmVyZW5jZXMgdG8gaGlzIHNldHRpbmdzIGFyZVxuICAqXHRyZW1vdmVkIGZyb20gZWFjaCB0YXJnZXQuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ3JlbW92ZVJvYmJlcicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHJlbW92ZVJvYmJlcihyb2JiZXJJZCkge1xuXG5cdFx0XHRjb25zb2xlLmluZm8oJ1JlbW92aW5nIHJvYmJlciAnICsgcm9iYmVySWQgKyAnLi4uJyk7XG5cblx0XHRcdHRoaXMubGlzdC5kZWxldGUocm9iYmVySWQpO1xuXG5cdFx0XHR0aGlzLnNldHRpbmdzLnBhdGguY3kubm9kZXMoKS5lYWNoKGZ1bmN0aW9uIChub2RlKSB7XG5cdFx0XHRcdHJldHVybiBub2RlLmRhdGEoJ3JvYmJlclNldHRpbmdzJykuZGVsZXRlKHJvYmJlcklkKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjcm9iYmVycycpLmZpbmQoJ1tkYXRhLXJvYmJlcmlkPScgKyByb2JiZXJJZCArICddJykucmVtb3ZlKCk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG4gICpcdERpc3BsYXkgYSBtb2RhbCBlbmFibGluZyB0aGUgdXNlciB0byBzZXQgdGhlXG4gICpcdHJvYmJlciBwcm9wZXJ0aWVzIGZvciBldmVyeSB0YXJnZXQuXG4gICovXG5cblx0fSwge1xuXHRcdGtleTogJ2NvbmZpZ3VyZVJvYmJlcicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGNvbmZpZ3VyZVJvYmJlcihyb2JiZXJJZCkge1xuXG5cdFx0XHRjb25zb2xlLmluZm8oJ0NvbmZpZ3VyaW5nIHJvYmJlciAnICsgcm9iYmVySWQgKyAnLicpO1xuXG5cdFx0XHR2YXIgdGFibGUgPSAnXFxuXFx0XFx0XFx0PHRhYmxlIGNsYXNzPVwic3RyaXBlZCBjZW50ZXJlZFwiPlxcblxcdFxcdFxcdFxcdDx0aGVhZD5cXG5cXHRcXHRcXHRcXHRcXHQ8dHI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPlRhcmdldCBJRDwvdGg+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PHRoPkNvc3Q8L3RoPlxcblxcdFxcdFxcdFxcdFxcdFxcdDx0aD5SZXdhcmQ8L3RoPlxcblxcdFxcdFxcdFxcdFxcdDwvdHI+XFxuXFx0XFx0XFx0XFx0PC90aGVhZD5cXG5cXG5cXHRcXHRcXHRcXHQ8dGJvZHk+JztcblxuXHRcdFx0dGhpcy5zZXR0aW5ncy5wYXRoLmN5Lm5vZGVzKCdbaWQgIT0gXCIwXCJdJykuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuXG5cdFx0XHRcdHZhciBzZXR0aW5ncyA9IG5vZGUuZGF0YSgncm9iYmVyU2V0dGluZ3MnKS5nZXQocm9iYmVySWQpO1xuXG5cdFx0XHRcdHRhYmxlICs9ICdcXG5cXHRcXHRcXHRcXHQ8dHIgZGF0YS1ub2RlaWQ9XCInICsgbm9kZS5pZCgpICsgJ1wiIGRhdGEtcm9iYmVyaWQ9XCInICsgcm9iYmVySWQgKyAnXCI+XFxuXFx0XFx0XFx0XFx0XFx0PHRkPicgKyBub2RlLmlkKCkgKyAnPC90ZD5cXG5cXHRcXHRcXHRcXHRcXHQ8dGQ+PGlucHV0IGRhdGEtc2V0dGluZz1cImNvc3RcIiB0eXBlPVwibnVtYmVyXCIgdmFsdWU9XCInICsgc2V0dGluZ3MuY29zdCArICdcIiBtaW49XCIwXCI+PC90ZD5cXG5cXHRcXHRcXHRcXHRcXHQ8dGQ+PGlucHV0IGRhdGEtc2V0dGluZz1cInJld2FyZFwiIHR5cGU9XCJudW1iZXJcIiB2YWx1ZT1cIicgKyBzZXR0aW5ncy5yZXdhcmQgKyAnXCIgbWluPVwiMFwiPjwvdGQ+XFxuXFx0XFx0XFx0XFx0PC90cj4nO1xuXHRcdFx0fSk7XG5cblx0XHRcdHRhYmxlICs9ICdcXG5cXHRcXHRcXHRcXHQ8L3Rib2R5PlxcblxcdFxcdFxcdDwvdGFibGU+JztcblxuXHRcdFx0JCgnI21vZGFsLXJvYmJlci1jb25maWcgaDQnKS50ZXh0KCdSb2JiZXIgJyArIHJvYmJlcklkICsgJyBjb25maWd1cmF0aW9uJyk7XG5cblx0XHRcdCQoJyNtb2RhbC1yb2JiZXItY29uZmlnIHAnKS5odG1sKHRhYmxlKTtcblxuXHRcdFx0JCgnI21vZGFsLXJvYmJlci1jb25maWcnKS5tb2RhbCgnb3BlbicpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuICAqXHRSZXR1cm4gdGhlIGxpc3Qgb2YgZXZlcnkgcm9iYmVyLlxuICAqL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdnZXRTZXR0aW5ncycsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGdldFNldHRpbmdzKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0bGlzdDogW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLmxpc3QpKSxcblx0XHRcdFx0Y2F0Y2hQcm9iYWJpbGl0eTogQXJyYXkuZnJvbSh0aGlzLmNhdGNoUHJvYmFiaWxpdHkpLnJlZHVjZShmdW5jdGlvbiAob2JqLCBfcmVmKSB7XG5cdFx0XHRcdFx0dmFyIF9yZWYyID0gX3NsaWNlZFRvQXJyYXkoX3JlZiwgMiksXG5cdFx0XHRcdFx0ICAgIGtleSA9IF9yZWYyWzBdLFxuXHRcdFx0XHRcdCAgICB2YWx1ZSA9IF9yZWYyWzFdO1xuXG5cdFx0XHRcdFx0b2JqW2tleV0gPSB2YWx1ZTtyZXR1cm4gb2JqO1xuXHRcdFx0XHR9LCB7fSlcblx0XHRcdH07XG5cdFx0fVxuXHR9XSk7XG5cblx0cmV0dXJuIFJvYmJlcnM7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFJvYmJlcnM7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX0ludGVyZmFjZSA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9JbnRlcmZhY2UnKTtcblxudmFyIF9JbnRlcmZhY2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfSW50ZXJmYWNlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuLypcbipcdEN5dG9zY2FwZSAodGhlIGdyYXBoIGxpYnJhcnkgd2UgYXJlIHVzaW5nKSBkb2Vzbid0IHdvcmsgc29cbipcdHdlbGwgd2hlbiB0aGUgcmVuZGVyaW5nIGNhbnZhcyBpcyBoaWRkZW4gd2hpbGUgdGhlIGdyYXBoXG4qXHRpcyBpbml0aWFsaXplZC4gV2UgaGF2ZSB0byB3YWl0IGZvciB0aGUgY2FudmFzIHRvIGJlIGRpc3BsYXllZFxuKlx0YmVmb3JlIGluaXRpYWxpemluZyBpdCBhbmQgdG8gb25seSBkbyBzbyBvbmNlLlxuKlxuKlx0VGh1cywgd2UgdXNlIHRoZSBnbG9iYWwgZmxhZyBncmFwaEluaXRpYWxpemVkLlxuKi9cblxudmFyIGdyYXBoSW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuLypcbipcdEZ1bmN0aW9uIGNhbGxlZCB3aGVuZXZlciB0aGUgaGFzaCBpcyB1cGRhdGVkIHRvIGRvIHRoZSBjb3JyZWN0XG4qXHRhY3Rpb24uXG4qL1xuXG52YXIgdXBkYXRlSGFzaCA9IGZ1bmN0aW9uIHVwZGF0ZUhhc2goaGFzaCkge1xuXG5cdC8vIFdlIHJlbW92ZSB0aGUgJyMnIGNoYXJhY3RlciBmcm9tIHRoZSBoYXNoLiBKdXN0IGluIGNhc2UuXG5cdGhhc2ggPSBoYXNoLnJlcGxhY2UoL14jLywgJycpO1xuXG5cdC8qXG4gKlx0UHJldmVudHMgIyBsaW5rcyBmcm9tIGdvaW5nIHRvIHRoZSBlbGVtZW50LlxuICovXG5cdHZhciBub2RlID0gJCgnIycgKyBoYXNoKTtcblx0bm9kZS5hdHRyKCdpZCcsICcnKTtcblx0ZG9jdW1lbnQubG9jYXRpb24uaGFzaCA9IGhhc2g7XG5cdG5vZGUuYXR0cignaWQnLCBoYXNoKTtcblxuXHQvKlxuICpcdFdlIGhhdmUgdG8gc29ydCB0aGUgZ3JhcGggd2hlbiBpdCdzIGRpc3BsYXllZFxuICpcdGZvciB0aGUgZmlyc3QgdGltZS5cbiAqL1xuXHRpZiAoIWdyYXBoSW5pdGlhbGl6ZWQgJiYgaGFzaCA9PT0gJ3NpbXVsYXRlJykge1xuXHRcdHdpbmRvdy5ncmFwaC5zb3J0KCk7XG5cdFx0Z3JhcGhJbml0aWFsaXplZCA9IHRydWU7XG5cdH1cblxuXHRpZiAod2luZG93LmN5ICE9PSB1bmRlZmluZWQpIHdpbmRvdy5jeS5yZXNpemUoKTtcblxuXHQvKlxuICpcdEZpeCBhIGJ1ZyB3aXRoIHBhcmFsbGF4IGltYWdlcy5cbiAqL1xuXG5cdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdCQod2luZG93KS5zY3JvbGwoKTtcblx0fSwgMjUpO1xufTtcblxuLypcbipcdFNldHVwIG5vbi1zcGVjaWZpYyBET00gbGlzdGVuZXJzIGFuZCBpbml0aWFsaXplIG1vZHVsZXMuXG4qL1xudmFyIHNldHVwRE9NID0gZnVuY3Rpb24gc2V0dXBET00oKSB7XG5cblx0JCgnW2RhdGEtZGVzdF0nKS5jbGljayhmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9ICQoZXZlbnQuZXZlbnRUYXJnZXQpLmRhdGEoJ2Rlc3QnKTtcblx0XHQkKCduYXYgdWwudGFicycpLnRhYnMoJ3NlbGVjdF90YWInLCAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2Rlc3QnKSk7XG5cdFx0dXBkYXRlSGFzaCgkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2Rlc3QnKSk7XG5cdH0pO1xuXG5cdCQoJ25hdiB1bC50YWJzJykub24oJ2NsaWNrJywgJ2EnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHR1cGRhdGVIYXNoKCQoZXZlbnQuY3VycmVudFRhcmdldCkuYXR0cignaHJlZicpKTtcblx0fSk7XG5cblx0JCh3aW5kb3cpLm9uKCdoYXNoY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuXHRcdCQoJ25hdiB1bC50YWJzJykudGFicygnc2VsZWN0X3RhYicsIHdpbmRvdy5sb2NhdGlvbi5oYXNoLnNsaWNlKDEpKTtcblx0XHR1cGRhdGVIYXNoKHdpbmRvdy5sb2NhdGlvbi5oYXNoKTtcblx0fSk7XG5cblx0JCgnLnBhcmFsbGF4JykucGFyYWxsYXgoKTtcblxuXHQkKCcubW9kYWwjbW9kYWwtcm9iYmVyLWNvbmZpZycpLm1vZGFsKCk7XG5cblx0Q29uc29sZUxvZ0hUTUwuY29ubmVjdCgkKCcjY29uc29sZScpKTtcbn07XG5cbi8qXG4qXHRXaGVuZXZlciB0aGUgRE9NIGNvbnRlbnQgaXMgcmVhYWR5IHRvIGJlIG1hbmlwdWxhdGVkLFxuKlx0c2V0dXBlIHRoZSBzcGVjaWZpYyBET00gYW5kIGNyZWF0ZSBhbiBJbnRlcmZhY2Ugd2l0aCB0aGUgc2VydmVyLlxuKlx0VGhlbiwgd2UgbGluayB0aGUgVUkgZWxlbWVudHMgdG8gdGhlIHNldHRpbmdzIHRoZXkgbWFuaXB1bGF0ZS5cbiovXG4kKGZ1bmN0aW9uICgpIHtcblx0c2V0dXBET00oKTtcblxuXHR2YXIgaWZhY2UgPSBuZXcgX0ludGVyZmFjZTIuZGVmYXVsdCgpO1xuXHQkKCcjc29ydE5vZGVzJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0cmV0dXJuIGlmYWNlLnNldHRpbmdzLnBhdGguc29ydCgpO1xuXHR9KTtcblx0JCgnI25ld1JvYmJlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdHJldHVybiBpZmFjZS5zZXR0aW5ncy5yb2JiZXJzLm5ld1JvYmJlcigpO1xuXHR9KTtcblx0JCgnI2xhdW5jaEJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdHJldHVybiBpZmFjZS5zdGFydFNpbXVsYXRpb24oKTtcblx0fSk7XG5cdCQoJy5tb2RhbCNtb2RhbC1yZXN1bHRzJykubW9kYWwoeyBjb21wbGV0ZTogZnVuY3Rpb24gY29tcGxldGUoKSB7XG5cdFx0XHRyZXR1cm4gaWZhY2Uuc3RvcFNpbXVsYXRpb24oKTtcblx0XHR9IH0pO1xufSk7Il19
