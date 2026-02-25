// plugins/_link.js
// 🔗 Comando: .link (solo para owners)
// 💀 Si alguien no autorizado lo usa, es expulsado

const owners = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // ✅ dueños autorizados

const handler = async (m, { conn, isBotAdmin }) => {
  if (!m.isGroup)
    return conn.reply(m.chat, '❗ Este comando solo puede usarse dentro de grupos.', m);

  const isOwner = owners.includes(m.sender);

  // 🚫 Si no es dueño, lo descansa
  if (!isOwner) {
    if (!isBotAdmin)
      return conn.reply(m.chat, '😼 No sos mi dueño... y encima no soy admin.', m);

    await conn.reply(
      m.chat,
      `💀 *${m.pushName || 'Usuario'}*, no sos mi dueño.\nTe voy a descansar un rato...`,
      m
    );
    await conn.sendMessage(m.chat, { react: { text: '☠️', key: m.key } });
    await new Promise(resolve => setTimeout(resolve, 1500));
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    return;
  }

  // 👑 Si es dueño
  if (!isBotAdmin)
    return conn.reply(m.chat, '❗ Necesito ser *administrador del grupo* para obtener el enlace.', m);

  try {
    await conn.sendMessage(m.chat, { react: { text: '😼', key: m.key } });

    const code = await conn.groupInviteCode(m.chat);
    const link = `https://chat.whatsapp.com/${code}`;
    const metadata = await conn.groupMetadata(m.chat);

    // 🎩 Frases especiales para dueños
    const frases = [
      '🐾 A la orden, mi creador.',
      '😼 Siempre listo para servirte, sensei.',
      '👑 Solo tú controlas los hilos del destino del grupo.',
      '⚡ Obedeciendo a mi amo felino supremo...',
      '🦾 Poder y control absoluto, como siempre, jefe.',
    ];
    const frase = frases[Math.floor(Math.random() * frases.length)];

    const texto = `
╭━━━〔 *🌐 Enlace del grupo* 〕━━━⬣
┃ 📛 *Nombre:* ${metadata.subject}
┃ 👥 *Miembros:* ${metadata.participants.length}
┃ 🔗 *Invitación:* 
┃ ${link}
╰━━━━━━━━━━━━━━━━━━━━━━⬣
${frase}
🐾 *FelixCat_Bot — Conectando Garras y Grupos*
`.trim();

    await conn.reply(m.chat, texto, m);
  } catch (err) {
    console.error(err);
    await conn.reply(
      m.chat,
      '❗ No pude obtener el enlace. Asegúrate de que el bot sea administrador.',
      m
    );
  }
};

handler.help = ['link'];
handler.tags = ['owner'];
handler.command = ['link', 'glink'];
handler.group = true;

export default handler;
