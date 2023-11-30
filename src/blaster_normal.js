const { config } = require('./_utils');
const WhatsApp = require('ez-whatsapp').default
const { Browsers, delay } = require('@whiskeysockets/baileys');

if(config.id === undefined) return console.error('id not defined');
console.log('Device ID: ' + config.id);
const id = config.id

const nameBot = 'bot' + id

const numbers = `
6281231223047
6281231223049
6281231223051
6281231223061
6281231223062
6281231223064
6281231226743
6281231226744
6281231226745
6281231226746
6281231226748
6281231226751
6281231226752
6281231226765
6281231227041
6281231227564
6281310812347
6281310812359
6281310812361
6281310812362
6281310813916
6281310813917
6281310813926
6281310813927
6285900046245
6287777762845
`.split('\n').map(n => n.trim()).filter(n => n)

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const browser = Browsers.appropriate('Chrome')
browser[0] = `Nasdem test bot[${id}]`
const wa = new WhatsApp(nameBot, {
    browser
})

wa.on('sock.connecting', () => {
    console.log(nameBot, 'connecting...')
})

wa.on('sock.disconnected', () => {
    console.log(nameBot, 'disconnected!')
})


wa.on('sock.connected', async () => {
    console.log(nameBot, 'connected! start sending to', numbers.length, 'numbers')
    let i = 1
    for (const number of numbers) {
        console.log(nameBot, i++, number);
        await delay(random(2, 3) * 1_000)

        // kirim pesan dengan 2 detik typing
        const msgCtx = wa.createMessage(2_000)
        msgCtx.text(`!hai\n*Selamat pagi kak*\nmohon maaf mengganggu kami sedang mencoba fitur baru kak!!`)
        await msgCtx.send(number)
    }

    console.log(nameBot, 'done sending');
    await wa.stopSock()
    await delay(1_000)
    process.exit(0)
})

console.log(nameBot, 'start');
wa.startSock()