// plugins/dar-quitar.js
// Comandos: .dar / .quitar
// Solo OWNER puede usarlos

console.log('[Plugin] dar-quitar cargado');

const handler = async (m, { conn, command }) => {
  try {
    if (!m.isGroup)
      return await conn.sendMessage(m.chat, { text: '⚠️ Este comando solo funciona en grupos.' }, { quoted: m });

    // --- NUMEROS PROTEGIDOS ---
    const ownerNumbers = [
      '59896026646@s.whatsapp.net',
      '59898719147@s.whatsapp.net'
    ];
    const botNumber = '59892682421@s.whatsapp.net'; // tu bot

    // --- INFO DEL GRUPO ---
    const group = await conn.groupMetadata(m.chat);
    const participants = group.participants || [];
    const groupOwner = group.owner || '';

    const admins = participants.filter(p => p.admin).map(p => p.id);
    const members = participants.map(p => p.id);

    // --- DAR ADMIN A TODOS ---
    if (command === 'dar') {

      const toPromote = members.filter(
        id => !admins.includes(id) &&
        id !== botNumber &&
        !ownerNumbers.includes(id)
      );

      if (toPromote.length === 0)
        return await conn.sendMessage(m.chat, { text: '✅ Todos los miembros ya son administradores.' }, { quoted: m });

      for (let id of toPromote) {
        await conn.groupParticipantsUpdate(m.chat, [id], 'promote');
        await new Promise(res => setTimeout(res, 1000));
      }

      await conn.sendMessage(m.chat, {
        text: `🟢 Se dio admin a *${toPromote.length}* miembros.`,
        mentions: toPromote
      }, { quoted: m });
    }

    // --- QUITAR ADMIN A TODOS ---
    if (command === 'quitar') {

      const toDemote = participants
        .filter(p =>
          (p.admin === 'admin' || p.admin === 'superadmin') &&
          p.id !== groupOwner &&
          p.id !== botNumber &&
          !ownerNumbers.includes(p.id)
        )
        .map(p => p.id);

      if (toDemote.length === 0)
        return await conn.sendMessage(m.chat, { text: 'ℹ️ No hay administradores que quitar (excepto el creador, bot y owners).' }, { quoted: m });

      for (let id of toDemote) {
        await conn.groupParticipantsUpdate(m.chat, [id], 'demote');
        await new Promise(res => setTimeout(res, 1000));
      }

      const mentionsText = toDemote.map(jid => `@${jid.split('@')[0]}`).join(', ');
      await conn.sendMessage(m.chat, {
        text: `🚨 Se les ha quitado el admin a:\n${mentionsText}`,
        mentions: toDemote
      }, { quoted: m });
    }

  } catch (err) {
    console.error('❌ Error en dar-quitar.js:', err);
    await conn.sendMessage(m.chat, { text: '⚠️ Ocurrió un error al ejecutar el comando.' }, { quoted: m });
  }
};

// Datos del comando
handler.help = ['dar', 'quitar'];
handler.tags = ['owner'];

// ✅ ARRAY para detección de comandos
handler.command = ['dar', 'quitar'];

handler.group = true;
handler.rowner = true; // solo owners reales del bot

export default handler;
