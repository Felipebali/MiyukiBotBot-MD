const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // Dueños del bot
const specialNumber = '59895044754@s.whatsapp.net'; // Persona con rango único

const handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.');

  const sender = m.sender;
  const isOwner = ownerNumbers.includes(sender);
  const senderData = participants.find(p => p.id === sender);
  const isAdmin = senderData?.admin;

  // Solo dueños o administradores pueden usar el comando
  if (!isOwner && !isAdmin) {
    return m.reply('🚫 Solo los administradores o los dueños pueden usar este comando.');
  }

  const admins = participants.filter(p => p.admin);
  const ownersInGroup = participants.filter(p => ownerNumbers.includes(p.id));
  const specialUser = participants.find(p => p.id === specialNumber);
  const otherAdmins = admins.filter(a => !ownerNumbers.includes(a.id) && a.id !== specialNumber);

  const ownerTitles = {
    '59898719147@s.whatsapp.net': 'Dueño Principal 👑',
    '59896026646@s.whatsapp.net': 'Creador Asociado 👑'
  };

  const specialTitle = '💫 Miembro Especial 💫';

  // Texto principal
  let texto = `👥 *Administración del Grupo*\n\n`;

  if (ownersInGroup.length > 0) {
    texto += `👑 *Dueños del Grupo:*\n`;
    texto += ownersInGroup
      .map(o => `${ownerTitles[o.id] || 'Dueño'} @${o.id.split('@')[0]}`)
      .join('\n');
    texto += `\n\n`;
  }

  if (specialUser) {
    texto += `${specialTitle}\n@${specialUser.id.split('@')[0]}\n\n`;
  }

  const adminText = otherAdmins
    .map(a => `• @${a.id.split('@')[0]}`)
    .join('\n');

  texto += `🛡️ *Administradores:*\n${adminText || 'Ninguno'}\n\n`;
  texto += `✅ *Comando ejecutado por:* @${sender.split('@')[0]}`;

  const allMentions = [
    sender,
    ...ownersInGroup.map(o => o.id),
    ...(specialUser ? [specialUser.id] : []),
    ...otherAdmins.map(a => a.id)
  ];

  await conn.sendMessage(m.chat, { text: texto, mentions: allMentions }, { quoted: m });
};

handler.command = ['admins'];
handler.tags = ['group'];
handler.help = ['admins'];
handler.group = true;

export default handler;
