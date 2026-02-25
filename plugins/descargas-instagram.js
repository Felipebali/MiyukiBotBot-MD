import { igdl } from 'ruhend-scraper';

const handler = async (m, { args, conn }) => {

  // Emojis locales (evita errores)
  const emoji = "📸";
  const msm = "❌";
  const rwait = "⏳";
  const done = "✅";
  const error = "⚠️";

  if (!args[0]) {
    return conn.reply(m.chat, `${emoji} Por favor, ingresa un enlace de Instagram.`, m);
  }

  try {
    await m.react(rwait);

    const res = await igdl(args[0]);
    const data = res.data || res.result || [];

    if (!data.length) {
      await m.react(error);
      return conn.reply(m.chat, `${msm} No se pudo obtener el contenido.`, m);
    }

    for (let media of data) {
      await conn.sendFile(
        m.chat,
        media.url,
        'instagram.mp4',
        `${emoji} Aquí tienes tu video de Instagram :3`,
        m
      );
    }

    await m.react(done);

  } catch (e) {
    await m.react(error);
    return conn.reply(m.chat, `${msm} Ocurrió un error al procesar el enlace.`, m);
  }
};

handler.command = ['instagramdl', 'igdl'];
handler.tags = ['descargas'];
handler.help = ['instagramdl <link>', 'igdl <link>'];
handler.register = true;

export default handler;
