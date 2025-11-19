// plugins/ruletabanF.js
// Activador: letra "F" o "f" (sin prefijo)
// Solo owners pueden usarlo
// Expulsa un usuario aleatorio (no admin, bot ni owner)
// No menciona quién lo activó, no cita mensajes

let handler = async (m, { conn, groupMetadata }) => {
  try {
    if (!m.isGroup) return;

    const text = (m.text || '').trim();
    if (text.toLowerCase() !== 'f') return;

    // Dueños autorizados
    const BOT_OWNERS = ['59896026646', '59898719147', '59892363485'];
    const ownersJids = BOT_OWNERS.map(n => n + '@s.whatsapp.net');

    // Verificar si quien lo usa es owner
    if (!ownersJids.includes(m.sender)) return;

    const participants = groupMetadata?.participants || [];

    // Filtrar participantes elegibles
    const elegibles = participants
      .filter(p => {
        const jid = p.id;
        const isPartAdmin = p.admin === 'admin' || p.admin === 'superadmin';
        const isBot = jid === conn.user.jid;
        const isGroupOwner = groupMetadata.owner && jid === groupMetadata.owner;
        const isBotOwner = ownersJids.includes(jid);
        return !isPartAdmin && !isBot && !isGroupOwner && !isBotOwner;
      })
      .map(p => p.id);

    if (!elegibles.length)
      return conn.sendMessage(m.chat, { text: '❌ No hay usuarios elegibles para expulsar.' });

    const elegido = elegibles[Math.floor(Math.random() * elegibles.length)];

    try {
      await conn.groupParticipantsUpdate(m.chat, [elegido], 'remove');
      await conn.sendMessage(m.chat, {
        text: `💀 El destino decidió... @${elegido.split('@')[0]} fue eliminado del grupo.`,
        mentions: [elegido]
      });
    } catch (err) {
      console.error('Error expulsando usuario:', err);
      conn.sendMessage(m.chat, {
        text: '❌ No pude eliminar al usuario. Asegurate de que el bot tenga permisos de administrador.'
      });
    }
  } catch (err) {
    console.error('ruletabanF:', err);
    conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al ejecutar la ruleta.' });
  }
};

handler.customPrefix = /^\s*f\s*$/i;
handler.command = new RegExp();
handler.group = true;

export default handler;
