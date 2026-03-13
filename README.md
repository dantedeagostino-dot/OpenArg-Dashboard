# OpenArg Dashboard — Modernización del Estado y Transformación Democrática

Dashboard interactivo single-page que cruza datos de 3 fuentes para trazar el mapa de la modernización estatal pendiente en Argentina.

## 🚀 Cómo usar

Abrir `index.html` directamente en el navegador (doble-click). No requiere instalación ni build step.

## 📊 Secciones (8 tabs)

| # | Tab | Contenido |
|---|---|---|
| 1 | **Inicio** | KPIs globales (2,327 gobiernos locales, 54.3 INTRA promedio, 80% formación inadecuada, 7.5% expediente electrónico) |
| 2 | **Transparencia** | Rankings INTRA 2024 (25 jurisdicciones) e ITPP 2024 (CIPPEC) con charts interactivos |
| 3 | **Municipios** | Infraestructura por tamaño, radar de capacidades, distribución por jurisdicción |
| 4 | **Datos Abiertos** | IDAC 2025, calidad vs cantidad, interoperabilidad vs carga manual |
| 5 | **Estado Agéntico** | Framework conceptual, 6 niveles de autonomía IA, stack tecnológico, caso MIA |
| 6 | **Desafíos 2026** | Crisis de talento, ciberseguridad, sistemas heredados, reforma legal |
| 7 | **Democracia IA** | Deliberación digital, representatividad, desinformación, contratación inteligente |
| 8 | **Tecnologías** | 6 proyectos de Colossus Lab con tags y links |

## 📂 Fuentes de datos

- `Digitalización Municipal y Datos Abiertos.md` — INDEC, INTRA, CIPPEC (ITPP), IDAC, CAF-AdS-SIP
- `IA, Datos Abiertos y Democracia Argentina.md` — Agentic State Vision Paper, UNESCO, OCDE, Fundar
- ColossusWeb (`LabView.jsx`) — Proyectos del Laboratorio

## 🛠️ Stack técnico

- HTML5 single-page (~490 líneas)
- TailwindCSS (CDN)
- Chart.js (INTRA horizontal bar, ITPP bar, infraestructura grouped bar, capacidades radar)
- Google Fonts (Inter 300-900)
- Vanilla JavaScript (tabs, lazy chart init, scroll effects)

## 👨‍💻 Créditos

**Laboratorio Colossus** · 2026
