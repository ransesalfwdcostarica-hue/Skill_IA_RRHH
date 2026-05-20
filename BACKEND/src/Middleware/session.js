// Map global: clave = userId, valor = { messages[], isFirstMessage }
const sessions = new Map();

/**
 * Obtiene la sesión de conversación de un usuario. La crea si no existe.
 * @param {string} userId - Identificador único del empleado
 * @returns {object} Objeto de sesión con el historial de mensajes
 */
function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, { messages: [], isFirstMessage: true });
  }
  return sessions.get(userId);
}

/**
 * Agrega un mensaje a la sesión del usuario. Mantiene un límite para evitar rebasar límites de tokens.
 * @param {string} userId - Identificador del usuario
 * @param {'user'|'assistant'|'system'} role - Rol del emisor
 * @param {string} content - Contenido del mensaje
 */
function addMessage(userId, role, content) {
  const session = getSession(userId);
  session.messages.push({ role, content });

  // Limitar a los últimos 10 mensajes (5 rondas de conversación) para conservar contexto
  if (session.messages.length > 10) {
    session.messages = session.messages.slice(-10);
  }
}

/**
 * Limpia el historial de un usuario (útil para reiniciar chat)
 * @param {string} userId - Identificador del usuario
 */
function clearSession(userId) {
  sessions.delete(userId);
}

module.exports = { getSession, addMessage, clearSession };
