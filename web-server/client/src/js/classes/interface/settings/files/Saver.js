export default class Saver {
	constructor(settings){
		this.settings = settings
	}

	save(){

		const date = new Date()

		this.download(
			`${date.toLocaleDateString()}-${date.toLocaleTimeString().replace(':', '-')}.json`,
			JSON.stringify(this.settings.getSettings()))
	}

	download(filename, text) {
		const link = document.createElement('a')
		link.setAttribute('href', `data:text/json;charset=utf-8,${encodeURIComponent(text)}`)
		link.setAttribute('download', filename)

		link.style.display = 'none'
		document.body.appendChild(link)

		link.click()

		document.body.removeChild(link)
	}
}