// 📂 plugins/_autoread.js — AUTO READ ESTABLE

let handler = async (m, { conn }) => {}

handler.before = async function (m, { conn }) {
  try {
    if (!m.key || m.key.fromMe) return

    // Enviar recibo de lectura al servidor
    await conn.readMessages([m.key])
  } catch {}
}

export default handler
