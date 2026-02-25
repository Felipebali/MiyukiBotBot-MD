// 📂 plugins/gay.js — FULL COMPATIBLE CON CUALQUIER LOADER
console.log('[Plugin] gay cargado');

let handler = async (m, { conn, command }) => {
  try {
    const chatData = global.db.data.chats[m.chat] || {};

    // 🔒 Juegos activados?
    if (!chatData.games) return; // <- si juegos desactivados, no hace nada

    // 🎯 Detectar objetivo del test
    let who = m.quoted
      ? m.quoted.sender
      : (m.mentionedJid && m.mentionedJid[0]) || m.sender;

    let simpleId = who.split("@")[0];

    // 🎰 Porcentaje random
    let porcentaje = Math.floor(Math.random() * 101);

    // 🏳️‍🌈 Barra visual
    const totalBars = 10;
    const filledBars = Math.round(porcentaje / 10);
    const bar = '🏳️‍🌈'.repeat(filledBars) + '⬜'.repeat(totalBars - filledBars);

    // 💬 Frase por nivel
    let frase;
    if (porcentaje >= 95) frase = '🏳️‍🌈 Nivel divino: sos el arcoíris encarnado.';
    else if (porcentaje >= 80) frase = '💅 Fabulos@ total: brillás más que RuPaul.';
    else if (porcentaje >= 65) frase = '🦄 Brillas con orgullo y estilo.';
    else if (porcentaje >= 50) frase = '😉 Un 50/50, pero el radar marca fuerte.';
    else if (porcentaje >= 35) frase = '🤭 Un poco de color, pero disimulás.';
    else if (porcentaje >= 20) frase = '😇 Bastante tranqui, aunque algo sospechoso.';
    else if (porcentaje >= 5) frase = '😎 Hetero con un toque de glitter.';
    else frase = '🗿 Puro, sin rastros de arcoíris.';

    // 🔥 Título según comando
    const titulo = '🏳️‍🌈 *TEST GAY 2.1* 🏳️‍🌈';

    // 📩 Mensaje final
    let msg = `
${titulo}

👤 Usuario: @${simpleId}
📊 Nivel de gay: ${porcentaje}%

${bar}

💬 ${frase}
`.trim();

    await conn.sendMessage(m.chat, { text: msg, mentions: [who] }, { quoted: m });

  } catch (err) {
    console.error(err);
    return conn.reply(m.chat, '❌ Error ejecutando el comando .gay', m);
  }
};

// 🔥 Compatibilidad máxima para cualquier loader
handler.help = ['gay'];
handler.tags = ['fun', 'juego'];
handler.group = true;

// Formato normal
handler.command = ['gay'];

// Regex alternativo por si el loader lo usa
handler.command = handler.command || /^gay$/i;

// Permitir alias en loader
handler.customPrefix = null;
handler.register = true; // loader strict mode fix

export default handler;
