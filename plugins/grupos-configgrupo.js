const handler = async (m, { conn, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) 
    return conn.sendMessage(m.chat, { text: '❗ Este comando solo funciona en grupos.' });

  // Validación: admin o owner
  if (!isAdmin && !isOwner) 
    return conn.sendMessage(m.chat, { text: '🛡️ Solo los administradores o dueños pueden usar este comando.' });

  if (!isBotAdmin) 
    return conn.sendMessage(m.chat, { text: '🤖 Necesito ser administrador para cambiar la configuración del grupo.' });

  try {
    const groupInfo = await conn.groupMetadata(m.chat);
    const isClosed = groupInfo.announce || false; // true = cerrado, false = abierto
    let text = '';

    if (isClosed) {
      // Abrir grupo
      await conn.groupSettingUpdate(m.chat, 'not_announcement');
      text = '🔓 *El grupo ha sido abierto.*\nAhora todos pueden enviar mensajes. 🥹';
    } else {
      // Cerrar grupo
      await conn.groupSettingUpdate(m.chat, 'announcement');
      text = '🔒 *El grupo ha sido cerrado.*\nSolo los administradores pueden enviar mensajes. 🥺';
    }

    await conn.sendMessage(m.chat, { text });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { text: '❌ Error al cambiar la configuración del grupo.' });
  }
}

handler.help = ['g'];
handler.tags = ['grupo'];
handler.command = ['g'];
handler.group = true;
handler.botAdmin = true;
handler.admin = false;  // Lo controlamos dentro del handler
handler.rowner = false; // Lo controlamos dentro del handler

export default handler;
