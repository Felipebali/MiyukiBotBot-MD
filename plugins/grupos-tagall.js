let handler = async function (m, { conn, groupMetadata, args, isAdmin, isOwner }) {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

  if (!conn.user || !conn.user.id) {
    return m.reply('❌ Este comando está protegido y no puede ser usado fuera de Felix-Cat Bot.');
  }

  // ✅ Mensaje solo texto para usuarios no admins
  if (!(isAdmin || isOwner)) {
    await conn.sendMessage(m.chat, {
      text: '❌ Solo un administrador puede usar este comando.',
      mentions: [m.sender]
    });
    throw false;
  }

  const participantes = groupMetadata?.participants || [];
  const mencionados = participantes.map(p => p.id).filter(Boolean);

  const mensajeOpcional = args.length ? args.join(' ') : '⚡ Sin mensaje extra.';

  const mensaje = [
    `🔥 Se activó el tag de todos! 🔥`,
    `⚡ Usuarios invocados:`,
    mencionados.map(jid => `- @${jid.split('@')[0]}`).join('\n'),
    '💥 Que comience la acción!',
    'https://miunicolink.local/tagall-FelixCat'
  ].join('\n');

  await conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: mencionados.concat(m.sender)
  });
};

handler.command = ['invocar', 'todos', 'tagall'];
handler.help = ['invocar *<mensaje>*'];
handler.tags = ['grupos'];
handler.group = true;
handler.admin = true;

export default handler;
