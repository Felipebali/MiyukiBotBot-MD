// plugins/_autodelete-teeliminó.js (versión confiable)
const frases = [/te\s*elimin[oó]\.?/i]

let handler = async (m, { conn }) => {
  if (!m.isGroup) return

  const texto = m.text || ''
  if (!frases.some(r => r.test(texto))) return
  // Borra el mensaje
  try {
    await conn.sendMessage(m.chat, { delete: m.key })
  } catch (e) {
    console.error('No se pudo eliminar mensaje "Te eliminó":', e)
  }
}

handler.before = async (m, { conn }) => {
  await handler(m, { conn })
  return true // evita que otros plugins procesen el mensaje
}

handler.customPrefix = /^te\s*elimin[oó]\.?$/i
handler.command = new RegExp()
handler.group = true

export default handler
