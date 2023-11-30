const WhatsApp = require("ez-whatsapp").default;
const { Browsers, isJidUser, delay } = require("@whiskeysockets/baileys");

const browser = Browsers.appropriate("Chrome");
const nameBot = "helper";
browser[0] = `Nasdem [${nameBot}]`;
const wa = new WhatsApp(nameBot, {
    browser,
    silentLog: false,
});

const groupTestBot = "120363024101903992@g.us";
wa.on("sock.connecting", () => console.log(nameBot, "connecting..."));
wa.on("sock.disconnected", () => console.log(nameBot, "disconnected!"));
wa.on("sock.connected", async () => {
    console.log(nameBot, "connected!");


    // create comunity
    // const res = await wa.sock.groupCreate("Community Saya", []);
    // console.log("GroupMetaData", res);
    // const jid = "120363199493162535@g.us"
    const jid = "120363200015871097@g.us" // comunity
    // await wa.sock.groupSettingUpdate(jid, 'announcement')

    console.log(
        await wa.sock.groupParticipantsUpdate(jid, [
            '6281231223061@s.whatsapp.net',
            '628884966841@s.whatsapp.net',
            '6285231028718@s.whatsapp.net',
        ], 'add')
    );

    // wa.sock.ev.on("messages.upsert", async (messagesInfo) => {
    //     const message = messagesInfo.messages[0];
    //     console.log(nameBot, message);

    //     const textContent =
    //         message.message?.conversation ||
    //         message.message?.extendedTextMessage?.text ||
    //         "";
    //     if (
    //         textContent === "!join" &&
    //         message.key.fromMe === false &&
    //         isJidUser(message.key.remoteJid)
    //     ) {
    //         await delay(3_000);
    //         wa.sock.groupParticipantsUpdate(
    //             groupTestBot,
    //             [message.key.remoteJid],
    //             "add"
    //         );
    //     }
    // });

    // wa.sock.ev.on("group-participants.update", async (data) => {
    //     console.log(nameBot, "group-participants.update", data);

    //     if (data.action === "add") {
    //         await wa.sendMessageWithTyping(
    //             data.participants[0],
    //             {
    //                 text: "Sudah di tambahkan ke group",
    //             },
    //             undefined,
    //             5_000
    //         );
    //     }
    // });

    // const group = (await wa.sock.groupFetchAllParticipating())[groupTestBot];
    // group.participants.map(async ({ id }) => {
    //     return {
    //         nomor: id.split("@")[0],
    //         nama: await wa.sock.GET,
    //     };
    // });
});

wa.startSock();
