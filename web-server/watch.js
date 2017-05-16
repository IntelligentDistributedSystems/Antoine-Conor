var chokidar = require('chokidar')
const fs = require('fs'),
	spawn = require('child_process').spawn

const doing = new Set()
const todo = new Set()
const history = new Map()

// Don't compile more than once every 250ms.

const doJob = (script) => {
    doing.add(script)
    history.set(script, new Date())
    todo.delete(script)
    const p = spawn('npm', ['run', `build-${script}`], {
            stdio: 'inherit' // pipe output to the console
        })
    // Print something when the process completes
    p.on('close', code => {
        doing.delete(script)
        if (code === 1) {
            console.error(`✖ "npm run ${script}" failed.`)
        } else {
            console.log('Watching for changes...')
        }
        if (todo.size !== 0){
            console.log(`Doing todo-job ${[...todo][0]}`)
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

            console.log(`Already doing ${script}. Added to todo list.`)
            return todo.add(script)

        }
        
        console.log(`${path} change detected.`)
        // Spawn the process
        doJob(script)
    }
})

console.log('Watching for changes...')