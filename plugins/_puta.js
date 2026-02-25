// 📂 plugins/puto_puta.js — FelixCat_Bot 🔥
let handler = async (m, { conn, command }) => {
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

    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

    // 🎯 Determinar objetivo (citado > mencionado > autor)
    let who = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0]) || m.sender;
    let simpleId = who.split("@")[0];
    let name = conn.getName ? conn.getName(who) : simpleId;

    // 🎲 Generar porcentaje aleatorio
    let porcentaje = Math.floor(Math.random() * 101);

    // 📊 Crear barra visual
    const totalBars = 10;
    const filledBars = Math.round(porcentaje / 10);
    const bar = '🔥'.repeat(filledBars) + '⬜'.repeat(totalBars - filledBars);

    // 💬 Frases personalizadas según porcentaje
    let frase;
    if (porcentaje >= 90) frase = '💋 Nivel leyenda: una obra de arte en movimiento.';
    else if (porcentaje >= 75) frase = '😏 El grupo no puede resistirse a tu encanto.';
    else if (porcentaje >= 60) frase = '😉 Naturalmente provocador/a.';
    else if (porcentaje >= 45) frase = '😅 Juguetón/a pero con límites.';
    else if (porcentaje >= 30) frase = '🤭 Algo de picardía, pero disimulás.';
    else if (porcentaje >= 15) frase = '😇 Casi inocente, aunque algo se nota.';
    else frase = '👼 Ángel puro, sin rastros de malicia.';

    // 🧾 Armar mensaje final
    let msg = `
💄 *TEST DE ${command.toUpperCase()} FELIXCAT 2.1* 💄

👤 *Usuario:* @${simpleId}
📊 *Nivel de ${command === 'puto' ? 'putez' : 'puteza'}:* ${porcentaje}%

${bar}

💬 ${frase}
`.trim();

    // 📤 Enviar con mención clickeable
    await conn.sendMessage(m.chat, { text: msg, mentions: [who] }, { quoted: m });

  } catch (err) {
    console.error(err);
    return conn.reply(m.chat, '❌ Error ejecutando el comando.', m);
  }
};

handler.help = ['puta', 'puto'];
handler.tags = ['fun', 'juego'];
handler.command = /^(puto|puta)$/i;
handler.group = true;

export default handler;
