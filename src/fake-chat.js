"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ez_whatsapp_1 = require("ez-whatsapp");
var baileys_1 = require("@whiskeysockets/baileys");
var fs_1 = require("fs");
var botNumbers = {};
var botSessions = fs_1.default.readdirSync('.session/auth-state');
// const botSessions = [];
console.log(botSessions);
var random = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };
var getFriendNumber = function (myJid) { return Object.keys(botNumbers).filter(function (jid) { return jid !== myJid; }); };
var randomText = function () {
    var texts = [
        'Hello there!', 'How are you?', 'What about you?', 'What\'s up?', 'How\'s it going?',
        'Halo', 'Iya', 'Oke', 'Nice', 'Sangat baik', 'Sangat bagus', 'Wah Keren', 'Keren',
        'Bagaimana?', 'Baiklah', 'Dimana'
    ];
    return texts[random(0, texts.length - 1)];
};
botSessions.forEach(function (nameBot) { return __awaiter(void 0, void 0, void 0, function () {
    var browser, wa, msgTemp, msg, msgCtx, _a, key, pushName, msgCtx;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                browser = baileys_1.Browsers.appropriate('Chrome');
                browser[0] = "Nasdem test bot[".concat(nameBot, "]");
                wa = new ez_whatsapp_1.default(nameBot, {
                    browser: browser
                });
                wa.on('sock.connecting', function () {
                    console.log(nameBot, 'connecting...');
                });
                wa.on('sock.disconnected', function () {
                    console.log(nameBot, 'disconnected!');
                });
                wa.on('msg.incoming', function (_a) {
                    var message = _a.message;
                    return __awaiter(void 0, void 0, void 0, function () {
                        var isReplyBack;
                        return __generator(this, function (_b) {
                            if (message.key.fromMe
                                || !(0, baileys_1.isJidUser)(message.key.remoteJid || undefined))
                                return [2 /*return*/];
                            console.log(wa.info.pushName, '=> Received message from', message.pushName);
                            isReplyBack = random(1, 25) > 5;
                            console.log('isReplyBack', isReplyBack);
                            botNumbers[wa.sock.user.id].push({
                                isReplyBack: isReplyBack,
                                message: message,
                            });
                            return [2 /*return*/];
                        });
                    });
                });
                wa.on('sock.connected', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var friendNumber;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.log(nameBot, 'connected! start sending', wa.sock.user);
                                botNumbers[wa.sock.user.id] = [];
                                console.log(Object.keys(botNumbers));
                                return [4 /*yield*/, (0, baileys_1.delay)(random(5000, 10000))];
                            case 1:
                                _a.sent();
                                friendNumber = getFriendNumber(wa.sock.user.id);
                                botNumbers[wa.sock.user.id].push({
                                    isReplyBack: true,
                                    message: {
                                        text: ['Hello there!', 'How are you?', 'What about you?'][random(0, 2)],
                                        to: friendNumber[random(0, friendNumber.length - 1)],
                                        typing: random(2, 4),
                                    },
                                });
                                return [2 /*return*/];
                        }
                    });
                }); });
                wa.startSock();
                setInterval(function () {
                    if (botNumbers[wa.sock.user.id].length > 0)
                        return;
                    var friendNumber = getFriendNumber(wa.sock.user.id);
                    botNumbers[wa.sock.user.id].push({
                        isReplyBack: true,
                        message: {
                            typing: random(2, 8),
                            text: 'haai! obrolan baru',
                            to: friendNumber[random(0, friendNumber.length - 1)],
                        }
                    });
                }, 60000);
                _c.label = 1;
            case 1:
                if (!true) return [3 /*break*/, 11];
                if (!(botNumbers[(_b = wa.sock) === null || _b === void 0 ? void 0 : _b.user.id] === undefined || botNumbers[wa.sock.user.id].length === 0)) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, baileys_1.delay)(5000)];
            case 2:
                _c.sent();
                return [3 /*break*/, 1];
            case 3:
                msgTemp = botNumbers[wa.sock.user.id].shift();
                if (msgTemp === undefined) {
                    return [3 /*break*/, 1];
                }
                if (!msgTemp.break) return [3 /*break*/, 5];
                return [4 /*yield*/, (0, baileys_1.delay)(msgTemp.break)];
            case 4:
                _c.sent();
                return [3 /*break*/, 1];
            case 5:
                if (!msgTemp.message.hasOwnProperty('typing')) return [3 /*break*/, 7];
                msg = msgTemp.message;
                msgCtx = wa.createMessage(random(msg.typing, msg.typing || 3) * 1000);
                msgCtx.text(msg.text);
                return [4 /*yield*/, msgCtx.send(msg.to)];
            case 6:
                _c.sent();
                return [3 /*break*/, 10];
            case 7:
                _a = msgTemp.message, key = _a.key, pushName = _a.pushName;
                return [4 /*yield*/, wa.sock.readMessages([key])];
            case 8:
                _c.sent();
                if (msgTemp.isReplyBack == false) {
                    return [3 /*break*/, 1];
                }
                msgCtx = wa.createMessage(random(3, 7) * 1000);
                msgCtx.text(randomText());
                return [4 /*yield*/, msgCtx.send(key.remoteJid)];
            case 9:
                _c.sent();
                console.log(wa.info.pushName, 'reply', pushName || key.remoteJid);
                _c.label = 10;
            case 10:
                if (random(1, 20) <= 4) {
                    botNumbers[wa.sock.user.id].push({
                        isReplyBack: false,
                        break: random(10000, 20000),
                        message: {}
                    });
                }
                return [3 /*break*/, 1];
            case 11: return [2 /*return*/];
        }
    });
}); });
setInterval(function () {
    console.log(JSON.stringify(Object.entries(botNumbers).reduce(function (obj, _a) {
        var jid = _a[0], msgs = _a[1];
        obj[jid] = msgs.length;
        return obj;
    }, {}), undefined, 3));
}, 20000);
