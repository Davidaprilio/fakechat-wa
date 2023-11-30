import WhatsApp from 'ez-whatsapp'
import { Browsers, isJidUser, delay, proto } from '@whiskeysockets/baileys';
import fs from 'fs'

type BotNumbers = {
    [jid: string]: {
        nameBot: string, 
        pushName: string,
        totalMsgSent: number
    } // jumlah pesan yang dikirim
}

const botNumbers: BotNumbers = {}

type Chats = {
    msgID: string,
    msg: proto.IWebMessageInfo
}

const chats: {
    [jidBot: string]: {
        [jidContact: string]: Chats[]
    }
} = {}

// const botSessions = fs.readdirSync('.session/auth-state')
const botSessions = fs.readdirSync('.session-keepon/auth-state')
// const botSessions = [];
console.log('The Bots', botSessions);

function getNameForID(jidUser: string, defaultValue = '') {
    return botNumbers[jidUser]?.pushName || botNumbers[jidUser]?.nameBot || defaultValue
}

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const getFriendNumber = (myJid: string) => Object.keys(botNumbers).filter(jid => jid !== myJid)
const randomText = () => {
    const texts = [
        'Hello there!', 'How are you?', 'What about you?', 'What\'s up?', 'How\'s it going?', 
        'Halo', 'Iya', 'Oke', 'Nice', 'Sangat baik', 'Sangat bagus', 'Wah Keren', 'Keren',
        'Bagaimana?', 'Baiklah', 'Dimana', 'Kita lagi disuruh jaga nih!', 'Oke, Kita jaga ya!',
        'Biar aman gak dingin', 'Oke, kita panasin', 'Wah makasih lho', 'ini nanti dipakai siapa',
        'Ini nanti bakal dipakai partai nasdem', 'kita hanya kirim ke nomor anggota ya','kita gak boleh spam ya, mantap',
        'target kita banyak', 'yuk demi nasdem', 'semoga aman dan baik baik saja', 'kita harus jaga ini dan tetap semangat',
        '2 bulan lagi bakal kerja keras', 'kita harus siap', 'keep strong', 'semangat untuk semuanya'
    ]
    return texts[random(0, texts.length - 1)]
}


const DELAY = {
    MAX: 50,
    MIN: 30
}

