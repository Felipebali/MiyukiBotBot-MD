// 📂 plugins/kick-admins.js
let handler = async (m, { conn }) => {
  try {
    if (!/^\.ka$/i.test(m.text)) return // Solo responde a ".ka"
    await conn.sendMessage(m.chat, { react: { text: '💀', key: m.key } })

    const groupMetadata = await conn.groupMetadata(m.chat)
    const participants = groupMetadata.participants

    // 🔒 ID real del bot (con y sin sufijo)
    const botJid = conn.decodeJid(conn.user.id)
    const botNumber = botJid.split('@')[0].replace(/[^0-9]/g, '') // solo número

    // 🔹 Dueños protegidos
    const owners = ['59898719147', '59896026646']

    // 🔹 Administradores a expulsar (excluyendo bot y dueños)
    const admins = participants.filter(p => {
      if (!p.admin) return false
      const num = p.id.split('@')[0].replace(/[^0-9]/g, '')
      return num !== botNumber && !owners.includes(num)
    })

    if (admins.length === 0) {
      await conn.sendMessage(m.chat, { text: '😺 No hay administradores que expulsar.' })
      return
    }

    // 🔨 Expulsar uno por uno
    for (const admin of admins) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [admin.id], 'remove')
        await new Promise(r => setTimeout(r, 1500))
      } catch (err) {
        console.log(`⚠️ No se pudo expulsar a ${admin.id}:`, err.message)
      }
    }

  } catch (e) {
    console.error('⚠️ Error en .ka:', e)
  }
}

handler.customPrefix = /^\.ka$/i
handler.command = new RegExp
handler.group = true
handler.owner = true

export default handler
