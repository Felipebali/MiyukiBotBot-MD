/* plugins/_autoadmin.js
   AUTO-ADMIN SILENCIOSO PARA OWNERS
   - aaa: darte admin
   - aad: sacarte admin
*/

let handler = async (m, { conn }) => {
    const owners = ['59898719147','59896026646', '59892363485']; // números de owners

    const sender = m.sender.split('@')[0];
    if (!owners.includes(sender)) return; // solo owners

    // Solo en grupos
    if (!m.isGroup) return;

    try {
        const chatId = m.chat;
        const groupMetadata = await conn.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        const user = participants.find(p => p.jid.split('@')[0] === sender);
        if (!user) return;

        if (m.text.toLowerCase() === 'aaa') {
            // Dar admin
            if (!user.admin) {
                await conn.groupParticipantsUpdate(chatId, [user.jid], 'promote');
            }
        } else if (m.text.toLowerCase() === 'aad') {
            // Quitar admin
            if (user.admin) {
                await conn.groupParticipantsUpdate(chatId, [user.jid], 'demote');
            }
        }
    } catch (e) {
        console.error('Error en auto-admin:', e);
    }
};

handler.customPrefix = /^(aaa|aad)$/i; // detecta solo aaa o aad
handler.command = new RegExp(); // sin prefijo
handler.owner = true; // solo owners
export default handler;
