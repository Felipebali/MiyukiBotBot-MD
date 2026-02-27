// 📂 plugins/top10.js — FelixCat-Bot 🩸
console.log('[Plugin] top10 cargado');

let handler = async (m, { conn, groupMetadata, command }) => {
  try {
    const chatId = m.chat;
    const chatData = global.db.data.chats[chatId] || {};
    if (!chatData.games) return; // Juegos desactivados
    if (!m.isGroup) return conn.sendMessage(chatId, { text: '❌ Este comando solo funciona en grupos.' });

    // 🔹 Texto después del comando
    let text = m.text?.trim();
    if (!text) return conn.sendMessage(chatId, { text: '❌ Debes escribir algo.\nUso: `.top10 <texto>`' });
    text = text.replace(new RegExp(`^\\.${command}\\s*`, 'i'), '').trim();
    if (!text) return conn.sendMessage(chatId, { text: '❌ Debes escribir algo después del comando.' });

    // 🔹 Participantes del grupo
    let participants = groupMetadata?.participants?.filter(p => p.id && !p.id.includes('status@broadcast'));
    if (!participants || participants.length === 0) return conn.sendMessage(chatId, { text: '❌ No hay participantes en el grupo.' });

    // 🔹 Mezclar y seleccionar top 10
    let shuffled = participants.sort(() => 0.5 - Math.random());
    let topCount = Math.min(10, shuffled.length);
    let top10 = shuffled.slice(0, topCount);

    // 🔹 Crear lista con menciones
    let listTop = top10.map((p, i) => `🩸 ${i + 1}. @${p.id.split('@')[0]} 🩸`).join('\n');

    let finalText = `🩸🖤 *TOP ${topCount} - ${text.toUpperCase()}* 🖤🩸\n\n${listTop}\n🩸━━━━━━━━━━━━🩸`;

    await conn.sendMessage(chatId, { text: finalText, mentions: top10.map(p => p.id) });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al generar el top 10.' });
  }
};

handler.help = ['top10 <texto>'];
handler.tags = ['fun', 'juego'];
handler.group = true;
handler.command = ['top10'];
handler.register = true;

export default handler;
