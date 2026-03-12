// 📂 plugins/perfil.js — PERFIL FelixCat 🐾

import fs from 'fs'
import path from 'path'

const dbPath = './database'
const perfilesFile = path.join(dbPath, 'perfiles.json')
const parejasFile = path.join(dbPath, 'parejas.json')
const hermanosFile = path.join(dbPath, 'hermanos.json')

// =====================
// CREAR BASE DE DATOS
// =====================

if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath)

if (!fs.existsSync(perfilesFile))
fs.writeFileSync(perfilesFile, JSON.stringify({}, null, 2))

if (!fs.existsSync(parejasFile))
fs.writeFileSync(parejasFile, JSON.stringify({}, null, 2))

if (!fs.existsSync(hermanosFile))
fs.writeFileSync(hermanosFile, JSON.stringify({}, null, 2))

const loadPerfiles = () => JSON.parse(fs.readFileSync(perfilesFile))
const savePerfiles = data =>
fs.writeFileSync(perfilesFile, JSON.stringify(data, null, 2))

const loadParejas = () => JSON.parse(fs.readFileSync(parejasFile))
const loadHermanos = () => JSON.parse(fs.readFileSync(hermanosFile))

// =====================
// FUNCIONES
// =====================

const calcularEdad = fecha => {

const [d,m,a] = fecha.split('/').map(Number)
if(!d || !m || !a) return null

const nacimiento = new Date(a,m-1,d)
const hoy = new Date()

let edad = hoy.getFullYear() - nacimiento.getFullYear()
const mes = hoy.getMonth() - nacimiento.getMonth()

if(mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate()))
edad--

return edad
}

const signoZodiacal = fecha => {

const [d,m] = fecha.split('/').map(Number)
if(!d || !m) return null

const signos = [
['Capricornio ♑',19],
['Acuario ♒',18],
['Piscis ♓',20],
['Aries ♈',19],
['Tauro ♉',20],
['Géminis ♊',20],
['Cáncer ♋',22],
['Leo ♌',22],
['Virgo ♍',22],
['Libra ♎',22],
['Escorpio ♏',21],
['Sagitario ♐',21],
['Capricornio ♑',31]
]

return d <= signos[m-1][1]
? signos[m-1][0]
: signos[m][0]

}

const tiempoRelacion = fecha => {

if(!fecha) return null

const diff = Date.now() - Number(fecha)
const dias = Math.floor(diff / 86400000)

return `${dias} día(s)`

}

const diasParaCumple = fecha => {

const [d,m] = fecha.split('/').map(Number)
if(!d || !m) return null

const hoy = new Date()
const año = hoy.getFullYear()

let cumple = new Date(año,m-1,d)

if(cumple < hoy)
cumple = new Date(año+1,m-1,d)

return Math.ceil((cumple-hoy)/86400000)

}

// =====================
// HANDLER
// =====================

