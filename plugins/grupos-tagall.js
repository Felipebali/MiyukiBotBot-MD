// 📂 plugins/tagall.js — FelixCat-Bot 🐾
// TagAll con toggle .antitagall — sin citar nunca

let handler = async function (m, { conn, groupMetadata, args, isAdmin, isOwner, command }) {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

  const chatId = m.chat;

  // Inicializar configuración del chat
  if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {};
  const chatData = global.db.data.chats[chatId];

  // 🔥 Toggle .antitagall — SOLO ADMIN / OWNER
  if (command === 'antitagall') {
    if (!(isAdmin || isOwner)) {
      return await conn.sendMessage(chatId, { text: '❌ Solo un administrador puede usar este comando.' });
    }

    chatData.tagallEnabled = !chatData.tagallEnabled;
    return await conn.sendMessage(chatId, { 
      text: `⚡ TagAll ahora está ${chatData.tagallEnabled ? 'activado ✅' : 'desactivado ❌'} para este grupo.` 
    });
  }

  // ===========================
  // TagAll normal (.tagall / .invocar / .todos)
  // ===========================

  if (!(isAdmin || isOwner)) {
    return await conn.sendMessage(chatId, {
      text: '❌ Solo un administrador puede usar este comando.',
      mentions: [m.sender]
    });
  }

  if (!chatData.tagallEnabled) {
    return await conn.sendMessage(chatId, { text: '⚠️ El TagAll está desactivado. Usa ".antitagall" para activarlo.' });
  }

  const participantes = groupMetadata?.participants || [];
  const mencionados = participantes.map(p => p.id).filter(Boolean);

  const mensajeOpcional = args.length ? args.join(' ') : '';

  const mensaje = [
    `🔥 Se activó el tag de todos! 🔥`,
    `⚡ Usuarios invocados:`,
    mencionados.map(jid => `- @${jid.split('@')[0]}`).join('\n'),
    '💥 Que comience la acción!',
    'https://miunicolink.local/tagall-FelixCat',
    mensajeOpcional
  ].filter(Boolean).join('\n');

  // Envía el mensaje SIN citar NADA
  await conn.sendMessage(chatId, { text: mensaje, mentions: mencionados.concat(m.sender) });
};

// Comandos
handler.command = ['invocar', 'todos', 'tagall', 'antitagall'];
handler.help = ['tagall / .antitagall (toggle)'];
handler.tags = ['grupos'];
handler.group = true;
handler.admin = true;

export default handler;
