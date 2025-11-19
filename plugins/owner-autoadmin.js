const handler = async (m, { conn, isAdmin }) => {
  const sender = m.sender.split('@')[0]; // solo el número sin @s.whatsapp.net
  const owners = global.owner.map(([num]) => num.replace(/[^0-9]/g, '')); // limpia los números de owners

  const isOwner = owners.includes(sender);

  if (!isOwner) {
    await m.react('❌');
    return conn.sendMessage(m.chat, { text: 'Sos 🧑🏿‍🦱 qué esperas que te de admin? 😏' });
  }

  if (isAdmin) {
    return conn.sendMessage(m.chat, { text: '👑 *Tú ya sos admin, maestro.*' });
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote');
    await m.react('✔️');
    await conn.sendMessage(m.chat, { text: '👑 *Listo, jefe. Ya sos admin 🥷.*' });
  } catch {
    await conn.sendMessage(m.chat, { text: '⚠️ Ocurrió un error al intentar darte admin.' });
  }
};

handler.tags = ['owner'];
handler.help = ['autoadmin'];
handler.command = ['autoadmin'];
handler.rowner = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
