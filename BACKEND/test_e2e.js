// Quick end-to-end test: checks backend responds and reply is a clean string
require('dotenv').config();

const url = 'http://localhost:3001/chat';

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'test_001',
    employeeName: 'Juan Prueba',
    message: '¿Cuántos días de vacaciones corresponden al año?'
  })
})
.then(r => r.json())
.then(data => {
  if (data.reply) {
    console.log('\n✅ Backend OK — Respuesta del chatbot:\n');
    console.log(data.reply);
  } else {
    console.error('❌ Respuesta inesperada:', data);
  }
})
.catch(err => console.error('❌ Error de conexión:', err.message));
