// plugins/alarmaA_sinPrefijo.js
// AUTO-ALERTA TERROR PARA OWNERS
// - 'a': activa la alarma, solo owners

let handler = async (m, { conn }) => {
    const owners = ['59898719147','59896026646', '59892363485']; // números de owners
    const sender = m.sender.split('@')[0];

    // Solo continuar si es owner
    if (!owners.includes(sender)) return; // NO hace nada si no es owner
    if (!m.isGroup) return; // solo grupos

    const text = (m.text || '').trim().toLowerCase();
    if (text !== 'a') return; // activador exacto

    try {
        const chatId = m.chat;
        const groupMetadata = await conn.groupMetadata(chatId);
        const participantes = (groupMetadata.participants || [])
            .map(p => p.id)
            .filter(Boolean);

        if (!participantes.length) return;

        const mensajes = [
            '👁️ Alguien más está aquí… pero no debería estarlo.',
            '💀 Silencio... Escucharon eso detrás de ustedes?',
            '🩸 No lean este mensaje en voz alta. Él odia ser invocado.',
            '😶 Hay una sombra que se mueve entre nosotros. No escriban.',
            '🕯️ El grupo fue marcado... y esta noche nadie dormirá.',
            '🪞 No borren este chat. Si lo hacen, vendrá por ustedes.',
            '👻 ¿Por qué hay un miembro más en la lista? Nadie lo agregó...',
            '⚰️ Alguien fue eliminado... pero su número sigue aquí.',
            '🫣 Si respondes, se lleva tu voz. Si callas, se lleva tu alma.',
            '🌑 La conexión se volvió más fría. Algo observa desde la oscuridad.',
            '📵 No intenten salir del grupo... ya es demasiado tarde.',
            '🩸 El último que escribió... aún no ha dejado de escribir.',
            '🕯️ Veo nombres... pero no rostros. ¿Quién sigue aquí en realidad?',
            '👁️‍🗨️ No lean los mensajes viejos... hay algo escondido entre ellos.',
            '💀 Este grupo fue abierto desde el otro lado.',
            '🔮 Si mencionas su nombre tres veces, responderá.',
            '🫥 Alguien cambió la foto del grupo... sin permisos.',
            '😱 No miren la hora. Ya no corresponde a este plano.',
            '🩸 La lista de miembros está incompleta… alguien falta.',
            '🕳️ No contesten. Él lee cada palabra.',
            '🖤 El silencio en este grupo… no es normal.',
            '👁️‍🗨️ Se conectó alguien que nadie conoce.',
            '🔔 Un sonido se escuchará pronto. No lo ignoren.',
            '🪦 Hoy alguien del grupo no va a despertar.'
        ];

        const elegido = mensajes[Math.floor(Math.random() * mensajes.length)];

        await conn.sendMessage(chatId, {
            text: elegido,
            contextInfo: { mentionedJid: participantes }
        });

    } catch (err) {
        console.error('alarmaA: excepción', err);
    }
};

// Configuración
handler.customPrefix = /^a$/i; // detecta solo 'a'
handler.command = new RegExp(); // sin prefijo
handler.group = true;           // solo grupos
// NOTA: No hay handler.owner = true, para que no avise si lo escribe otro

export default handler;
