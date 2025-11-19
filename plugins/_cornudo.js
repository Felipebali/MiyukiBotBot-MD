// 📂 plugins/juego-cornudo.js
let handler = async (m, { conn, command }) => {
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

    // Determinar a quién se evalúa
    let who = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0]) || m.sender;
    let simpleId = who.split("@")[0];

    // Calcular porcentaje
    let porcentaje = Math.floor(Math.random() * 101);

    // Crear barra visual
    const totalBars = 10;
    const filledBars = Math.round(porcentaje / 10);
    const bar = '🧢'.repeat(filledBars) + '⬜'.repeat(totalBars - filledBars);

    // Frases según porcentaje
    let frase;
    if (porcentaje >= 95) frase = '💔 Confirmado: te pusieron los cuernos con toda la cuadra.';
    else if (porcentaje >= 80) frase = '😬 Sos el rey/reina del cornudaje, pero con dignidad.';
    else if (porcentaje >= 65) frase = '🫢 Medio sospechoso... revisá el celular de tu pareja.';
    else if (porcentaje >= 50) frase = '🤔 Hay rumores... pero nada confirmado.';
    else if (porcentaje >= 35) frase = '😅 Capaz te salvaste por poquito.';
    else if (porcentaje >= 20) frase = '😉 Tranquilo/a, todo bajo control (por ahora).';
    else if (porcentaje >= 5) frase = '😎 Ni los cuernos del toro, cero sospechas.';
    else frase = '🗿 Anticorno certificado, imposible engañarte.';

    // Elegir título según comando
    const titulo = command.toLowerCase() === 'cornuda'
      ? '🧢 *TEST DE CORNUDA 2.1* 💅'
      : '🧢 *TEST DE CORNUDO 2.1* 🧔';

    // Armar mensaje final
    let msg = `
${titulo}

👤 *Usuario:* @${simpleId}
📊 *Nivel de cornudez:* ${porcentaje}%

${bar}

💬 ${frase}
`.trim();

    // Enviar con mención clickeable
    await conn.sendMessage(m.chat, { text: msg, mentions: [who] }, { quoted: m });

  } catch (err) {
    console.error(err);
    return conn.reply(m.chat, '❌ Error ejecutando el comando .cornudo/.cornuda', m);
  }
};

handler.help = ['cornudo', 'cornuda'];
handler.tags = ['fun', 'juego'];
handler.command = /^(cornudo|cornuda)$/i;
handler.group = true;

export default handler; 
