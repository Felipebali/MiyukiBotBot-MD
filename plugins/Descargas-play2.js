import yts from 'yt-search';
import fetch from 'node-fetch';

async function descargarVideo(url) {
  const apiURL = `https://api.sylphy.xyz/download/ytmp4?url=${encodeURIComponent(url)}&apikey=sylphy-fbb9`;
  const res = await fetch(apiURL);
  const data = await res.json();
  if (!data.status || !data.res?.url) throw new Error('No se pudo obtener el video');
  return { url: data.res.url, title: data.res.title || 'Video sin título' };
}

let handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) {
    return conn.reply(m.chat, `⚡️ *FelixCat-Bot* ⚡️\n\nUso:\n${usedPrefix}play2 <nombre del video>\nEj: ${usedPrefix}play2 spy x family opening`, m);
  }

  try {
    await conn.reply(m.chat, '🎬 Buscando tu video en YouTube...', m);

    const resultados = await yts(text);
    if (!resultados.videos.length) throw new Error('No se encontraron resultados');

    const video = resultados.videos[0];
    const { url, title } = await descargarVideo(video.url);

    const caption = `⚡️ *FelixCat-Bot* ⚡️\n🏷 Título: *${title}*\n⏳ Duración: ${video.timestamp}\n👑 Autor: ${video.author.name}`;

    const buffer = await fetch(url).then(res => res.buffer());

    await conn.sendMessage(m.chat, {
      video: buffer,
      mimetype: 'video/mp4',
      fileName: `${title}.mp4`,
      caption
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, `❌ Error: ${e.message}`, m);
  }
};

handler.help = ['play2 <nombre>'];
handler.tags = ['descargas'];
handler.command = ['play2'];

export default handler;
