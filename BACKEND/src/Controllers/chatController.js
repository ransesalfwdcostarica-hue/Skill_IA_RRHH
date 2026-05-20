const { askGroq } = require('../Config/groq');
const { buildSystemPrompt } = require('../Config/systemPrompt');
const { getSession, addMessage } = require('../Middleware/session');

/**
 * Procesa una consulta de chat del empleado, agregándola al historial
 * de sesión y obteniendo la respuesta de la IA (Groq).
 */
async function handleChat(req, res) {
  try {
    const { message, userId, employeeName } = req.body;

    if (!message || !userId || !employeeName) {
      return res.status(400).json({
        error: 'Se requieren obligatoriamente los campos: message, userId y employeeName.'
      });
    }

    const session = getSession(userId);

    // Guardar el mensaje del usuario en su historial
    addMessage(userId, 'user', message);

    // Generar el prompt con las políticas de Garnier & Garnier
    const systemPrompt = buildSystemPrompt(employeeName);

    // Consultar a Llama 3.1 en Groq con el historial completo
    const reply = await askGroq(systemPrompt, session.messages);

    // Guardar la respuesta del bot en el historial del usuario
    addMessage(userId, 'assistant', reply);

    return res.json({ reply });

  } catch (error) {
    console.error('Error en handleChat:', error.message);
    return res.status(500).json({ error: 'Error interno al procesar el mensaje.' });
  }
}

module.exports = { handleChat };
