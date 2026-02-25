import fetch from 'node-fetch';

// Normalizador de JID para evitar fallos
function cleanJid(jid = "") {
  if (typeof jid !== "string") return "";
  return jid
    .replace(/:[0-9]+/g, "")   // elimina device IDs ':0' ':18' etc.
    .replace(/\/.+$/, "");     // elimina sufijos '/something'
}

const handler = async (m, { conn, command, text, isAdmin }) => {
  try {
    if (!isAdmin) throw '🌳 *Solo un administrador puede ejecutar este comando*';

    const ownerId = (global.owner && global.owner[0] && global.owner[0][0])
      ? `${global.owner[0][0]}@s.whatsapp.net`
      : null;

    let target = m.mentionedJid?.[0] || m.quoted?.sender || text || '';
    target = typeof target === 'object' ? (target[0] || '') : target;

    if (target && !target.includes('@')) target = target.replace(/\D/g, '') + '@s.whatsapp.net';
    if (!target) throw '❄️ Especifica a quién mutear/desmutear (mención, reply o número).';

    target = cleanJid(target);

    if (ownerId && target === ownerId) throw '🍬 *El creador del bot no puede ser mutado*';
    if (target === cleanJid(conn.user?.jid)) throw '🍭 *No puedes mutar el bot*';

    if (!global.db) global.db = { data: { users: {} } };
    if (!global.db.data) global.db.data = { users: {} };
    if (!global.db.data.users) global.db.data.users = {};
    if (!global.db.data.users[target]) global.db.data.users[target] = { mute: false };

    const userData = global.db.data.users[target];

    // ============================
    // 🔇 MUTE
    // ============================
    if (command === 'mute') {
      if (userData.mute === true) throw '🍭 *Este usuario ya ha sido mutado*';

      const thumbnail = await (await fetch('https://telegra.ph/file/f8324d9798fa2ed2317bc.png')).buffer();
      const quotedMsg = {
        key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'mute-id' },
        message: { locationMessage: { name: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 mutado', jpegThumbnail: thumbnail } },
        participant: '0@s.whatsapp.net'
      };

      userData.mute = true;

      await conn.sendMessage(
        m.chat,
        {
          text: `*🔇 Usuario muteado*\n👉 @${target.split("@")[0]} ahora está silenciado.`,
          mentions: [target]
        },
        { quoted: quotedMsg }
      );

      return;
    }

    // ============================
    // 🔊 UNMUTE
    // ============================
    if (command === 'unmute') {
      if (userData.mute === false) throw '🍭 *Este usuario no está muteado*';

      const thumbnail = await (await fetch('https://telegra.ph/file/aea704d0b242b8c41bf15.png')).buffer();
      const quotedMsg = {
        key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'unmute-id' },
        message: { locationMessage: { name: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 desmuteado', jpegThumbnail: thumbnail } },
        participant: '0@s.whatsapp.net'
      };

      userData.mute = false;

      await conn.sendMessage(
        m.chat,
        {
          text: `*🔊 Usuario desmuteado*\n👉 @${target.split("@")[0]} ahora puede hablar.`,
          mentions: [target]
        },
        { quoted: quotedMsg }
      );

      return;
    }

    throw 'Comando no reconocido.';

  } catch (err) {
    const e = typeof err === 'string' ? err : (err?.message || String(err));
    try {
      await conn.reply(m.chat, `🌿 Error: ${e}`, m);
    } catch (_) {}
  }
};

handler.command = ['mute', 'unmute'];
handler.admin = true;
handler.botAdmin = true;

// =====================================================
// 🧹 AUTO-DELETE — borra SIEMPRE los mensajes muteados
// =====================================================
handler.before = async (m, { conn, isBotAdmin }) => {
  try {
    if (!m.isGroup) return;
    if (!isBotAdmin) return;

    let sender = m.sender || m.key?.participant || m.participant || m.author;
    if (!sender) return;

    sender = cleanJid(sender);

    if (!global.db?.data?.users[sender]) return;
    if (!global.db.data.users[sender].mute) return;

    const metadata = await conn.groupMetadata(m.chat);
    const admins = metadata.participants
      .filter(p => p.admin)
      .map(p => cleanJid(p.id));

    if (admins.includes(sender)) return;

    await conn.sendMessage(m.chat, { delete: m.key });

  } catch (err) {
    console.log('Error en mute-before:', err);
  }
};

export default handler;
