// plugins/_suicidarse.js
// 🛑 PREVENCIÓN + MENSAJE DE APOYO
// .suicidarse → mensaje motivador + recursos de ayuda

const frases = [
  "💙 Tu vida vale más de lo que hoy estás sintiendo.",
  "🌤️ No estás solo/a, pedir ayuda es un acto de valentía.",
  "🫂 Incluso en los días más oscuros, tu vida importa.",
  "💪 Resistir también es una forma de ganar.",
  "🌱 Siempre hay algo nuevo que puede llegar.",
  "🧠 Lo que hoy pesa, mañana puede doler menos.",
  "❤️ No estás roto/a, estás luchando."
];

const handler = async (m, { conn }) => {
  // ✅ Solo en grupos
  if (!m.isGroup)
    return conn.reply(m.chat, '❗ Este comando solo funciona en grupos.', m);

  try {
    const user = m.sender;
    const frase = frases[Math.floor(Math.random() * frases.length)];

    // 💙 Mensaje de contención
    const mensaje = `
🛑 *@${user.split("@")[0]}*, este mensaje es importante:

${frase}

📞 *Uruguay – Líneas de ayuda:*
• *0800 0767* — Línea Vida (24h)
• *911* — Emergencias

Pedir ayuda no es debilidad. 💙
`.trim();

    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: [user]
    });

    // Reacción de apoyo
    await conn.sendMessage(m.chat, { react: { text: '💙', key: m.key } });

  } catch (err) {
    console.error('Error en .suicidarse:', err);
  }
};

handler.help = ['suicidarse'];
handler.tags = ['prevencion'];
handler.command = ['suicidarse'];
handler.group = true;

export default handler;
