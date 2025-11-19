// 📂 plugins/_sortear.js
/**
 * Comando: .sortear
 * Solo para dueños 👑
 * Sortea un ganador entre los miembros del grupo
 * Autor: Feli 💀
 */

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // dueños del bot

const handler = async (m, { conn, args, groupMetadata }) => {
  try {
    if (!m.isGroup) return; // Solo en grupos
    if (!ownerNumbers.includes(m.sender)) return; // Solo dueños

    // Obtener el texto del premio
    const premio = args.join(' ');
    if (!premio) {
      return conn.reply(m.chat, '💡 Usa el comando así:\n*.sortear [premio]*\n\nEjemplo:\n.sortear una noche en un jacuzzi', m);
    }

    // Obtener participantes
    const participants = groupMetadata?.participants?.map(p => p.id) || [];
    if (participants.length === 0) return conn.reply(m.chat, '⚠️ No hay participantes en el grupo.', m);

    // Elegir ganador al azar
    const ganador = participants[Math.floor(Math.random() * participants.length)];

    // Enviar mensaje final
    await conn.sendMessage(m.chat, {
      text: `🎉 *¡Sorteo completado!* 🎉\n\n🏆 *@${ganador.split('@')[0]}* ganó ${premio}! 🥳`,
      mentions: [ganador]
    });

  } catch (err) {
    console.error('Error en sortear:', err);
    conn.reply(m.chat, '❌ Hubo un error al realizar el sorteo.', m);
  }
};

handler.help = ['sortear'];
handler.tags = ['owner'];
handler.command = ['sortear'];
handler.group = true;
handler.rowner = true; // Solo dueños

export default handler;
