// 📂 plugins/menuj.js — FelixCat_Bot
let handler = async (m, { conn }) => {
  try {
    const chatSettings = global.db.data.chats[m.chat] || {};
    const gamesEnabled = chatSettings.games !== false; // Por defecto activados

    let menuText = `╔═════════════════════╗
🎮  MINI-JUEGOS FELIXCAT 🐾
╚═════════════════════╝
Estado: ${gamesEnabled ? '🟢 Activados' : '🔴 Desactivados'}
────────────────────────────
`;

    if (gamesEnabled) {
      menuText += `
🌟 *Juego Especial y Viral:*
🐾 *.therian* → Descubre tu animal interior PRO 🐲✨
────────────────────────────

🎲 *Juegos Disponibles:*

🧠 *.math* → Operaciones matemáticas
✊✋✌️ *.ppt <@user>* → Piedra, papel o tijera
💃🕺 *.dance <@user>* → Bailar con amigo
🌍 *.bandera* → Adivina la bandera
😸 *.adivinanza* → Resuelve adivinanzas
🏛️ *.capital* → Adivina la capital de un país
🎯 *.trivia* → Preguntas de cultura general
✨ *.consejo* → Te da un consejo aleatorio
💭 *.pensar <pregunta>* → Bola mágica que responde tu pregunta
🔢 *.numero* → Genera un número aleatorio
👑 *.top10* → Top 10 divertidos del grupo
🍽️ *.plato* → Adivina la opción correcta
❤️ *.match* → Empareja dos personas al azar 💞
💢 *.enemigo* → Enfrenta a dos personas al azar 😾
🏳️‍🌈 *.gay* → Descubre quién es el más gay del grupo 🏳️‍🌈
😻 *.lindo* → El bot elige al más lindo del grupo 😺
💋 *.linda* → El bot elige a la más linda del grupo 💄
😹 *.feo* → El bot elige al más feo del grupo 💀
🙈 *.fea* → El bot elige a la más fea del grupo 👹
────────────────────────────

💅 *.trolo <@user>* → Test de trolez (versión 2.1)
🧢 *.cornudo <@user>* / *.cornuda <@user>* → Test de cornudez (versión 2.1)
💔 *.infiel <@user>* → Test de infidelidad (versión 2.1)
🔥 *.zorra <@user>* / *.zorro <@user>* → Test de zorreada (versión 2.1)
😈 *.puta <@user>* → Comando divertido/insulto gracioso
😂 *.puto <@user>* → Comando divertido/insulto gracioso
🎉 *.sortear [premio]* → Sortea participantes del grupo
────────────────────────────
`;
    } else {
      menuText += `⚠️ *Mini-juegos desactivados.*  
Menciona a un admin para activarlos 🔴
────────────────────────────
`;
    }

    menuText += `👑 *Powered by FelixCat 🐾*`;

    await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });

  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, '✖️ Error al mostrar el menú de mini-juegos.', m);
  }
};

handler.command = ['menuj', 'mj'];
handler.group = true;

export default handler;
