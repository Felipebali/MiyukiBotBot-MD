let handler = async (m, { conn }) => {
  let chat = global.db.data.chats[m.chat];
  if (chat.nsfw === undefined) chat.nsfw = false;

  // Verificar si NSFW está activado
  if (!chat.nsfw) {
    await conn.sendMessage(m.chat, { text: '❌ Este comando +18 está desactivado en este chat. Pide a un dueño activar NSFW.' });
    return;
  }

  let who = m.sender;
  let targetJid = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0]);
  let senderName = '@' + who.split('@')[0];
  let targetName = targetJid ? '@' + targetJid.split('@')[0] : null;

  // Mensajes sexuales +18 🔥😈
  const mensajes18 = [
    `💋 ${senderName} se acercó lentamente a ${targetName} y dejó un beso ardiente en sus labios 😈🔥`,
    `💋 ${senderName} besó a ${targetName} con deseo y un toque travieso, imposible de resistir 😏🔥`,
    `💋 ${senderName} mordisqueó suavemente los labios de ${targetName} mientras lo abrazaba 🔥😳`,
    `💋 ${senderName} se dio un beso provocativo a sí mismo, imaginando a ${targetName} 😈🔥`,
    `💋 ${senderName} y ${targetName} compartieron un beso intenso y cargado de pasión 🔥😏`,
    `💋 ${senderName} rozó sus labios con los de ${targetName} de manera atrevida y sensual 🔥😈`,
    `💋 ${senderName} susurró al oído de ${targetName} algo travieso mientras lo besaba 🔥😏`,
    `💋 ${senderName} abrazó a ${targetName} por detrás y lo besó apasionadamente 😈🔥`,
    `💋 ${senderName} atrapó a ${targetName} en un beso inesperado y ardiente 😏🔥`,
    `💋 ${senderName} acarició el rostro de ${targetName} antes de darle un beso intenso 😳🔥`,
    `💋 ${senderName} se acercó lentamente, miró a ${targetName} con deseo y lo besó 😈🔥`,
    `💋 ${senderName} y ${targetName} compartieron un momento travieso y lleno de pasión 🔥😏`,
    `💋 ${senderName} jugó con ${targetName} y terminó besándolo con deseo 😈🔥`
  ];

  let mensajesSolo = [
    `💋 ${senderName} se dio un beso travieso a sí mismo 😏🔥`,
    `💋 ${senderName} imaginó un beso ardiente mientras se acariciaba 😈🔥`,
    `💋 ${senderName} se abrazó y se dio un beso provocativo 😳🔥`,
    `💋 ${senderName} se miró al espejo y se dio un beso intenso 😈🔥`,
    `💋 ${senderName} suspiró pensando en un beso travieso consigo mismo 😏🔥`
  ];

  // Selección aleatoria
  let textMessage;
  if (!targetJid || targetJid === who) {
    textMessage = mensajesSolo[Math.floor(Math.random() * mensajesSolo.length)];
  } else {
    textMessage = mensajes18[Math.floor(Math.random() * mensajes18.length)];
  }

  let mentions = targetJid ? [who, targetJid] : [who];

  // Enviar mensaje +18 sexual
  await conn.sendMessage(m.chat, { text: textMessage, mentions });
};

handler.command = ['kiss18'];
handler.help = ['kiss18 @usuario'];
handler.tags = ['fun', 'nsfw'];

export default handler;
