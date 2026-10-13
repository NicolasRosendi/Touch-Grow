# Tech&Grow — landing page

Landing estática para presentar Tech&Grow y agendar demos por mail (`nrrosendi@gmail.com`).
HTML, CSS y JS sin dependencias ni paso de compilación.

## Estructura

```
index.html            Página completa
assets/css/styles.css Estilos (tokens de la app: claro/oscuro, Literata, vidrio con degradés)
assets/js/main.js     Animaciones, rangos interactivos, chat de demo, gráficos SVG y formulario → mailto
assets/img/           Logo e íconos de la marca
favicon.ico
render.yaml           Blueprint de Render (sitio estático)
```

## Publicar en Render

- **Blueprint:** New → Blueprint → elegí este repo (usa `render.yaml`).
- **A mano:** New → Static Site → este repo, *Build Command* vacío y *Publish Directory* `.`.

## Probar en local

```
python3 -m http.server 8000
```
y abrí <http://localhost:8000>.

## Qué editar

- **Correo de destino:** `CORREO` al principio de `assets/js/main.js` y los `href="mailto:..."` de `index.html`.
- **Rangos y permisos:** arreglo `RANGOS` en `assets/js/main.js`.
- **Gráficos:** los datos de la proyección (`diarios`, `PRESUPUESTO`) y de horas (`HORAS`) son de ejemplo y están rotulados así en la página; reemplazalos por métricas reales cuando las tengas.
- **Tema:** comparte la clave `tg:tema` de `localStorage` con la app, así que respeta el modo elegido allí.
