// 📂 plugins/antiestado.js — FelixCat_Bot 🐾
// Anti-Estado con expulsión para usuarios que mencionan al grupo en estados

// 🔹 Dueños (exentos de expulsión)
const owners = ['59896026646', '59898719147', '59892363485'];

export async function before(m, { conn }) {
  if (!m.isGroup) return true;
  if (!m.message) return true;

  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});

  // Si no está activado → no hace nada
  if (!chat.antiestado) return true;

  const who = m.sender;
  const number = who.replace(/\D/g, '');
  const msg = m.msg || m.message || {};
  const type = Object.keys(msg)[0] || "";

  // --- Obtener admins ---
  const groupMetadata = await conn.groupMetadata(m.chat);
  const admins = groupMetadata.admins
    ? groupMetadata.admins.map(v => v.id)
    : groupMetadata.participants.filter(p => p.admin).map(v => v.id);

  const isAdmin = admins.includes(who);
  const isOwner = owners.includes(number);

  // 🧹 Función para borrar mensaje
  async function deleteMessageSafe() {
    try {
      const deleteKey = {
        remoteJid: m.chat,
        fromMe: m.key.fromMe,
        id: m.key.id,
        participant: m.key.participant || m.participant || m.sender,
      };
      await conn.sendMessage(m.chat, { delete: deleteKey });
    } catch {}
  }

  // 🦶 Función para expulsar
  async function expelUser() {
    try {
      await conn.groupParticipantsUpdate(m.chat, [who], "remove");
    } catch (e) {
      console.error('Error expulsando usuario:', e);
    }
  }

  // --- FUNCIÓN GENERAL DE SANCIÓN ---
  async function handleStateViolation() {

    await deleteMessageSafe();

    if (isAdmin || isOwner) {
      // ❕ Administradores y owners NO se expulsan
      await conn.sendMessage(m.chat, {
        text: `⚠️ @${who.split('@')[0]}, *no se permite mencionar al grupo desde un estado.*\n(Estás exento por ser admin/owner)`,
        mentions: [who],
      });
      return false;
    }

    // ❌ Usuario normal → expulsión
    await conn.sendMessage(m.chat, {
      text: `🚫 @${who.split('@')[0]}, *no está permitido mencionar al grupo desde un estado.*\nSerás expulsado.`,
      mentions: [who],
    });

    await expelUser();
    return false;
  }

  // ---------------------------
  // Detectores de mensajes tipo estado
  // ---------------------------

  if (m.chat === "status@broadcast") return handleStateViolation();
  if (type === "protocolMessage") return handleStateViolation();
  if (type === "eventMessage" || type === "status") return handleStateViolation();
  if (msg?.statusMessage || msg?.ephemeralMessage?.message?.statusMessage) return handleStateViolation();

  return true;
}

// 🔘 Comando para activar/desactivar
let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply("❌ Este comando solo funciona en grupos.");

  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});

  chat.antiestado = !chat.antiestado;

  m.reply(
    chat.antiestado
      ? "🛡️ *Anti-Estado ACTIVADO*.\nSe eliminarán estados y se expulsará a quien mencione al grupo."
      : "🔕 *Anti-Estado DESACTIVADO*."
  );
};

handler.command = /^antiestado$/i;
handler.group = true;
handler.admin = false;
handler.owner = false;

export default handler;
