// Código adaptado por Anubis 🐾 estilo Felix-Cat 😼

import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, usedPrefix }) => {
    const chat = global.db.data.chats[m.chat] || {};

    // Verificar si NSFW está activado
    if (!chat.nsfw && m.isGroup) {
        return conn.sendMessage(m.chat, { 
            text: `《✦》El contenido *NSFW* está desactivado en este grupo.\n> Un dueño puede activarlo con el comando » *#nsfw*` 
        }, { quoted: m });
    }

    // Detectar a quién se menciona o responde
    let who;
    if (m.mentionedJid?.length) {
        who = m.mentionedJid[0];
    } else if (m.quoted) {
        who = m.quoted.sender;
    } else {
        who = m.sender;
    }

    // Solo usernames
    const usernameTarget = `@${who.split("@")[0]}`;
    const usernameSender = `@${m.sender.split("@")[0]}`;

    // Construir mensaje usando solo usernames
    let str;
    if (m.mentionedJid?.length) {
        str = `${usernameSender} le está lamiendo el coño a ${usernameTarget}.`;
    } else if (m.quoted) {
        str = `${usernameSender} le chupó el coño a ${usernameTarget}.`;
    } else {
        str = `${usernameSender} está lamiendo un coño! >.<`;
    }

    if (m.isGroup) {
        const videos = [
            'https://qu.ax/LPcsZ.mp4',
            'https://qu.ax/OvlTU.mp4',
            'https://qu.ax/gaZHP.mp4',
            'https://qu.ax/PSBkz.mp4',
            'https://qu.ax/Kejmn.mp4',
            'https://qu.ax/SFFq.mp4',
            'https://qu.ax/EDZBg.mp4',
            'https://qu.ax/Smfz.mp4'
        ];

        const video = videos[Math.floor(Math.random() * videos.length)];

        // Menciones: sender y target
        const mentions = [m.sender, who];

        await conn.sendMessage(m.chat, {
            video: { url: video },
            gifPlayback: true,
            caption: str,
            mentions
        }, { quoted: m });
    }
};

handler.help = ['lickpussy/coño @tag'];
handler.tags = ['nsfw'];
handler.command = ['lickpussy', 'coño'];
handler.group = true;

export default handler;
