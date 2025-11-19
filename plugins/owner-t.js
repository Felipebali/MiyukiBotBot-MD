// plugins/t_sinPrefijo.js
import { randomInt } from 'crypto'

let mensajesDivertidos = [
  "🎉 ¡Hey! Todos deberían leer esto 😏",
  "👀 Atención, atención… algo raro está pasando",
  "😈 No puedo decir mucho, pero todos tienen que verlo",
  "🔥 Sorpresa misteriosa para todos ustedes",
  "🤖 El bot dice: ¡Hola a todos sin que lo sepan!",
  "😜 Alguien tiene que reaccionar primero…",
  "👹 Esto es un mensaje secreto solo para ustedes",
  "😏 ¿Quién se atreve a contestar primero?",
  "⚡ Algo está por pasar… atentos todos",
  "🎭 Veamos quién está prestando atención…",
  "🩸 Nadie se lo espera, pero todos lo recibirán",
  "💀 Cuidado, esto podría cambiar el juego",
  "👁️ Todos están siendo observados…",
  "🔥 Esto es solo el comienzo de la diversión",
  "🤫 Misterio activado, lean con cuidado"
]

let historialMensajes = {}

let handler = async (m, { conn, groupMetadata }) => {
  if (!m.isGroup) return; // solo grupos

  // Solo owners
  const owners = ['59898719147','59896026646', '59892363485'] // números sin @
  const sender = m.sender.split('@')[0]
  if (!owners.includes(sender)) return

  // Inicializa historial
  if (!historialMensajes[m.chat]) historialMensajes[m.chat] = []

  // Filtra mensajes ya usados
  let disponibles = mensajesDivertidos.filter(msg => !historialMensajes[m.chat].includes(msg))
  if (disponibles.length === 0) {
    historialMensajes[m.chat] = []
    disponibles = [...mensajesDivertidos]
  }

  // Elegir aleatorio
  let mensaje = disponibles[randomInt(0, disponibles.length)]
  historialMensajes[m.chat].push(mensaje)

  // Obtener participantes para mención oculta
  const participantes = (groupMetadata?.participants || []).map(u => u.id).filter(Boolean)

  await conn.sendMessage(m.chat, {
    text: mensaje,
    contextInfo: { mentionedJid: participantes }
  })
}

// Configuración sin prefijo y solo owners
handler.customPrefix = /^u$/i // activar escribiendo solo "u"
handler.command = new RegExp()       // sin prefijo
handler.group = true                 // solo grupos
handler.owner = true                 // solo owners
handler.register = false             // no requiere registro

export default handler
