// 🔹 Kick solo mencionando o citando, sin mensaje de aviso
const handler = async (m, { conn, isAdmin, command }) => {
  const emoji = '🔪';
  const sender = m.sender.replace(/\D/g, '');

  const ownersBot = ['59898719147', '59896026646', '59892363485']; // dueños del bot

  // Obtener info del grupo
  let groupInfo;
  try {
    groupInfo = await conn.groupMetadata(m.chat);
  } catch {
    return; // no hacemos nada si falla
  }

  const ownerGroup = groupInfo.owner ? groupInfo.owner.replace(/\D/g, '') : null;
  const botJid = conn.user.jid.replace(/\D/g, '');
  const protectedList = [...ownersBot, botJid, ownerGroup].filter(Boolean);

  // ---------- PERMISO ----------
  if (!isAdmin && !ownersBot.includes(sender) && sender !== ownerGroup) return;

  // ---------- DETECTAR USUARIO ----------
  const user = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!user) return; // solo kick si mencionan o citan

  const userNorm = String(user).replace(/\D/g, '');

  // ---------- PROTEGIDOS ----------
  if (protectedList.includes(userNorm)) return;

  // ---------- EXPULSAR ----------
  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
    try { await m.react(emoji); } catch {}
  } catch (err) {
    console.log('Error expulsando:', err);
  }
};

handler.help = ['k'];
handler.tags = ['grupo'];
handler.command = ['k', 'echar', 'hechar', 'sacar'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
