// plugins/consejo.js
let usados = {}; // Registro de consejos usados por chat

let handler = async (m, { conn }) => {
    try {
        const chat = global.db.data.chats[m.chat] || {};
        if (!chat.games) return await conn.sendMessage(m.chat, { text: '❌ Los juegos están desactivados. Usa .juegos para activarlos.' });

        const consejos = [
            "💡 Recuerda tomar agua durante el día.",
            "😼 No confíes en gatos que hablan mucho.",
            "📚 Dedica al menos 30 minutos a aprender algo nuevo.",
            "🌿 Respira profundo y relájate un momento.",
            "🎵 Escucha tu canción favorita para levantar el ánimo.",
            "☕ A veces un café ayuda a pensar mejor.",
            "📝 Haz una lista de cosas por hacer y marca lo que completes.",
            "🏃‍♂️ Un poco de ejercicio ayuda a despejar la mente.",
            "😴 Dormir bien es parte de ser productivo.",
            "🌞 Sal a tomar un poco de sol, ¡tu cuerpo lo agradecerá!",
            "🎯 No te desanimes si fallas, aprende y sigue.",
            "🧠 Mantén la mente activa con juegos o acertijos.",
            "💬 Sonríe, un comentario amable cambia el día de alguien.",
            "📖 Lee algo que te inspire hoy.",
            "🎨 Expresa tu creatividad, aunque sea dibujando garabatos.",
            "🛌 Descansa cuando tu cuerpo lo pida.",
            "🍀 Cree en tu suerte y actúa en consecuencia.",
            "🐾 Dedica tiempo a tu mascota o a la naturaleza.",
            "🤝 Ayuda a alguien sin esperar nada a cambio.",
            "🎶 Aprende una nueva canción o instrumento.",
            "📅 Organiza tu día para evitar estrés innecesario.",
            "💪 Mantente activo y cuida tu cuerpo.",
            "🕰️ Aprovecha cada momento, el tiempo es oro.",
            "📝 Reflexiona sobre lo que agradeces hoy.",
            "🍎 Come algo saludable y nutritivo.",
            "💤 No olvides dormir las horas necesarias.",
            "🏞️ Sal a caminar y despeja tu mente.",
            "💡 Haz algo diferente hoy, rompe la rutina.",
            "👀 Observa los detalles pequeños de tu entorno.",
            "💭 Piensa positivo, atrae cosas buenas.",
            "📌 Anota tus metas y trabaja en ellas.",
            "🗣️ Comunica tus ideas con claridad.",
            "🎁 Haz un pequeño regalo a alguien.",
            "🧘 Medita o respira profundo 5 minutos.",
            "📸 Captura un momento bonito del día.",
            "💌 Envía un mensaje de cariño a alguien.",
            "🤔 Aprende algo nuevo cada día.",
            "🎬 Ve una película que te haga reír.",
            "🛠️ Arregla algo que hayas dejado pendiente.",
            "🌱 Planta algo o cuida tus plantas.",
            "📖 Lee un capítulo de un libro interesante.",
            "🖌️ Pinta, dibuja o haz manualidades.",
            "🎯 Establece objetivos pequeños y cúmplelos.",
            "🏅 Celebra tus pequeños logros.",
            "🧩 Resuelve un acertijo o rompecabezas.",
            "🛁 Date un momento para relajarte.",
            "💭 Reflexiona sobre tus pensamientos y emociones.",
            "📚 Aprende una nueva palabra hoy.",
            "🌟 Cree en ti mismo y en tu capacidad."
        ];

        if (!usados[m.chat]) usados[m.chat] = [];
        const disponibles = consejos.filter(c => !usados[m.chat].includes(c));

        let consejo;
        if (disponibles.length === 0) {
            usados[m.chat] = [];
            consejo = consejos[Math.floor(Math.random() * consejos.length)];
        } else {
            consejo = disponibles[Math.floor(Math.random() * disponibles.length)];
        }

        usados[m.chat].push(consejo);

        // Mensaje minimalista y atractivo
        const mensaje = `
✨ 🐾 *CONSEJO DEL DÍA - FELIXCAT* 🐾 ✨

💡 Consejo:
> ${consejo}

🌟 Que tengas un día increíble 😸
`;

        await conn.sendMessage(m.chat, { text: mensaje });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { text: '✖️ Ocurrió un error al generar el consejo.' });
    }
};

handler.command = ['consejo'];
handler.group = true;
handler.admin = false;
handler.rowner = false;

export default handler;
