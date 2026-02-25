import fs from 'fs';
import path from 'path';

let handler = async (m, { conn }) => {
    // Validación NSFW solo para grupos
    if (!db.data.chats[m.chat].nsfw && m.isGroup) {
        return m.reply(
`🐉 El contenido *NSFW* está desactivado en este grupo.
> Solo el OWNER puede activarlo con el comando » *.nsfw*`
        );
    }

    // Detectamos el usuario mencionado o citado
    let who;
    if (m.mentionedJid && m.mentionedJid.length > 0) who = m.mentionedJid[0];
    else if (m.quoted) who = m.quoted.sender;
    else who = m.sender;

    // Solo usernames
    const usernameTarget = `@${who.split("@")[0]}`;
    const usernameSender = `@${m.sender.split("@")[0]}`;

    // React al mensaje
    m.react('😮');

    // Construimos el mensaje usando solo usernames
    let str;
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        str = `${usernameSender} le dio una mamada a ${usernameTarget}.`;
    } else if (m.quoted) {
        str = `${usernameSender} le está dando una mamada a ${usernameTarget}.`;
    } else {
        str = `${usernameSender} está dando una mamada >.<`.trim();
    }

    if (m.isGroup) {
        const videos = [
            'https://telegra.ph/file/0260766c6b36537aa2802.mp4',
            'https://telegra.ph/file/2c1c68c9e310f60f1ded1.mp4',
            'https://telegra.ph/file/e14f5a31d3b3c279f5593.mp4',
            'https://telegra.ph/file/e020aa808f154a30b8da7.mp4',
            'https://telegra.ph/file/1cafb3e72664af94d45c0.mp4',
            'https://telegra.ph/file/72b49d3b554df64e377bb.mp4',
            'https://telegra.ph/file/9687aedfd58a3110c7f88.mp4',
            'https://telegra.ph/file/c799ea8a1ed0fd336579c.mp4',
            'https://telegra.ph/file/7352d18934971201deed5.mp4',
            'https://telegra.ph/file/379edd38bac6de4258843.mp4'
        ];
        const video = videos[Math.floor(Math.random() * videos.length)];

        // Menciones: sender y target
        const mentions = [m.sender, who];

        await conn.sendMessage(
            m.chat,
            { video: { url: video }, gifPlayback: true, caption: str, mentions },
            { quoted: m }
        );
    }
};

handler.help = ['blowjob/mamada @tag'];
handler.tags = ['nsfw'];
handler.command = ['blowjob','bj','mamada'];
handler.group = true;

export default handler;
