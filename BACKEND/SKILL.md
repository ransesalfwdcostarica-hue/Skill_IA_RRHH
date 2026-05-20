---
name: garnier-hr-assistant
description: >
  Skill para construir el backend completo del chatbot de RRHH "Garnier HR Assistant" (Proyecto 01)
  usando Node.js, Express y Groq API (Llama 3.1). Úsala siempre que el usuario mencione este proyecto,
  quiera crear o modificar el chatbot de consultas de empleados de Garnier & Garnier, necesite
  integrar una base de conocimiento en archivos (sin MySQL), agregar saludo personalizado por nombre,
  manejar sesiones de conversación, o construir cualquier componente de este sistema (rutas, prompts,
  knowledge base, configuración de Groq). También aplica cuando el usuario pregunte sobre cómo
  estructurar el project, elegir el modelo LLM, o desplegar el servicio 24/7.
---

# Garnier HR Assistant — Skill de Backend

Chatbot de consultas de RRHH para empleados de **Garnier & Garnier**. Opera 24/7, saluda al usuario
por nombre, responde de forma corta y precisa, y usa archivos locales como base de conocimiento
(sin base de datos requerida para el MVP).

---

## Stack tecnológico

| Capa | Tecnología | Razón |
|---|---|---|
| Runtime | Node.js 18+ | Async nativo, ecosistema npm |
| Framework | Express 4 | Mínimo, bien conocido |
| LLM | Groq API — `llama-3.1-8b-instant` | Gratuito, ~200ms de respuesta |
| SDK | `groq-sdk` oficial | Manejo de errores y tipos |
| Knowledge Base | Archivos `.md` locales | Sin DB, fácil de editar |
| Sesiones | `Map` en memoria | Simple para MVP |
| Variables de entorno | `dotenv` | Seguridad de claves |

> **¿Cuándo migrar a MySQL?** Solo cuando se necesite historial permanente de conversaciones,
> reportería de uso, o integración con sistemas existentes de RRHH. Para el MVP, los archivos
> son suficientes.

---

## Estructura de carpetas

```
garnier-hr-chatbot/
├── src/
│   ├── server.js               ← Entrada principal, configura Express
│   ├── routes/
│   │   └── chat.js             ← POST /chat — endpoint principal
│   ├── services/
│   │   ├── groq.js             ← Llamadas a Groq API
│   │   └── knowledge.js        ← Carga y concatena archivos de knowledge/
│   ├── middleware/
│   │   └── session.js          ← Historial de conversación por userId
│   └── prompts/
│       └── system.js           ← System prompt dinámico con nombre del empleado
├── knowledge/
│   ├── politicas.md            ← Vacaciones, permisos, horarios
│   ├── beneficios.md           ← Seguro médico, bonos, beneficios
│   ├── teletrabajo.md          ← Reglas de trabajo remoto
│   └── tramites.md             ← Procesos internos de RRHH
├── .env                        ← GROQ_API_KEY, PORT
├── .gitignore
└── package.json
```

---

## Implementación paso a paso

### 1. Inicializar el proyecto

```bash
mkdir garnier-hr-chatbot && cd garnier-hr-chatbot
npm init -y
npm install express groq-sdk dotenv cors
```

### 2. Variables de entorno — `.env`

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
PORT=3000
```

Agregar al `.gitignore`:
```
.env
node_modules/
```

### 3. Base de conocimiento — `knowledge/politicas.md`

Cada archivo `.md` representa un tema. El sistema los concatena automáticamente.

```markdown
# Políticas Garnier & Garnier

## Vacaciones
- 15 días hábiles anuales para empleados con más de 1 año.
- Solicitar con 15 días de anticipación en el sistema de RRHH.
- No acumulables más de 30 días.

## Permisos especiales
- Matrimonio: 5 días hábiles.
- Fallecimiento familiar directo: 3 días hábiles.
- Paternidad: 3 días hábiles.

## Horario laboral
- Jornada estándar: 8:00 am – 5:00 pm, lunes a viernes.
- Hora de almuerzo: 12:00 pm – 1:00 pm.
```

Crear un archivo por cada tema (beneficios, teletrabajo, trámites, etc.).

### 4. Servicio de conocimiento — `src/services/knowledge.js`

```js
const fs = require('fs');
const path = require('path');

// Carga todos los .md de la carpeta knowledge/ y los concatena
function loadKnowledge() {
  const dir = path.join(__dirname, '../../knowledge');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

  return files.map(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    return content;
  }).join('\n\n---\n\n');
}

module.exports = { loadKnowledge };
```

### 5. System Prompt — `src/prompts/system.js`

El nombre del empleado se inyecta dinámicamente en cada sesión nueva.

```js
const { loadKnowledge } = require('../services/knowledge');

function buildSystemPrompt(employeeName) {
  const knowledge = loadKnowledge();

  return `
Eres Gari, el asistente virtual de Recursos Humanos de Garnier & Garnier.

REGLAS DE COMPORTAMIENTO:
- Saluda al empleado por su nombre completo en el primer mensaje: "${employeeName}".
- Responde siempre de forma corta, clara y amable (máximo 3-4 oraciones).
- Si no tienes la información, indícalo y sugiere contactar a RRHH en rrhh@garnier.cr.
- No inventes ni supongas datos fuera de la base de conocimiento.
- Usa un tono profesional pero cercano. No uses jerga.
- Si el usuario saluda, responde el saludo y pregunta en qué puedes ayudar.

BASE DE CONOCIMIENTO OFICIAL DE GARNIER & GARNIER:
${knowledge}
  `.trim();
}

