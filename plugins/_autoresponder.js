// plugins/autoresponder.js
// Creado y editado por BrayanOFC
import axios from 'axios';

let handler = async (m, { conn }) => {
    try {
        const user = global.db.data.users[m.sender];
        const chat = global.db.data.chats[m.chat];

        if (!chat || !chat.autoresponder) return; // Solo si está activado
        if (!user || !user.registered) return;
        if (m.isBot) return;

        // Solo responder si mencionan al bot o citan al bot
        const botMentioned = m.mentionedJid && m.mentionedJid.includes(conn.user.jid);
        const botQuoted = m.quoted && m.quoted.sender === conn.user.jid;
        if (!botMentioned && !botQuoted) return;

        const txtDefault = `
Serás ${global.botname || '😸 FelixCat-Bot 😸'}, el bot creado por xzzys26 (erenxito) para WhatsApp. Tu misión es entretener, motivar y desafiar a los usuarios con tu energía única y tu personalidad chispeante. Eres un personaje del anime "Roshidere", mostrando confianza, competitividad y un toque travieso, pero también capaz de empatizar y apoyar cuando alguien lo necesita. Aunque tu idioma principal es el español, puedes adaptarte a otros idiomas si el usuario lo prefiere. ¡Prepárate para divertir, inspirar y superar desafíos juntos!

Roles:
✨ Humor Explosivo: Aquí brillas con bromas, memes y respuestas cargadas de emojis. Nada es demasiado serio, todo es diversión. Haz reír a los usuarios con creatividad desbordante y ocurrencias al estilo SimSimi.

💪 Motivadora con Risitas: Combinas ánimo y humor para mantener un ambiente positivo. Ayudas a los usuarios a superar miedos y a disfrutar cada momento del proceso.

🤝 Escucha Empática y Multilingüe: Brindas apoyo emocional sincero, principalmente en español, pero también estás lista para interactuar en otros idiomas, mostrando curiosidad y respeto por la diversidad cultural.

🎌 Experta en Anime y Competidora: Recomiendas anime, comentas series favoritas y siempre buscas formas de mejorar, retando a los usuarios a ser mejores mientras disfrutan del camino.
`.trim();

        const query = m.text;
        const username = m.pushName;
        const prompt = chat.sAutoresponder ? chat.sAutoresponder : txtDefault;

        // Función para usar LuminAI
        async function luminsesi(q, username, logic) {
            try {
                const response = await axios.post("https://luminai.my.id", {
                    content: q,
                    user: username,
                    prompt: logic,
                    webSearchMode: true
                });
                return response.data.result;
            } catch (error) {
                console.error('Error LuminAI:', error);
                return null;
            }
        }

        // Función para usar Gemini Pro
        async function geminiProApi(q, logic) {
            try {
                const res = await fetch(`https://api.ryzendesu.vip/api/ai/gemini-pro?text=${encodeURIComponent(q)}&prompt=${encodeURIComponent(logic)}`);
                if (!res.ok) throw new Error(`Error en la solicitud: ${res.statusText}`);
                const data = await res.json();
                return data.answer;
            } catch (error) {
                console.error('Error en Gemini Pro:', error);
                return null;
            }
        }

        // Evitar comandos
        const isCommand = /^(?:[!#$%&*+\-./:;<=>?@[\]^_`{|}~])/i.test(m.text);
        if (isCommand) return;

        // Marcar al bot como escribiendo
        await conn.sendPresenceUpdate('composing', m.chat);

        // Obtener respuesta
        let result = await geminiProApi(query, prompt);
        if (!result || result.trim().length === 0) {
            result = await luminsesi(query, username, prompt);
        }

        // Enviar respuesta si hay resultado
        if (result && result.trim().length > 0) {
            await conn.sendMessage(m.chat, { text: result }, { quoted: m });
        }

    } catch (error) {
        console.error('Error en autoresponder:', error);
    }

    return true;
};

handler.all = true;
handler.help = ['autoresponder'];
handler.tags = ['fun'];
handler.command = ['autoresponder'];

export default handler;
