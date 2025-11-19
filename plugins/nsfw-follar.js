// Código adaptado por Anubis para NSFW solo owner

import fs from 'fs';
import path from 'path';

let handler = async (m, { conn }) => {
    // Validación NSFW solo para grupos
    if (!db.data.chats[m.chat].nsfw && m.isGroup) {
        return m.reply(
`👑 El contenido *NSFW* está desactivado en este grupo.
> Solo el OWNER puede activarlo con el comando » *.nsfw*`
        );
    }

    // Detectamos el usuario mencionado o citado
    let who;
    if (m.mentionedJid?.length > 0) who = m.mentionedJid[0];
    else if (m.quoted) who = m.quoted.sender;
    else who = m.sender;

    // Solo usernames
    const usernameTarget = `@${who.split("@")[0]}`;
    const usernameSender = `@${m.sender.split("@")[0]}`;

    m.react('🥵');

    // Construimos el mensaje según si hay mención o cita
    let str;
    if (m.mentionedJid?.length > 0) {
        str = `${usernameSender} *follo fuertemente a la perra de* ${usernameTarget}.`;
    } else if (m.quoted) {
        str = `${usernameSender} *se la metió durísimo a la perrita de* ${usernameTarget}.`;
    } else {
        str = `${usernameSender} *está follando ricamente.*`.trim();
    }

    if (m.isGroup) {
        const videos = [
            'https://files.catbox.moe/7ito13.mp4', 
            'https://files.catbox.moe/6to3zj.mp4', 
            'https://files.catbox.moe/8j94sh.mp4',
            'https://files.catbox.moe/ylfpb7.mp4',
            'https://files.catbox.moe/kccjc7.mp4',
            'https://files.catbox.moe/lt9e1u.mp4'
        ];
        const video = videos[Math.floor(Math.random() * videos.length)];

        // Menciones: sender y target
        const mentions = [m.sender, who];
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions }, { quoted: m });
    }
}

handler.help = ['follar @tag'];
handler.tags = ['nsfw'];
handler.command = ['follar'];
handler.group = true;

export default handler;
