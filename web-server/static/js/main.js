let graphInitialized = false

const updateHash = hash => {
	hash = hash.replace( /^#/, '' )

	if (hash.includes('parameters') || hash.includes('modal'))
		hash = 'simulate'

	const node = $( '#' + hash )
	node.attr( 'id', '' )
	document.location.hash = hash
	node.attr( 'id', hash )

	if (!graphInitialized && (hash === 'parameters-0' || hash === 'simulate')){
		window.graph.sort()
		graphInitialized = true
	}

	if (window.cy !== undefined)
		window.cy.resize()

	setTimeout(() => {
		$(window).scroll()
	}, 25)
}

const setupDOM = () => {

	$('[data-dest]').click(function() {
		window.location.hash = $(this).data('dest')
		$('ul.tabs').tabs('select_tab', $(this).data('dest'))
		updateHash($(this).data('dest'))
	})

	$('ul.tabs').on('click', 'a', function(e) {
		updateHash($(this).attr('href'))
	})

	$(window).on('hashchange', function(e){
		$('ul.tabs').tabs('select_tab', window.location.hash.slice(1))
		updateHash(window.location.hash)
	})

	$('.parallax').parallax()

	ConsoleLogHTML.connect($('#console'))
}

$(function(){
	setupDOM()
	
	const interface = new Interface()
	$('#sortNodes').on('click', event => interface.properties.path.sort())
	$('#launchButton').on('click')
})