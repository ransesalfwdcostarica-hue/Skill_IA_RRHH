import axios from 'axios';

const API_URL = 'http://localhost:3001';

export const chatService = {
  /**
   * Envia un mensaje al backend del chatbot
   * @param {string} userId - ID del empleado
   * @param {string} employeeName - Nombre del empleado
   * @param {string} message - El mensaje a enviar
   * @returns {Promise<string>} La respuesta del chatbot
   */
  sendMessage: async (userId, employeeName, message) => {
    try {
      const response = await axios.post(`${API_URL}/chat`, {
        userId,
        employeeName,
        message,
      });
      return response.data.reply;
    } catch (error) {
      console.error('Error enviando mensaje al chatbot:', error);
      throw error;
    }
  },
};
