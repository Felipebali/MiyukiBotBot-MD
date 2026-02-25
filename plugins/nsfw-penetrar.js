let handler = async (m, { conn, command, text }) => {
    if (!db.data.chats[m.chat].nsfw && m.isGroup) {
        return m.reply('[❗] 𝐋𝐨𝐬 𝐜𝐨𝐦𝐚𝐧𝐝𝐨𝐬 +18 están desactivados en este grupo.\n> Si eres admin y deseas activarlos usa .enable nsfw');
    }

    // Obtiene el usuario mencionado o el que respondió al mensaje
    let user = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : m.sender);

    // Solo usernames de sender y target
    const usernameTarget = `@${user.split('@')[0]}`;
    const usernameSender = `@${m.sender.split('@')[0]}`;

    // Mensaje de respuesta
    const responseMessage = `
*TE HAN LLENADO LA CARA DE SEMEN POR PUTA Y ZORRA!*

*Le ha metido el pene a ${text || usernameTarget}* con todo y condón hasta quedar seco, has dicho "por favor más duroooooo!, ahhhhhhh, ahhhhhh, hazme un hijo que sea igual de pitudo que tú!" mientras te penetraba y luego te ha dejado en silla de ruedas!

*${text || usernameTarget}* 
🔥 *YA TE HAN PENETRADO!*`;

    // Envía la respuesta al chat mencionando ambos
    conn.reply(m.chat, responseMessage, null, { mentions: [m.sender, user] });
}

// Ayuda y configuración del comando
handler.help = ['penetrar @user'];
handler.tags = ['nsfw'];
handler.command = ['penetrar', 'penetrado'];
handler.group = true;
handler.fail = null;

export default handler;