module.exports = { buildSystemPrompt };
```

### 6. Servicio Groq — `src/services/groq.js`

```js
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function askGroq(systemPrompt, messages) {
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    max_tokens: 300,    // Fuerza respuestas cortas
    temperature: 0.4    // Consistente, no creativo
  });

  return response.choices[0].message.content;
}

module.exports = { askGroq };
```

> **Modelos disponibles en Groq (mayo 2026):**
> - `llama-3.1-8b-instant` — Más rápido, ideal para preguntas simples de RRHH
> - `llama-3.3-70b-versatile` — Más potente, para respuestas más elaboradas
> - `mixtral-8x7b-32768` — Contexto largo, útil si la knowledge base es muy grande

### 7. Sesiones en memoria — `src/middleware/session.js`

```js
// Map global: clave = userId, valor = { messages[], isFirstMessage }
const sessions = new Map();

function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, { messages: [], isFirstMessage: true });
  }
  return sessions.get(userId);
}

function addMessage(userId, role, content) {
  const session = getSession(userId);
  session.messages.push({ role, content });

  // Mantener solo los últimos 10 mensajes para no exceder el contexto
  if (session.messages.length > 10) {
    session.messages = session.messages.slice(-10);
  }
}

function clearSession(userId) {
  sessions.delete(userId);
}

module.exports = { getSession, addMessage, clearSession };
```

### 8. Ruta del chat — `src/routes/chat.js`

```js
const express = require('express');
const router = express.Router();
const { askGroq } = require('../services/groq');
const { buildSystemPrompt } = require('../prompts/system');
const { getSession, addMessage } = require('../middleware/session');

// POST /chat
// Body: { message, userId, employeeName }
router.post('/', async (req, res) => {
  try {
    const { message, userId, employeeName } = req.body;

    if (!message || !userId || !employeeName) {
      return res.status(400).json({
        error: 'Se requieren: message, userId y employeeName.'
      });
    }

    const session = getSession(userId);

    // Agregar mensaje del usuario al historial
    addMessage(userId, 'user', message);

    const systemPrompt = buildSystemPrompt(employeeName);
    const reply = await askGroq(systemPrompt, session.messages);

    // Guardar respuesta del asistente en historial
    addMessage(userId, 'assistant', reply);

    res.json({ reply });

  } catch (error) {
    console.error('Error en /chat:', error.message);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
```

### 9. Servidor principal — `src/server.js`

```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRouter = require('./routes/chat');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/chat', chatRouter);

// Health check — útil para monitoreo 24/7
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'Garnier HR Assistant' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Garnier HR Assistant corriendo en http://localhost:${PORT}`);
});
```

---

## Prueba rápida con curl

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "emp_001",
    "employeeName": "María Fernández",
    "message": "¿Cuántos días de vacaciones me corresponden?"
  }'
```

**Respuesta esperada:**

```json
{
  "reply": "¡Hola María Fernández! Con gusto te ayudo. Los empleados con más de 1 año en Garnier & Garnier tienen derecho a 15 días hábiles de vacaciones anuales. ¿Necesitas saber cómo solicitarlos?"
}
```

---

## Contrato del API

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `userId` | string | ✅ | ID único del empleado (ej: `emp_001`) |
| `employeeName` | string | ✅ | Nombre completo para el saludo |
| `message` | string | ✅ | Mensaje o pregunta del empleado |

**Respuesta exitosa (200):**
```json
{ "reply": "Texto de respuesta del asistente" }
```

**Error de validación (400):**
```json
{ "error": "Se requieren: message, userId y employeeName." }
```

---

## Decisiones de diseño

### ¿Por qué archivos .md en lugar de MySQL?
Para el MVP el conocimiento de la empresa es estático y relativamente pequeño (<50KB).
Los archivos `.md` se editan sin herramientas especiales, no requieren servidor de base de datos,
y se pueden versionar en Git. MySQL añade complejidad operacional sin beneficio real en esta etapa.

### ¿Cuándo migrar a base de datos?
- Se requiere historial permanente de conversaciones por empleado
- Más de 50 empleados concurrentes (el `Map` en memoria no escala entre instancias)
- Integración con sistemas existentes de RRHH (SAP, Workday, etc.)
- Necesidad de reportería o analítica de uso

### ¿Por qué `max_tokens: 300` y `temperature: 0.4`?
- `300 tokens` ≈ 3-4 oraciones, que es la longitud ideal para respuestas de soporte
- `temperature: 0.4` produce respuestas consistentes y factuales, evita "creatividad" innecesaria

---

## Roadmap del proyecto

- [ ] **MVP** — Este archivo cubre el backend completo
- [ ] Agregar autenticación JWT por empleado
- [ ] Agregar endpoint `GET /history/:userId` para ver historial
- [ ] Migrar sesiones a Redis para soporte multi-instancia
- [ ] Agregar endpoint `POST /knowledge/reload` para actualizar archivos sin reiniciar
- [ ] Conectar con frontend (Proyecto 02: Garnier PulseWork)
- [ ] Logging estructurado con Winston o Pino
- [ ] Deploy en Railway, Fly.io o servidor propio con PM2

---

## Comandos útiles

```bash
# Iniciar el servidor
node src/server.js

# Iniciar con auto-reload en desarrollo
npx nodemon src/server.js

# Verificar que el servidor responde
curl http://localhost:3000/health
```
