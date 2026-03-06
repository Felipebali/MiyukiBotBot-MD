let handler = async (m, { conn, text }) => {

  if (!text) {
    return m.reply('⚠️ Usa el comando así:\n.alerta mensaje')
  }

  const grupoDestino = '120363424917153708@g.us'

  try {

    // obtener participantes del grupo destino
    const metadata = await conn.groupMetadata(grupoDestino)

    // lista de menciones ocultas
    const menciones = metadata.participants.map(u => u.id)

    const mensaje = `🚨 ALERTA 🚨

${text}`

    await conn.sendMessage(
      grupoDestino,
      {
        text: mensaje,
        mentions: menciones
      }
    )

    m.reply('✅ Alerta enviada.')

  } catch (err) {
    console.error(err)
    m.reply('❌ No se pudo enviar la alerta.')
  }
}

handler.command = ['alerta']

export default handler
