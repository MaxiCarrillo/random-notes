# Diez notas en treinta segundos

Aplicación sencilla para practicar la localización de notas naturales en las seis cuerdas de la guitarra. Cada tirada contiene exactamente diez combinaciones únicas de nota (A–G) y cuerda (1.ª–6.ª).

## Modos de práctica

- **Nivel 1 — Sin reloj:** prioriza la precisión y propone contar los trastes en voz alta desde una nota ancla.
- **Nivel 2 — 30 segundos:** permite iniciar o reiniciar una cuenta regresiva asociada a la tirada actual. La regla de tres días consecutivos se presenta solo como orientación y no se guarda.

La aplicación no incluye cuentas, historial, puntuación ni persistencia.

## Desarrollo

Requiere Node.js y npm.

```bash
npm install
npm run dev
```

Comprobaciones de calidad:

```bash
npm run lint
npm run build
```
