const data = {
    '62567890123' : {
        name: 'Tsel 4-1',
        send: 30,
        receive: 20,
        unread: 5,
        open_chat: 'Tsel 1-2',
        status: "sending ...",
    },
    '62123456789' : {
        name: 'Tsel 1-2',
        send: 30,
        receive: 20,
        unread: 5,
        open_chat: undefined,
        status: "delay 9s",
    },
    "62234567890": {
        name: 'Tsel 3-4',
        send: 20,
        receive: 10,
        unread: 5,
        open_chat: 'Tsel 4-1',
        status: "typing 3s",
    }
}

let counter = 0;
const startLines = Object.keys(data).length + 4;
const startAt = new Date().toLocaleString()
function printProgress() {
    console.clear();
    // data.forEach((item, index) => {
    //     item.age++
    // })
    for (let i = -1; i < startLines; i++) {
        // process.stdout.cursorTo(0, i);
        // process.stdout.clearLine({
        //     x: 0,
        //     y: i
        // });
    }
    process.stdout.cursorTo(0, -1);
    console.log("start at:", startAt);
    console.table(data)
    console.count("label")
    counter++;
}

setInterval(function () {
    printProgress();
}, 1000);