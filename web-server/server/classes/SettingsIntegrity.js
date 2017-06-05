module.exports = {
	settingsCorrupted : function(settings){

		// Fields presence

		if (typeof settings === 'undefined')
			return `No settings submitted.`

		if (typeof settings.general === 'undefined')
			return `No general settings submitted.`

		if (typeof settings.paths === 'undefined')
			return `No paths settings submitted.`

		if (typeof settings.paths.vertices === 'undefined')
			return `No vertices settings submitted.`

		if (typeof settings.paths.edges === 'undefined')
			return `No edges settings submitted.`

		if (typeof settings.robbers === 'undefined')
			return `No robbers settings submitted.`

		if (typeof settings.robbers.list === 'undefined')
			return `No robbers list submitted.`

		if (typeof settings.robbers.catchProbability === 'undefined')
			return `No catch probability settings submitted.`

		// settings integrity

		const robbersList = settings.robbers.list

		if (robbersList.length === 0)
			return `Robbers list should contain at least 1 robber.`

		const verticesSet = new Set()

		if (settings.general.numberOfIterations < 1 || settings.general.numberOfIterations > 100)
			return `Invalid number of iterations.`

		if (! settings.general.distanceWeight > 0)
			return `Invalid distance weight (must be > 0).`

		// Vertcies integrity

		for (let vertice of settings.paths.vertices){
			if (verticesSet.has(vertice.id))
				return `Same id (${vertice.id}) shared by two differents target.`

			verticesSet.add(vertice.id)

			if (! (vertice.robbersInterest >= 0))
				return `Invalid robbers interest for target ${vertice.id}.`

			if (! (vertice.guardiansCost >= 0))
				return `Invalid guardians cost for target ${vertice.id}.`

			if (! (vertice.guardiansReward >= 0))
				return `Invalid guardians reward for target ${vertice.id}.`

			if (typeof vertice.robberSettings === 'undefined')
				return `No robber settings submitted for target ${vertice.id}.`

			if (typeof vertice.position !== 'object')
				return `No position settings submitted for target ${vertice.id}.`

			if (typeof vertice.position.x !== 'number')
				return `Invalid x position submitted for target ${vertice.id}.`

			if (typeof vertice.position.y !== 'number')
				return `Invalid y position submitted for target ${vertice.id}.`

			for (let robber of robbersList){

				if (typeof vertice.robberSettings[robber] === 'undefined')
					return `No settings submitted for rober ${robber} and target ${vertice.id}.`

				if (! (vertice.robberSettings[robber].cost >= 0))
					return `Invalid robber cost for rober ${robber} and target ${vertice.id}.`

				if (! (vertice.robberSettings[robber].reward >= 0))
					return `Invalid robber reward for rober ${robber} and target ${vertice.id}.`
			}
		}

		if (! verticesSet.has(0))
			return `No base vertex submitted.`

		// Edges integrity

		for (let edge of settings.paths.edges){
			if (typeof edge.source === 'undefined')
				return `No source submitted for a given edge.`
			if (typeof edge.target === 'undefined')
				return `No target submitted for a given edge.`
			if (edge.length < 0)
				return `Invalid length submitted for a given edge.`
			if (! (verticesSet.has(edge.source)))
				return `The source ${edge.source} does not exist.`
			if (! (verticesSet.has(edge.target)))
				return `The target ${edge.target} does not exist.`
		}

		if (settings.paths.edges.length === 0)
			return 'The path should have at least 1 edge.'

		// Catch probability integrity

		for (let robber of robbersList){
			if (! (settings.robbers.catchProbability[robber] >= 0 
				&& settings.robbers.catchProbability[robber] <= 1))
				return `Invalid catch probability for robber ${robber}.`
		}

		return false
	}
}