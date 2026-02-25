const handler = async (m, { conn }) => {
  let txt = '';

  try {
    const groups = Object.entries(conn.chats)
      .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);

    const totalGroups = groups.length;

    // Bot JID real normalizado
    const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    for (let i = 0; i < groups.length; i++) {
      const [jid] = groups[i];

      // Obtener metadata real del grupo
      const metadata = await conn.groupMetadata(jid).catch(() => null) || {};
      const participants = metadata.participants || [];

      // Nueva forma correcta de detectar admins en Baileys 2024/2025
      const adminList = participants
        .filter(p => p.isAdmin || p.isSuperAdmin)
        .map(p => p.id.replace(/:.*$/, ''));

      const isBotAdmin = adminList.includes(botJid.replace(/:.*$/, ''));

      const isParticipant = participants.some(
        p => p.id.replace(/:.*$/, '') === botJid.replace(/:.*$/, '')
      );

      let inviteLink = '--- (No admin) ---';

      if (isBotAdmin) {
        try {
          const code = await conn.groupInviteCode(jid);
          inviteLink = `https://chat.whatsapp.com/${code}`;
        } catch {
          inviteLink = '--- (Error obteniendo código) ---';
        }
      }

      txt += `*◉ Grupo ${i + 1}*
*➤ Nombre:* ${metadata.subject || '(Sin nombre)'}
*➤ ID:* ${jid}
*➤ Admin:* ${isBotAdmin ? '✔ Sí' : '❌ No'}
*➤ Estado:* ${isParticipant ? '👤 Participante' : '❌ Ex participante'}
*➤ Total Participantes:* ${participants.length}
*➤ Link:* ${inviteLink}

`;
    }

    return m.reply(
      `*Lista de grupos del Bot* 🤖\n\n` +
      `*—◉ Total de grupos:* ${totalGroups}\n\n${txt}`
    );

  } catch (e) {
    console.log('Error listgroup:', e);
    return m.reply('❌ Error al obtener la lista de grupos.');
  }
};

handler.help = ['groups', 'grouplist'];
handler.tags = ['owner'];
handler.command = ['listgroup', 'gruposlista', 'grouplist', 'listagrupos'];
handler.rowner = true;

export default handler;
