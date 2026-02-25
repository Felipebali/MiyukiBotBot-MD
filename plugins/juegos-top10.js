// 📂 plugins/top10.js — FULL COMPATIBLE CON CUALQUIER LOADER
console.log('[Plugin] top10 cargado');

let handler = async (m, { conn, groupMetadata, text, command }) => {
  try {
    const chat = global.db.data.chats[m.chat] || {};

    // 🔒 Juegos activados?
    if (chat.games === false) return;

    // Validar que el usuario haya puesto un texto
    if (!text) {
      return await conn.sendMessage(m.chat, {
        text: '❌ Debes escribir algo.\n\n👉 *Uso correcto:* `.top10 <texto>`\nEjemplo: `.top10 los más guapos`'
      });
    }

    // Obtener participantes reales del grupo
    const participants = groupMetadata?.participants
      .filter(p => !p.id.includes('status@broadcast'));

    if (!participants || participants.length === 0) {
      return await conn.sendMessage(m.chat, { text: '❌ No hay participantes en el grupo.' });
    }

    // Mezclar y seleccionar 10
    const shuffled = participants.sort(() => 0.5 - Math.random());
    const top10 = shuffled.slice(0, 10);

    // Crear lista final con menciones
    const listTop = top10
      .map((v, i) => `🩸 ${i + 1}. @${v.id.split('@')[0]} 🩸`)
      .join('\n');

    // Texto final usando lo que el usuario escribió
    const finalText = `🩸🖤 *TOP 10 - ${text.toUpperCase()}* 🖤🩸

${listTop}
🩸━━━━━━━━━━━━🩸`;

    // Enviar con menciones
    await conn.sendMessage(m.chat, {
      text: finalText,
      mentions: top10.map(v => v.id)
    });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al generar el top 10.' });
  }
};

// 🔥 Compatibilidad máxima para cualquier loader
handler.help = ['top10 <texto>'];
handler.tags = ['fun', 'juego'];
handler.group = true;

// Formato normal
handler.command = ['top10'];

// Regex alternativo por si el loader lo usa
handler.command = handler.command || /^top10$/i;

// Permitir alias en loader
handler.customPrefix = null;
handler.register = true;

export default handler;
