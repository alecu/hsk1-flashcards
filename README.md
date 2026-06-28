# HSK1 FlashCards

Aplicacion web estatica para practicar vocabulario basico de chino simplificado usando tarjetas del nivel HSK1. La app esta pensada para desktop y mobile, publicada en GitHub Pages y ejecutada completamente en el browser.

## Estado actual

El repositorio ya incluye un MVP funcional con:

- 150 palabras de HSK1.
- Render de hanzi con pinyin por silaba.
- Colores por tono.
- Modo `Chino -> Castellano`.
- Modo `Multiple choice`.
- Modo `Revision de errores`.
- Persistencia local de progreso y sesiones.
- Workflow de deploy automatico a GitHub Pages.

## Objetivos

- Practicar vocabulario HSK1 con sesiones cortas y repetibles.
- Combinar modos de aprendizaje y juego.
- Mantener una arquitectura sin backend.
- Persistir progreso localmente en el navegador.

## Stack propuesto

- Vite
- React
- TypeScript
- CSS plano en una primera etapa
- GitHub Pages para deploy
- localStorage para persistencia inicial

## Estructura inicial

- `docs/`: documentacion de producto y tecnica.
- `data/`: dataset HSK1 y otros recursos estaticos.
- `src/`: aplicacion cliente.

## Desarrollo local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

El repositorio incluye [`.github/workflows/deploy.yml`](/Users/alecu/Documents/Codex/2026-06-28-hola-quiero-que-hagamos-un-plan/.github/workflows/deploy.yml:1) para publicar el sitio en GitHub Pages en cada push a `main`.

## Proximo paso recomendado

Agregar audio por tarjeta y una capa mas refinada de repeticion espaciada.
