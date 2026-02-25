// 📂 plugins/_modoadmin-filter.js

let handler = async (m, { conn, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return

    const chat = global.db?.data?.chats?.[m.chat]
    if (!chat || !chat.modoadmin) return

    if (!m.text) return
    const body = m.text.trim()

    if (!body.startsWith('.')) return

    const command = body.slice(1).split(' ')[0].toLowerCase()

    // ✅ Comandos permitidos aunque esté activo
    const permitidos = ['modoadmin', 'menu']

    if (permitidos.includes(command)) return

    // ⛔ Si no es admin ni owner → BLOQUEO REAL
    if (!(isAdmin || isOwner)) {
      await conn.reply(
        m.chat,
        `🚫 *MODO ADMIN ACTIVADO*\n\nSolo los administradores pueden usar comandos.\n\n⛔ Bloqueado: *.${command}*`,
        m
      )

      return true // 🔥 ESTE return es el bloqueo real
    }

  } catch (e) {
    console.error('Error en _modoadmin-filter:', e)
  }
}

// ✅ ESTO ES LO QUE TU LOADER SÍ SOPORTA
handler.all = true

export default handler
