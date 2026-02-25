// 📂 plugins/blacklist.js — FelixCat-Bot 🐾
// Comandos: .ln (añadir), .ln2 (quitar), .vln (ver)

import { addToBlacklist, removeFromBlacklist, getBlacklist, isBlacklisted, getUser } from "../database-functions.js";

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

let handler = async (m, { client, text, usedPrefix, command, participants }) => {
  // --------------------------
  // VER LISTA NEGRA
  // --------------------------
  if (command === "vln") {
    const entries = getBlacklist().reverse();
    if (entries.length === 0) return client.sendText(m.chat, "No hay usuarios en lista negra.", m);

    let msg = entries
      .map((entry, i) => {
        const num = `+${entry.jid.split("@")[0]}`;

        let fechaTexto = "Desconocida";
        if (entry.dateAdded) {
          const d = new Date(entry.dateAdded);
          fechaTexto = d
            .toLocaleString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
            .replace(",", " -");
        }

        const razon = entry.reason || "Sin razón";
        const añadidoPor = entry.addedBy ? `+${entry.addedBy.split("@")[0]}` : "Desconocido";

        return `${i === 2 && entries.length > 2 ? readMore : ""}${entries.length - i}. ${num}\n📝 Razón: ${razon}\n👤 Añadido por: ${añadidoPor}\n📆 Fecha: ${fechaTexto}\n`;
      })
      .join("\n");

    const jids = entries.map((e) => e.jid);
    return client.sendMessage(m.chat, { text: msg, mentions: jids }, { quoted: m });
  }

  // --------------------------
  // OBTENER USUARIO Y RAZÓN
  // --------------------------
  let who, reason;
  const phoneMatches = text.match(/\+\d[\d\s-]*/g);
  if (phoneMatches && phoneMatches.length > 0) {
    who = phoneMatches[0].replace(/[^\d]/g, "") + "@s.whatsapp.net";
    reason = text.replace(phoneMatches[0], "").trim();
  } else {
    who = m.mentionedJid?.[0] || m.quoted?.sender;
    reason = who ? text.replace(`@${who.split("@")[0]}`, "").trim() : null;
  }

  if (!who) return client.sendText(m.chat, `Debes mencionar o citar a un usuario para usar ${usedPrefix}${command}`, m);
  if (who === client.user.jid || who === m.sender) return m.react("❌");

  if (command === "ln" && !reason) return client.sendText(m.chat, "Debes dar una razón para añadir a la blacklist.", m);

  // No afectar owners del bot
  const ownerJids = globalThis.owners.map(o => o + "@s.whatsapp.net");
  if (ownerJids.includes(who)) return m.react("❌");

  const exists = isBlacklisted(who);

  // --------------------------
  // AÑADIR A BLACKLIST
  // --------------------------
  if (command === "ln") {
    if (exists) {
      addToBlacklist(who, reason, m.sender);
      return client.sendText(m.chat, "El usuario ya estaba en blacklist. Se actualizó la razón.", m);
    }

    addToBlacklist(who, reason, m.sender);
    m.react("✅");

    // Expulsar de este grupo si está
    if (m.isGroup) {
      const inGroup = participants.some(p => p.jid === who);
      if (inGroup) await client.groupParticipantsUpdate(m.chat, [who], "remove");
    }

    // Expulsar de todos los grupos del bot
    const groupChats = Object.keys(client.chats).filter(k => k.endsWith("@g.us"));
    for (const chatId of groupChats) {
      if (m.isGroup && chatId === m.chat) continue;
      const metadata = client.chats[chatId]?.metadata;
      if (metadata?.participants) {
        const inGroup = metadata.participants.some(p => p.jid === who);
        if (inGroup) await client.groupParticipantsUpdate(chatId, [who], "remove");
      }
    }
    return;
  }

  // --------------------------
  // QUITAR DE BLACKLIST
  // --------------------------
  if (command === "ln2") {
    if (!exists) return client.sendText(m.chat, "Ese usuario no estaba en la lista negra.", m);
    removeFromBlacklist(who);
    return m.react("☑️");
  }
};

handler.command = ["ln", "ln2", "vln"];
handler.rowner = true;

export default handler;
