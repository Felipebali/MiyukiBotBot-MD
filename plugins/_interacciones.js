import fs from 'fs'
import path from 'path'

const dir = './database'
const file = path.join(dir, 'parejas.json')

const loadDB = () => JSON.parse(fs.readFileSync(file))
const saveDB = (data) => fs.writeFileSync(file, JSON.stringify(data, null, 2))

let handler = async (m, { conn, command }) => {

const db = loadDB()
const sender = conn.decodeJid(m.sender)

const getUser = (id) => {
if (!db[id]) {
db[id] = {
pareja: null,
estado: 'soltero',
propuesta: null,
propuestaFecha: null,
propuestaMatrimonio: null,
propuestaMatrimonioFecha: null,
relacionFecha: null,
matrimonioFecha: null,
amor: 0
}
}
return db[id]
}

const tag = (id) => '@' + id.split('@')[0]

const box = (title, text) => `╭━━━〔 ${title} 〕━━━⬣
${text}
╰━━━━━━━━━━━━━━━━⬣`

const getTarget = () => {
if (m.mentionedJid?.length) return m.mentionedJid[0]
if (m.quoted?.sender) return conn.decodeJid(m.quoted.sender)
return null
}

const user = getUser(sender)
const target = getTarget()
if (!target) return m.reply('💌 Menciona o responde a alguien.')

const targetUser = getUser(target)


// 🚫 persona en relación
if (targetUser.pareja && targetUser.pareja !== sender) {
return conn.reply(m.chat,
box('🚨 PERSONA EN RELACIÓN',
`${tag(target)} está en pareja con ${tag(targetUser.pareja)} ❤️
Respeta relaciones ajenas 😾`),
m,{mentions:[target,targetUser.pareja]})
}


// 🚫 infidelidad
if (user.pareja && user.pareja !== target) {
return conn.reply(m.chat,
box('🚨 INFIDELIDAD DETECTADA',
`${tag(sender)} intentó ${command} a ${tag(target)} 😾
Pero su pareja es ${tag(user.pareja)} ❤️`),
m,{mentions:[sender,target,user.pareja]})
}


// ❌ no son pareja
if (!user.pareja || user.pareja !== target)
return m.reply('💔 No son pareja.')


// ❤️ acciones
let suma = 0

if (command === 'flores') suma = 15
if (command === 'regalo') suma = 20
if (command === 'cita') suma = 25

user.amor += suma
targetUser.amor += suma

saveDB(db)

return conn.reply(m.chat,
box('💞 MOMENTO ROMÁNTICO',
`${tag(sender)} 💕 ${tag(target)}
Acción: ${command}

❤️ Amor actual: ${user.amor}`),
m,{mentions:[sender,target]})

}

handler.command = ['flores','regalo','cita']

export default handler
