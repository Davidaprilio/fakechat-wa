const { config, getBotListArgs, random } = require("./_utils");
import WhatsApp from'ez-whatsapp'
import { Browsers, delay } from '@whiskeysockets/baileys';
import { rmSync, writeFileSync } from 'fs';
import axios from 'axios';

let bots: string[] = getBotListArgs(config)

// console.table(bots.map((s) => ({name: s})));

async function run() {
    for (const nameBot of bots) {
        const nameLog = `[${nameBot.padEnd(10, ' ')}]`
        const browser = Browsers.appropriate('Chrome')
        browser[0] = `Nasdem bot_keepon[${config.id}]`
        const wa = new WhatsApp(nameBot, {
            browser,
            pathSession: '.session-keepon'
        })

        wa.on('sock.connecting', () => console.log(nameLog, 'WA is connecting...'))

        wa.on('sock.disconnected', async () => {
            console.log(nameLog, 'WA is disconnected!')
            await wa.startSock()
        })

        wa.on('sock.connected', () => console.log(nameLog, 'WA is connected!'))

        await wa.startSock()
        await wa.waitSockConnected()

        await delay(2_000)

        // https://i.pravatar.cc/150 random photo


        const colours = [
            'red',
            'orange',
            'yellow',
            'green',
            'blue',
            'indigo',
            'salmon',
            'teal',
            'darkorange',
            'darkgreen',
            'darkblue',
        ]

        const url = `https://placehold.co/400x400/${colours[random(0, colours.length - 1)]}/white.png?text=Deptech+BOT\\n${nameBot.replace('_', '+').replace('~', '-')}&font=roboto`

        console.log(nameBot, 'generate image:', url);
        const pathImage = `./${nameBot}.png`
        await downloadImage(url, pathImage)
        
        console.log(nameBot, 'set photo profile');
        await wa.sock.updateProfilePicture(wa.sock.user!.id, {
            url: pathImage
        })
        console.log(nameBot, 'profile picture updated');
        rmSync(pathImage)
    }
}

async function downloadImage(url: string, filePath: string): Promise<void> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    writeFileSync(filePath, response.data);
}

try {
    run()
} catch (error) {
    console.error(error);
}
