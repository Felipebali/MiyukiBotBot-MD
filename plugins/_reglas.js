// 📂 plugins/reglas.js — FelixCat-Bot 🐾
// Muestra las reglas del grupo — solo administradores

let handler = async function (m, { conn, groupMetadata, isAdmin }) {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

  // ✅ Solo administradores pueden usarlo
  if (!isAdmin) {
    return await conn.sendMessage(m.chat, { 
      text: '🚫 Solo los administradores pueden consultar las reglas del grupo.',
      mentions: [m.sender]
    });
  }

  try {
    // Obtener descripción / reglas del grupo
    const descripcion = groupMetadata?.desc || '❌ Este grupo no tiene reglas establecidas.';

    // Frases aleatorias tipo militar
    const frases = [
      '🪖 Todo soldado debe obedecer las reglas sin cuestionar.',
      '⚔️ La disciplina es la base del orden.',
      '💣 El caos será eliminado con precisión digital.',
      '📜 Las reglas son sagradas y deben cumplirse sin excepción.',
      '🔥 Quien rompa las reglas, conocerá la furia del comandante.'
    ];
    const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];

    // Mensaje final
    const texto = [
      '🎖️ *REGLAMENTO OFICIAL DEL GRUPO*',
      '',
      fraseAleatoria,
      '',
      `📋 *REGLAS:*\n${descripcion}`,
      '',
      '⚠️ *El incumplimiento será castigado con advertencias o fusilamiento digital.*'
    ].join('\n');

    await conn.sendMessage(m.chat, { text: texto });

  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { text: '⚠️ No pude obtener las reglas. Asegúrate de que el bot sea administrador del grupo.' });
  }
};

// Comandos
handler.command = ['reglas'];
handler.help = ['.reglas (solo admins)'];
handler.tags = ['grupos'];
handler.group = true;
handler.admin = true;

export default handler;
