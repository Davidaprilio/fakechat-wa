import WhatsApp from 'ez-whatsapp'
import { Browsers, isJidUser, delay, proto } from '@whiskeysockets/baileys';
import fs from 'fs'
const { config, getBotListArgs } = require('./_utils');

type BotNumbers = {
    [nameBot: string]: {
        phone: string, 
        jid: string, 
        pushName: string,
        send: number,
        recived: number,
        unread: number,
        status: string,
        active_chats: number,
        open_chats?: string,
        seconds: number,
        interval?: number
    } // jumlah pesan yang dikirim
}

const botNumbers: BotNumbers = {}

const jidNameMap: { [jid: string]: string } = {}

type Chats = {
    msgID: string,
    msg: proto.IWebMessageInfo
}

const chats: {
    [jidBot: string]: {
        [jidContact: string]: Chats[]
    }
} = {}

const botSessions: string[] = getBotListArgs(config)
// const botSessions = fs.readdirSync('.session/auth-state')
// const botSessions = fs.readdirSync('.session-keepon/auth-state')
// const botSessions = [];
// console.log('The Bots', botSessions);

function getNameForID(jidUser: string, defaultValue = '') {
    const nameBot = jidNameMap[jidUser]
    return botNumbers[nameBot]?.pushName || nameBot || defaultValue
}

function getPhoneNumber(phone: string) {
    phone = phone.split('@')[0]
    phone = phone.split(':')[0]
    return phone
}

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const getFriendNumber = (myJid: string) => Object.keys(jidNameMap).filter(jid => jid !== myJid)
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
    MAX: 70,
    MIN: 40
}

