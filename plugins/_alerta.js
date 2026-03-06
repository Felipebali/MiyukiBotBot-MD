let handler = async (m, { conn, text }) => {

  if (!text)
    return m.reply('⚠️ Usa el comando así:\n.alerta mensaje')

  const grupoDestino = '120363424917153708@g.us'

  try {

    // obtener participantes del grupo destino
    const metadata = await conn.groupMetadata(grupoDestino)
    const participantes = metadata.participants.map(p => p.id)

    const mensaje = `🚨 ALERTA

${text}

⚠️ Mensaje enviado por un creador.`

    await conn.sendMessage(
      grupoDestino,
      {
        text: mensaje,
        mentions: participantes
      },
      { quoted: m }
    )

    m.reply('✅ Alerta enviada al grupo.')

  } catch (e) {
    console.error(e)
    m.reply('❌ No se pudo enviar la alerta.')
  }
}

handler.command = ['alerta']

export default handler
