const handler = async (m, { conn, isAdmin }) => {
  const emoji = '🔪';
  const sender = m.sender.replace(/\D/g, '');

  const ownersBot = ['59898719147', '59896026646', '59892363485']; // dueños del bot

  // Obtener info del grupo
  let groupInfo;
  try {
    groupInfo = await conn.groupMetadata(m.chat);
  } catch {
    return conn.reply(m.chat, '❌ No se pudo obtener información del grupo.', m);
  }

  const ownerGroup = groupInfo.owner ? groupInfo.owner.replace(/\D/g, '') : null;
  const botJid = conn.user.jid.replace(/\D/g, '');
  const protectedList = [...ownersBot, botJid, ownerGroup].filter(Boolean);

  // ---------- PERMISO ----------
  if (!isAdmin && !ownersBot.includes(sender) && sender !== ownerGroup) {
    return conn.reply(
      m.chat,
      '❌ Solo admins, el dueño del grupo o los dueños del bot pueden usar este comando.',
      m
    );
  }

  // ---------- DETECTAR USUARIO ----------
  let user = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!user) return conn.reply(m.chat, '📌 Debes mencionar o citar un mensaje para expulsar.', m);

  const normalize = jid => String(jid || '').replace(/\D/g, '');
  const userNorm = normalize(user);

  // ---------- INTENTO DE EXPULSAR AL DUEÑO DEL GRUPO ----------
  if (userNorm === ownerGroup && sender !== ownerGroup && !ownersBot.includes(sender)) {
    return conn.sendMessage(m.chat, {
      text: `😏 Tranquilo campeón... @${user.split('@')[0]} es el dueño del grupo.\nNi los dioses del código pueden echarlo.`,
      mentions: [user]
    });
  }

  // ---------- PROTEGIDOS ----------
  if (protectedList.includes(userNorm)) {
    return conn.reply(m.chat, '😎 Es imposible eliminar a alguien protegido.', m);
    }

  // ---------- EXPULSAR ----------
  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');

    // Reacción (se mantiene)
    try { await m.react(emoji); } catch {}

    // ❌ No se envía mensaje de aviso aquí

  } catch (err) {
    console.log('Error expulsando:', err);
    return conn.reply(
      m.chat,
      '❌ No se pudo expulsar al usuario. Asegúrate de que el bot sea administrador y tenga permisos.',
      m
    );
  }
};

handler.help = ['k'];
handler.tags = ['grupo'];
handler.command = ['k', 'echar', 'hechar', 'sacar'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
