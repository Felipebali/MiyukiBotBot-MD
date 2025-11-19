// plugins/juegos-bandera.js
let handler = async (m, { conn }) => {
    const chatSettings = global.db?.data?.chats?.[m.chat] || {};
    if (chatSettings.games === false) {
        return conn.sendMessage(m.chat, { text: '⚠️ Los juegos están desactivados en este chat. Usa *.juegos* para activarlos.' }, { quoted: m });
    }

    const flags = [
        // América
        { name: "Argentina", emoji: "🇦🇷" }, { name: "Bolivia", emoji: "🇧🇴" },
        { name: "Brasil", emoji: "🇧🇷" }, { name: "Canadá", emoji: "🇨🇦" },
        { name: "Chile", emoji: "🇨🇱" }, { name: "Colombia", emoji: "🇨🇴" },
        { name: "México", emoji: "🇲🇽" }, { name: "Uruguay", emoji: "🇺🇾" },
        { name: "Paraguay", emoji: "🇵🇾" }, { name: "Perú", emoji: "🇵🇪" },
        { name: "Estados Unidos", emoji: "🇺🇸" }, { name: "Cuba", emoji: "🇨🇺" },
        { name: "Ecuador", emoji: "🇪🇨" }, { name: "Venezuela", emoji: "🇻🇪" },

        // Europa
        { name: "España", emoji: "🇪🇸" }, { name: "Francia", emoji: "🇫🇷" },
        { name: "Italia", emoji: "🇮🇹" }, { name: "Alemania", emoji: "🇩🇪" },
        { name: "Reino Unido", emoji: "🇬🇧" }, { name: "Portugal", emoji: "🇵🇹" },
        { name: "Polonia", emoji: "🇵🇱" }, { name: "Grecia", emoji: "🇬🇷" },
        { name: "Rusia", emoji: "🇷🇺" }, { name: "Ucrania", emoji: "🇺🇦" },

        // Asia
        { name: "China", emoji: "🇨🇳" }, { name: "Japón", emoji: "🇯🇵" },
        { name: "India", emoji: "🇮🇳" }, { name: "Corea del Sur", emoji: "🇰🇷" },
        { name: "Arabia Saudita", emoji: "🇸🇦" }, { name: "Tailandia", emoji: "🇹🇭" },
        { name: "Indonesia", emoji: "🇮🇩" }, { name: "Turquía", emoji: "🇹🇷" },

        // África
        { name: "Egipto", emoji: "🇪🇬" }, { name: "Sudáfrica", emoji: "🇿🇦" },
        { name: "Nigeria", emoji: "🇳🇬" }, { name: "Marruecos", emoji: "🇲🇦" },
        { name: "Argelia", emoji: "🇩🇿" }, { name: "Etiopía", emoji: "🇪🇹" },

        // Oceanía
        { name: "Australia", emoji: "🇦🇺" }, { name: "Nueva Zelanda", emoji: "🇳🇿" },
        { name: "Fiyi", emoji: "🇫🇯" }, { name: "Samoa", emoji: "🇼🇸" }
    ];

    // Selecciona una bandera correcta y genera opciones
    const correct = flags[Math.floor(Math.random() * flags.length)];
    let options = [correct.name];
    while (options.length < 4) {
        const opt = flags[Math.floor(Math.random() * flags.length)].name;
        if (!options.includes(opt)) options.push(opt);
    }
    options = options.sort(() => Math.random() - 0.5);

    if (!global.flagGame) global.flagGame = {};

    const text = `🌍 *ADIVINA LA BANDERA*\n\n${correct.emoji}\n\n🔹 Opciones:\n${options.map((o, i) => `*${i + 1}.* ${o}`).join('\n')}\n\nResponde *citando ESTE mensaje* con el nombre correcto.\n⏱️ *Tienes 25 segundos!*`;

    // Enviamos SIN citar el mensaje original (así el mensaje del bot es el objetivo a citar)
    const msg = await conn.sendMessage(m.chat, { text });

    // Guardar el juego completo
    global.flagGame[m.chat] = {
        answer: correct.name,
        emoji: correct.emoji,
        options,
        answered: false,
        messageId: msg?.key?.id || (msg?.key && msg.key.remoteJid ? msg.key.id : null),
        timeout: setTimeout(async () => {
            const game = global.flagGame?.[m.chat];
            if (game && !game.answered) {
                const failMsgs = [
                    `⏰ Se acabó el tiempo! Era *${game.answer}* ${game.emoji}`,
                    `💀 Nadie acertó, la respuesta era *${game.answer}* ${game.emoji}`
                ];
                await conn.sendMessage(m.chat, { text: failMsgs[Math.floor(Math.random() * failMsgs.length)] }, { quoted: msg });
                delete global.flagGame[m.chat];
            }
        }, 25000)
    };
};

// Función util: normaliza texto (quita tildes y no alfanuméricos)
function normalizeText(s) {
    if (!s) return '';
    // quitar acentos
    s = s.normalize ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : s;
    // dejar solo letras y números y espacios
    return s.replace(/[^0-9a-zA-Z\s]/g, '').trim().toLowerCase();
}

// Detección solo si se cita el mensaje del juego
handler.before = async (m, { conn }) => {
    const game = global.flagGame?.[m.chat];
    if (!game || game.answered || !m.text) return;

    // Aceptar distintos campos posibles del citado (compatibilidad)
    const quotedId = m.quoted?.key?.id || m.quoted?.id || m.quoted?.stanzaId || null;
    if (!quotedId) return;

    // Si no cita EL mensaje del bot, ignorar
    if (quotedId !== game.messageId) return;

    const raw = m.text.trim();
    const userAnswer = normalizeText(raw);
    const normalizedAnswer = normalizeText(game.answer);

    // comprobación por número (1-4)
    const isNumber = /^(1|2|3|4)$/.test(userAnswer);
    const chosenIndex = isNumber ? parseInt(userAnswer, 10) - 1 : null;

    // comprobación: nombre exacto normalizado o número apuntando a la opción
    const correctByName = userAnswer === normalizedAnswer;
    const correctByNumber = (isNumber && game.options[chosenIndex] && normalizeText(game.options[chosenIndex]) === normalizedAnswer);

    if (correctByName || correctByNumber) {
        clearTimeout(game.timeout);
        game.answered = true;
        const winMsgs = [
            `🔥 Correcto! Era *${game.answer}* ${game.emoji}`,
            `🏆 Sos un genio! *${game.answer}* ${game.emoji}`,
            `👏 Bien hecho! *${game.answer}* ${game.emoji}`
        ];
        await conn.sendMessage(m.chat, { text: winMsgs[Math.floor(Math.random() * winMsgs.length)] }, { quoted: m });
        delete global.flagGame[m.chat];
    } else {
        const failMsgs = [
            '❌ Incorrecto!',
            '🤔 No, esa no es.',
            '🙃 Casi, pero no.',
            '💀 Fallaste!'
        ];
        await conn.sendMessage(m.chat, { text: failMsgs[Math.floor(Math.random() * failMsgs.length)] }, { quoted: m });
    }
};

handler.command = ['bandera', 'flags', 'flag'];
handler.help = ['bandera'];
handler.tags = ['juegos'];
handler.group = false;

export default handler;
