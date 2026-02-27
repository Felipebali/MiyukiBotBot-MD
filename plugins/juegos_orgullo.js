// 📂 plugins/gay.js — FelixCat_Bot 🏳️‍🌈
let handler = async (m, { conn, command }) => {
  try {
    const chatData = global.db.data.chats[m.chat] || {};

    // ⚠️ Verificar si los juegos están activados
    if (!chatData.games) {
      return await conn.sendMessage(
        m.chat,
        { text: '🎮 *Los mini-juegos están desactivados.*\nActívalos con *.juegos* 🔓' },
        { quoted: m }
      );
    }

    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

    // 🎯 Determinar objetivo (citado > mencionado > autor)
    let who = m.quoted
      ? m.quoted.sender
      : (m.mentionedJid && m.mentionedJid[0]) || m.sender;

    let simpleId = who.split("@")[0];

    // 🎲 Porcentaje aleatorio
    let porcentaje = Math.floor(Math.random() * 101);

    // 📊 Barra visual
    const totalBars = 10;
    const filledBars = Math.round(porcentaje / 10);
    const bar = '🏳️‍🌈'.repeat(filledBars) + '⬜'.repeat(totalBars - filledBars);

    // 💬 Frases por nivel
    let frases = [
      "✨ Brillás con energía propia.",
      "🌈 Tenés un aura colorida y poderosa.",
      "🎉 Nivel fiesta activado.",
      "😎 Tranquilo pero con estilo.",
      "🦄 Energía única e irrepetible.",
      "🔥 FelixCat detecta vibra especial."
    ];

    const frase = frases[Math.floor(Math.random() * frases.length)];

    // 🧾 Mensaje final
    let msg = `
🏳️‍🌈 *TEST GAY FELIXCAT 2.1* 🏳️‍🌈

👤 *Usuario:* @${simpleId}
📊 *Nivel detectado:* ${porcentaje}%

${bar}

💬 ${frase}
`.trim();

    // 📤 Enviar mensaje con mención clickeable
    await conn.sendMessage(
      m.chat,
      { text: msg, mentions: [who] },
      { quoted: m }
    );

  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, '✖️ Error al ejecutar el test.', m);
  }
};

handler.command = ['gay'];
handler.tags = ['fun', 'juego'];
handler.help = ['gay <@usuario>'];
handler.group = true;

export default handler;
