// Variable para guardar el último mensaje usado
let lastShIndex = -1;

let handler = async (m, { conn, participants }) => {
    // Números de owners
    const owners = ['59898719147', '59896026646', '59892363485'];
    const senderNum = m.sender.replace(/[^0-9]/g, '');

    // Solo continuar si es owner
    if (!owners.includes(senderNum)) return; // NO hace nada, sin aviso

    // Comando sin prefijo: "sh"
    if (m.text && m.text.toLowerCase() === 'sh') {
        const mensajes = [
            "🫡 Hola, pueden hacer silencio mi creador esta durmiendo! 😴",
            "😮‍💨 Hagan silencio, gracias! 🥰",
            "🫎 Cornudos y cornudas hagan caso cierren el orto! 😎", 
            "🖕🏻 No se callan ni por casualidad manga de giles 🫠" 
        ];

        // Elegir un índice aleatorio que no sea igual al último
        let index;
        do {
            index = Math.floor(Math.random() * mensajes.length);
        } while (index === lastShIndex);
        lastShIndex = index;

        const mensaje = mensajes[index];

        // Menciones ocultas a todos los participantes
        const mentions = participants.map(p => p.jid);

        await conn.sendMessage(m.chat, { text: mensaje, mentions });
    }
};

// Configuración del plugin
handler.customPrefix = /^sh$/i; // detecta solo "sh" sin prefijo
handler.command = new RegExp(); // sin prefijo
handler.group = true; // solo grupos
export default handler;
