const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // Dueños del bot

const handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.');

  const sender = m.sender;
  const isOwner = ownerNumbers.includes(sender);
  const senderData = participants.find(p => p.id === sender);
  const isAdmin = senderData?.admin;

  // 🚫 Solo dueños o administradores pueden usar el comando
  if (!isOwner && !isAdmin) {
    return m.reply('🚫 Solo los administradores o los dueños pueden consultar las reglas del grupo.');
  }

  try {
    // Obtener metadatos del grupo
    const groupMetadata = await conn.groupMetadata(m.chat);
    const descripcion = groupMetadata.desc || '❌ Este grupo no tiene reglas establecidas.';

    // Frases militares aleatorias
    const frases = [
      '🪖 Todo soldado debe obedecer las reglas sin cuestionar.',
      '⚔️ La disciplina es la base del orden.',
      '💣 El caos será eliminado con precisión digital.',
      '📜 Las reglas son sagradas y deben cumplirse sin excepción.',
      '🔥 Quien rompa las reglas, conocerá la furia del comandante.'
    ];
    const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];

    const texto = `🎖️ *REGLAMENTO OFICIAL DEL GRUPO*\n\n${fraseAleatoria}\n\n📋 *REGLAS:*\n${descripcion}\n\n⚠️ *El incumplimiento será castigado con advertencias o fusilamiento digital.*`;

    await conn.sendMessage(m.chat, { text: texto });
  } catch (err) {
    console.error(err);
    m.reply('⚠️ No pude obtener las reglas. Asegúrate de que el bot sea administrador del grupo.');
  }
};

handler.command = ['reglas'];
handler.tags = ['group'];
handler.help = ['reglas'];
handler.group = true;

export default handler; 
