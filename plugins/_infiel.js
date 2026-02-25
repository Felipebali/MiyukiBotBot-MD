// 📂 plugins/juego-infiel.js
let handler = async (m, { conn }) => {
  try {
    const chatData = global.db.data.chats[m.chat] || {};

    // ⚠️ Verificar si los juegos están activados
    if (!chatData.games) {
      return await conn.sendMessage(
        m.chat,
        { text: '❌ Los mini-juegos están desactivados en este chat. Usa *.juegos* para activarlos.' },
        { quoted: m }
      );
    }

    // Determinar objetivo
    let who = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0]) || m.sender;
    let simpleId = who.split("@")[0];

    // Calcular porcentaje aleatorio
    let porcentaje = Math.floor(Math.random() * 101);

    // Crear barra visual
    const totalBars = 10;
    const filledBars = Math.round(porcentaje / 10);
    const bar = '💔'.repeat(filledBars) + '⬜'.repeat(totalBars - filledBars);

    // Frases según porcentaje
    let frase;
    if (porcentaje >= 95) frase = '🔥 Infiel profesional, Netflix debería hacerte una serie.';
    else if (porcentaje >= 80) frase = '💋 Sos un/a experto/a en mentir con una sonrisa.';
    else if (porcentaje >= 65) frase = '😏 Te tiembla el pulso cuando te llega un mensaje a escondidas.';
    else if (porcentaje >= 50) frase = '🤨 Dudoso/a... te tienta lo prohibido.';
    else if (porcentaje >= 35) frase = '🙃 Sos fiel... pero con un par de recaídas emocionales.';
    else if (porcentaje >= 20) frase = '😊 Bastante fiel, aunque las tentaciones te siguen.';
    else if (porcentaje >= 5) frase = '😇 Totalmente fiel, ni un pensamiento traidor.';
    else frase = '🗿 Santo/a canonizado/a de la fidelidad.';

    // Armar mensaje final
    let msg = `
💔 *TEST DE INFIDELIDAD 2.1* 💋

👤 *Usuario:* @${simpleId}
📊 *Nivel de infiel:* ${porcentaje}%

${bar}

💬 ${frase}
`.trim();

    // Enviar con mención clickeable
    await conn.sendMessage(m.chat, { text: msg, mentions: [who] }, { quoted: m });

  } catch (err) {
    console.error(err);
    return conn.reply(m.chat, '❌ Error ejecutando el comando .infiel', m);
  }
};

handler.help = ['infiel'];
handler.tags = ['fun', 'juego'];
handler.command = /^infiel$/i;
handler.group = true;

export default handler; 
