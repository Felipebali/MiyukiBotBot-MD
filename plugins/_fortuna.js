import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const dir = './database'
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const file = path.join(dir, 'fortunas.json')
if (!fs.existsSync(file)) {
  fs.writeFileSync(file, JSON.stringify({
    usadas: [],
    usadasRaras: [],
    usadasMalas: []
  }, null, 2))
}

const loadDB = () => JSON.parse(fs.readFileSync(file))
const saveDB = (data) => fs.writeFileSync(file, JSON.stringify(data, null, 2))

// ================= NORMAL
const normales = [
  "Algo bueno está por llegar a tu vida.",
  "Hoy es un gran día para intentar algo nuevo.",
  "Una sorpresa agradable te espera pronto.",
  "Confía en tu intuición, no fallará.",
  "Tu esfuerzo dará frutos antes de lo que crees.",
  "La suerte favorece a los valientes.",
  "Hoy recibirás buenas noticias.",
  "La paciencia será tu mejor aliada.",
  "Alguien piensa mucho en ti.",
  "Un cambio positivo está en camino."
]

// ================= RARAS
const raras = [
  "🍀 Tendrás un golpe de suerte inesperado.",
  "💎 Una oportunidad única aparecerá muy pronto.",
  "✨ El universo conspira fuertemente a tu favor.",
  "🔥 Hoy atraerás algo que deseas mucho.",
  "🌟 Un sueño importante comenzará a cumplirse.",
  "👑 Tendrás reconocimiento de alguien importante.",
  "🚀 Un avance rápido llegará a tu vida.",
  "💰 Algo relacionado al dinero mejorará.",
  "🧭 Tomarás una decisión que cambiará tu futuro.",
  "🎯 Lograrás algo que creías imposible."
]

// ================= MALAS
const malas = [
  "💀 Hoy no es tu día… pero mañana puede ser peor.",
  "🥲 Una siesta habría sido mejor idea.",
  "😿 Algo saldrá mal… pero será gracioso después.",
  "🍞 Cuidado con lo que comes hoy.",
  "📉 Tus planes pueden fallar… improvisa.",
  "🐌 Tendrás un día lento y extraño.",
  "🌧️ Mejor evita discusiones hoy.",
  "🤡 Harás algo vergonzoso sin querer.",
  "📱 Alguien te ignorará hoy.",
  "🪫 Tu energía estará baja… descansa."
]

function obtenerFrase(lista, usadasKey, db) {
  if (!db[usadasKey]) db[usadasKey] = []

  if (db[usadasKey].length >= lista.length) {
    db[usadasKey] = []
  }

  const disponibles = lista.filter(f => !db[usadasKey].includes(f))
  const frase = disponibles[Math.floor(Math.random() * disponibles.length)]

  db[usadasKey].push(frase)
  return frase
}

let handler = async (m, { conn }) => {

  let db = loadDB()

  // Probabilidades
  const rand = Math.random()

  let frase
  let tipo

  if (rand < 0.4) {
    tipo = "🍀 *Fortuna Rara*"
    frase = obtenerFrase(raras, 'usadasRaras', db)
  } else if (rand < 0.8) {
    tipo = "🥠 *Fortuna Normal*"
    frase = obtenerFrase(normales, 'usadas', db)
  } else {
    tipo = "💀 *Fortuna Mala*"
    frase = obtenerFrase(malas, 'usadasMalas', db)
  }

  saveDB(db)

  const texto = `
${tipo}

"${frase}"

✨ El destino ha hablado...
`.trim()

  const img = await (await fetch('https://files.catbox.moe/xli6lh.jpg')).buffer()

  await conn.sendMessage(m.chat, {
    text: texto,
    contextInfo: {
      externalAdReply: {
        title: "🥠 Galleta de la Fortuna",
        body: "Mensaje del destino",
        thumbnail: img,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.help = ['fortuna']
handler.tags = ['fun']
handler.command = ['fortuna']

export default handler
