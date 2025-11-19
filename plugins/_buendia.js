// plugins/buenas_horario_auto.js
let lastShIndex = -1;

let handler = async (m, { conn, participants }) => {
    const owners = ['59898719147','59896026646', '59892363485']; // números de owners
    const senderNum = m.sender.replace(/[^0-9]/g, '');

    // Solo continuar si es owner
    if (!owners.includes(senderNum)) return; // NO hace nada si no es owner
    if (!m.isGroup) return; // solo grupos

    const text = (m.text || '').trim().toLowerCase();
    if (!text.startsWith('buenas')) return;

    // Obtener hora actual
    const now = new Date();
    const hours = now.getHours();

    let mensajes = [];

    if (hours >= 5 && hours < 12) { // mañana
        mensajes = [
            "🌅 ¡Buenos días! Que el café esté fuerte y la paciencia también 😎",
            "☀️ Buen día! A comerse el mundo con estilo 😏",
            "😴 Despierten, el mundo no se va a conquistar solo! 🌄"
        ];
    } else if (hours >= 12 && hours < 18) { // tarde
        mensajes = [
            "🌇 Buenas tardes! Hora de brillar aunque el sol esté en pausa 😎",
            "😏 Tarde tranquila, tomen un mate y disfruten 😌",
            "☀️ ¡Hola grupo! Que la tarde les traiga buena vibra 🌤️"
        ];
    } else { // noche
        mensajes = [
            "🌙 Buenas noches! Que los sueños sean más divertidos que la vida real 😴",
            "💤 Descansen, mi creador necesita paz y silencio 😇",
            "🌌 Dulces sueños a todos! Que la luna cuide sus travesuras 😏",
            "✨ Buenas noches! Que las estrellas iluminen sus sueños más locos 🌟"
        ];
    }

    // Elegir un mensaje aleatorio diferente al último
    let index;
    do { index = Math.floor(Math.random() * mensajes.length); } while (index === lastShIndex);
    lastShIndex = index;

    const mensaje = mensajes[index];

    const mentions = participants.map(p => p.jid);
    await conn.sendMessage(m.chat, { text: mensaje, mentions });
};

handler.customPrefix = /^buenas/i; // detecta "buenas" sin prefijo
handler.command = new RegExp(); // sin prefijo
handler.group = true;           // solo grupos
// NOTA: No hay handler.owner = true, para que no avise nada si no es owner

export default handler;
