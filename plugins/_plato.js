// 📂 plugins/juegos-opciones.js
let handler = async (m, { conn }) => {
    const chatSettings = global.db?.data?.chats?.[m.chat] || {};
    if (chatSettings.games === false) {
        return conn.sendMessage(m.chat, { text: '⚠️ Los juegos están desactivados en este chat. Usa *.juegos* para activarlos.' }, { quoted: m });
    }

    const opciones = [
        // 🍔 Comidas
        { name: "Pizza Napolitana", hint: "🍕" },
        { name: "Sushi Mixto", hint: "🍣" },
        { name: "Tacos Picantes", hint: "🌮" },
        { name: "Chocolate", hint: "🍫" },
        { name: "Plátano", hint: "🍌" },
        { name: "Helado", hint: "🍨" },
        { name: "Hamburguesa", hint: "🍔" },

        // 🐾 Animales
        { name: "Elefante", hint: "🐘" },
        { name: "Perro", hint: "🐶" },
        { name: "Panda", hint: "🐼" },
        { name: "Gato", hint: "🐱" },
        { name: "León", hint: "🦁" },
        { name: "Tigre", hint: "🐯" },
        { name: "Delfín", hint: "🐬" },

        // 💼 Objetos
        { name: "Guitarra", hint: "🎸" },
        { name: "Reloj", hint: "⏰" },
        { name: "Avión", hint: "✈️" },
        { name: "Coche de carreras", hint: "🏎️" },
        { name: "Laptop", hint: "💻" },

        // 🎭 Personajes
        { name: "Harry Potter", hint: "⚡️" },
        { name: "Iron Man", hint: "🤖" },
        { name: "Homero Simpson", hint: "🍩" },
        { name: "Mickey Mouse", hint: "🐭" },
        { name: "Naruto", hint: "🍥" },

        // 🎬 Películas / series
        { name: "La Casa de Papel", hint: "🎭" },
        { name: "Star Wars", hint: "🌌" },
        { name: "El Señor de los Anillos", hint: "💍" },
        { name: "Avengers", hint: "🛡️" },
        { name: "Matrix", hint: "🟩" },

        // 💬 Frases / expresiones
        { name: "Carpe Diem", hint: "⌛️" },
        { name: "Hakuna Matata", hint: "🦁" },
        { name: "No Pain No Gain", hint: "💪" },
        { name: "Hasta la vista", hint: "🤖" }
    ];

    // Escoge una opción correcta y genera las alternativas
    const correct = opciones[Math.floor(Math.random() * opciones.length)];
    let options = [correct.name];
    while (options.length < 4) {
        const opt = opciones[Math.floor(Math.random() * opciones.length)].name;
        if (!options.includes(opt)) options.push(opt);
    }
    options = options.sort(() => Math.random() - 0.5);

    if (!global.variosGame) global.variosGame = {};

    const text = `🎲 *ADIVINA LA OPCIÓN CORRECTA*\n\n${correct.hint}\n\n🔹 Opciones:\n${options.map((o, i) => `*${i + 1}.* ${o}`).join('\n')}\n\nResponde *citando ESTE mensaje* con el nombre o número correcto.\n⏱️ *Tienes 30 segundos!*`;

    // Enviar mensaje del juego
    const msg = await conn.sendMessage(m.chat, { text });

    // Guardar el juego
    global.variosGame[m.chat] = {
        answer: correct.name,
        hint: correct.hint,
        options,
        answered: false,
        messageId: msg?.key?.id || (msg?.key && msg.key.remoteJid ? msg.key.id : null),
        timeout: setTimeout(async () => {
            const game = global.variosGame?.[m.chat];
            if (game && !game.answered) {
                const failMsgs = [
                    `⏰ Se acabó el tiempo! Era *${game.answer}* ${game.hint}`,
                    `💀 Nadie acertó, la respuesta era *${game.answer}* ${game.hint}`
                ];
                await conn.sendMessage(m.chat, { text: failMsgs[Math.floor(Math.random() * failMsgs.length)] }, { quoted: msg });
                delete global.variosGame[m.chat];
            }
        }, 30000)
    };
};

// 🧩 Normalizar texto
function normalizeText(s) {
    if (!s) return '';
    s = s.normalize ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : s;
    return s.replace(/[^0-9a-zA-Z\s]/g, '').trim().toLowerCase();
}

// 🎯 Verificación de respuesta
handler.before = async (m, { conn }) => {
    const game = global.variosGame?.[m.chat];
    if (!game || game.answered || !m.text) return;

    const quotedId = m.quoted?.key?.id || m.quoted?.id || m.quoted?.stanzaId || null;
    if (!quotedId || quotedId !== game.messageId) return;

    const raw = m.text.trim();
    const userAnswer = normalizeText(raw);
    const normalizedAnswer = normalizeText(game.answer);

    const isNumber = /^(1|2|3|4)$/.test(userAnswer);
    const chosenIndex = isNumber ? parseInt(userAnswer, 10) - 1 : null;

    const correctByName = userAnswer === normalizedAnswer;
    const correctByNumber = (isNumber && game.options[chosenIndex] && normalizeText(game.options[chosenIndex]) === normalizedAnswer);

    if (correctByName || correctByNumber) {
        clearTimeout(game.timeout);
        game.answered = true;
        const winMsgs = [
            `✅ Correcto! Era *${game.answer}* ${game.hint} 🎉`,
            `🏆 Sos un genio! *${game.answer}* ${game.hint}`,
            `👏 Bien hecho! Era *${game.answer}* ${game.hint}`
        ];
        await conn.sendMessage(m.chat, { text: winMsgs[Math.floor(Math.random() * winMsgs.length)] }, { quoted: m });
        delete global.variosGame[m.chat];
    } else {
        const failMsgs = [
            '❌ Incorrecto!',
            '🙃 No era esa!',
            '🤔 Casi, pero no.',
            '😹 Fallaste!'
        ];
        await conn.sendMessage(m.chat, { text: failMsgs[Math.floor(Math.random() * failMsgs.length)] }, { quoted: m });
    }
};

handler.command = ['opcion', 'varios', 'plato'];
handler.help = ['opcion'];
handler.tags = ['juegos'];
handler.group = false;

export default handler;
