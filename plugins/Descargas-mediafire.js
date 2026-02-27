import axios from 'axios';
import fetch from 'node-fetch';

let free = 150;
let prem = 500;
const userCaptions = new Map();
const userRequests = {};

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const sticker = 'https://qu.ax/Wdsb.webp';

  if (!args[0]) return m.reply(`⚠️ Ingrese un enlace válido de Mediafire\nEj: ${usedPrefix + command} https://www.mediafire.com/file/...`);

  if (userRequests[m.sender]) 
    return await conn.reply(m.chat, `⚠️ @${m.sender.split('@')[0]} ya estás descargando algo 🙄\nEspera a que termine tu solicitud actual...`, userCaptions.get(m.sender) || m);

  userRequests[m.sender] = true;
  m.react('🚀');

  try {
    const downloadAttempts = [
      async () => {
        const res = await fetch(`https://api.delirius.store/download/mediafire?url=${args[0]}`);
        const data = await res.json();
        return { url: data.data[0].link, filename: data.data[0].filename, filesize: data.data[0].size, mimetype: data.data[0].mime };
      },
      async () => {
        const res = await fetch(`https://api.neoxr.eu/api/mediafire?url=${args[0]}&apikey=russellxz`);
        const data = await res.json();
        if (!data.status || !data.data) throw new Error('Error en Neoxr');
        return { url: data.data.url, filename: data.data.title, filesize: data.data.size, mimetype: data.data.mime };
      },
      async () => {
        const res = await fetch(`https://api.agatz.xyz/api/mediafire?url=${args[0]}`);
        const data = await res.json();
        return { url: data.data[0].link, filename: data.data[0].nama, filesize: data.data[0].size, mimetype: data.data[0].mime };
      },
      async () => {
        const res = await fetch(`https://api.siputzx.my.id/api/d/mediafire?url=${args[0]}`);
        const data = await res.json();
        return data.data.map(file => ({ url: file.link, filename: file.filename, filesize: file.size, mimetype: file.mime }))[0];
      }
    ];

    let fileData = null;
    for (const attempt of downloadAttempts) {
      try {
        fileData = await attempt();
        if (fileData) break;
      } catch (err) {
        console.error(`Error en intento: ${err.message}`);
        continue;
      }
    }

    if (!fileData) throw new Error('No se pudo descargar el archivo desde ninguna API');

    const file = Array.isArray(fileData) ? fileData[0] : fileData;
    const caption = `┏━━『 𝐌𝐄𝐃𝐈𝐀𝐅𝐈𝐑𝐄 』━━•
┃🔰 𝐍𝐨𝐦𝐛𝐫𝐞 : ${file.filename}
┃⚡️ 𝐏𝐞𝐬𝐨 : ${file.filesize}
┃📂 𝐓𝐢𝐩𝐨 : ${file.mimetype}
╰━━━⊰ 𓃠 ${info.vs} ⊱━━━━•\n> ⏳ Espera un momento en los envíos de tus archivos`.trim();

    const captionMessage = await conn.reply(m.chat, caption, m);
    userCaptions.set(m.sender, captionMessage);
    await conn.sendFile(m.chat, file.url, file.filename, '', m, null, { mimetype: file.mimetype, asDocument: true });
    m.react('✅');

  } catch (e) {
    await conn.sendFile(m.chat, sticker, 'error.webp', '', m);
    m.react('❌');
    console.error(e);
  } finally {
    delete userRequests[m.sender];
  }
};

handler.help = ['mediafire', 'mediafiredl'];
handler.tags = ['descargas'];
handler.command = /^(mediafire|mediafiredl|dlmediafire)$/i;
handler.limit = 3;

export default handler;
