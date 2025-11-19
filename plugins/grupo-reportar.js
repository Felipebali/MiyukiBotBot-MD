
const handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.');

  // Obtener administradores del grupo
  const admins = participants?.filter(p => p.admin) || [];
  if (!admins.length) return m.reply('⚠️ No hay administradores en este grupo.');

  const senderTag = `@${m.sender.split('@')[0]}`;

  // Frases aleatorias estilo militar
  const frases = [
    '🪖 *Atención, oficiales:* hay un nuevo incidente en curso.',
    '⚡ *Alerta táctica:* intervención administrativa solicitada.',
    '🚨 *Comando de control:* se requiere revisión inmediata.',
    '🔥 *Reporte prioritario:* revisar situación en el frente.',
    '🎯 *Aviso de campo:* supervisión requerida.'
  ];
  const frase = frases[Math.floor(Math.random() * frases.length)];

  // Texto del aviso
  const aviso = `⚠️ *ALERTA EN EL GRUPO* ⚠️\n\n${frase}\n\n📣 *Solicitado por:* ${senderTag}\n\n👮 *Administradores:* ${admins.map(a => '@' + a.id.split('@')[0]).join(', ')}`;

  // Menciones: usuario + admins
  const mentions = [m.sender, ...admins.map(a => a.id)];

  try {
    // Cita siempre el mensaje donde se usó el comando
    await conn.sendMessage(
      m.chat,
      {
        text: aviso,
        mentions
      },
      { quoted: m }
    );
  } catch (err) {
    console.error('Error al enviar aviso:', err);
    m.reply('❌ Ocurrió un error al intentar avisar a los administradores.');
  }
};

handler.command = ['avisar', 'reportar'];
handler.help = ['avisar', 'reportar'];
handler.tags = ['group'];
handler.group = true;

export default handler;
