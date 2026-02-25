// 📂 plugins/enemigo.js
let handler = async (m, { conn, participants }) => {
  try {
    // ✅ Verifica si los juegos están activados
    const chat = global.db.data.chats[m.chat] || {};
    const gamesEnabled = chat.games !== false; // Activados por defecto

    if (!gamesEnabled) {
      return conn.sendMessage(m.chat, {
        text: '🎮 *Los mini-juegos están desactivados en este grupo.*\n\nActívalos con *.juegos* 🔓',
      });
    }

    if (!participants || participants.length < 2) {
      return conn.sendMessage(m.chat, { text: '👥 Se necesitan al menos *2 personas* en el grupo para jugar.' });
    }

    // 🎲 Selección aleatoria de dos usuarios distintos
    let user1 = participants[Math.floor(Math.random() * participants.length)].id;
    let user2;
    do {
      user2 = participants[Math.floor(Math.random() * participants.length)].id;
    } while (user1 === user2);

    // 💬 Frases divertidas aleatorias
    const frases = [
      "💢 La rivalidad está servida, ¡que gane el más rencoroso!",
      "⚔️ Estos dos tienen cuentas pendientes desde hace siglos.",
      "🔥 El odio es tan fuerte que derrite el hielo del Ártico.",
      "😾 Una pelea legendaria acaba de comenzar.",
      "💣 ¡Cuidado! El grupo va a explotar con tanto veneno.",
      "👊 Dos almas en guerra eterna, sin final a la vista.",
    ];
    const frase = frases[Math.floor(Math.random() * frases.length)];

    // 🧾 Mensaje final con menciones clickeables
    const text = `
💥 *ENEMIGOS GATUNOS DETECTADOS* 💥

🐾 ${'@' + user1.split('@')[0]} 😾 VS 😾 ${'@' + user2.split('@')[0]}

${frase}
`;

    // 📩 Enviar con menciones clickeables
    await conn.sendMessage(
      m.chat,
      { text, mentions: [user1, user2] },
      { quoted: m }
    );

  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, '✖️ Ocurrió un error al ejecutar el comando .enemigo', m);
  }
};

handler.command = ['enemigo', 'enemigos'];
handler.tags = ['fun'];
handler.help = ['enemigo'];
handler.group = true;

export default handler;
