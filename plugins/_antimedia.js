// 📂 plugins/grupos-antiMedia.js — FelixCat_Bot 🐾
// Elimina solo fotos (imageMessage) y videos (videoMessage).
// Incluye logs de depuración y fallback para intentar borrar el mensaje.

const owners = ["59896026646@s.whatsapp.net", "59898719147@s.whatsapp.net"];

let handler = async (m, { conn, command }) => {
  try {
    // Solo owners pueden activar/desactivar
    if (!owners.includes(m.sender)) {
      return await conn.sendMessage(m.chat, { text: "❌ Solo los dueños pueden activar o desactivar este sistema." });
    }

    const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});
    chat.antiMedia = !chat.antiMedia;
    global.db.data.chats[m.chat] = chat;

    await conn.sendMessage(m.chat, {
      text: `🖼️ *Anti Fotos/Videos* fue *${chat.antiMedia ? "activado" : "desactivado"}*.\n\n🔹 Cuando está activado, el bot elimina solo imágenes y videos automáticamente.`
    });

    console.log(`[AntiMedia] ${chat.antiMedia ? "ACTIVADO" : "DESACTIVADO"} en ${m.chat} por ${m.sender}`);
  } catch (err) {
    console.error("[AntiMedia][handler] Error:", err);
  }
};

handler.help = ["antimedia"];
handler.tags = ["grupo"];
handler.command = /^antimedia$/i;

export default handler;


// ==========================================
//        AUTO-ELIMINAR FOTOS Y VIDEOS
// ==========================================
export async function before(m, { conn, isBotAdmin }) {
  try {
    const chat = global.db.data.chats[m.chat];
    if (!chat?.antiMedia) return;              // no activado en este chat
    if (!m.isGroup) return;                    // solo en grupos
    if (!isBotAdmin) {
      console.log("[AntiMedia] No soy admin en:", m.chat);
      return;                                  // sin admin no se puede borrar
    }

    // Asegurarse que exista key e id
    const keyId = m?.key?.id || (m.msg && m.msg.key && m.msg.key.id);
    if (!keyId) {
      console.log("[AntiMedia] Mensaje sin key.id — no se puede borrar. m.key:", m.key);
      return;
    }

    const isPhotoOrVideo =
      m.mtype === "imageMessage" ||
      m.mtype === "videoMessage" ||
      (m.message && m.message.imageMessage) ||
      (m.message && m.message.videoMessage);

    if (!isPhotoOrVideo) return; // no es imagen ni video

    // Evitar borrar mensajes de owners (opcional)
    const ownersList = ["59896026646@s.whatsapp.net", "59898719147@s.whatsapp.net"];
    if (ownersList.includes(m.sender)) {
      console.log("[AntiMedia] Es owner, no se borra:", m.sender);
      return;
    }

    // Intento principal de borrado (estructura clásica)
    try {
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: keyId,
          participant: m.participant || m.sender
        }
      });
      console.log(`[AntiMedia] Borrado correcto (principal) - ${keyId} en ${m.chat} por ${m.sender}`);
      return;
    } catch (errMain) {
      console.warn("[AntiMedia] Falló borrado principal:", errMain && errMain.message ? errMain.message : errMain);
      // Fallback: algunos wrappers aceptan directamente { delete: m.key }
      try {
        await conn.sendMessage(m.chat, { delete: m.key });
        console.log(`[AntiMedia] Borrado correcto (fallback delete m.key) - ${keyId}`);
        return;
      } catch (errFb) {
        console.warn("[AntiMedia] Falló borrado fallback delete m.key:", errFb && errFb.message ? errFb.message : errFb);
      }
    }

    // Si llegamos acá, no pudimos borrar
    console.error(`[AntiMedia] No se pudo borrar el mensaje ${keyId} en ${m.chat}. Revisa permisos y versión de Baileys.`);

  } catch (e) {
    console.error("[AntiMedia] Error inesperado en before:", e);
  }
}
