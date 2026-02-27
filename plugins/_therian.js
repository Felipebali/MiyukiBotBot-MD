// 📂 plugins/therians_pro.js — FelixCat_Bot 🐾 PRO Master 100%
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

    // 🎯 Determinar objetivo
    let who = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0]) || m.sender;
    let simpleId = who.split("@")[0];
    let name = conn.getName ? conn.getName(who) : simpleId;

    // 🐾 Tipos de Therians PRO
    const types = [
      '🐺 Lobo', '🦊 Zorro', '🐱 Gato', '🐺 Hombre-Lobo', '🦁 León',
      '🐉 Dragón', '🦄 Unicornio', '🐲 Dragón Asiático', '🦅 Águila Mística',
      '🦖 T-Rex Fantástico', '🦌 Ciervo Lunar', '🐉 Fénix', '🦁 León Fantástico'
    ];

    // 🎯 Atributos extendidos
    const attributes = ['Animal', 'Espíritu', 'Poder', 'Agilidad', 'Magia'];

    const totalBars = 10;
    const barSymbols = ['🟩','🟦','🟪','🟧','🟥','🟫','🟨','🟪'];

    // Generar porcentajes y barras
    const results = types.map(type => {
      const attr = {};
      attributes.forEach(attrName => {
        const pct = Math.floor(Math.random()*101);
        const filled = Math.round(pct/10);
        const sym = barSymbols[Math.floor(Math.random()*barSymbols.length)];
        attr[attrName] = { pct, bar: sym.repeat(filled)+'⬜'.repeat(totalBars - filled) };
      });
      return { type, attr };
    });

    // 💬 Frases épicas
    const frases = [
      "🌙 Tu espíritu animal domina la noche.",
      "🔥 Peligroso y adorable, equilibrio perfecto.",
      "💨 Sigiloso, nadie te ve acercarte.",
      "💖 Tu Therians interior es puro amor salvaje.",
      "🛡️ Protector de tu manada, valiente y noble.",
      "⚡ Poder extremo: cuidado con tus enemigos.",
      "🌟 Aura mágica que brilla más que la luna llena.",
      "🌀 FelixCat confirma: alma de criatura legendaria."
    ];
    const frase = frases[Math.floor(Math.random()*frases.length)];

    // 🏆 Promedio y clasificación PRO
    const promedio = Math.floor(results.reduce((acc,res)=>{
      return acc + attributes.reduce((a,attr)=>{
        return a + res.attr[attr].pct;
      },0)/attributes.length;
    },0)/results.length);

    let categoria = 'Común';
    if (promedio >= 90) categoria = '✨ Legendario Supremo ✨';
    else if (promedio >= 75) categoria = '⚡ Legendario ⚡';
    else if (promedio >= 60) categoria = 'Raro 🌀';
    else if (promedio >= 40) categoria = 'Inusual 🌟';

    // 🧾 Armar mensaje final
    let msg = `🐾 *THERIANS PRO MASTER 100%* 🐾

👤 *Usuario:* @${simpleId}
🎖️ *Clasificación final:* ${categoria} (Promedio: ${promedio}%)

🔹 *Resultados por tipo:*\n`;

    results.forEach(res => {
      msg += `• ${res.type}:\n`;
      attributes.forEach(attr => {
        msg += `   - ${attr}: ${res.attr[attr].pct}% ${res.attr[attr].bar}\n`;
      });
    });

    msg += `\n💬 ${frase}`;

    // 📤 Enviar mensaje con mención
    await conn.sendMessage(m.chat, { text: msg, mentions: [who] }, { quoted: m });

  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, '✖️ Error al ejecutar el test de Therians PRO Master.', m);
  }
};

handler.command = ['therianspro','therians','therian','animaltest','theriancat','theriandeluxe'];
handler.tags = ['fun','juego'];
handler.help = ['therianspro <@usuario>'];
handler.group = true;

export default handler;
