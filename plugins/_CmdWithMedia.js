import { proto, generateWAMessage, areJidsSameUser } from '@whiskeysockets/baileys';

export async function all(m, chatUpdate, conn) {
  if (m.isBaileys) return;
  if (!m.message) return;
  if (!m.msg?.fileSha256) return;

  const hashKey = Buffer.from(m.msg.fileSha256).toString('base64');
  if (!(hashKey in global.db.data.sticker)) return;

  const hash = global.db.data.sticker[hashKey];
  const { text, mentionedJid } = hash;

  const messages = await generateWAMessage(
    m.chat,
    { text, mentions: mentionedJid || [] },
    {
      userJid: conn.user.id,
      quoted: m.quoted?.fakeObj,
    }
  );

  messages.key.fromMe = areJidsSameUser(m.sender, conn.user.id);
  messages.key.id = m.key.id;

  if (m.isGroup) messages.participant = m.sender;

  const msg = {
    ...chatUpdate,
    messages: [proto.WebMessageInfo.fromObject(messages)],
    type: 'append',
  };

  conn.ev.emit('messages.upsert', msg);
}
