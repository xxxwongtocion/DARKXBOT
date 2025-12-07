const { default: makeWASocket, fetchLatestBaileysVersion, useSingleFileAuthState } = require('@whiskeysockets/baileys')
const P = require('pino')
const qrcode = require('qrcode-terminal')

// use auth file
const { state, saveState } = useSingleFileAuthState('./auth_info.json')

async function start() {
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger: P({ level: 'silent' }),
    auth: state
  })

  sock.ev.on('creds.update', saveState)

  sock.ev.on('connection.update', (update) => {
    const { connection, qr } = update
    if (qr) {
      console.log('Scan QR code with WhatsApp:')
      qrcode.generate(qr, { small: true })
      console.log('Linked ID: DARKXDEV')
    }
    if (connection === 'open') {
      console.log('Bot connected successfully!')
    }
  })

  sock.ev.on('messages.update', async (msgs) => {
    for (let m of msgs){
      if(m.status === 'status'){
        await sock.readMessages([m.key])
        await sock.sendMessage(m.key.remoteJid, { react: { text: '❤️', key: m.key } })
      }
    }
  })
}

start()
