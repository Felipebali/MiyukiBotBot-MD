import fetch from 'node-fetch';
import axios from 'axios';

const userRequests = {};

const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!args[0]) return m.reply(`⚠️ Ingrese un enlace de Facebook para descargar el video\nEj: ${usedPrefix + command} https://www.facebook.com/...`);
  if (!args[0].match(/www.facebook.com|fb.watch/g)) return m.reply(`⚠️ Ingrese un enlace válido de Facebook\nEj: ${usedPrefix + command} https://www.facebook.com/...`);

  if (userRequests[m.sender]) 
    return await conn.reply(m.chat, `⚠️ @${m.sender.split('@')[0]} Calmao, ya estás bajando un video 🙄\nEspera a que termine tu descarga actual...`, m);

  userRequests[m.sender] = true;
  m.react('⌛');

  try {
    const downloadAttempts = [
      async () => {
        const api = await fetch(`https://api.agatz.xyz/api/facebook?url=${args[0]}`);
        const data = await api.json();
        const videoUrl = data.data.hd || data.data.sd;
        const imageUrl = data.data.thumbnail;
        if (videoUrl) return { type: 'video', url: videoUrl, caption: '✅ Aquí está tu video de Facebook' };
        if (imageUrl) return { type: 'image', url: imageUrl, caption: '✅ Aquí está la imagen de Facebook' };
      },
      async () => {
        const api = await fetch(`${info.fgmods.url}/downloader/fbdl?url=${args[0]}&apikey=${info.fgmods.key}`);
        const data = await api.json();
        const downloadUrl = data.result[0].hd || data.result[0].sd;
        return { type: 'video', url: downloadUrl, caption: '✅ Aquí está tu video de Facebook' };
      },
      async () => {
        const apiUrl = `${info.apis}/download/facebook?url=${args[0]}`;
        const apiResponse = await fetch(apiUrl);
        const delius = await apiResponse.json();
        const downloadUrl = delius.urls[0].hd || delius.urls[0].sd;
        return { type: 'video', url: downloadUrl, caption: '✅ Aquí está tu video de Facebook' };
      },
      async () => {
        const apiUrl = `https://api.dorratz.com/fbvideo?url=${encodeURIComponent(args[0])}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        const hdUrl = data.result.hd;
        const sdUrl = data.result.sd;
        const downloadUrl = hdUrl || sdUrl;
        return { type: 'video', url: downloadUrl, caption: '✅ Aquí está tu video de Facebook' };
      }
    ];

    let mediaData = null;
    for (const attempt of downloadAttempts) {
      try {
        mediaData = await attempt();
        if (mediaData) break;
      } catch (err) {
        console.error(`Error en intento: ${err.message}`);
        continue;
      }
    }

    if (!mediaData) throw new Error('No se pudo descargar el video o imagen desde ninguna API');

    const fileName = mediaData.type === 'video' ? 'video.mp4' : 'thumbnail.jpg';
    await conn.sendFile(m.chat, mediaData.url, fileName, mediaData.caption, m);
    m.react('✅');

  } catch (e) {
    m.react('❌');
    console.log(e);
    m.reply('❌ Ocurrió un error al descargar el video.');
  } finally {
    delete userRequests[m.sender];
  }
};

handler.help = ['fb', 'facebook', 'fbdl'];
handler.tags = ['descargas'];
handler.command = /^(facebook|fb|facebookdl|fbdl|facebook2|fb2|facebookdl2|fbdl2|facebook3|fb3|facebookdl3|fbdl3|facebook4|fb4|facebookdl4|fbdl4|facebook5|fb5|facebookdl5|fbdl5)$/i;

export default handler;
