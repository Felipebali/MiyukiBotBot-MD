// 📂 plugins/top10.js — FULL COMPATIBLE CON CUALQUIER LOADER
console.log('[Plugin] top10 cargado');

let handler = async (m, { conn, command, args }) => {
  try {
    const chatData = global.db.data.chats[m.chat] || {};

    // 🔒 Juegos activados?
    if (!chatData.games) return;

    // Validar que el usuario haya escrito algo
    const text = args?.join(' ');
    if (!text) {
      return conn.sendMessage(m.chat, {
        text: '❌ Debes escribir algo.\n\n👉 *Uso correcto:* `.top10 <texto>`\nEjemplo: `.top10 los más guapos`'
      });
    }

    // Obtener metadata del grupo
    const metadata = await conn.groupMetadata(m.chat).catch(() => null);
    const participants = metadata?.participants?.filter(p => !p.id.includes('status@broadcast'));
    if (!participants || participants.length === 0) {
      return conn.sendMessage(m.chat, { text: '❌ No hay participantes en el grupo.' });
    }

    // Mezclar y tomar top 10
    const shuffled = participants.sort(() => 0.5 - Math.random());
    const top10 = shuffled.slice(0, 10);

    // Armar lista con menciones
    const listTop = top10
      .map((p, i) => `🩸 ${i + 1}. @${p.id.split('@')[0]} 🩸`)
      .join('\n');

    const finalText = `🩸🖤 *TOP 10 - ${text.toUpperCase()}* 🖤🩸\n\n${listTop}\n🩸━━━━━━━━━━━━🩸`;

    // Enviar mensaje con menciones
    await conn.sendMessage(m.chat, { text: finalText, mentions: top10.map(p => p.id) });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al generar el top 10.' });
  }
};

// 🔥 Configuración del handler
handler.help = ['top10 <texto>'];
handler.tags = ['fun', 'juego'];
handler.group = true;
handler.command = ['top10'];
handler.register = true;

export default handler;
