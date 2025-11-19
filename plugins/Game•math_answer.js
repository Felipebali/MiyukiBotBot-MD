// plugin Game•math-responder.js
// Responde a preguntas del plugin .math (sin monedas)
global.math = global.math || {};

const handler = async (m, { conn }) => {
    const id = m.chat;

    // Validaciones básicas
    if (!m.quoted) return;
    if (m.quoted.sender != conn.user.jid) return;
    if (!/^🧮 ¿Cuánto es el resultado de/i.test(m.quoted.text)) return;
    if (!(id in global.math)) return conn.reply(m.chat, `🌵 Ya se ha respondido a esa pregunta.`, m);

    if (m.quoted.id !== global.math[id][0].id) return;

    const math = global.math[id][1];

    // Convertir ambos a float para manejar decimales
    const respuestaUsuario = parseFloat(m.text);
    const respuestaCorrecta = parseFloat(math.result);

    if (respuestaUsuario === respuestaCorrecta) {
        conn.reply(m.chat, `🌵 ¡Respuesta correcta!`, m);

        clearTimeout(global.math[id][3]);
        delete global.math[id];
    } else {
        // Restar intentos
        global.math[id][2]--;
        if (global.math[id][2] <= 0) {
            conn.reply(m.chat, `🌵 Se acabaron tus oportunidades.\n⭐️ La respuesta correcta era: *${math.result}*`, m);
            clearTimeout(global.math[id][3]);
            delete global.math[id];
        } else {
            conn.reply(m.chat, `🌵 Respuesta incorrecta.\n✨ Intentos restantes: *${global.math[id][2]}*`, m);
        }
    }
};

// Prefijo: cualquier número (entero o decimal)
handler.customPrefix = /^-?[0-9]+(\.[0-9]+)?$/;
handler.command = new RegExp;

export default handler;

function isNumber(x) {
    return typeof x === 'number' && !isNaN(x);
}
