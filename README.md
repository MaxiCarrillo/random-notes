# Diez notas en treinta segundos

Aplicación sencilla para practicar la localización de notas naturales en las seis cuerdas de la guitarra.

## Modos de juego

- **10 notas al azar:** cada tirada contiene exactamente diez combinaciones únicas de nota (A–G) y cuerda (1.ª–6.ª) distribuidas por todo el diapasón.
- **7 notas por cuerda:** recorre las cuerdas en orden descendente desde la 6.ª (E) hasta la 1.ª (E). En cada cuerda se presentan las 7 notas naturales en orden aleatorio (por ejemplo: B, F, G, C, A, E, D) con navegación paso a paso.

## Niveles de práctica

- **Nivel 1 — Sin reloj:** prioriza la precisión y propone contar los trastes en voz alta desde una nota ancla sin límite de tiempo.
- **Nivel 2 — 30 segundos:** permite iniciar una cuenta regresiva de 30 segundos asociada a la tirada activa. En el modo por cuerdas, cada cuerda cuenta con su propio temporizador independiente de 30 segundos. La regla de tres días consecutivos se presenta solo como orientación y no se guarda.

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

## GitHub Pages deployment

Pushes to `master` automatically build and deploy the site through GitHub Actions. The workflow can also be run manually from the Actions tab.

Before the first deployment, configure the repository once:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.

The production site is available at <https://maxicarrillo.github.io/random-notes/>.
