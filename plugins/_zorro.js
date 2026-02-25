// 📂 plugins/juego-zorra.js — FULL COMPATIBLE CON CUALQUIER LOADER

let handler = async (m, { conn, command }) => {
  try {
    const chatData = global.db.data.chats[m.chat] || {};

    // 🔒 Juegos activados?
    if (!chatData.games) {
      return await conn.sendMessage(
        m.chat,
        { text: '❌ Los mini-juegos están desactivados en este chat. Usa *.juegos* para activarlos.' },
        { quoted: m }
      );
    }

    // 🎯 Detectar objetivo del test
    let who = m.quoted
      ? m.quoted.sender
      : (m.mentionedJid && m.mentionedJid[0]) || m.sender;

    let simpleId = who.split("@")[0];

    // 🎰 Porcentaje random
    let porcentaje = Math.floor(Math.random() * 101);

    // 🔥 Barra visual
    const totalBars = 10;
    const filledBars = Math.round(porcentaje / 10);
    const bar = '🔥'.repeat(filledBars) + '⬜'.repeat(totalBars - filledBars);

    // 💬 Frase por nivel
    let frase;
    if (porcentaje >= 95) frase = '💃🔥 Nivel dios/a: te tienen que bendecir antes de verte.';
    else if (porcentaje >= 80) frase = '😈 Sos el/la líder del club de los zorros/as.';
    else if (porcentaje >= 65) frase = '😉 Sos coquete, peligroso/a, pero con estilo.';
    else if (porcentaje >= 50) frase = '🤭 Tenés tu fama, pero sabés jugar bien.';
    else if (porcentaje >= 35) frase = '😅 Algo se sospecha, pero aún disimulás.';
    else if (porcentaje >= 20) frase = '😇 Bastante tranqui, pero con pasado oscuro.';
    else if (porcentaje >= 5) frase = '😎 Casi inocente, solo un poco travieso/a.';
    else frase = '🗿 Santo/a puro/a, ni un pensamiento indecente.';

    // 🔥 Título según comando
    const titulo =
      command.toLowerCase() === 'zorra'
        ? '💃 *TEST DE ZORRA 2.1* 💄'
        : '🦊 *TEST DE ZORRO 2.1* 😏';

    // 📩 Mensaje final
    let msg = `
${titulo}

👤 Usuario: @${simpleId}
📊 Nivel de zorreada: ${porcentaje}%

${bar}

💬 ${frase}
`.trim();

    await conn.sendMessage(m.chat, { text: msg, mentions: [who] }, { quoted: m });

  } catch (err) {
    console.error(err);
    return conn.reply(m.chat, '❌ Error ejecutando el comando .zorra/.zorro', m);
  }
};

// 🔥 **Compatibilidad máxima** para cualquier loader:

handler.help = ['zorra', 'zorro'];      // menú
handler.tags = ['fun', 'juego'];        // categoría
handler.group = true;                   // solo grupos

// Formato normal
handler.command = ['zorra', 'zorro'];

// Regex alternativo por si el loader lo usa
handler.command = handler.command || /^(zorra|zorro)$/i;

// Permitir alias en loader
handler.customPrefix = null;
handler.register = true;                // loader strict mode fix

export default handler;
