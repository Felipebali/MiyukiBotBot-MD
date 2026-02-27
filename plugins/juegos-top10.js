// 📂 plugins/top10.js — FelixCat_Bot 🩸
console.log('[Plugin] top10 cargado');

let handler = async (m, { conn, command }) => {
  try {
    const chatData = global.db.data.chats[m.chat] || {};
    if (!chatData.games) return; // Juegos desactivados

    if (!m.isGroup) return conn.sendMessage(m.chat, { text: '❌ Este comando solo funciona en grupos.' });

    // 🔹 Obtener texto después del comando
    let text = m.text?.trim();
    if (!text) return conn.sendMessage(m.chat, { text: '❌ Debes escribir algo.\nUso: `.top10 <texto>`' });
    text = text.replace(new RegExp(`^\\.${command}\\s*`, 'i'), '').trim();
    if (!text) return conn.sendMessage(m.chat, { text: '❌ Debes escribir algo después del comando.' });

    // 🔹 Obtener participantes del grupo
    let metadata = await conn.groupMetadata(m.chat).catch(() => null);
    let participants = metadata?.participants?.filter(p => p.id && !p.id.includes('status@broadcast'));
    if (!participants || participants.length === 0) return conn.sendMessage(m.chat, { text: '❌ No hay participantes en el grupo.' });

    // 🔹 Mezclar y tomar hasta 10
    let shuffled = participants.sort(() => 0.5 - Math.random());
    let topCount = Math.min(10, shuffled.length);
    let top10 = shuffled.slice(0, topCount);

    // 🔹 Crear lista con menciones
    let listTop = top10.map((p, i) => `🩸 ${i + 1}. @${p.id.split('@')[0]} 🩸`).join('\n');

    let finalText = `🩸🖤 *TOP ${topCount} - ${text.toUpperCase()}* 🖤🩸\n\n${listTop}\n🩸━━━━━━━━━━━━🩸`;

    // 🔹 Enviar mensaje con menciones
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
