const fs = require('fs');
const { config, getBotListArgs } = require('./_utils');
const stringArgv = require('string-argv').default

const WhatsApp = require('ez-whatsapp').default
const { Browsers, delay, isJidUser, isJidGroup, isJidStatusBroadcast } = require('@whiskeysockets/baileys');

const { ConsoleConnector } = require('@nlpjs/console-connector')
const connector = new ConsoleConnector()

let bots = getBotListArgs(config)

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const messages = {
    // jidbot : {
    //  jid: [msgid]
    // }
} 
const timeOut = {}

const wa_session = {}

async function run() {
    for (const nameBot of bots) {
        const nameLog = `[${nameBot.padEnd(10, ' ')}]`
        const browser = Browsers.appropriate('Chrome')
        browser[0] = `Nasdem bot_keepon[${nameBot}]`
        const wa = new WhatsApp(nameBot, {
            browser,
            pathSession: config.pathsession ? `.${config.pathsession}` : '.session-keepon',
            showQRinTerminal: config.paired ? false : true,
        })

        wa_session[nameBot] = wa

        wa.on('sock.connecting', () => console.log(nameLog, 'WA is connecting...'))

        wa.on('sock.disconnected', async () => {
            console.log(nameLog, 'WA is disconnected!')
            await wa.startSock()
        })

        wa.on('msg.incoming', async ({ message }) => {
            if (
                message.key.id === undefined &&
                message.key.remoteJid === undefined &&
                !isJidUser(message.key.remoteJid) &&
                !isJidStatusBroadcast(message.key.remoteJid)
            ) return

            console.log(nameLog, 'Message', JSON.stringify(message, undefined, 3));

            if (messages[wa.sock.user.id][message.key.remoteJid] === undefined) {
                messages[wa.sock.user.id][message.key.remoteJid] = []
            }

            messages[wa.sock.user.id][message.key.remoteJid].push(message.key)

            if(timeOut[wa.sock.user.id] === undefined) {
                const delayRead = random(3, 6) * 1_000
                timeOut[wa.sock.user.id] = setTimeout(async () => {
                    await wa.sock.readMessages(
                        messages[wa.sock.user.id][message.key.remoteJid]
                    )
                    console.log(nameLog, 'OK, Read', messages[wa.sock.user.id][message.key.remoteJid].length ,'messages');
                    delete messages[wa.sock.user.id][message.key.remoteJid]
                    timeOut[wa.sock.user.id] = undefined
                }, delayRead)
                console.log(nameLog, 'New Conversation from:', message.pushName || 'unknown','will read on ', message.key.remoteJid, delayRead / 1000,'s');
            }

            let path = `./images/msg`
            if (message.key.remoteJid.split('@')[0] === 'status') {
                console.log(nameBot, 'Satus From', message.key, message);
                path = `./images/status`
            }
            // save message with media
            if(
                message.message?.productMessage?.productImage ||
                message.message?.imageMessage
            ) {
                if(!fs.existsSync(path)) fs.mkdirSync(path)
                await wa.downloadFileMessage(message, path)
            }
            
            const textMsg = message.message?.conversation || message.message?.extendedTextMessage?.text || ''
            console.log(nameLog, 'New Msg from ', message.key.remoteJid.split('@')[0], message.pushName || 'unknown', ':=>', textMsg);
            const isReply = isJidUser(message.key.remoteJid) || message.key.remoteJid == '120363024101903992@g.us'
            if(isReply && textMsg.startsWith('!')) {
                await delay(2_000)
                await wa.sock.readMessages([message.key])
                await delay(1_000)
                await wa.sendMessageWithTyping(
                    message.key.remoteJid,
                    {
                        text: "OK, I'm Online"
                    },
                    undefined,
                    4_000
                ).catch((err) => {
                    console.log(nameLog, 'send error', err);
                })
            }
        })

        wa.on('sock.connected', () => {
            console.log(nameLog, 'WA is connected!')
            messages[wa.sock.user.id] = {}
        })

        
        console.log(nameBot, 'starting...');
        await wa.startSock()
        if (config.paired) {
            await new Promise((r) => {
                const time = setInterval(async () => {
                    if (wa.info.status == 'scan QR') {
                        await wa.stopSock()
                        r()
                        clearInterval(time)
                    }
                }, 500)
                
                wa.on('sock.connected', async () => {
                    clearInterval(time)
                    r()
                })
            })
        } else {
            await wa.waitSockConnected()
        }
    }

    console.table(
        Object.entries(wa_session).map(([nameBot, wa]) => {
            return {
                bot: nameBot,
                nomor: wa.info.phoneNumber,
                status: wa.info.status
            }
        })
    );
}

try {
    run()

    async function sendMsg(numbers, message) {
        let [nameBot, number] = numbers.split('=>')
        const wa = wa_session[nameBot]
        if (wa === undefined && nameBot !== 'all') return console.error('Bot not found', nameBot)
        if (message === undefined || message === '') return console.error('Message text not empty')
        if (number === undefined || number === '') return console.error('Target not empty, enter nameBot or phone number')

        if (Number.isNaN(parseInt(number))) {
            if(wa_session[number]) number = wa_session[number].info.phoneNumber
            else return console.error('Name Bot target not found', number)
        }

        console.log(nameBot, 'send msg to', number);

        let _bots = []
        if (nameBot === 'all') {
            _bots = Object.keys(wa_session).filter(name => wa_session[name].info.phoneNumber !== number)
        } else {
            _bots.push(nameBot)
        }
        for (const nmB of _bots) {
            const wa = wa_session[nmB]
            await wa.sendMessageWithTyping(number, {
                text: message
            }).then((res) => {
                console.log(nmB, 'send id', res.key.id);  
            }).catch((err) => {
                console.error(nmB, 'send error', err);
            })
        }
    }

    async function showAllBot() {
        console.log('The Bots', bots);
    }

    connector.onHear = async (parent, line) => {
        line = line.trim()
        if (line.toLowerCase() === 'quit') {
            connector.exit();
            return
        }

        const commands = stringArgv(line)
        const cmd = commands.shift()?.trim()
        if (cmd == undefined) return
        const args = {}
        for (const arg of commands) {
            if (arg.startsWith('--')) {
                const [key, value] = arg.split('=')
                args[key.slice(2)] = value ? value.replace(/^"(.*)"$/, '$1') : true
            }
        }

        switch (cmd) {
            case 'sendmsg': 
                sendMsg(commands[0], args.message)
                break;

            case 'showallbot':
                showAllBot()
                break;

            case 'clear':
                console.clear()
                break;
        
            default: connector.say(`Command '${cmd}' not found`); break;
        }
    };
} catch (error) {
    console.error(error);
}
