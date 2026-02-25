// plugins/numero.js
let usados = {}; // Para no repetir números consecutivos en el mismo chat

let handler = async (m, { conn }) => {
    try {
        const chat = global.db.data.chats[m.chat] || {};
        if (!chat.games) return await conn.sendMessage(m.chat, { text: '❌ Los juegos están desactivados. Usa .juegos para activarlos.' });

        const min = 1;
        const max = 100;

        if (!usados[m.chat]) usados[m.chat] = [];

        let numero;
        let intentos = 0;
        do {
            numero = Math.floor(Math.random() * (max - min + 1)) + min;
            intentos++;
            if (intentos > 20) break; // previene loop infinito
        } while (usados[m.chat].includes(numero));

        usados[m.chat].push(numero);

        // Limitar la lista de usados para no crecer indefinidamente
        if (usados[m.chat].length > 50) usados[m.chat].shift();

        // Mensaje minimalista y llamativo
        const mensaje = `
✨ 🔢 *NÚMERO MÁGICO - FELIXCAT* 🔢 ✨

🎲 Número generado:
> ${numero}

🌟 ¡Que la suerte te acompañe! 😸
`;

        await conn.sendMessage(m.chat, { text: mensaje });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { text: '✖️ Ocurrió un error al generar el número.' });
    }
};

handler.command = ['numero', 'num'];
handler.group = true;
handler.admin = false;
handler.rowner = false;

export default handler;
