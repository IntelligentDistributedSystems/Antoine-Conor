var chokidar = require('chokidar')
const fs = require('fs'),
	spawn = require('child_process').spawn

const doing = new Set()
const todo = new Set()
const history = new Map()

const notify = (title, message = '', duration = 2000) => {
    const args = [`Autobuild: ${title}`, '-t', `${duration}`]
    if (message !== '')
        args.push(message)
    spawn('notify-send', args)
}

const play = path => {
    spawn('paplay', [path])
}

const info = (title, message = '') => {
    notify(title, message, 4000)
    console.info(title)
    console.info(message)
}

const success = (title, message = '') => {
    notify(title, message, 4000)
    console.info(title)
    console.info(message)
    play('/usr/share/sounds/freedesktop/stereo/complete.oga')
}

const error = (title, message = '') => {
    notify(title, message, 20000)
    console.error(title)
    console.error(message)
    play('/usr/share/sounds/freedesktop/stereo/dialog-error.oga')
}

// Don't compile more than once every 250ms.

const doJob = (script) => {
    doing.add(script)
    history.set(script, new Date())
    todo.delete(script)

    let errorMessage = ''

    const p = spawn('npm', ['run', `build-${script}`])

    p.stderr.on('data', data => {

        const asString = `${data}`
        console.log(asString)
        if (asString.includes('SyntaxError')){
            errorMessage = asString
        }
    })

    // Print something when the process completes
    p.on('close', code => {
        doing.delete(script)
        if (code === 1) {
            error(`✖ ${script} compilation failed`, `${errorMessage}`)
        } else {
            success(`${script} success`)
        }
        if (todo.size !== 0){
            info(`doing todo-job ${[...todo][0]}`)
            doJob([...todo][0])
        }
    })
}

chokidar.watch('./client/src/').on('all', (event, path) => {
    // Use the extension of the file as the npm script name
    const script = path.split('.').pop()
    if (['js', 'scss'].includes(script)) {
        // Don't compile more than once every 250ms.
        if (doing.has(script)){

            if (new Date() - history.get(script) < 250) {
                 return console.log('250ms countdown running.')
            }

            info(`already doing ${script}`, `Added to todo list.`)
            return todo.add(script)

        }

        info(`${path} change detected.`)
        // Spawn the process
        doJob(script)
    }
})

info('Watching for changes...')