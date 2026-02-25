import fetch from "node-fetch";
import { load } from "cheerio";

const handler = async (m, { conn, isOwner, isBotAdmin }) => {
  try {
    // 🔒 Reglas de seguridad (silenciosas)
    if (!m.isGroup) return;
    if (!isOwner) return;
    if (!isBotAdmin) return;

    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    const MAX_PAGES = 22697;
    const page_num = Math.floor(Math.random() * MAX_PAGES) + 1;
    const list_url = `https://es.xgroovy.com/photos/${page_num}/`;

    const list_res = await fetch(list_url, { headers });
    if (!list_res.ok) return;

    const $list = load(await list_res.text());

    let album_links = [];
    $list("a[href]").each((i, el) => {
      const href = $list(el).attr("href")?.trim();
      if (
        href &&
        href.startsWith("https://es.xgroovy.com/photos/") &&
        /^https:\/\/es\.xgroovy\.com\/photos\/\d+\/[^/]+\/$/.test(href)
      ) album_links.push(href);
    });

    album_links = [...new Set(album_links)];
    if (!album_links.length) return;

    const chosenAlbum =
      album_links[Math.floor(Math.random() * album_links.length)];

    const album_res = await fetch(chosenAlbum, { headers });
    if (!album_res.ok) return;

    const $ = load(await album_res.text());
    const image_urls = new Set();

    $("img[src], a[href]").each((i, el) => {
      const src = $(el).attr("src") || $(el).attr("href");
      if (src?.includes("/contents/albums/sources/") && src.endsWith(".jpg"))
        image_urls.add(src);
    });

    const images = [...image_urls];
    if (!images.length) return;

    const final_image = images[Math.floor(Math.random() * images.length)];

    // 🎯 Grupo destino = mismo grupo
    const TARGET_GROUP = m.chat;

    // 👻 Obtener participantes
    const metadata = await conn.groupMetadata(TARGET_GROUP);
    const participantsIDs = metadata.participants.map(p => p.id);

    await conn.sendMessage(TARGET_GROUP, {
      image: { url: final_image },
      caption: "Mirá lo que pedís alzado de mrd 😤😠",
      viewOnce: true,
      mentions: participantsIDs,
      contextInfo: { mentionedJid: participantsIDs }
    });

  } catch {}
};

// 🔥 ACTIVACIÓN SIN PREFIJO (sin filtros del framework)
handler.customPrefix = /^pa$/i;
handler.command = new RegExp();
handler.group = false;
handler.owner = false;
handler.botAdmin = false;

export default handler;
