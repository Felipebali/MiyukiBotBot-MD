import axios from 'axios';

const handler = async (m, { args, conn }) => {
  const emoji = "📸";
  const msm = "❌";
  const rwait = "⏳";
  const done = "✅";
  const error = "⚠️";

  if (!args[0]) {
    return conn.reply(m.chat, `${emoji} Por favor, ingresa un enlace de Instagram.`, m);
  }

  try {
    if (typeof m.react === 'function') m.react(rwait);

    // 🔹 API pública gratuita para Instagram
    const apiUrl = `https://api.lolhuman.xyz/api/instagram?apikey=your_api_key&url=${encodeURIComponent(args[0])}`;
    const { data } = await axios.get(apiUrl);
    const mediaList = data.result || [];

    if (!mediaList.length) {
      if (typeof m.react === 'function') m.react(error);
      return conn.reply(m.chat, `${msm} No se pudo obtener el contenido.`, m);
    }

    for (let media of mediaList) {
      await conn.sendFile(
        m.chat,
        media.url,
        'instagram.mp4',
        `${emoji} Aquí tienes tu video de Instagram :3`,
        m
      );
    }

    if (typeof m.react === 'function') m.react(done);

  } catch (e) {
    if (typeof m.react === 'function') m.react(error);
    return conn.reply(m.chat, `${msm} Ocurrió un error al procesar el enlace.`, m);
  }
};

handler.command = ['instagramdl', 'igdl'];
handler.tags = ['descargas'];
handler.help = ['instagramdl <link>', 'igdl <link>'];
handler.register = true;

export default handler;
