// plugins/grupos-Tag.js
import baileys from '@whiskeysockets/baileys';
const { generateWAMessageFromContent } = baileys;
import * as fs from 'fs';

const handler = async (m, { conn, text, participants }) => {
  try {
    const users = participants.map(u => conn.decodeJid(u.id));
    const q = m.quoted ? m.quoted : m || m.text || m.sender;
    const c = m.quoted ? await m.getQuotedObj() : m.msg || m.text || m.sender;

    const msg = conn.cMod(
      m.chat,
      generateWAMessageFromContent(
        m.chat,
        { [m.quoted ? q.mtype : 'extendedTextMessage']: m.quoted ? c.message[q.mtype] : { text: '' || c } },
        { userJid: conn.user.id } // no citado
      ),
      text || q.text,
      conn.user.jid,
      { mentions: users }
    );

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

  } catch {
    const users = participants.map(u => conn.decodeJid(u.id));
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || '';
    const isMedia = /image|video|sticker|audio/.test(mime);
    const more = String.fromCharCode(8206);
    const masss = more.repeat(850);
    const htextos = `${text ? text : '🐉 Debes enviar un texto para hacer un tag.'}`;

    if ((isMedia && quoted.mtype === 'imageMessage') && htextos) {
      const mediax = await quoted.download?.();
      conn.sendMessage(m.chat, { image: mediax, caption: htextos, mentions: users });
    } else if ((isMedia && quoted.mtype === 'videoMessage') && htextos) {
      const mediax = await quoted.download?.();
      conn.sendMessage(m.chat, { video: mediax, mimetype: 'video/mp4', caption: htextos, mentions: users });
    } else if ((isMedia && quoted.mtype === 'audioMessage') && htextos) {
      const mediax = await quoted.download?.();
      conn.sendMessage(m.chat, { audio: mediax, mimetype: 'audio/mpeg', fileName: `Hidetag.mp3`, mentions: users });
    } else if ((isMedia && quoted.mtype === 'stickerMessage') && htextos) {
      const mediax = await quoted.download?.();
      conn.sendMessage(m.chat, { sticker: mediax, mentions: users });
    } else {
      await conn.relayMessage(
        m.chat,
        {
          extendedTextMessage: {
            text: `${masss}\n${htextos}\n`,
            contextInfo: {
              mentionedJid: users,
              externalAdReply: {
                thumbnail: imagen1,
                sourceUrl: md
              }
            }
          }
        },
        {}
      );
    }
  }
};

handler.help = ['tag'];
handler.tags = ['grupo'];
handler.command = ['tag'];
handler.group = true;
handler.admin = true;

export default handler;
