import fetch from "node-fetch";

const handler = async (m, { conn, text, command, isOwner, chat = {} }) => {
    if (!text) return conn.reply(m.chat, '❌ Debes escribir qué imagen buscar.', m);

    // Definir adultMode seguro
    const adultMode = chat?.adultMode || false;

    // Restricciones para grupos
    if (!adultMode && m.isGroup && !isOwner) {
        const prohibited = ["caca","polla","gay","hombres cogiendo","mia malkova","porno","gore","cum","puta","culo","pussy","hentai","pene","coño","asesinato","zoofilia","desnudo","muertos","pornhub","xnxx","xvideos","vagina","sex","xxx","+18","pedofilia","necrofilia"];
        const normalizedText = text.replace(/\s+/g, "").toLowerCase();
        if (prohibited.some(word => normalizedText.includes(word.replace(/\s+/g, "")))) {
            await m.react("⚠️");
            return conn.sendMessage(m.chat, { text: "*⚠️ BUSQUEDA RESTRINGIDA ⚠️*" }, { quoted: m });
        }
    }

    await m.react("📷");

    try {
        const query = encodeURIComponent(text);
        const url = `https://www.google.com/search?q=${query}&hl=es&tbm=isch&tbs=isz:lt,islt:qsvga`;

        const HEADERS = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        };

        const res = await fetch(url, { headers: HEADERS });
        const html = await res.text();

        const regex = /\["(https?:\/\/encrypted-tbn0\.gstatic\.com\/images\?[^"]+?)".*?\["(https?:\/\/[^"]+?)".*?"(.*?)".*?\]/g;
        let match;
        const resultados = [];
        const visto = new Set();

        while ((match = regex.exec(html)) !== null) {
            let original_url = match[2].replace(/\\u003d/g, "=").replace(/\\u0026/g, "&");
            let titulo = match[3].replace(/\\u[\dA-F]{4}/gi, u => String.fromCharCode(parseInt(u.replace("\\u",""),16))).replace(/<[^>]+>/g,"").trim();
            if (!titulo) titulo = `Imagen ${resultados.length+1}`;
            if (!visto.has(original_url)) {
                visto.add(original_url);
                resultados.push({ titulo, url: original_url });
            }
            if (resultados.length >= 10) break;
        }

        if (!resultados.length) return conn.reply(m.chat, "❌ No se encontraron resultados.", m);

        const elegido = resultados[Math.floor(Math.random() * resultados.length)];
        await conn.sendFile(m.chat, elegido.url, "img.jpg", `*Resultado de:* ${text}`, m);

    } catch (err) {
        console.error(err);
        conn.reply(m.chat, "❌ Ocurrió un error al buscar la imagen.", m);
    }
};

handler.help = ['imagen', 'foto', 'imágen'];
handler.tags = ['tools'];
handler.command = ['imagen', 'foto', 'imágen'];
handler.group = true;
handler.botAdmin = false;

export default handler;
