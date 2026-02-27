import axios from 'axios';

global.emoji = '🎵';

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  try {
    if (!args[0]) {
      return conn.sendMessage(
        m.chat,
        { text: `⚡️ Debes ingresar un enlace de TikTok.\n\n📌 *Ejemplo:* ${usedPrefix + command} https://vm.tiktok.com/ZMreHF2dC/` },
        { quoted: m }
      );
    }

    if (!/(?:https?:\/\/)?(?:www\.|vm\.|vt\.|t\.?)?tiktok\.com\/([^\s&]+)/gi.test(args[0])) {
      return conn.sendMessage(m.chat, { text: `❎ Enlace de TikTok inválido.` }, { quoted: m });
    }

    if (typeof m.react === 'function') m.react('⌛');

    // 🔹 API pública de TikTok (ejemplo: tiktokdl.xyz)
    const { data } = await axios.get(`https://api.tiktokdl.xyz/?url=${args[0]}`);
    if (!data || !data.video) throw new Error('No se pudo obtener el video de TikTok');

    const videoUrl = data.video;
    const title = data.title || 'Sin título';
    const author = data.author_name || 'Desconocido';
    const duration = data.duration || 'Desconocida';

    const caption = `
╭━━━〔 ⚡️ *FelixCat-Bot-Descargas* ⚡️ 〕━━━⬣
┃ ❒ *Autor:* ${author}
┃ ❒ *Título:* ${title}
┃ ❒ *Duración:* ${duration}
╰━━━━━━━━━━━━━━━━━━━━━━⬣
`.trim();

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption
    }, { quoted: m });

    if (typeof m.react === 'function') m.react('✅');

  } catch (e) {
    if (typeof m.react === 'function') m.react('❌');
    return conn.sendMessage(m.chat, { text: `❌ *Error:* ${e.message}` }, { quoted: m });
  }
};

handler.help = ["tiktok"];
handler.tags = ["descargas"];
handler.command = ["tt", "tiktok", "ttdl"];

export default handler;
