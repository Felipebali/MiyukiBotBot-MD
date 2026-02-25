let handler = async (m, { conn, args }) => {
  if (!m.isGroup) 
    return conn.reply(m.chat, '⚠️ Este comando solo funciona en grupos.', m);

  if (!args[0])
    return conn.reply(m.chat, '⚠️ Usa: .ht <mensaje>', m);

  // Obtener todos los participantes del grupo
  const groupMetadata = await conn.groupMetadata(m.chat);
  const mentions = groupMetadata.participants.map(p => p.id);

  // Enviar mensaje con hidetag minimalista
  await conn.sendMessage(m.chat, {
    text: args.join(' '),
    mentions
  });
};

handler.command = ['ht'];
handler.help = ['ht <mensaje>'];
handler.tags = ['group'];
handler.group = true;
handler.admin = true; // Solo admins
export default handler;
