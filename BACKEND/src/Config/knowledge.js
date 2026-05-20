const fs = require('fs');
const path = require('path');

/**
 * Carga todos los archivos .md del directorio 'knowledge' y los concatena.
 * @returns {string} Base de conocimiento en texto plano formateada.
 */
function loadKnowledge() {
  try {
    const dir = path.join(__dirname, '../../knowledge');
    
    if (!fs.existsSync(dir)) {
      console.warn(`⚠️ ADVERTENCIA: El directorio de conocimiento '${dir}' no existe.`);
      return '';
    }

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

    if (files.length === 0) {
      console.warn('⚠️ ADVERTENCIA: No se encontraron archivos .md en el directorio de conocimiento.');
      return '';
    }

    return files.map(file => {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8');
      return content;
    }).join('\n\n---\n\n');

  } catch (error) {
    console.error('Error al cargar la base de conocimiento:', error);
    return '';
  }
}

module.exports = { loadKnowledge };
