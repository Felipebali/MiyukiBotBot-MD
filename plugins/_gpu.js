// 📂 plugins/gpu.js
const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net', '59892363485@s.whatsapp.net']; // Dueños autorizados

let handler = async (m, { conn, args }) => {
  try {
    const sender = m.sender;

    if (!ownerNumbers.includes(sender))
      return m.reply('🚫 Solo los dueños del bot pueden usar este comando.');

    // 🧩 Determinar target:
    let target = null;

    // 1️⃣ Si mencionó a alguien
    if (m.mentionedJid && m.mentionedJid.length > 0) {
      target = m.mentionedJid[0];
    }

    // 2️⃣ Si citó un mensaje
    else if (m.quoted && m.quoted.sender) {
      target = m.quoted.sender;
    }

    // 3️⃣ Si puso un número como argumento
    else if (args[0]) {
      let num = args[0].replace(/[^0-9]/g, ''); // Quitar símbolos y letras
      if (num.length < 8)
        return m.reply('❌ Número no válido. Usa el formato: .gpu 5989xxxxxxx');
      target = `${num}@s.whatsapp.net`;
    }

    // Si no hay target, error
    if (!target)
      return m.reply('❌ Debes mencionar, citar o escribir el número de alguien.');

    const simpleTarget = target.split('@')[0];

    // 🖼️ Intentar obtener la foto de perfil
    let ppUrl;
    try {
      ppUrl = await conn.profilePictureUrl(target, 'image');
    } catch {
      ppUrl = null;
    }

    if (!ppUrl)
      return m.reply(`❌ No se pudo obtener la foto de perfil de @${simpleTarget}.`, {
        mentions: [target],
      });

    // 📤 Enviar imagen
    await conn.sendMessage(
      m.chat,
      {
        image: { url: ppUrl },
        caption: `📥 Foto de perfil de @${simpleTarget}`,
        mentions: [target],
      },
      { quoted: m }
    );
  } catch (err) {
    console.error(err);
    m.reply('⚠️ Ocurrió un error al intentar obtener la foto.');
  }
};

handler.command = /^(gpu)$/i;
handler.tags = ['owner', 'tools'];
handler.help = ['gpu [@usuario | número | cita]'];
handler.group = false;

export default handler;
