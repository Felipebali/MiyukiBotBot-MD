const { proto } = (await import('@whiskeysockets/baileys')).default;

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.isGroup) return;

  if (!text) {
    return m.reply(`${emoji || ''} Por favor, ingresa el número de la persona a la que quieres invitar.\n\n*Ejemplo:*\n*${usedPrefix + command} 5211234567890*`);
  }

  const number = text.replace(/[^0-9]/g, '');
  if (isNaN(number)) {
    return m.reply('❌ El número ingresado no es válido. Asegúrate de incluir el código de país sin el símbolo "+".');
  }

  const userJid = `${number}@s.whatsapp.net`;

  try {
    const [result] = await conn.onWhatsApp(userJid);
    if (!result || !result.exists) {
      return m.reply(`❌ El número *${number}* no tiene una cuenta de WhatsApp.`);
    }

    const inviteCode = await conn.groupInviteCode(m.chat);
    const inviteUrl = 'https://chat.whatsapp.com/' + inviteCode;

    // Enviar solo el enlace al usuario
    await conn.sendMessage(userJid, { text: inviteUrl });

    // Confirmación simple sin mencionar nada
    m.reply(`✅ Enlace de invitación enviado.`);

  } catch (e) {
    console.error("Error al enviar invitación:", e);
    m.reply(`❌ Ocurrió un error al enviar la invitación.`);
  }
};

handler.help = ['invitar <número>', 'add <número>'];
handler.tags = ['group'];
handler.command = ['add', 'agregar', 'añadir', 'invite', 'invitar'];

handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
