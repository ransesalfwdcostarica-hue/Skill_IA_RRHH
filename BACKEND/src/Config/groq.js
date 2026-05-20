const Groq = require('groq-sdk');

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey || apiKey.includes('ingresa_aqui_tu_api_key')) {
  console.warn('⚠️ ADVERTENCIA: GROQ_API_KEY no está configurada o es el marcador de posición en el archivo .env.');
}

const groq = new Groq({ apiKey: apiKey || 'dummy-key' });

/**
 * Envía una consulta al modelo Llama en Groq
 * @param {string} systemPrompt - Mensaje del sistema con la base de conocimiento y reglas
 * @param {Array} messages - Historial de mensajes de la conversación
 * @returns {Promise<string>} Respuesta del modelo
 */
async function askGroq(systemPrompt, messages) {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 300,    // Forzar respuestas concisas
      temperature: 0.4    // Respuestas consistentes y lógicas
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error al comunicarse con la API de Groq:', error);
    throw new Error('No se pudo procesar la solicitud con el asistente de IA.');
  }
}

module.exports = { askGroq };
