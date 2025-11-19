// 📂 plugins/aprobar.js — Aprueba todas las solicitudes sin responder al comando
let handler = async (m, { conn, isAdmin }) => {
  const owners = ['59896026646', '59898719147', '59892363485'];
  const sender = m.sender.split('@')[0];

  if (!isAdmin && !owners.includes(sender)) return;

  try {
    const pendingList = await conn.groupRequestParticipantsList(m.chat);

    if (!pendingList || pendingList.length === 0) {
      // Enviar mensaje normal sin citar el comando
      return conn.sendMessage(m.chat, { text: '✅ No hay solicitudes pendientes de aprobación.' }, { quoted: null });
    }

    for (const user of pendingList) {
      try {
        await conn.groupRequestParticipantsUpdate(m.chat, [user.jid], 'approve');
        console.log(`✅ Aprobado: ${user.jid}`);
        await new Promise(r => setTimeout(r, 2500)); // Espera 2.5 segundos entre aprobaciones
      } catch (err) {
        console.log('❌ Error al aprobar a:', user.jid, err);
      }
    }

    // Mensaje final sin citar el comando
    await conn.sendMessage(m.chat, { text: '🎉 Todas las solicitudes pendientes fueron aprobadas.' }, { quoted: null });

  } catch (err) {
    console.error('Error general al aprobar solicitudes:', err);
    await conn.sendMessage(
      m.chat,
      { text: '⚠️ Ocurrió un error al intentar aprobar las solicitudes. Asegúrate de que el bot sea administrador.' },
      { quoted: null }
    );
  }
};

handler.help = ['ap', 'aprobar'];
handler.tags = ['group'];
handler.command = ['ap', 'aprobar'];
handler.group = true;
handler.botAdmin = true;

export default handler;
