// plugins/antigordas.js
let handler = async (m, { conn }) => {
  try {
    const frases = [
      "😹 ¡Uy! Ese plato de comida te debe estar llamando a gritos...",
      "🐷 Creo que tu báscula me pidió ayuda, ¡está llorando!",
      "🥴 Si el sofá hablara, estaría feliz de verte pasar más tiempo en él.",
      "😬 Más te vale moverte antes de que tus zapatos pidan jubilación.",
      "🍔 Si las calorías fueran monedas, ya serías millonario.",
      "😼 Hasta mis galletas me miran con lástima cuando estás cerca.",
      "💤 Ni el sueño te salva de esa cintura traicionera.",
      "🫣 El espejo te envió un mensaje de emergencia...",
      "😹 Tus pantalones ya enviaron la renuncia hace tiempo.",
      "🍩 Si los postres supieran tu nombre, llorarían de felicidad."
    ];

    // Elegimos una frase al azar
    const frase = frases[Math.floor(Math.random() * frases.length)];

    // Enviamos mensaje sin mención visible
    await conn.sendMessage(m.chat, {
      text: frase,
      mentions: [m.sender] // Mención oculta, no hace ping
    });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { text: `✖️ Error ejecutando antigordas\n\n${e}` });
  }
};

handler.help = ['antigordas'];
handler.tags = ['especiales'];
handler.command = ['antigordas'];

// Funciona para todos
handler.owner = false;
handler.admin = false;
handler.group = false;
handler.private = false;

export default handler;
