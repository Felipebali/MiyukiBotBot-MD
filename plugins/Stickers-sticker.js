import { sticker } from '../lib/sticker.js';

let handler = async (m, { conn, args }) => {
    let stiker;
    try {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || q.mediaType || '';

        if (/webp|image|video/g.test(mime)) {
            if (/video/g.test(mime)) {
                if ((q.msg || q).seconds > 8)
                    return m.reply(`☁️ *¡El video no puede durar más de 8 segundos!*`);
            }

            let img = await q.download?.();
            if (!img) return m.reply(`🐉 *_Envía primero imagen/video/gif y luego responde con el comando._*`, m);

            stiker = await sticker(img, false, global.packname, global.author);

        } else if (args[0] && isUrl(args[0])) {
            stiker = await sticker(false, args[0], global.packname, global.author);
        } else {
            return m.reply(`💫 URL incorrecta o formato no soportado`);
        }
    } catch (e) {
        console.error(e);
        return m.reply('⚡ Error al generar el sticker', m);
    }

    if (stiker) {
        await conn.sendFile(
            m.chat,
            stiker,
            'sticker.webp',
            '', 
            m,
            true
        );
    }
};

handler.help = ['stiker <img>', 'sticker <url>'];
handler.tags = ['sticker'];
handler.command = ['s', 'sticker', 'stiker'];

export default handler;

const isUrl = (text) => {
    return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'));
};
