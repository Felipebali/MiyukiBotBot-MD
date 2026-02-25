// plugins/antifake-offline.js

let handler = async (m, { conn, isAdmin, isOwner }) => {
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: '⚠️ Este comando solo funciona en grupos.' });
    if (!(isAdmin || isOwner)) return conn.sendMessage(m.chat, { text: '⚠️ Solo admins pueden usar este comando.' });

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    let chat = global.db.data.chats[m.chat];

    chat.antifake = !chat.antifake;

    await conn.sendMessage(m.chat, {
        text: chat.antifake
            ? '🚨 Antifake activado! Ahora solo números internacionales sospechosos serán avisados 😏💌'
            : '💤 Antifake desactivado! Relájate, todos los números son bienvenidos 😎✨'
    });
};

// Detecta nuevos participantes
handler.all = async (m, { conn }) => {
    try {
        let chat = global.db.data.chats[m.chat];
        if (!m.isGroup || !chat?.antifake) return;

        let newUsers = m.participants || [];
        for (let who of newUsers) {
            let numberOnly = who.split('@')[0].replace(/\D/g,''); 
            if (!numberOnly || numberOnly.startsWith('598')) continue; // ignorar uruguayos o vacíos

            let groupMetadata = await conn.groupMetadata(m.chat);
            let admins = groupMetadata.participants.filter(u => u.admin === 'admin' || u.admin === 'superadmin');
            let mentions = admins.map(u => u.id);

            await conn.sendMessage(m.chat, {
                text: `⚠️ Nuevo número internacional detectado: @${who.split("@")[0]}\nTipo: POSIBLE NO URUGUAYO`,
                mentions: [who, ...mentions]
            });
        }
    } catch (e) {
        console.log('Error en plugin antifake-offline:', e);
    }
};

handler.help = ['antifake'];
handler.tags = ['group'];
handler.command = ['antifake', 'antivirtuales'];

export default handler;
