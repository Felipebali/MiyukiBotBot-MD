// plugins/_admin-request.js
let lastIndex = -1;

// 🧠 Lista de dueños
const owners = ['59896026646', '59898719147', '59892363485'];

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return; // Solo en grupos
    if (!m.text) return;

    const texto = m.text.toLowerCase();
    if (!(texto.includes('dame admin') || texto.includes('quiero admin'))) return;

    const who = m.sender;
    const senderNum = who.split('@')[0];

    // Si el que lo dice es owner
    if (owners.includes(senderNum)) {
      try {
        // Dar admin al dueño
        await conn.groupParticipantsUpdate(m.chat, [who], 'promote');
        await conn.sendMessage(m.chat, {
          text: `👑 @${senderNum} ya te doy admin.`,
          mentions: [who]
        });
      } catch (e) {
        await conn.sendMessage(m.chat, {
          text: `⚠️ No pude darte admin, revisá mis permisos.`,
          mentions: [who]
        });
      }
      return;
    }

    // Si no es owner, responder con mensajes aleatorios
    const mensajes = [
      `@${senderNum}, calma ahí 😎, no puedes pedir admin así 😏`,
      `@${senderNum}, sorry amigo/a, admin no se pide, se gana 😅`,
      `@${senderNum}, jaja tranquilo/a, hoy no toca admin 😆`,
      `@${senderNum}, admin no se da, se gana con estilo 😎`,
      `@${senderNum}, hoy no hay admin para nadie 😜`
    ];

    // Elegir mensaje aleatorio sin repetir
    let index;
    do {
      index = Math.floor(Math.random() * mensajes.length);
    } while (index === lastIndex);
    lastIndex = index;

    await conn.sendMessage(m.chat, {
      text: mensajes[index],
      mentions: [who]
    });

  } catch (err) {
    console.error('Error en _admin-request.js:', err);
  }
};

handler.customPrefix = /^(dame admin|quiero admin)/i;
handler.command = new RegExp();
handler.group = true;

export default handler;