try {
    botSessions.forEach(async (nameBot) => {
        const browser = Browsers.appropriate('Chrome')
        browser[0] = `Nasdem test bot[${nameBot}]`
        const wa = new WhatsApp(nameBot, {
            browser,
            pathSession: config.pathsession ? `.${config.pathsession}` : '.session-keepon',
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
    
            if (!chats[wa.sock.user!.id][message.key.remoteJid!]) chats[wa.sock.user!.id][message.key.remoteJid!] = []
            if (message.key.id) chats[wa.sock.user!.id][message.key.remoteJid!].push({
                msgID: message.key.id,
                msg: message
            })
            botNumbers[nameBot].recived++

            let unreadmsg = 0
            let active_chats = 0
            Object.entries(chats[wa.sock.user!.id]).forEach((msgs) => {
                if (msgs.length > 0) {
                    active_chats++
                }
                unreadmsg += msgs.length
            })
            botNumbers[nameBot].unread = unreadmsg
            botNumbers[nameBot].active_chats = active_chats

            // botNumbers[nameBot].unread = chats[wa.sock.user!.id][message.key.remoteJid!].length
            console.log(wa.info.pushName, '=> Received message from', message.pushName, ': unread', botNumbers[nameBot].unread);
        })

        wa.on('sock.connected', async () => {
            console.log(nameBot, 'connected! start sending', wa.sock.user)
            botNumbers[nameBot].jid = wa.sock.user!.id
            botNumbers[nameBot].phone = getPhoneNumber(botNumbers[nameBot].jid)
            botNumbers[nameBot].pushName = wa.info.pushName || '-'
            botNumbers[nameBot].status = 'connected'
            chats[wa.sock.user!.id] = {}
            jidNameMap[botNumbers[nameBot].phone] = nameBot
            await delay(2000)

            const delaySec = random(10, 50)
            timerUpdate(delaySec, (secLeft) => botNumbers[nameBot].status = `delay ${secLeft}s`)
            await delay(delaySec * 1000)

            const friendNumber = getFriendNumber(wa.sock.user!.id)
            // Pesan Awal
            sendMessage('send', 
                friendNumber[random(0, friendNumber.length - 1)], 
                random(5, 8),
                false
            )
        })

        const timerUpdate = (seconds: number, callback: (secLeft: number) => void) => {
            if (botNumbers[nameBot].interval !== undefined) {
                clearInterval(botNumbers[nameBot].interval)
            }
            let secondsLeft = seconds - 1
            botNumbers[nameBot].interval = setInterval(() => {
                callback(secondsLeft)
                secondsLeft -= 1
                if (secondsLeft <= 0) {
                    clearInterval(botNumbers[nameBot].interval)
                    return
                }
            }, 1_000) as unknown as number
        }
    
        botNumbers[nameBot] = {
            phone: '',
            jid: '',
            pushName: wa.info.pushName || '-',
            send: 0,
            recived: 0,
            unread: 0,
            status: 'connecting',
            seconds: 0,
            active_chats: 0,
        }

        // setTimeout(async () => {
        //     botNumbers[nameBot].status = 'connected'
        //     const delaySec = 10
        //     await delay(1000)
            
        //     timerUpdate(delaySec, (secLeft) => botNumbers[nameBot].status = `delay ${secLeft}s`)
        //     await delay(delaySec * 1000)
            
        //     timerUpdate(5, (secLeft) => botNumbers[nameBot].status = `typing ${secLeft}s`)
        //     await delay(5000)
        //     botNumbers[nameBot].status = 'SEND'

        //     await delay(1000)
        //     botNumbers[nameBot].status = 'OK'
        // })
        // return
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
    
        async function sendMessage(method: 'send', msg: proto.IWebMessageInfo | string, time: number, withDelay?: false): Promise<void>
        async function sendMessage(method: 'reply', msg: proto.IWebMessageInfo, time: number, withDelay?: false): Promise<void>
        async function sendMessage(method: 'send' | 'reply' = 'send', msg: proto.IWebMessageInfo | string, time: number = 1, withDelay?: false): Promise<void> {
            botNumbers[nameBot].status = `typing ${time}s`
            const secTyping = time * 1_000
            const msgCtx = wa.createMessage(secTyping)
            timerUpdate(time, (secLeft) => botNumbers[nameBot].status = `typing ${secLeft}s`)
            msgCtx.text(randomText())
            if (method == 'reply' && typeof msg === 'object') {
                await msgCtx.reply(msg)
            } else {
                const no = (typeof msg === 'string' ? msg : msg.key.remoteJid!).split(':')[0]
                await msgCtx.send(no)
                // console.log(no, res);
            }
            botNumbers[nameBot].status = `send msg`
            botNumbers[nameBot].send++
            await delay(1_000)
            if (withDelay === undefined) {
                const t = random(15,50)
                timerUpdate(t, (secLeft) => botNumbers[nameBot].status = `delay ${secLeft}s`)
                await delay(t * 1000) // for delay sec
            }
        }
    
        await wa.waitSockConnected()
        await delay(60_000)
    
        // Robot untuk reply pesan masuk
        while (true) {
            if (wa.sock?.user == undefined) {
                botNumbers[nameBot].status = 'disconnected'
                await delay(5_000)
                continue
            }
            await wa.waitSockConnected()
            botNumbers[nameBot].open_chats = undefined
    
            // jika tidak ada pesan masuk
            let unreadmsg = 0
            let active_chats = 0
            const listChats = Object.entries(chats[wa.sock.user!.id]).reduce((obj, [jid, msgs]) => {
                obj[jid] = msgs.length
                if (msgs.length > 0) {
                    active_chats++
                }
                unreadmsg += msgs.length
                return obj
            }, {} as { [jid: string]: number })

            botNumbers[nameBot].unread = unreadmsg
            botNumbers[nameBot].active_chats = active_chats

            // console.log(wa.info.pushName, 'List Chat:', Object.entries(listChats).reduce((obj, [jid, totalChat]) => {
            //     obj[getNameForID(jid, jid)] = totalChat
            //     return obj
            // }, {} as { [name: string]: number }));
            
            if (chats[wa.sock?.user!.id] === undefined || Object.entries(chats[wa.sock?.user!.id]).length == 0) {
                console.log(wa.info.pushName, 'No User in chat');
                const sec = random(45, 60)
                timerUpdate(sec, (secLeft) => botNumbers[nameBot].status = `no chat ${secLeft}s`)
                await delay(sec * 1_000)
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
                    const sec = random(10, 15)
                    timerUpdate(sec, (secLeft) => botNumbers[nameBot].status = `no chat ${secLeft}s`)
                    await delay(sec * 1_000)
                }
                continue
            }
            const msgsId = pickChats[random(0, pickChats.length - 1)][0]
            const msgs = chats[wa.sock?.user!.id][msgsId]
            chats[wa.sock?.user!.id][msgsId] = []
            await wa.sock.readMessages(Object.values(msgs).map(msg => msg.msg.key))

            // reply
            const replyPhone = getPhoneNumber(msgs[0]?.msg.key.remoteJid || 'unknown')
            const replyTo = jidNameMap[replyPhone] || replyPhone
            botNumbers[nameBot].open_chats = replyTo

            const readSec = random(10, 16)
            timerUpdate(readSec, (secLeft) => botNumbers[nameBot].status = `read ${secLeft}s`)
            await delay(readSec * 1_000)
    
            // console.log(wa.info.pushName, 'Reply to:', replyTo);
            for (const {msg} of msgs) {
                if (random(1,5) == 5) {
                    console.log(wa.info.pushName, 'Skip Reply msg');
                    botNumbers[nameBot].status = 'skip reply'
                    await delay(2_000)
                    continue // ada kemungkinan pesan tidak dibalas
                }
                const [minSec, maxSec] = [10, 15]
                if(random(1, 15) <= 4) await sendMessage('reply', msg, random(minSec, maxSec))
                else await sendMessage('send', msg.key.remoteJid!, random(minSec, maxSec))
            }
            if (msgs.length == 1 && random(1,8) == 8) {
                const msg = msgs[0].msg

                botNumbers[nameBot].status = 'add reply'
                await delay(2_000)

                const totalMsg = random(1, 3);
                console.log(wa.info.pushName, 'Many Reply', totalMsg, 'to', replyTo);
    
                for (let i = 0; i < totalMsg; i++)
                    await sendMessage('send', msg.key.remoteJid!, random(8, 20))
            }
            console.log(wa.info.pushName, 'End Replying to:', replyTo);
        }
    })
} catch (error) {
    console.error('!!! ERROR: ');
    console.error(error);
}

