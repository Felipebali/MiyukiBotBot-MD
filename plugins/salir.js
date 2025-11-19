// plugins/salir.js
// Comando sin prefijo: "Salir" -> el bot abandona el grupo (solo Owner)

let handler = async (m, { conn, isOwner }) => {
  try {
    // Solo funciona en grupo
    if (!m.isGroup) return;

    // El comando es sin prefijo: palabra exacta "salir"
    if (!/^salir$/i.test(m.text)) return;

    // Solo Owner puede usarlo
    if (!isOwner) {
      return conn.sendMessage(m.chat, { text: "No toques lo que no es tuyo." }, { quoted: null });
    }

    // Mensaje antes de salir
    await conn.sendMessage(m.chat, { text: "Me retiro del grupo, cuídense. 🫡" }, { quoted: null });

    // Salir del grupo
    await conn.groupLeave(m.chat);

  } catch (e) {
    console.log(e);
  }
};

// Detecta sin prefijo
handler.customPrefix = /^salir$/i;
handler.command = new RegExp;

export default handler;
