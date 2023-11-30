const { readdirSync } = require("fs")

const args = process.argv.slice(2)
const config = {}
for (const arg of args) {
    if (arg.startsWith('--')) {
        const [key, value] = arg.split('=')
        config[key.slice(2)] = value || true
    }
}



function getBotListArgs(config) {
    let bots = []
    if (config.all) {
        const botSessions = readdirSync(`.${config.pathsession}/auth-state`)
        bots = botSessions
        
        if (config.except) {
            const except = config.except.split(',')
            bots = bots.filter(b => !except.includes(b))
        }
    } else {
        if (config.id === undefined) {
            console.error('id not defined')
            process.exit(0)
        }
        bots = config.id.split(',')
    }
    console.log('The Bots', bots);

    return bots
}

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

module.exports = {
    config,
    random,
    getBotListArgs
}