# Documento de diseno

## 1. Vision del producto

La aplicacion sera una SPA estatica para practicar vocabulario de chino simplificado nivel HSK1. El objetivo es ofrecer una experiencia simple, rapida y clara tanto en mobile como en desktop, sin depender de backend ni servicios externos para la logica principal.

Cada tarjeta representa una palabra del HSK1 y tiene dos caras:

- Cara A: palabra en castellano.
- Cara B: palabra en caracteres chinos y, debajo de cada caracter, el pinyin correspondiente.

Cada silaba del pinyin se colorea segun su tono.

## 2. Requisitos de producto

### Funcionales

- Mostrar tarjetas HSK1 con hanzi, pinyin y traduccion al castellano.
- Permitir sesiones por rondas, por ejemplo de 20 tarjetas aleatorias.
- Validar respuestas de la usuaria.
- Reinsertar tarjetas falladas al final de la pila en posicion aleatoria.
- Marcar tarjetas acertadas como aprendidas dentro de la ronda.
- Guardar progreso y estadisticas locales.
- Soportar diferentes modos de estudio y juego.

### No funcionales

- Publicacion como sitio estatico en GitHub Pages.
- Toda la logica corre en el browser.
- Diseno responsive y mobile-first.
- Sin dependencias de backend para el MVP.
- Rendimiento alto con dataset local.

## 3. Arquitectura propuesta

La app se divide en tres capas:

### Datos

Contiene el vocabulario HSK1 y recursos estaticos.

Responsabilidades:

- Definir tarjetas y metadatos.
- Mantener traducciones y variantes aceptadas.
- Incluir tonos por silaba para colorear el pinyin.

### Motor de juego y aprendizaje

Encapsula reglas de sesion, scoring, repeticion y progreso.

Responsabilidades:

- Seleccion de tarjetas para cada ronda.
- Manejo de pilas: pendientes, activas, aprendidas, falladas.
- Reglas de reingreso de tarjetas incorrectas.
- Estadisticas y progreso persistido.

### UI

Capa visual y de interaccion.

Responsabilidades:

- Render de tarjetas.
- Captura de respuestas.
- Feedback inmediato.
- Navegacion entre modos, resultados y configuracion.

## 4. Stack tecnico

- `Vite` para tooling y build.
- `React` para UI.
- `TypeScript` para tipado del dominio.
- `CSS` plano al inicio; migrable luego a un sistema de diseno mas formal si hace falta.
- `localStorage` para persistencia del MVP.
- `GitHub Actions + GitHub Pages` para deploy.

## 5. Modelo de datos

Cada tarjeta puede representarse asi:

```ts
type Tone = 0 | 1 | 2 | 3 | 4

type Card = {
  id: string
  hanzi: string[]
  pinyin: string[]
  tones: Tone[]
  spanish: string
  aliases?: string[]
  hskLevel: 1
}
```

Ejemplo:

```json
{
  "id": "hsk1-nihao",
  "hanzi": ["你", "好"],
  "pinyin": ["ni3", "hao3"],
  "tones": [3, 3],
  "spanish": "hola",
  "aliases": ["buenas"],
  "hskLevel": 1
}
```

## 6. Sistema de colores para tonos

Propuesta inicial:

- Tono 1: rojo
- Tono 2: naranja
- Tono 3: verde
- Tono 4: azul
- Tono neutro: gris

Esto debe implementarse a nivel de silaba, no a nivel de palabra completa.

## 7. Modos de juego y aprendizaje

### 7.1 Chino -> Castellano

Se muestra la tarjeta del lado chino. La usuaria escribe la traduccion al castellano.

Reglas:

- La ronda toma 20 tarjetas aleatorias.
- Si la respuesta es correcta, la tarjeta pasa a aprendidas.
- Si la respuesta es incorrecta, vuelve al final de la pila en posicion aleatoria.
- La ronda termina cuando no quedan tarjetas activas.

### 7.2 Castellano -> Chino

Se muestra la traduccion al castellano y la usuaria recuerda o selecciona el hanzi correcto.

### 7.3 Castellano -> Pinyin

La usuaria practica pronunciacion y tonos antes de memorizar caracteres.

### 7.4 Multiple choice

La app muestra una tarjeta y cuatro opciones posibles. Ideal para sesiones de entrada o uso casual.

### 7.5 Emparejar

Matching entre castellano y hanzi/pinyin.

### 7.6 Revision rapida

