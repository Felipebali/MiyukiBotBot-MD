// Créditos actualizados para FelixCat-Bot

async function handler(m, { conn, usedPrefix }) {
  try {
    await m.react('👨‍💻');

    const imageUrl = 'https://files.catbox.moe/in2ou9.jpg'; // Podés cambiar la imagen por tu logo

    const messageText = `
🤖 *FelixCat-Bot*
👤 *Creador:* Balkoszky 🇵🇱
📱 *Número:* +59898719147
🌐 *GitHub:* https://github.com/FelipeBali
📸 *Instagram:* https://www.instagram.com/feli_bali
`;

    await conn.sendMessage(
      m.chat,
      {
        image: { url: imageUrl },
        caption: messageText,
        footer: '*⚡ Bot Personalizado por Balkoszky🇵🇱*',
        headerType: 4,
      },
      { quoted: m }
    );
  } catch (error) {
    console.error('Error:', error);
    await conn.sendMessage(m.chat, {
      text: `
🤖 *FelixCat-Bot*
👤 *Creador:* Balkoszky 🇵🇱
📱 *Número:* +59898719147
🌐 *GitHub:* https://github.com/FelipeBali
📸 *Instagram:* https://www.instagram.com/feli_bali

*⚡ Bot Personalizado por Balkoszky🇵🇱*
`,
    });
  }
}

handler.help = ['creador'];
handler.tags = ['info'];
handler.command = ['creator', 'creador', 'dueño'];

export default handler;
