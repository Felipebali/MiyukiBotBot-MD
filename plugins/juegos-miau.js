// plugins/miau.js
let handler = async (m, { conn }) => {
    try {
        const frasesMiau = [
            "😺 *Miau!* Te mando buenas vibras y ronroneos positivos 💖",
            "🐾 FelixCat dice: Nunca es mal momento para una siesta o un mimo 💤",
            "🌸 Recordá: siempre hay algo lindo esperándote, aunque sea un maullido suave.",
            "💞 Miau miau~ estás haciendo lo mejor que podés, y eso está perfecto.",
            "🐈‍⬛ Un gatito invisible acaba de desearte un día increíble 😽",
            "☀️ Sonreí, que hoy tenés energía gatuna al 100%",
            "🎶 *Miau~* te canto una canción de suerte y ternura 💫",
            "🐾 FelixCat ronronea de felicidad por verte acá 😸",
            "🍀 Si ves un gato hoy, es señal de buena suerte (¡ya viste uno, yo!) 😼",
            "🌙 Los gatos miran las estrellas porque saben que cada una cumple un deseo."
        ];

        const mensaje = frasesMiau[Math.floor(Math.random() * frasesMiau.length)];
        await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m });

        // Reacciona con un emoji al mensaje original
        await m.react('😻');

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { text: '😿 Error al enviar un miau.', quoted: m });
    }
};

handler.command = ['miau'];
handler.group = false; // puede usarse también en privado
export default handler;
