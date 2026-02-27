// 📂 plugins/juego-zorra.js — FelixCat_Bot 💃🦊
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

    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

    // 🎯 Determinar objetivo (prioridad: citado > mencionado > autor)
    const who = m.quoted?.sender || m.mentionedJid?.[0] || m.sender;
    const simpleId = who.split("@")[0];
    const name = conn.getName ? conn.getName(who) : simpleId;

    // 🎰 Porcentaje random
    const porcentaje = Math.floor(Math.random() * 101);

    // 🔥 Barra visual
    const totalBars = 10;
    const filledBars = Math.round(porcentaje / 10);
    const bar = '🔥'.repeat(filledBars) + '⬜'.repeat(totalBars - filledBars);

    // 💬 Frases personalizadas por comando
    const frasesZorra = [
      '💃🔥 Nivel dios/a: te tienen que bendecir antes de verte.',
      '😈 Sos la líder del club de las zorritas.',
      '😉 Coqueta, peligrosa y con estilo.',
      '🤭 Tenés tu fama, pero sabés jugar bien.',
      '😅 Algo se sospecha, pero aún disimulás.',
      '😇 Bastante tranqui, pero con pasado oscuro.',
      '😎 Casi inocente, solo un poco traviesa.',
      '🗿 Santo/a puro/a, ni un pensamiento indecente.'
    ];

    const frasesZorro = [
      '🦊🔥 Nivel dios: todo un lobo astuto.',
      '😈 Sos el líder del club de zorros.',
      '😉 Astuto, coquete y con estilo.',
      '🤭 Tenés tu fama, pero sabés jugar bien.',
      '😅 Algo se sospecha, pero aún disimulás.',
      '😇 Bastante tranqui, pero con pasado oscuro.',
      '😎 Casi inocente, solo un poco travieso.',
      '🗿 Santo/a puro/a, ni un pensamiento indecente.'
    ];

    const frases = /zorra/i.test(command) ? frasesZorra : frasesZorro;
    const frase = frases[Math.floor(Math.random() * frases.length)];

    // 🔥 Título según comando
    const titulo = /zorra/i.test(command)
      ? '💃 *TEST DE ZORRA 2.1* 💄'
      : '🦊 *TEST DE ZORRO 2.1* 😏';

    // 🧾 Armar mensaje final
    const msg = `
${titulo}

👤 *Usuario:* @${simpleId}
📊 *Nivel de zorreada:* ${porcentaje}%

${bar}

💬 ${frase}
`.trim();

    // 📤 Enviar mensaje con mención clickeable
    await conn.sendMessage(m.chat, { text: msg, mentions: [who] }, { quoted: m });

  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, '✖️ Error ejecutando el test de zorro/zorra.', m);
  }
};

// 🔥 Configuración del handler
handler.command = ['zorra', 'zorro'];  // ambos comandos en un mismo archivo
handler.help = ['zorra <@usuario>', 'zorro <@usuario>'];
handler.tags = ['fun', 'juego'];
handler.group = true;

export default handler;
