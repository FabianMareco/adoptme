# 🐾 AdoptMe API
Backend REST para gestión de adopciones de mascotas.
**Coderhouse — Diplomatura Full Stack Web Developer — Backend III**

## 🚀 Instalación
```bash
npm install
cp .env.example .env
npm run dev
```

## 📋 Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/mocks/mockingpets | Genera mascotas mock |
| GET | /api/mocks/mockingusers | Genera usuarios mock |
| POST | /api/mocks/generateData | Inserta datos en BD |
| GET | /api/pets | Lista mascotas |
| POST | /api/pets | Crea mascota |
| GET | /api/users | Lista usuarios |
| POST | /api/sessions/register | Registra usuario |
| POST | /api/sessions/login | Login |
| POST | /api/adoptions/:uid/:pid | Adoptar mascota |

## 🐳 Docker
```bash
docker build -t adoptme .
docker run -p 8080:8080 adoptme
```
**DockerHub:** https://hub.docker.com/r/fabianmareco/adoptme

## 🧪 Testing
```bash
npm test
```

## ⚠️ npm audit
Vulnerabilidades reportadas corresponden exclusivamente a devDependencies
(mocha, bcrypt build tools) y no afectan el runtime de producción.

## 📚 Swagger
Disponible en: http://localhost:8080/api/docs
# adoptme
# adoptme
