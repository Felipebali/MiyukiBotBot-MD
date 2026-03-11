import fs from 'fs'
import path from 'path'

const dir = './database'
const file = path.join(dir, 'parejas.json')

const loadDB = () => JSON.parse(fs.readFileSync(file))

let handler = async (m, { conn, isOwner }) => {

if (!isOwner)
return m.reply('👑 Este comando es solo para los *Owners* del bot.')

let db = loadDB()
let parejas = []

for (let id in db) {
let user = db[id]

if (user.pareja && id < user.pareja) {

let parejaData = db[user.pareja]
if (!parejaData) continue

let amorTotal = (user.amor || 0) + (parejaData.amor || 0)

parejas.push({
u1: id,
u2: user.pareja,
amor: amorTotal
})

}
}

if (!parejas.length)
return m.reply('💔 No hay parejas registradas todavía.')

parejas.sort((a,b)=> b.amor - a.amor)

let texto = `🏆 *TOP PAREJAS DEL BOT* 🏆\n\n`

parejas.slice(0,10).forEach((p,i)=>{

let u1 = '@'+p.u1.split('@')[0]
let u2 = '@'+p.u2.split('@')[0]

texto += `💞 *${i+1}.* ${u1} ❤️ ${u2}\n`
texto += `❤️ Amor total: ${p.amor}\n\n`

})

await conn.reply(m.chat, texto, m, {
mentions: parejas.slice(0,10).flatMap(p=>[p.u1,p.u2])
})

}

handler.help = ['topparejas']
handler.tags = ['owner']
handler.command = ['topparejas','topamor']

export default handler
