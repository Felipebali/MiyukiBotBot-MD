// 📂 plugins/gay.js — FelixCat_Bot 🌈
let handler = async (m, { conn }) => {
  try {
    const chatData = global.db.data.chats[m.chat] || {};

    // ⚠️ Verificar si los juegos están activados
    if (!chatData.games) {
      return await conn.sendMessage(
        m.chat,
        { text: '❌ Los mini-juegos están desactivados en este chat. Usa .juegos para activarlos.' },
        { quoted: m }
      );
    }

    // 🎯 Determinar objetivo (prioridad: citado > mencionado > autor)
    let who = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0]) || m.sender;
    let simpleId = who.split("@")[0];
    let name = conn.getName ? conn.getName(who) : simpleId;

    // 🎲 Calcular porcentaje aleatorio
    let porcentaje = Math.floor(Math.random() * 101);

    // 🏳️‍🌈 Crear barra visual
    const totalBars = 10;
    const filledBars = Math.round(porcentaje / 10);
    const bar = '🏳️‍🌈'.repeat(filledBars) + '⬜'.repeat(totalBars - filledBars);

    // 💬 Frases según porcentaje
    let frase;
    if (porcentaje >= 95) frase = '🏳️‍🌈 Nivel divino: sos el arcoíris encarnado.';
    else if (porcentaje >= 80) frase = '💅 Fabulos@ total: brillás más que RuPaul.';
    else if (porcentaje >= 65) frase = '🦄 Brillas con orgullo y estilo.';
    else if (porcentaje >= 50) frase = '😉 Un 50/50, pero el radar marca fuerte.';
    else if (porcentaje >= 35) frase = '🤭 Un poco de color, pero disimulás.';
    else if (porcentaje >= 20) frase = '😇 Bastante tranqui, aunque algo sospechoso.';
    else if (porcentaje >= 5) frase = '😎 Hetero con un toque de glitter.';
    else frase = '🗿 Puro, sin rastros de arcoíris.';

    // 🧾 Armar mensaje final
    let msg = `
🏳️‍🌈 *TEST GAY 2.1* 🏳️‍🌈

👤 *Usuario:* @${simpleId}
📊 *Nivel de gay:* ${porcentaje}%

${bar}

💬 ${frase}
`.trim();

    // 📤 Enviar con mención
    await conn.sendMessage(m.chat, { text: msg, mentions: [who] }, { quoted: m });

  } catch (err) {
    console.error(err);
    return conn.reply(m.chat, '❌ Error ejecutando el comando .gay', m);
  }
};

handler.help = ['gay'];
handler.tags = ['fun', 'juego'];
handler.command = /^gay$/i;
handler.group = true;

export default handler;