Sesion corta enfocada en tarjetas falladas recientemente.

### 7.7 Supervivencia

Modo ludico con limite de errores.

### 7.8 Modo examen

Sesion cerrada con puntaje final y pocas ayudas.

### 7.9 Modo tonos

Practica orientada solo a identificar tonos correctos.

## 8. Lojica de aprendizaje

La logica no deberia depender solo del azar. Incluso en el MVP conviene registrar:

- cantidad de aciertos
- cantidad de errores
- ultimo uso
- racha de respuestas correctas

Reglas sugeridas:

- Las tarjetas nuevas tienen prioridad alta.
- Las falladas reaparecen pronto.
- Las acertadas varias veces bajan de prioridad.
- Los modos de juego comparten el progreso base pero pueden registrar metricas propias.

## 9. Persistencia local

Para el MVP:

- Configuracion de usuaria
- Historial resumido por tarjeta
- Estadisticas globales
- Ultimo modo jugado

Implementacion sugerida:

- `localStorage` con versionado de schema

Escalable a futuro:

- `IndexedDB` si se agregan mas datos, audio o historial detallado

## 10. Pantallas principales

- Inicio
- Seleccion de modo
- Sesion de estudio
- Resultado final
- Estadisticas
- Configuracion

## 11. UX y diseno visual

Lineamientos:

- Mobile-first
- Tarjeta protagonista y centrada
- Interacciones tactiles amplias
- Tipografia legible
- Feedback inmediato al responder
- Transiciones breves y funcionales
- Buen contraste y accesibilidad de teclado

## 12. Roadmap de implementacion

### Fase 1: Base tecnica

- Inicializar proyecto con Vite + React + TypeScript
- Definir estructura de carpetas
- Crear tipos del dominio
- Preparar deploy en GitHub Pages

### Fase 2: Dataset y rendering

- Cargar dataset HSK1
- Renderizar hanzi y pinyin por silaba
- Aplicar colores por tono

### Fase 3: Primer modo jugable

- Implementar `Chino -> Castellano`
- Crear motor de rondas de 20 tarjetas
- Validacion flexible de respuestas
- Persistencia basica

### Fase 4: Expansion

- Multiple choice
- Revision rapida
- Estadisticas
- Configuracion

### Fase 5: Iteraciones futuras

- Audio
- Repeticion espaciada mas avanzada
- Modos de examen y supervivencia
- Refinamiento visual

## 13. Decisiones iniciales recomendadas

Para evitar friccion al empezar:

- MVP sin audio
- Validacion flexible en castellano
- Pinyin visible en modos de aprendizaje
- Dos modos iniciales: `Chino -> Castellano` y `Multiple choice`
- Persistencia local sin login

## 14. Riesgos y puntos a resolver

- Definir alcance exacto del dataset HSK1 y sus variantes.
- Resolver como aceptar sinonimos y formas equivalentes en castellano.
- Evitar una UI sobrecargada en mobile.
- Decidir si la escritura de hanzi se autoevalua o se reemplaza por seleccion guiada en primeras versiones.

## 15. Criterios de exito del MVP

- La usuaria puede iniciar una ronda sin configuracion compleja.
- Completa una sesion de 20 tarjetas en mobile o desktop.
- El progreso se conserva al recargar la pagina.
- El feedback es claro y rapido.
- La app puede desplegarse en GitHub Pages sin backend.

## 16. Implementacion actual

El MVP implementado en este repositorio cubre:

- Soporte para HSK 2.0 nivel 1 y HSK 3.0 nivel 1.
- Catalogo en castellano con respuestas alternativas.
- Generacion de pinyin con tonos por silaba.
- Modo `Chino -> Castellano`.
- Modo `Multiple choice`.
- Modo `Revision de errores`.
- Persistencia local con `localStorage`.
- Build y deploy automatico a GitHub Pages.

## 17. Dataset dual

La app ahora permite elegir entre dos listas:

- `HSK 2.0`: 150 palabras, construidas desde el paquete `@leonsilicon/hsk2.0`.
- `HSK 3.0`: 300 palabras, descargadas desde la herramienta de CLI y almacenadas en el repositorio.

Para HSK 3.0:

- se conserva el vocabulario fuente descargado
- se normaliza internamente a JSON
- se usa un glosario propio en castellano
- el pinyin se segmenta a nivel de silaba usando el texto fuente descargado, con soporte para casos como `谁` y palabras con `儿化`
