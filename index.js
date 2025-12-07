const {
  default: makeWASocket,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys')
const P = require('pino')
const qrcode = require('qrcode-terminal')

async function start() {
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    printQRInTerminal: true,
    logger: P({ level: 'silent' }),
    auth: {}
  })

  sock.ev.on('connection.update', ({ qr }) =>{
    if(qr){
      console.log("Scan WhatsApp linked device")
      qrcode.generate(qr, {small: true})
      console.log("Linked ID: DARKXDEV")
    }
  })

  sock.ev.on('messages.upsert', async () => {})

  // Auto view status
  sock.ev.on("messages.update", async (msgs)=>{
    for (let m of msgs){
      if(m.status === 'status'){
        await sock.readMessages([m.key])
        await sock.sendMessage(m.key.remoteJid, { react: { text: "❤️", key:m.key }})
      }
    }
  })
}

start()
