// 📂 plugins/antiver.js — FELI 2025
// Auto-lee TODOS los mensajes de grupos (Baileys MD FIX)

export async function before(m, { conn }) {
  try {
    if (!m.isGroup) return
    if (!m.key || !m.key.id) return
    if (m.fromMe) return

    // 🔥 FORZAR KEY CORRECTA (FIX BAILEYS)
    await conn.readMessages([{
      remoteJid: m.chat,
      id: m.key.id,
      participant: m.key.participant || m.sender
    }])

  } catch (e) {
    console.error('ANTIVER error:', e)
  }
}
