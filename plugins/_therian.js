// 📂 plugins/therians_pro_save.js — FelixCat_Bot 🐾 PRO Master + Paloma Migajera
import fs from 'fs'
import path from 'path'

const FILE = './database/therians.json'

// =================== UTILIDADES ===================
function loadJson(file) {
  if (!fs.existsSync(file)) return {}
  return JSON.parse(fs.readFileSync(file))
}

function saveJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

// =================== HANDLER ===================
let handler = async (m, { conn, command }) => {
  try {
    const chatData = global.db.data.chats[m.chat] || {}

    if (!chatData.games) {
      return await conn.sendMessage(
        m.chat,
        { text: '🎮 *Los mini-juegos están desactivados.*\nActívalos con *.juegos* 🔓' },
        { quoted: m }
      )
    }

    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

    let who = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0]) || m.sender
    let simpleId = who.split('@')[0]
    let name = conn.getName ? conn.getName(who) : simpleId

    // 🐾 Tipos de Therians PRO (máximo 15, incluyendo chistoso)
    let allTypes = [
      '🐺 Lobo','🦊 Zorro','🐱 Gato','🐺 Hombre-Lobo','🦁 León',
      '🐉 Dragón','🦄 Unicornio','🐲 Dragón Asiático','🦅 Águila Mística',
      '🦖 T-Rex Fantástico','🦌 Ciervo Lunar','🐉 Fénix','🦁 León Fantástico',
      '🕊️ Paloma Migajera','🦝 Mapache Travieso'
    ]

    const attributes = ['Animal','Espíritu','Poder','Agilidad','Magia']
    const totalBars = 10
    const barSymbols = ['🟩','🟦','🟪','🟧','🟥','🟫','🟨','🟪']

    // 🔹 Cargar therians.json
    const db = loadJson(FILE)
    if (!db[who]) db[who] = { usedTypes: [] }

    // 🐾 Seleccionar un animal único
    let availableTypes = allTypes.filter(t => !db[who].usedTypes.includes(t))
    if (availableTypes.length === 0) db[who].usedTypes = [] // reset si ya usó todos
    availableTypes = allTypes.filter(t => !db[who].usedTypes.includes(t))
    const selectedType = availableTypes[Math.floor(Math.random()*availableTypes.length)]
    db[who].usedTypes.push(selectedType)

    // 🎯 Generar atributos
    const attrResult = {}
    attributes.forEach(attrName => {
      const pct = Math.floor(Math.random()*101)
      const filled = Math.round(pct/10)
      const sym = barSymbols[Math.floor(Math.random()*barSymbols.length)]
      attrResult[attrName] = { pct, bar: sym.repeat(filled)+'⬜'.repeat(totalBars-filled) }
    })

    // 💬 Frases épicas
    const frases = [
      "🌙 Tu espíritu animal domina la noche.",
      "🔥 Peligroso y adorable, equilibrio perfecto.",
      "💨 Sigiloso, nadie te ve acercarte.",
      "💖 Tu Therians interior es puro amor salvaje.",
      "🛡️ Protector de tu manada, valiente y noble.",
      "⚡ Poder extremo: cuidado con tus enemigos.",
      "🌟 Aura mágica que brilla más que la luna llena.",
      "🌀 FelixCat confirma: alma de criatura legendaria.",
      "😹 Incluso la Paloma Migajera tiene estilo único 🕊️"
    ]
    const frase = frases[Math.floor(Math.random()*frases.length)]

    // 🏆 Clasificación PRO
    const promedio = Math.floor(attributes.reduce((a, attr) => a + attrResult[attr].pct,0)/attributes.length)
    let categoria = 'Común'
    if (promedio >= 90) categoria = '✨ Legendario Supremo ✨'
    else if (promedio >= 75) categoria = '⚡ Legendario ⚡'
    else if (promedio >= 60) categoria = 'Raro 🌀'
    else if (promedio >= 40) categoria = 'Inusual 🌟'

    // 🧾 Mensaje final
    let msg = `🐾 *THERIANS PRO MASTER 100%* 🐾

👤 *Usuario:* @${simpleId}
🎖️ *Clasificación final:* ${categoria} (Promedio: ${promedio}%)

🔹 *Animal asignado:* ${selectedType}
🔹 *Atributos:*\n`

    attributes.forEach(attr => {
      msg += `• ${attr}: ${attrResult[attr].pct}% ${attrResult[attr].bar}\n`
    })

    msg += `\n💬 ${frase}`

    // 📤 Guardar en therians.json
    db[who].lastResult = { type: selectedType, attributes: attrResult, promedio, categoria, frase }
    saveJson(FILE, db)

    // 📤 Enviar mensaje
    await conn.sendMessage(m.chat, { text: msg, mentions: [who] }, { quoted: m })

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '✖️ Error al ejecutar el test de Therians PRO Master.', m)
  }
}

handler.command = ['therianspro','therians','therian','animaltest','theriancat','theriandeluxe']
handler.tags = ['fun','juego']
handler.help = ['therianspro <@usuario>']
handler.group = true

export default handler