try {
    botSessions.forEach(async (nameBot) => {
        const browser = Browsers.appropriate('Chrome')
        browser[0] = `Nasdem test bot[${nameBot}]`
        const wa = new WhatsApp(nameBot, {
            browser,
            pathSession: '.session-keepon'
        })
        
        wa.on('sock.connecting', () => console.log(nameBot, 'connecting...'))
        wa.on('sock.disconnected', () => console.log(nameBot, 'disconnected!'))
    
        wa.on('msg.incoming', async ({message}) => {
            const numberFr = getFriendNumber(wa.sock.user!.id).map(jid => jid.split(':')[0])        
            if (
                message.key.fromMe
                || !isJidUser(message.key.remoteJid || undefined)
                || !numberFr.includes(message.key.remoteJid!.split('@')[0])
            ) {
                console.log(wa.info.pushName, '=> Received message from (NOT FROM FRIEND)', message.pushName, message.key.remoteJid!.split('@')[0]);
                return
            }
    
            if(!chats[wa.sock.user!.id][message.key.remoteJid!]) chats[wa.sock.user!.id][message.key.remoteJid!] = []
            if (message.key.id) chats[wa.sock.user!.id][message.key.remoteJid!].push({
                msgID: message.key.id,
                msg: message
            })
    
            console.log(wa.info.pushName, '=> Received message from', message.pushName, ': unread', chats[wa.sock.user!.id][message.key.remoteJid!].length);
        })
        
        wa.on('sock.connected', async () => {
            console.log(nameBot, 'connected! start sending', wa.sock.user)
            botNumbers[wa.sock.user!.id] = {
                nameBot: nameBot,
                pushName: wa.info.pushName || '-',
                totalMsgSent: 0
            }
            chats[wa.sock.user!.id] = {}
    
            console.log(Object.keys(botNumbers));
    
            await delay(random(DELAY.MIN, DELAY.MAX) * 1000)
    
            const friendNumber = getFriendNumber(wa.sock.user!.id)
            // Pesan Awal
            sendMessage('send', 
                friendNumber[random(0, friendNumber.length - 1)], 
                random(DELAY.MIN, DELAY.MAX)
            )
        })
    
        await wa.startSock()
    
        // setInterval(async () => {
        //     for (const key in chats) {
        //         const listChat = chats[key]
        //         // jika tidak ada obrolan
        //         if(Object.keys(listChat).length == 0) {
        //             console.log(nameBot, 'no chat, open new more chat');
        //             const friendNumbers = getFriendNumber(wa.sock.user!.id)
    
        //             // buka obrolan baru ke teman
        //             for (let i = 0; i < random(1, Math.min(friendNumbers.length, 3)); i++) {
        //                 const nomor = friendNumbers.splice(random(0, friendNumbers.length - 1), 1)[0]
        //                 const jmlMsg = random(2,4)
        //                 console.log(wa.info.pushName, '=> Sending', jmlMsg,'message to', nomor);
                        
        //                 for (let a = 0; a < jmlMsg; a++) 
        //                     sendMessage('send', nomor, random(3,6))
        //             }
        //         }
        //     }
        // }, 90_000);
    
        async function sendMessage(method: 'send', msg: proto.IWebMessageInfo | string, time: number): Promise<void>
        async function sendMessage(method: 'reply', msg: proto.IWebMessageInfo, time: number): Promise<void>
        async function sendMessage(method: 'send' | 'reply' = 'send', msg: proto.IWebMessageInfo | string, time: number = 1) {
            const msgCtx = wa.createMessage(time * 1_000)
            msgCtx.text(randomText())
            if (method == 'reply' && typeof msg === 'object') {
                await msgCtx.reply(msg)
            } else {
                const no = (typeof msg === 'string' ? msg : msg.key.remoteJid!).split(':')[0]
                await msgCtx.send(no)
                // console.log(no, res);
            }
            botNumbers[wa.sock.user!.id].totalMsgSent++
            await delay((60 * random(6,8)) * 1000) // for delay minutes
        }
    
    
        // Robot untuk reply pesan masuk
        while (true) {
            if (wa.sock?.user == undefined) {
                console.log(wa.info.pushName, '=> WA user is undefined!');
                await delay(5_000)
                continue
            }
            await wa.waitSockConnected()
    
            // jika tidak ada pesan masuk
            const listChats = Object.entries(chats[wa.sock.user!.id]).reduce((obj, [jid, msgs]) => {
                obj[jid] = msgs.length
                return obj
            }, {} as { [jid: string]: number })
            console.log(wa.info.pushName, 'List Chat:', Object.entries(listChats).reduce((obj, [jid, totalChat]) => {
                obj[getNameForID(jid, jid)] = totalChat
                return obj
            }, {} as { [name: string]: number }));
            
            if (chats[wa.sock?.user!.id] === undefined || Object.entries(chats[wa.sock?.user!.id]).length == 0) {
                console.log(wa.info.pushName, 'No User in chat');
                await delay(random(45_000, 60_000))
                continue
            }
    
            // pilih 1 chat rondom dan buka chat
            // ada bug saat pick 1 ternyata chat nya kosong :=> jika kosong pick lagi
            const pickChats = Object.entries(listChats).filter(([jid, totalChat]) => totalChat > 0)
            if (pickChats.length === 0) {
                console.log(wa.info.pushName, 'No Chat');
                // ada kemungkinan membuat percakapan baru
                if(random(1, 5) == 5) {
                    const friendNumbers = getFriendNumber(wa.sock.user!.id)
                    const number = friendNumbers.splice(random(0, friendNumbers.length - 1), 1)[0]
                    console.log(wa.info.pushName, 'Start new chat to', number);
                    await sendMessage('send', number, random(3, 6))
                    if (random(1, 5) == 5) {
                        const addMsgAmount = random(0, 3)
                        for (let i = 0; i < addMsgAmount; i++) await sendMessage('send', number, random(3, 6))
                    }
                } else {
                    await delay(random(10_000, 15_000))
                }
                continue
            }
            const msgsId = pickChats[random(0, pickChats.length - 1)][0]
            const msgs = chats[wa.sock?.user!.id][msgsId]
            chats[wa.sock?.user!.id][msgsId] = []
            await wa.sock.readMessages(Object.values(msgs).map(msg => msg.msg.key))
            await delay(random(8_000, 15_000))
    
            const replyTo = msgs[0]?.msg.pushName || 'unknown'
            console.log(wa.info.pushName, 'Reply to:', replyTo);
            for (const {msg} of msgs) {
                if (random(1,5) == 5) {
                    console.log(wa.info.pushName, 'Skip Reply msg');
                    continue // ada kemungkinan pesan tidak dibalas
                }
                if(random(1, 15) <= 4) await sendMessage('reply', msg, random(8, 15))
                else await sendMessage('send', msg.key.remoteJid!, random(8, 15))
            }
            if (msgs.length == 1 && random(1,8) == 8) {
                const msg = msgs[0].msg
                const totalMsg = random(1, 3);
                console.log(wa.info.pushName, 'Many Reply', totalMsg, 'to', replyTo);
    
                for (let i = 0; i < totalMsg; i++)
                    await sendMessage('send', msg.key.remoteJid!, random(6, 11))
            }
            console.log(wa.info.pushName, 'End Replying to:', replyTo);
        }
    })
} catch (error) {
    console.error('!!! ERROR: ');
    console.error(error);
}

setInterval(() => {
    console.log('All Chats:', JSON.stringify(Object.entries(chats).reduce((obj, [jidBot, contacts]) => {
        obj[`${jidBot} - ${getNameForID(jidBot, '')}`] = Object.entries(contacts).reduce((obj, [jidContact, msgs]) => {
            obj[`${jidContact} - ${getNameForID(jidContact, '')}`] = msgs.length
            return obj
        }, {} as {[jidContact: string]: number})
        return obj
    }, {} as {[key: string]: {[key: string]: number}}), undefined, 3));
    console.log('List Bot Numbers:', botNumbers); 
}, 20_000)

// XL
// 1: 34
// 2: 160
// 3: 178 = 372
// 4: 561
// 5: 712 = 1489 ====

// 1: 157