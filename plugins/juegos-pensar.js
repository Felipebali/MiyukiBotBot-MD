// plugins/pensar.js — FelixCat_Bot 🐾
// Versión avanzada con emociones + intenciones + respuestas dinámicas

let usados = {};

let handler = async (m, { conn, text }) => {
    try {
        const chat = global.db.data.chats[m.chat] || {};
        if (!chat.games) return await conn.sendMessage(m.chat, { text: '❌ Los juegos están desactivados. Usa .juegos para activarlos.' });

        const preguntaRaw = text ? text.replace(/\.pensar\s*/i, '').trim() : '';
        const pregunta = preguntaRaw.toLowerCase();

        if (!pregunta) {
            return await conn.sendMessage(m.chat, {
                text: `🔮 *Bola Mágica FelixCat* 🔮

💭 Hazme una pregunta:
*_.pensar <tu pregunta>_*

Respondo con estilo 😼✨`
            });
        }

        // =========================================
        //        DETECCIÓN DE INTENCIÓN
        // =========================================
        let categoria = "general";

        if (pregunta.match(/(me quiere|amor|gust|novi|enamora|pareja)/)) categoria = "amor";
        else if (pregunta.match(/(dinero|plata|trabajo|rico|pagar)/)) categoria = "dinero";
        else if (pregunta.match(/(suerte|azar|ganar|lotería)/)) categoria = "suerte";
        else if (pregunta.match(/(amigo|amistad|compa)/)) categoria = "amistad";
        else if (pregunta.match(/(debería|hago|decisión|problema|conviene)/)) categoria = "decision";
        else if (pregunta.match(/(él|ella|@|esa persona|ese)/)) categoria = "persona";
        else if (pregunta.match(/(sexo|coger|beso|encama|hacer algo)/)) categoria = "picante";

        // =========================================
        //         DETECCIÓN DE EMOCIÓN
        // =========================================
        let emocion = "neutral";

        if (pregunta.match(/(triste|mal|deprimido|solo|abandonado)/)) emocion = "triste";
        else if (pregunta.match(/(enojado|bronca|molesto|harto)/)) emocion = "enojado";
        else if (pregunta.match(/(miedo|temor|preocupado|ansioso)/)) emocion = "ansiedad";
        else if (pregunta.match(/(feliz|contento|bien)/)) emocion = "feliz";
        else if (pregunta.match(/(duda|no sé|quizás)/)) emocion = "duda";
        else if (pregunta.match(/(caliente|ganas|encendida|picante)/)) emocion = "picante";

        // =========================================
        //          RESPUESTAS INTELIGENTES
        // =========================================

        const respuestas = {
            amor: [
                "💘 Sí, esa persona siente algo por vos… aunque no lo diga.",
                "❤️ Yo diría que sí, pero hace falta que uno de los dos se anime.",
                "💔 No parece muy interesado… pero todo puede cambiar.",
                "💕 Hay algo, eso seguro.",
                "🔥 Sí, y bastante fuerte."
            ],
            dinero: [
                "💰 Viene plata pronto, pero no de donde esperás.",
                "📉 Mmm… mejor no cuentes con eso ahora.",
                "💸 Si te movés un poco, sí.",
                "🤑 Te veo un golpe de suerte económica.",
                "🔮 La plata viene, lento pero seguro."
            ],
            suerte: [
                "🍀 Hoy la suerte está de tu lado.",
                "⚠️ Mmm… hoy no es tu día.",
                "🎲 Si apostás, ganás.",
                "✨ Algo bueno se acerca.",
                "🤞 Yo no arriesgaría justo ahora."
            ],
            amistad: [
                "🤝 Es un amigo genuino.",
                "🙄 Esa amistad es medio sospechosa.",
                "😊 Te aprecia de verdad.",
                "😼 No confiaría tanto.",
                "🌟 Amistad real."
            ],
            decision: [
                "🧠 Sí, hacelo. Lo vas a agradecer.",
                "⚠️ No es el momento.",
                "✨ Tu intuición ya sabe la respuesta.",
                "🚀 Dale, no te frenés.",
                "🔍 Falta un dato clave, esperá."
            ],
            persona: [
                "👀 Esa persona te piensa más de lo que creés.",
                "😹 No estás tan en su mente ahora.",
                "😼 Te quiere, pero es tímida/o.",
                "💬 Una charla sincera arregla todo.",
                "✨ Buena energía entre ustedes."
            ],
            picante: [
                "🔥 Sí… y quiere que pase.",
                "😏 Claramente sí, no se hace el/la boludo/a.",
                "🍑 Hoy pinta noche peligrosa.",
                "💋 Yo diría que sí, pero tranquilx.",
                "😼 Ese movimiento podría terminar MUY bien."
            ],
            general: [
                "😼 Sí, definitivamente.",
                "🐾 No lo creo.",
                "🤔 Puede ser…",
                "🎉 Parece que sí.",
                "⚠️ No ahora.",
                "✔️ Todo indica que sí.",
                "🤷‍♂️ Incierto."
            ]
        };

        // =========================================
        //   MODIFICADORES SEGÚN EMOCIÓN DETECTADA
        // =========================================

        const tonos = {
            triste: "💙 Te noto medio bajoneado… pero igual te digo:",
            enojado: "🔥 Pará un poco, respirá. Igual:",
            ansiedad: "😟 Tranqui, estás pensando demasiado. Mira:",
            feliz: "😸 Me gusta esa energía. Entonces:",
            duda: "🤨 Estás dudando mucho. Mi respuesta:",
            picante: "😏 Ufff, estás en modo peligro. Bueno:",
            neutral: ""
        };

        // Evitar respuestas repetidas
        if (!usados[m.chat]) usados[m.chat] = [];
        const posibles = respuestas[categoria].filter(r => !usados[m.chat].includes(r));

        let respuesta = posibles.length > 0
            ? posibles[Math.floor(Math.random() * posibles.length)]
            : respuestas[categoria][Math.floor(Math.random() * respuestas[categoria].length)];

        usados[m.chat].push(respuesta);
        if (usados[m.chat].length >= 15) usados[m.chat] = []; // limpiado

        // =========================================
        //             MENSAJE FINAL
        // =========================================

        const mensaje = `
✨🔮 *BOLA MÁGICA FELIXCAT* 🔮✨

❓ Pregunta:
> ${preguntaRaw}

${tonos[emocion]}

💡 Respuesta:
> ${respuesta}

😼 Que la magia te ilumine… o te confunda un poco más.
`;

        await conn.sendMessage(m.chat, { text: mensaje });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { text: '✖️ Ocurrió un error al usar la bola mágica.' });
    }
};

handler.command = ['pensar'];
handler.group = true;

export default handler;
