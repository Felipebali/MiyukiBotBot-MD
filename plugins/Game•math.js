// plugin Game•math.js
// Creado y optimizado para Gaara-Ultra-MD

global.math = global.math || {};

// Dificultades / modos
const modes = {
    noob: { min: 1, max: 10, time: 20000, bonus: 50 },
    easy: { min: 10, max: 50, time: 30000, bonus: 100 },
    medium: { min: 50, max: 200, time: 40000, bonus: 200 },
    hard: { min: 200, max: 1000, time: 60000, bonus: 500 }
};

// Operadores disponibles
const operators = ['+', '-', '*', '/'];

// Función para generar operaciones aleatorias según modo
function genMath(mode) {
    const { min, max, time, bonus } = modes[mode];

    const a = Math.floor(Math.random() * (max - min + 1)) + min;
    const b = Math.floor(Math.random() * (max - min + 1)) + min;
    const op = operators[Math.floor(Math.random() * operators.length)];

    let result;
    switch(op) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/': 
            if (b === 0) result = a; 
            else result = parseFloat((a / b).toFixed(2)); 
            break;
    }

    return {
        str: `${a} ${op} ${b}`,
        result,
        time,
        bonus
    };
}

// Verifica si es número
function isNumber(x) {
    return typeof x === 'number' && !isNaN(x);
}

// Handler principal
const handler = async (m, { conn, args, usedPrefix, command }) => {
    const chatSettings = global.db.data.chats[m.chat] || {};
    if (chatSettings.games === false) {
        return conn.reply(m.chat, '⚠️ Los juegos están desactivados en este chat. Usa .juegos para activarlos.', m);
    }

    const textoAyuda = `
🌵 Ingrese la dificultad con la que deseas jugar

🚩 Dificultades disponibles: *${Object.keys(modes).join(' | ')}*
• Ejemplo: *${usedPrefix + command} noob*
`.trim();

    if (args.length < 1) return await conn.reply(m.chat, textoAyuda, m);

    const mode = args[0].toLowerCase();
    if (!(mode in modes)) return await conn.reply(m.chat, textoAyuda, m);

    const id = m.chat;
    if (id in global.math) 
        return conn.reply(m.chat, '🌵 Todavía hay una pregunta activa en este chat.', global.math[id][0]);

    const math = genMath(mode);
  
    // Inicializar usuario si no existe
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = { monedas: 0 };
    const user = global.db.data.users[m.sender];

    if (!isNumber(user.monedas)) user.monedas = 0;

    // Guardar la pregunta en el objeto global
    global.math[id] = [
        await conn.reply(
            m.chat,
            `🧮 ¿Cuánto es el resultado de: *${math.str}*?\n\n🕝 Tiempo: *${(math.time / 1000).toFixed(2)} segundos*\n💰 Premio: *${math.bonus.toLocaleString()} Monedas*`,
            m
        ),
        math,
        4, // Intentos
        setTimeout(() => {
            if (global.math[id]) {
                conn.reply(m.chat, `⏳ Se ha acabado el tiempo.\n✔️ La respuesta era: *${math.result}*`, m);
                delete global.math[id];
            }
        }, math.time)
    ];
};

// Handler para respuestas
handler.before = async function (m, { conn }) {
    const chatSettings = global.db.data.chats[m.chat] || {};
    if (chatSettings.games === false) return; // No hacer nada si juegos desactivados

    const id = m.chat;
    if (!(id in global.math)) return;

    const [msg, math, tries] = global.math[id];

    // Inicializar usuario si no existe
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = { monedas: 0 };
    const user = global.db.data.users[m.sender];

    if (!isNumber(user.monedas)) user.monedas = 0;

    if (m.text && (parseInt(m.text) === math.result || parseFloat(m.text) === math.result)) {
        user.monedas += math.bonus;

        conn.reply(m.chat, `🎉 ¡Correcto! Has ganado *${math.bonus.toLocaleString()}* monedas. 💰`, m);

        clearTimeout(global.math[id][3]);
        delete global.math[id];
    } else if (tries > 1) {
        // Resta intentos si la respuesta es incorrecta
        global.math[id][2]--;
        conn.reply(m.chat, `❌ Respuesta incorrecta.\n🔁 Intentos restantes: *${global.math[id][2]}*`, m);
    } else {
        // Se acabaron los intentos
        conn.reply(m.chat, `⏳ Se acabaron tus intentos.\n✔️ La respuesta correcta era: *${math.result}*`, m);
        clearTimeout(global.math[id][3]);
        delete global.math[id];
    }
};

handler.help = ['math'];
handler.tags = ['game'];
handler.command = ['math', 'mates', 'matemáticas'];

export default handler;
