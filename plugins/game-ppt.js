const handler = async (m, {conn, text, command, usedPrefix, args}) => {
    // Verificar si los juegos están activados en este chat
    const chatSettings = global.db.data.chats[m.chat] || {};
    if (chatSettings.games === false) {
        return conn.sendMessage(m.chat, { text: '⚠️ Los juegos están desactivados en este chat. Usa .juegos para activarlos.' }, { quoted: m });
    }

    const pp = 'https://telegra.ph/file/c7924bf0e0d839290cc51.jpg';

    // Control de tiempo entre partidas
    const userData = global.db.data.users[m.sender] || { cookies: 0, wait: 0 };
    if (new Date() - userData.wait < 10000) {
        const timeLeft = Math.floor((10000 - (new Date() - userData.wait)) / 1000);
        throw `*🕓 Tendrás que esperar ${timeLeft} segundos antes de poder volver a jugar*`;
    }

    if (!args[0]) return conn.reply(m.chat, `*Piedra 🗿, Papel 📄 o Tijera ✂️*\n\n*🌵 Puedes usar estos comandos:*\n*• ${usedPrefix + command} piedra*\n*• ${usedPrefix + command} papel*\n*• ${usedPrefix + command} tijera*`, m);

    let astro = Math.random();
    if (astro < 0.34) astro = 'piedra';
    else if (astro > 0.34 && astro < 0.67) astro = 'tijera';
    else astro = 'papel';

    const textm = text.toLowerCase();

    // Resultados
    const win = 50;
    const lose = 30;
    const tie = 10;

    const outcomes = {
        piedra: { gana: 'tijera', pierde: 'papel' },
        papel: { gana: 'piedra', pierde: 'tijera' },
        tijera: { gana: 'papel', pierde: 'piedra' }
    };

    if (!userData.cookies) userData.cookies = 0;

    if (textm === astro) {
        userData.cookies += tie;
        m.reply(`*🌵 Empate!*\n\n*🚩 Tu: ${textm}*\n*🌸 El Bot: ${astro}*\n*🎁 Premio +${tie} Galletas*`);
    } else if (outcomes[textm]?.gana === astro) {
        userData.cookies += win;
        m.reply(`*🥳 ¡Tú ganas! 🎉*\n\n*🚩 Tu: ${textm}*\n*🌸 El Bot: ${astro}*\n*🎁 Premio +${win} Galletas*`);
    } else if (outcomes[textm]?.pierde === astro) {
        userData.cookies -= lose;
        m.reply(`*🌵 ¡Tú pierdes! 🌵*\n\n*🚩 Tu: ${textm}*\n*🌸 El Bot: ${astro}*\n*❌ Premio -${lose} Galletas*`);
    } else {
        return conn.reply(m.chat, '⚠️ Opción inválida, usa piedra, papel o tijera.', m);
    }

    userData.wait = new Date() * 1;
    global.db.data.users[m.sender] = userData;
};

handler.help = ['ppt'];
handler.tags = ['game'];
handler.command = ['ppt'];
handler.register = true;
export default handler;
