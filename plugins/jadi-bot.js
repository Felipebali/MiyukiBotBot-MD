// Código creado por The Carlos 👑 y modificado por Xzzys26 para Gaara-Ultra-MD
async function handler(m, { conn: stars, usedPrefix }) {
  const maxSubBots = 324;
  const conns = Array.isArray(global.conns) ? global.conns : [];

  const isConnOpen = c => c?.ws?.socket?.readyState === 1 || !!c?.user?.id;

  const uniqueUsers = new Map();
  for (const c of conns) {
    if (!c?.user || !isConnOpen(c)) continue;
    const jid = c.user.jid || c.user.id;
    if (!jid) continue;
    uniqueUsers.set(jid, c);
  }

  const users = [...uniqueUsers.values()];
  const totalUsers = users.length;
  const availableSlots = Math.max(0, maxSubBots - totalUsers);

  const title = `⚡『 𝙎𝙐𝘽-𝘽𝙊𝙏𝙎 𝙊𝙉𝙇𝙄𝙉𝙀 』⚡`;
  let responseMessage = '';

  if (!totalUsers) {
    responseMessage = `╭━━━〔 *${title}* 〕━━━╮
┃ ⚡ Sub-Bots activos: *0*
┃ ❌ Nadie conectado todavía
┃ 📜 Espacios disponibles: *${availableSlots}*
╰━━━━━━━━━━━━━━━━━━━━━━╯

> 📌 Conéctate ahora y forma parte de la red Ultra.`;
  } else {
    const listado = users.map((v, i) => {
      const num = v.user.jid.replace(/\D/g, '');
      const nombre = v.user.name || v.user.pushName || '🌟 Sub-Bot';
      const waLink = `https://wa.me/${num}?text=${usedPrefix}code`;
      return `╭━━━〔 ⚡ 𝙎𝙐𝘽-𝘽𝙊𝙏 #${i + 1} 〕━━━╮
┃ 👤 Usuario: @${num}
┃ ⚡️ Nombre: ${nombre}
┃ 🔗 Link: ${waLink}
╰━━━━━━━━━━━━━━━━━━━━━━╯`;
    }).join('\n\n');

    responseMessage = `╭━━━〔 *${title}* 〕━━━╮
┃ 📜 Total conectados: *${totalUsers}*
┃ ⚡ Espacios disponibles: *${availableSlots}*
╰━━━━━━━━━━━━━━━━━━━━━━╯

${listado}`.trim();
  }

  const imageUrl = 'https://files.catbox.moe/in2ou9.jpg'; // Cambia si quieres

  const fkontak = {
    key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" },
    message: { contactMessage: { displayName: "Subbot", vcard: "BEGIN:VCARD\nVERSION:3.0\nN:;Subbot;;;\nFN:Subbot\nEND:VCARD" } },
  };

  // Generar menciones únicas
  const mentions = typeof stars.parseMention === 'function'
    ? stars.parseMention(responseMessage)
    : [...new Set((responseMessage.match(/@(\d{5,16})/g) || []).map(v => v.replace('@', '') + '@s.whatsapp.net'))];

  try {
    await stars.sendMessage(
      m.chat,
      { image: { url: imageUrl }, caption: responseMessage, mentions },
      { quoted: fkontak }
    );
  } catch (e) {
    console.error('❌ Error enviando listado de subbots:', e);
    await stars.sendMessage(
      m.chat,
      { text: responseMessage, mentions },
      { quoted: fkontak }
    );
  }
}

handler.command = ['listjadibot', 'bots'];
handler.help = ['bots'];
handler.tags = ['jadibot'];
export default handler;
