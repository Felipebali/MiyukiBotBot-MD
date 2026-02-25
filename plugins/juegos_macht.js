// 📂 plugins/match.js — FULL COMPATIBLE CON CUALQUIER LOADER
console.log('[Plugin] match cargado');

let handler = async (m, { conn, args, command }) => {
  try {
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.games) return;
    if (!m.isGroup) return;

    // 📋 Obtener participantes
    const groupMetadata = await conn.groupMetadata(m.chat);
    let participants = groupMetadata.participants.map(p => p.id);
    const groupName = groupMetadata.subject || 'este grupo';

    // 🛡 Filtrar dueños y bot
    const botNumber = conn.user?.id.split(':')[0];
    const owners = ['59898719147', '59896026646'];

    participants = participants.filter(p => {
      const num = p.replace(/@s\.whatsapp\.net$/, '');
      return num !== botNumber && !owners.includes(num);
    });

    if (participants.length < 2) return;

    // 🎲 Random helper
    const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

    // 📊 Porcentaje random
    const porcentaje = () => Math.floor(Math.random() * 101);

    // ✨ Frases
    const frases = [
      '💘 *El destino los ha unido.*',
      '❤️ *El amor está en el aire.*',
      '💞 *Una pareja que haría historia.*',
      '💖 *Cupido hizo de las suyas.*',
      '💝 *Romance felino detectado.*'
    ];

    // 📌 1) MATCH ALL (pares con porcentaje)
    if (args[0] && args[0].toLowerCase() === 'all') {
      participants = participants.sort(() => Math.random() - 0.5);
      let msg = `💘 *MATCH GENERAL EN ${groupName.toUpperCase()}* 💘\n\n`;
      let mentions = [];

      for (let i = 0; i < participants.length; i += 2) {
        if (participants[i + 1]) {
          const pct = porcentaje();
          msg += `💞 @${participants[i].split('@')[0]} ❤️ @${participants[i + 1].split('@')[0]} — *${pct}% compatibles*\n`;
          mentions.push(participants[i], participants[i + 1]);
        } else {
          msg += `😿 @${participants[i].split('@')[0]} se quedó sin pareja 💔\n`;
          mentions.push(participants[i]);
        }
      }

      msg += `\n${pickRandom(frases)}`;
      await conn.sendMessage(m.chat, { react: { text: '💘', key: m.key } });
      await conn.sendMessage(m.chat, { text: msg, mentions }, { quoted: m });
      return;
    }

    // 📌 2) MATCH @usuario → autor ❤️ mencionado (con porcentaje)
    let mentioned = m.mentionedJid && m.mentionedJid[0];
    if (mentioned) {
      const author = m.sender;
      if (mentioned === author)
        return conn.reply(m.chat, "😂 No podés hacer match con vos mismo.", m);

      const pct = porcentaje();
      const msg = `💞 *MATCH ENTRE USUARIOS EN ${groupName}* 💞\n\n` +
                  `@${author.split('@')[0]} ❤️ @${mentioned.split('@')[0]} — *${pct}% compatibles*\n\n` +
                  pickRandom(frases);

      await conn.sendMessage(m.chat, { react: { text: '💘', key: m.key } });
      await conn.sendMessage(m.chat, { text: msg, mentions: [author, mentioned] }, { quoted: m });
      return;
    }

    // 📌 3) MATCH NORMAL → 2 random (autor no participa)
    const pool = participants.filter(p => p !== m.sender);
    if (pool.length < 2) return;

    const p1 = pickRandom(pool);
    const p2 = pickRandom(pool.filter(p => p !== p1));
    const pct = porcentaje();

    const msg = `💞 *MATCH ALEATORIO EN ${groupName}* 💞\n\n` +
                `@${p1.split('@')[0]} ❤️ @${p2.split('@')[0]} — *${pct}% compatibles*\n\n${pickRandom(frases)}`;

    await conn.sendMessage(m.chat, { react: { text: '💘', key: m.key } });
    await conn.sendMessage(m.chat, { text: msg, mentions: [p1, p2] }, { quoted: m });

  } catch (e) {
    console.error(e);
  }
};

// 🔥 Compatibilidad máxima con cualquier loader
handler.help = ['match', 'macht'];
handler.tags = ['fun', 'juego'];
handler.group = true;
handler.command = ['match', 'macht'];
handler.command = handler.command || /^(match|macht)$/i;
handler.customPrefix = null;
handler.register = true;

export default handler;