const startAt = new Date().toLocaleString()
setInterval(() => {
    console.clear()
    console.log("Start at:", startAt);
    console.table(Object.entries(botNumbers).reduce((obj, [nameBot, wa]) => {
        obj[nameBot] = {
            phone: wa.phone,
            name: wa.pushName,
            'send (msg)': wa.send,
            'recived (msg)': wa.recived,
            'unread (msg)': wa.unread,
            status: wa.status,
            open_chats: wa.open_chats,
            'unread chats': wa.active_chats +' no',
        }
        return obj
    }, {} as {[key: string]: {[key: string]: number|string|undefined}}))

    // console.log('All Chats:', JSON.stringify(Object.entries(chats).reduce((obj, [jidBot, contacts]) => {
    //     obj[`${jidBot} - ${getNameForID(jidBot, '')}`] = Object.entries(contacts).reduce((obj, [jidContact, msgs]) => {
    //         obj[`${jidContact} - ${getNameForID(jidContact, '')}`] = msgs.length
    //         return obj
    //     }, {} as {[jidContact: string]: number})
    //     return obj
    // }, {} as {[key: string]: {[key: string]: number}}), undefined, 3));
    // console.log('List Bot Numbers:', botNumbers); 
}, 1_000)

// XL
// 1: 34
// 2: 160
// 3: 178 = 372
// 4: 561
// 5: 712 = 1489 ====

// 1: 157