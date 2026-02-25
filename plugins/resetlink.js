// 📂 plugins/resetlink.js — Reset link solo para owners 🔗

console.log('[Plugin] resetlink cargado') // <-- Log para confirmar carga en Termux

const owners = ['59896026646@s.whatsapp.net', '59898719147@s.whatsapp.net'];

let handler = async (m, { conn, isOwner, isBotAdmin }) => {
  try {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

    const sender = m.sender
    if (!owners.includes(sender)) return

    if (!isBotAdmin) return m.reply('❌ Necesito ser administrador del grupo para resetear el link.')

    // Resetea el link del grupo
    const res = await conn.groupRevokeInvite(m.chat)

    // Envía el nuevo link
    await conn.sendMessage(m.chat, { 
      text: `🔗 *Link del grupo reseteado correctamente*\n\nNuevo link:\nhttps://chat.whatsapp.com/${res}`
    })

  } catch (e) {
    console.error('Error en resetlink:', e)
    m.reply('⚠️ Ocurrió un error al intentar resetear el link.')
  }
}

// Compatibilidad con distintos loaders
handler.command = ['resetlink'] // array de comandos
handler.command = handler.command || /^\.resetlink$/i // regex alternativa

handler.help = ['resetlink']
handler.tags = ['owner', 'group']
handler.group = true

// Meta para loader: solo owners
handler.owner = true
handler.rowner = true

export default handler
