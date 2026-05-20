// Cargar variables de entorno al iniciar
require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Garnier HR Assistant corriendo en http://localhost:${PORT}`);
  console.log(`📌 Enlace local: http://localhost:${PORT}/health`);
});
