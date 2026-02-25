let handler = async (m, { conn }) => {
  try {
    const chatData = global.db.data.chats[m.chat] || {};

    // ⚠️ Verificar si los juegos están activados
    if (!chatData.games) {
      return await conn.sendMessage(m.chat, { text: '❌ Los mini-juegos están desactivados en este chat. Usa .juegos para activarlos.' }, { quoted: m });
    }

    // Determinar objetivo (citado > mencionado > autor)
    let who = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0]) || m.sender;
    let simpleId = who.split("@")[0];
    let name = conn.getName ? conn.getName(who) : simpleId;

    // Calcular porcentaje aleatorio
    let porcentaje = Math.floor(Math.random() * 101);

    // Crear barra visual (estilo más “fino”)
    const totalBars = 10;
    const filledBars = Math.round(porcentaje / 10);
    const bar = '🏳️‍🌈'.repeat(filledBars) + '⬜'.repeat(totalBars - filledBars);

    // Frases según porcentaje
    let frase;
    if (porcentaje >= 95) frase = '💅 100% trolo certificado, brillas más que el arcoíris.';
    else if (porcentaje >= 80) frase = '💖 Sos una diva en secreto... o no tanto 👀';
    else if (porcentaje >= 65) frase = '✨ Medio closetero, pero se te nota la actitud.';
    else if (porcentaje >= 50) frase = '🤭 Sos dudoso, el gaydar marcó actividad.';
    else if (porcentaje >= 35) frase = '😅 Solo cuando nadie mira.';
    else if (porcentaje >= 20) frase = '😇 Bastante tranqui, pero algo sospechoso...';
    else if (porcentaje >= 5) frase = '😎 Hetero, pero con estilo.';
    else frase = '🗿 Hetero de manual, ni un brillo.';

    // Armar mensaje final
    let msg = `
🏳️‍🌈 *TEST DE TROLO 2.1* 🏳️‍🌈

👤 *Usuario:* @${simpleId}
📊 *Nivel de trolez:* ${porcentaje}%

${bar}

💬 ${frase}
`.trim();

    // Enviar con mención clickeable
    await conn.sendMessage(m.chat, { text: msg, mentions: [who] }, { quoted: m });

  } catch (err) {
    console.error(err);
    return conn.reply(m.chat, '❌ Error ejecutando el comando .trolo', m);
  }
};

handler.help = ['trolo'];
handler.tags = ['fun'];
handler.command = /^trolo$/i;
handler.group = true;

export default handler;