let handler = async (m,{conn,text,command}) => {

try {

const perfiles = loadPerfiles()
const parejas = loadParejas()
const hermanos = loadHermanos()

const jid = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
const username = jid.split('@')[0]

// =====================
// CREAR PERFIL
// =====================

if(!perfiles[jid]){

perfiles[jid] = {
registered:Date.now(),
joinGroup:null,
insignias:[],
genero:null,
birth:null,
bio:null
}

}

const user = perfiles[jid]

if(m.isGroup && !user.joinGroup)
user.joinGroup = Date.now()

// =====================
// PERMISOS
// =====================

const senderNumber = jid.replace(/[^0-9]/g,'')

const ownerNumbers = (global.owner || []).map(v=>{
if(Array.isArray(v)) v=v[0]
return String(v).replace(/[^0-9]/g,'')
})

const isRealOwner = ownerNumbers.includes(senderNumber)
const isAdmin = m.isAdmin || false

// =====================
// BIO
// =====================

if(command==='bio'){

if(!text) return m.reply('✍️ Escribe tu nueva bio.')

user.bio = text.trim()

savePerfiles(perfiles)

return m.reply('✅ Bio actualizada.')

}

// =====================
// GENERO
// =====================

if(command==='genero'){

if(!text) return m.reply('⚧️ Escribe tu género.')

user.genero = text.trim()

savePerfiles(perfiles)

return m.reply('✅ Género actualizado.')

}

// =====================
// NACIMIENTO
// =====================

if(command==='setbr'){

if(!text) return m.reply('🎂 Usa formato: .setbr 31/12/1998')

user.birth = text.trim()

savePerfiles(perfiles)

return m.reply('✅ Fecha de nacimiento guardada.')

}

// =====================
// OTORGAR INSIGNIA
// =====================

if(command==='otorgar'){

if(!m.mentionedJid[0])
return m.reply('⚠️ Menciona a un usuario.')

const target = m.mentionedJid[0]
const insignia = text.replace(/@\d+/g,'').trim()

if(!insignia)
return m.reply('⚠️ Escribe la insignia.')

if(!perfiles[target])
perfiles[target]={insignias:[]}

if(!perfiles[target].insignias)
perfiles[target].insignias=[]

perfiles[target].insignias.push(insignia)

savePerfiles(perfiles)

return m.reply(
`🏅 Insignia otorgada a @${target.split('@')[0]}
${insignia}`,
null,
{mentions:[target]}
)

}

// =====================
// QUITAR INSIGNIA
// =====================

if(command==='quitar'){

if(!m.mentionedJid[0])
return m.reply('⚠️ Menciona a un usuario.')

const target = m.mentionedJid[0]
const insignia = text.replace(/@\d+/g,'').trim()

if(!perfiles[target]?.insignias?.length)
return m.reply('❌ Ese usuario no tiene insignias.')

perfiles[target].insignias =
perfiles[target].insignias.filter(i=>i!==insignia)

savePerfiles(perfiles)

return m.reply(
`❌ Insignia quitada a @${target.split('@')[0]}`,
null,
{mentions:[target]}
)

}

// =====================
// VER INSIGNIAS
// =====================

if(command==='insignias'){

const target = m.mentionedJid?.[0]

// ver insignias de usuario

if(target){

const data = perfiles[target]

if(!data?.insignias?.length)
return m.reply('🏅 Este usuario no tiene insignias.')

const lista = data.insignias.map(i=>`• ${i}`).join('\n')

return m.reply(
`🏅 INSIGNIAS DE @${target.split('@')[0]}

${lista}`,
null,
{mentions:[target]}
)

}

// listar todos

let texto = '🏅 USUARIOS CON INSIGNIAS\n\n'
let mentions = []

for(const id in perfiles){

const data = perfiles[id]

if(data.insignias && data.insignias.length){

texto += `👤 @${id.split('@')[0]}
${data.insignias.join(' ')}

`

mentions.push(id)

}

}

if(!mentions.length)
return m.reply('❌ Nadie tiene insignias.')

return m.reply(texto.trim(),null,{mentions})

}

// =====================
// PERFIL
// =====================

if(command==='perfil'){

let estadoTexto='💔 Estado: Soltero/a'
let parejaTexto=''
let amorTexto=''
let tiempoTexto=''
let parejaJid=null

const data = parejas[jid]

if(data?.pareja){

parejaJid=data.pareja

estadoTexto =
data.estado==='casados'
?'💍 Estado: Casado/a'
:'💑 Estado: De novio/a'

parejaTexto=`❤️ Pareja: @${parejaJid.split('@')[0]}`
amorTexto=`💖 Amor: ${data.amor || 0}`

tiempoTexto=data.relacionFecha
?`⏳ Tiempo juntos: ${tiempoRelacion(data.relacionFecha)}`
:''

}

// hermanos

let hermanoTexto=''
let tiempoHermano=''
let hermanoJid=null

const dataHermano = hermanos[jid]

if(dataHermano?.hermano){

hermanoJid=dataHermano.hermano

hermanoTexto=`🧬 Hermano: @${hermanoJid.split('@')[0]}`

tiempoHermano=dataHermano.fecha
?`⏳ Tiempo de hermandad: ${tiempoRelacion(dataHermano.fecha)}`
:''

}

// edad

const edad=user.birth?calcularEdad(user.birth):null
const signo=user.birth?signoZodiacal(user.birth):null
const diasCumple=user.birth?diasParaCumple(user.birth):null

const textoPerfil = `

👤 PERFIL

@${username}

⭐ Rol: ${isRealOwner?'Dueño 👑':isAdmin?'Admin 🛡️':'Usuario 👤'}

${estadoTexto}
${parejaTexto}
${amorTexto}
${tiempoTexto}

${hermanoTexto}
${tiempoHermano}

🏅 Insignias:
${user.insignias?.length?user.insignias.join('\n'):'Ninguna'}

🚻 Género: ${user.genero || 'No definido'}

🎂 Nacimiento: ${user.birth || 'No registrado'}
${edad?`🎉 Edad: ${edad}`:''}
${signo?`🔮 Signo: ${signo}`:''}
${diasCumple?`⏳ Faltan ${diasCumple} día(s) para tu cumpleaños`:''}

📝 Bio: ${user.bio || 'Sin bio'}

`.trim()

savePerfiles(perfiles)

const mentions=[jid]

if(parejaJid) mentions.push(parejaJid)
if(hermanoJid) mentions.push(hermanoJid)

let pp=null

try{
pp = await conn.profilePictureUrl(jid,'image')
}catch{}

if(pp){

return conn.sendMessage(
m.chat,
{
image:{url:pp},
caption:textoPerfil,
mentions
},
{quoted:m}
)

}

return m.reply(textoPerfil,null,{mentions})

}

}catch(e){

console.error(e)
m.reply('❌ Error en perfil.')

}

}

handler.command = [
'perfil',
'setbr',
'bio',
'genero',
'otorgar',
'quitar',
'insignias'
]

export default handler
