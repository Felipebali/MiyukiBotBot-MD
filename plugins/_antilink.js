// 🔹 Regex
const groupLinkRegex = /chat.whatsapp.com\/(invite\/)?([0-9A-Za-z]{20,24})/i;
const channelRegex = /whatsapp\.com\/channel\/[0-9A-Za-z]{15,50}/i;
const genericGroupRegex = /(chat\.whatsapp\.com|whatsapp\.com\/invite)/i;

// 🔗 Enlace especial permitido
const tagallLink = "https://miunicolink.local/tagall-FelixCat";

// 👑 Dueños
const owners = ["59896026646", "59898719147", "59892363485", "59899022028"];

// 🧠 Cache de invitaciones
if (!global.groupInviteCodes) global.groupInviteCodes = {};

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  if (!m.isGroup || !isBotAdmin || !m.message) return true;

  const chat = global.db.data.chats[m.chat];
  if (!chat?.antiLink) return true;

  const text =
    m.text ||
    m.message.conversation ||
    m.message.extendedTextMessage?.text ||
    m.message.caption ||
    "";

  if (!text) return true;

  const who = m.sender;
  const number = who.replace(/\D/g, "");

  // 👑 Owner → permiso total
  if (owners.includes(number)) return true;

  const isGroupLink = groupLinkRegex.test(text);
  const isGenericGroup = genericGroupRegex.test(text);
  const isChannel = channelRegex.test(text);
  const isTagall = text.includes(tagallLink);

  async function deleteMsg() {
    try {
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant || m.sender,
        },
      });
    } catch {}
  }

  async function kickUser() {
    try {
      await conn.groupParticipantsUpdate(m.chat, [who], "remove");
    } catch {}
  }

  // 🛡️ Admines → todo permitido
  if (isAdmin) return true;

  // 🚫 TAGALL
  if (isTagall) {
    await deleteMsg();
    await kickUser();

    await conn.sendMessage(m.chat, {
      text: `🚫 @${who.split("@")[0]} no se permiten enlaces tagall`,
      mentions: [who],
    });

    return false;
  }

  // 🚫 CANALES → solo borrar, NO expulsar
  if (isChannel) {
    await deleteMsg();

    await conn.sendMessage(m.chat, {
      text: `⚠️ @${who.split("@")[0]} no se permiten enlaces de canales`,
      mentions: [who],
    });

    return false;
  }

  // 🔐 Código del grupo actual
  let currentInvite = global.groupInviteCodes[m.chat];
  if (!currentInvite) {
    try {
      currentInvite = await conn.groupInviteCode(m.chat);
      global.groupInviteCodes[m.chat] = currentInvite;
    } catch {
      return true;
    }
  }

  // ✅ Link del mismo grupo permitido
  if (isGroupLink && text.includes(currentInvite)) return true;

  // ❌ Cualquier otro link de grupo
  if (isGenericGroup) {
    await deleteMsg();
    await kickUser();

    await conn.sendMessage(m.chat, {
      text: `🚫 Link de grupo no permitido.\n\n👤 @${who.split("@")[0]} es expulsado del grupo actual.`,
      mentions: [who],
    });

    return false;
  }

  // 🟢 Todo lo demás permitido
  return true;
}
