# AulaMérito · Concurso Docente Matemáticas (Colombia)

Simulador **gratuito, público, sin registro ni backend**, diseñado para practicar para **Docente de Matemáticas en Armenia/Quindío**. No representa preguntas oficiales reservadas.

**[Abrir la web (requiere activar GitHub Pages)](https://juandaj.github.io/concurso-docente-matematicas/)**

## Qué incluye

- **132 ítems originales:** 24 lectura crítica, 24 razonamiento cuantitativo, 48 conocimientos específicos de Matemáticas, 24 pedagogía y 12 situaciones de reflexión (sin calificación psicotécnica).
- Simulacros mixtos cronometrados de **20/40/80 preguntas** con distribución **20/20/40/20**, mezcla de preguntas y de posiciones de respuesta, navegación y marcado para revisión.
- Práctica por áreas con explicación inmediata, resultados, indicadores, revisión de errores e historial.
- Datos guardados únicamente en **localStorage** del navegador. Exportación del historial como JSON. No hay cuentas, rastreadores ni sincronización entre dispositivos.
- Interfaz responsive; atajos de teclado A/B/C/D o 1–4 para responder, flechas para avanzar y F para marcar.

## Qué tan parecido es al examen real

La estructura de cuatro componentes procede del **Decreto 574 de 2022** para docentes: lectura crítica 20 %, razonamiento cuantitativo 20 %, conocimientos específicos 40 %, pedagogía 20 %. La prueba de conocimientos es eliminatoria y clasificatoria y requiere mínimo 60/100; la prueba psicotécnica es aparte.

**Limitaciones explícitas:** las duraciones de 30, 60 y 120 minutos, las cantidades de preguntas, la dificultad y el porcentaje de aciertos mostrado son **decisiones de práctica**, NO datos oficiales confirmados de las pruebas 2026–2027. Los casos de reflexión no reproducen ni califican psicotécnicos oficiales. Las instrucciones definitivas deben verificarse con la Guía de Orientación al Aspirante de la CNSC cuando sea publicada. El porcentaje del simulador no equivale a la nota calibrada de la CNSC.

## Fuentes oficiales para estudiar

- [CNSC · Convocatoria Docentes y Directivos Docentes 2026](https://www.cnsc.gov.co/convocatorias/docentes-y-directivos-docentes-2026)
- [CNSC · Anexo Técnico 2026](https://www.cnsc.gov.co/node/69894)
- [CNSC · Acuerdos 284 Quindío y 279 Armenia](https://www.cnsc.gov.co/node/69870)
- [Función Pública · Decreto 574 de 2022](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=185446)
- [MEN · Estándares Básicos de Competencias](https://www.mineducacion.gov.co/1780/w3-article-340021.html)
- [MEN · Estándares de Matemáticas (PDF)](https://www.mineducacion.gov.co/1621/articles-116042_archivo_pdf2.pdf)
- [Colombia Aprende · DBA Matemáticas](https://colombiaaprende.edu.co/recurso-coleccion/derechos-basicos-de-aprendizaje-matematicas)
- [SIMO · OPEC e inscripciones](https://simo.cnsc.gov.co)

**Para la aspirante ingeniera electrónica:** confirmar los requisitos de título profesional y demás condiciones en la OPEC específica de Docente de Matemáticas de cada entidad territorial, además de los documentos del proceso.

## Publicación gratuita en GitHub Pages

1. Abrir **Settings → Pages** del repositorio.
2. En **Build and deployment**, seleccionar **Source: Deploy from a branch**.
3. Seleccionar **Branch: main** y carpeta **/(root)**.
4. Presionar **Save**. Cuando termine de publicarse, navegar a **https://juandaj.github.io/concurso-docente-matematicas/**.

No requiere comprar dominio, alquilar servidor o ejecutar un build. [Guía oficial de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Desarrollo

Aplicación estática en \`index.html\`, \`styles.css\`, \`app.js\` y \`questions.js\`. Para probar localmente: ejecutar \`python -m http.server 8000\` en este directorio y abrir \`http://localhost:8000\`. No hay dependencias.

Para ampliar el banco, añadir preguntas con cuatro opciones y justificación individual en \`questions.js\`, evitando repeticiones, respuestas predecibles y distractores absurdos.

> **Aviso legal y de privacidad:** Proyecto educativo **independiente, no afiliado** a la CNSC, MEN o ICFES. No requiere cédula, correo ni contraseñas. El progreso se guarda solo en el dispositivo; borrar datos del navegador puede borrarlo. No se publican ni utilizan preguntas reservadas. Última revisión de referencias: **16 noviembre 2026**.
