// 📂 plugins/gpo.js
const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net', '59892363485@s.whatsapp.net']; // Dueños

let handler = async (m, { conn }) => {
  try {
    const sender = m.sender;

    // Solo owners pueden usarlo
    if (!ownerNumbers.includes(sender)) return m.reply('🚫 Solo los dueños del bot pueden usar este comando.');

    const groupId = m.chat; // JID del grupo

    // Obtener foto de perfil del grupo
    let ppUrl = null;
    try {
      ppUrl = await conn.profilePictureUrl(groupId, 'image').catch(() => null);
    } catch {}
    if (!ppUrl) return m.reply('❌ Este grupo no tiene foto de perfil.');

    // Enviar la foto del grupo
    await conn.sendMessage(
      m.chat,
      {
        image: { url: ppUrl },
        caption: `📸 Foto del grupo`
      },
      { quoted: m }
    );

  } catch (err) {
    console.error(err);
    m.reply('⚠️ Ocurrió un error al intentar descargar la foto del grupo.');
  }
};

handler.command = /^(gpo)$/i;
handler.tags = ['owner', 'tools'];
handler.help = ['gpo'];
handler.group = true; // solo funciona en grupos
export default handler;
