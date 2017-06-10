/**
 * Class enabling you to download the current settings or whatever text you want
 * on the client computer without server-side.
 */
export default class Saver {

	/**
	* @param {Settings} settings - Settings object using this saver. 
	*/
	constructor(settings){
		/**
		 * Settings object using this loader.
		 * @type {Settings}
		 */
		this.settings = settings
	}

	/**
	 * Download the current settings.
	 * 
	 * @return {Saver} chaining
	 */
	save(){

		const date = new Date()

		return this.download(
			`${date.toLocaleDateString()}-${date.toLocaleTimeString().replace(':', '-')}.json`,
			JSON.stringify(this.settings.getSettings()))
	}

	/**
	 * Download a file with given name and content.
	 * /!\ May be asynchronous depending on browsers implementation.
	 * 
	 * @param  {string} filename - The file name.
	 * @param  {string} text - The file content.
	 * @return {Saver} chaining
	 */
	download(filename, text) {
		const link = document.createElement('a')
		link.setAttribute('href', `data:text/json;charset=utf-8,${encodeURIComponent(text)}`)
		link.setAttribute('download', filename)

		link.style.display = 'none'
		document.body.appendChild(link)

		link.click()

		document.body.removeChild(link)

		return this
	}
}