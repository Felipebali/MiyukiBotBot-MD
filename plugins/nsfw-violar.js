
// plugins/nsfw-roleplay.js
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn }) => {
    const chat = global.db.data.chats[m.chat] || {};

    // Verificar NSFW
    if (!chat.nsfw && m.isGroup) {
        return m.reply(
`《✦》El contenido *NSFW* está desactivado en este grupo.
> Un owner puede activarlo con el comando » *#nsfw on*`
        );
    }

    // Detectar usuario objetivo
    let who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;

    // Solo usernames
    const usernameTarget = `@${who.split("@")[0]}`;
    const usernameSender = `@${m.sender.split("@")[0]}`;

    // Mensaje roleplay
    let str;
    if (m.mentionedJid?.length || m.quoted) {
        str = `${usernameSender} *está haciendo travesuras con* ${usernameTarget} *😏💦*`;
    } else {
        str = `${usernameSender} *está haciendo travesuras por aquí solo/a* 😏`;
    }
    
    if (m.isGroup) {
        // Videos o gifs roleplay
        const videos = [
            'https://files.catbox.moe/cnmn0x.jpg', 
            'https://files.catbox.moe/xph5x5.mp4', 
            'https://files.catbox.moe/4ffxj8.mp4',
            'https://files.catbox.moe/f6ovgb.mp4',
            'https://qu.ax/XmLe.mp4',
            'https://qu.ax/yiMt.mp4',
            'https://qu.ax/cdKQ.mp4'
        ];
        const video = videos[Math.floor(Math.random() * videos.length)];

        // Enviar video con menciones de ambos
        const mentions = [m.sender, who];
        await conn.sendMessage(
            m.chat,
            { video: { url: video }, gifPlayback: true, caption: str, mentions },
            { quoted: m }
        );
    }
};

handler.help = ['roleplay @tag'];
handler.tags = ['nsfw'];
handler.command = ['violar','perra'];
handler.group = true;

export default handler;
