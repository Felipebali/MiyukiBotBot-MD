let handler = async (m, { conn, text }) => {

  if (!m.isGroup)
    return m.reply('❌ Este comando solo funciona en grupos.')

  if (!m.isAdmin)
    return m.reply('❌ Solo administradores pueden usarlo.')

  if (!text)
    return m.reply('⚠️ Usa el comando así:\n.unir 59812345678')

  // Limpiar número
  let numero = text.replace(/[^0-9]/g, '')

  if (numero.length < 8)
    return m.reply('❌ Número inválido.')

  let user = numero + '@s.whatsapp.net'

  try {

    // Intentar añadir
    let res = await conn.groupParticipantsUpdate(
      m.chat,
      [user],
      'add'
    )

    let status = res?.[0]?.status

    if (status === 200) {
      return conn.sendMessage(
        m.chat,
        {
          text: `✅ Usuario ${numero} añadido correctamente.`,
          mentions: [user]
        },
        { quoted: m }
      )
    }

    // Si no se pudo añadir → enviar link
    let code = await conn.groupInviteCode(m.chat)
    let link = `https://chat.whatsapp.com/${code}`

    return conn.sendMessage(
      m.chat,
      {
        text: `⚠️ No se pudo añadir directamente.\n📩 Enlace del grupo:\n${link}`,
        mentions: [user]
      },
      { quoted: m }
    )

  } catch (e) {

    console.error(e)

    try {
      let code = await conn.groupInviteCode(m.chat)
      let link = `https://chat.whatsapp.com/${code}`

      return m.reply(`⚠️ No se pudo añadir.\nAquí el enlace:\n${link}`)
    } catch {
      return m.reply('❌ Error al intentar unir al usuario.')
    }
  }
}

handler.command = ['unir']
handler.group = true
handler.admin = true

export default handler
