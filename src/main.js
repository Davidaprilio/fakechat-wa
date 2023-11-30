
const { config } = require('./_utils');

if (config.id === undefined) return console.error('id not defined');
console.log('Device ID: ' + config.id);

const WhatsApp = require('ez-whatsapp').default
const { Browsers, delay } = require('@whiskeysockets/baileys');

const nameBot = 'bot' + config.id
const browser = Browsers.appropriate('Chrome')
browser[0] = `Nasdem test bot[${config.id}]`
const wa = new WhatsApp(nameBot, {
    browser
})

if(config['phone']) {
    wa.setPairingMode('code', config.phone)
}

wa.on('sock.connecting', () => {
    console.log('WA is connecting...')
})

wa.on('sock.disconnected', async () => {
    console.log('WA is disconnected!')
    await wa.startSock()
})

wa.on('pair-code.update', (code) => {
    console.log('Pairing code: ' + code)
})

wa.on('sock.connected', async () => {
    console.log('WA is connected!')
    // await abilitySendMessage()

    if(config['fetch-group']) {
        const group = (await wa.sock.groupFetchAllParticipating())[config['fetch-group']];
        console.log('Group Info:', group);
    }

    await delay(5000)
    // await wa.stopSock()
    // await wa.sock.logout('Logout by user')
})

wa.on('msg.incoming', ({message}) => {
    console.log(message);
})

wa.startSock()

async function getBufferFromUrl(url) {
    return await fetch(
        'https://www.w3schools.com/html/mov_bbb.mp4'
    ).then(async fimg => Buffer.from(await fimg.arrayBuffer()))
}



async function abilitySendMessage() {
    const msg = wa.createMessage()
    
    const logName = `${nameBot} send time`
    const timeTyping = 0 //ms


    // TEXT
    // msg.text('Ini Pesan Text')

    // IMAGE
    // msg.image(
    //     'https://source.unsplash.com/500x500?coder',
    //     'Ini Caption'
    // )

    // VIDEO
    // console.time('get_image');
    // const imgBfr = await getBufferFromUrl("https://www.w3schools.com/html/mov_bbb.mp4")
    // const imgBfr = fs.readFileSync("./mov_bbb.mp4")
    // console.timeEnd('get_image');
    // msg.video(
    //     imgBfr,
    //     "https://www.w3schools.com/html/mov_bbb.mp4"
    // )
    // As GIF
    // msg.video(
    //     imgBfr,
    //     "https://www.w3schools.com/html/mov_bbb.mp4",
    //     true
    // )

    // CONTACT
    // msg.contact('Display Name')
    //     .add('Person1', '628884966841')
    //     .add('Person2', '628884966842')
    //     .add('Person3', '628884966843')

    // LOCATION
    // const latitude = -6.304115,
    //     longitude = 106.821446
    // msg.location(latitude, longitude)

    // AUDIO
    // msg.audio(
    //     'https://cdn.pixabay.com/download/audio/2023/06/27/audio_4b43bd8b28.mp3'
    // )

    // VOICE NOTE
    msg.voice(
        // 'https://cdn.pixabay.com/download/audio/2023/06/27/audio_4b43bd8b28.mp3'
        './Voice.mp3'
    )

    // DOCUMENT
    // msg.rawPayload({
    //     document: {
    //         url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    //     },
    // })

    // BUTTON ✖
    // const btn = msg.button('Ini Button', 'ini footer')
    // btn.add('Button 1', 'btn_1')
    // btn.add('Button 2', 'btn_2')
    // btn.add('Button 3', 'btn_3')

    // LIST ✖
    // const list = msg.list('Judul', 'Ini isi pesan', 'ini footer')
    // list.addSection('Section 1')
    //     .addOption('Option 1')
    //     .addOption('Option 2')
    //     .addOption('Option 3')
    // list.addSection('Section 2')
    //     .addOption('Option 4')
    //     .addOption('Option 5')

    // BUTTON TEMPLATE (Hanya tampil di wa desktop dan web)
    // const btnTem = msg.template('template', 'Ini Footer')
    // btnTem.urlButton('My Github', 'https://github.com/Davidaprilio')
    // btnTem.callButton('My Phone', '6285231028718')
    // replyButton (hanya tampil di wa wa desktop)
    // btnTem.replyButton('Button 1', 'btn_1')
    // btnTem.replyButton('Button 2', 'btn_2')
    // btnTem.replyButton('Button 3', 'btn_3')


    console.time(logName);
    const res = await msg.send('628884966841')
    console.timeEnd(logName);
    console.log(res)
}