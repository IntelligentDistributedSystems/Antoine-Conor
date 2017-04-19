/*
*	Cytoscape (the graph library we are using) doesn't work so
*	well when the rendering canvas is hidden while the graph
*	is initialized. We have to wait for the canvas to be displayed
*	before initializing it and to only do so once.
*
*	Thus, we use the global flag graphInitialized.
*/


let graphInitialized = false

/*
*	Function called whenever the hash is updated to do the correct
*	action.
*/

const updateHash = hash => {

	// We remove the '#' character from the hash. Just in case.
	hash = hash.replace( /^#/, '' )

	/*
	*	Prevents # links from going to the element.
	*/
	const node = $( `#${hash}` )
	node.attr( 'id', '' )
	document.location.hash = hash
	node.attr( 'id', hash )

	/*
	*	We have to sort the graph when it's displayed
	*	for the first time.
	*/
	if (!graphInitialized && hash === 'simulate'){
		window.graph.sort()
		graphInitialized = true
	}

	if (window.cy !== undefined)
		window.cy.resize()

	/*
	*	Fix a bug with parallax images.
	*/

	setTimeout(() => {
		$(window).scroll()
	}, 25)
}

/*
*	Setup non-specific DOM listeners and initialize modules.
*/
const setupDOM = () => {

	$('[data-dest]').click(event => {
		window.location.hash = $(event.eventTarget).data('dest')
		$('nav ul.tabs').tabs('select_tab', $(event.currentTarget).data('dest'))
		updateHash($(event.currentTarget).data('dest'))
	})

	$('nav ul.tabs').on('click', 'a', event => {
		updateHash($(event.currentTarget).attr('href'))
	})

	$(window).on('hashchange', () => {
		$('nav ul.tabs').tabs('select_tab', window.location.hash.slice(1))
		updateHash(window.location.hash)
	})

	$('.parallax').parallax()

	$('.modal').modal()

	ConsoleLogHTML.connect($('#console'))
}

/*
*	Whenever the DOM content is reaady to be manipulated,
*	setupe the specific DOM and create an Interface with the server.
*	Then, we link the UI elements to the settings they manipulate.
*/
$(() => {
	setupDOM()
	
	const interface = new Interface()
	$('#sortNodes').on('click', event => interface.settings.path.sort())
	$('#newRobber').on('click', event => interface.settings.robbers.newRobber())
	$('#launchButton').on('click', event => interface.startSimulation())
})