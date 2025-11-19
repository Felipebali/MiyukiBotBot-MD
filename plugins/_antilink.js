// 📂 plugins/antilink.js

const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;
const channelLinkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]+)/i;
const anyLinkRegex = /https?:\/\/[^\s]+/i;

// 🔹 Enlaces permitidos
const allowedLinks = /(tiktok\.com|youtube\.com|youtu\.be|link\.clashroyale\.com)/i;
const tagallLink = 'https://miunicolink.local/tagall-FelixCat';
const igLinkRegex = /(https?:\/\/)?(www\.)?instagram\.com\/[^\s]+/i;
const clashLinkRegex = /(https?:\/\/)?(link\.clashroyale\.com)\/[^\s]+/i;

// 🔹 Cache para códigos de invitación por grupo
if (!global.groupInviteCodes) global.groupInviteCodes = {};

// 🔹 Números dueños exentos
const owners = ['59896026646', '59898719147', '59892363485'];

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  if (!m.isGroup) return true;
  if (!isBotAdmin) return true;
  if (!m.message) return true;

  const chat = global.db.data.chats[m.chat];
  if (!chat?.antiLink) return true;

  // 🔸 Extraer texto desde cualquier tipo de mensaje
  const text =
    m.text ||
    m.message.conversation ||
    m.message.extendedTextMessage?.text ||
    m.message.caption ||
    '';

  if (!text) return true;

  const who = m.sender;
  const number = who.replace(/\D/g, '');

  const isGroupLink = groupLinkRegex.test(text);
  const isChannelLink = channelLinkRegex.test(text);
  const isAnyLink = anyLinkRegex.test(text);
  const isAllowedLink = allowedLinks.test(text);
  const isTagall = text.includes(tagallLink);
  const isIG = igLinkRegex.test(text);
  const isClash = clashLinkRegex.test(text);

  // 🔹 Función segura para eliminar mensaje (mejorada)
  async function deleteMessageSafe() {
    try {
      const deleteKey = {
        remoteJid: m.chat,
        fromMe: m.key.fromMe,
        id: m.key.id,
        participant: m.key.participant || m.participant || m.sender,
      };
      await conn.sendMessage(m.chat, { delete: deleteKey });
      console.log(`🗑️ Mensaje borrado correctamente de ${who}`);
    } catch (err) {
      console.log(`⚠️ No se pudo eliminar el mensaje (${who}):`, err.message);
    }
  }

  // 🔹 Tagall → eliminar siempre
  if (isTagall) {
    await deleteMessageSafe();
    await conn.sendMessage(m.chat, {
      text: `😮‍💨 Qué compartís el tagall inútil @${who.split('@')[0]}...`,
      mentions: [who],
    });
    return false;
  }

  // 🔹 Dueños exentos de expulsión (pero igual borra el mensaje)
  const isOwner = owners.includes(number);
  if (isOwner) {
    if (isGroupLink) {
      await deleteMessageSafe();
      await conn.sendMessage(m.chat, {
        text: `⚠️ Link de grupo eliminado aunque seas owner, @${who.split('@')[0]}.`,
        mentions: [who],
      });
    }
    return true;
  }

  // 🔹 Links permitidos
  if (isIG || isChannelLink || isClash || isAllowedLink) return true;

  // 🔹 Link del mismo grupo permitido
  let currentInvite = global.groupInviteCodes[m.chat];
  if (!currentInvite) {
    try {
      currentInvite = await conn.groupInviteCode(m.chat);
      global.groupInviteCodes[m.chat] = currentInvite;
    } catch {
      return true;
    }
  }
  if (isGroupLink && text.includes(currentInvite)) return true;

  // 🔹 Link de otro grupo → eliminar + expulsar
  if (isGroupLink && !text.includes(currentInvite)) {
    await deleteMessageSafe();
    if (!isAdmin) {
      await conn.sendMessage(m.chat, {
        text: `🚫 @${who.split('@')[0]} fue *expulsado* por compartir un link de *otro grupo*.`,
        mentions: [who],
      });
      await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
    } else {
      await conn.sendMessage(m.chat, {
        text: `⚠️ @${who.split('@')[0]}, no compartas links de otros grupos.`,
        mentions: [who],
      });
    }
    return false;
  }

  // 🔹 Otros links no permitidos
  if (isAnyLink) {
    await deleteMessageSafe();
    await conn.sendMessage(m.chat, {
      text: `⚠️ @${who.split('@')[0]}, tu link fue eliminado (no permitido).`,
      mentions: [who],
    });
    return false;
  }

  return true;
}
