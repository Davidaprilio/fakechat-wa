const WhatsApp = require('ez-whatsapp').default
const { Browsers } = require('@whiskeysockets/baileys');

const bots = Array.from({ length: 1 }, (_, i) => i + 1);


bots.forEach((id) => {
    const nameBot = 'bot' + id
    
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
        console.log(nameBot, 'connected! start sending')
        const timeTyping = 0 //ms
        for (let i = 1; i <= 50; i++) {
            const logName = `${nameBot} sending ${i}`
            const msg = wa.createMessage(timeTyping)
            // msg.image(
            //     'https://source.unsplash.com/500x500?coder', 
            //     'Pesan ke ' + i
            // )
            msg.text('dari ' + id + ' pesan ke ' + i)
            console.time(logName);
            await msg.send('628884966841').catch((err) => {
                console.error(
                    'Failed to send message from ' + nameBot + ': ',
                    err.message
                );
            })
            console.timeEnd(logName);
        }

        await wa.stopSock()
    })
    
    wa.startSock()
})
