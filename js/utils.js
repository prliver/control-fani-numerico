// js/utils.js

// Formato numérico consistente
function fmt(n, decimales = 2) {
    if (n === undefined || n === null || isNaN(n)) return '—';
    return Number(n).toFixed(decimales);
}

// Generación dinámica de tablas (CORREGIDA: celdas separadas)
function buildTable(id, headers, rows, extraClass = '') {
    let html = `<table class="${extraClass}">`;
    html += `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
    html += `<tbody>`;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        html += `<tr>`;
        // Aseguramos que cada celda se renderice por separado
        for (let j = 0; j < headers.length; j++) {
            let val = (row[j] !== undefined && row[j] !== null) ? row[j] : '—';
            // Si es número (o string numérico), formatear
            if (typeof val === 'number' || (typeof val === 'string' && !isNaN(parseFloat(val)))) {
                val = fmt(parseFloat(val), 4);
            }
            html += `<td>${val}</td>`;
        }
        html += `</tr>`;
    }
    html += `</tbody></table>`;
    const container = document.getElementById(id);
    if (container) container.innerHTML = html;
}

// Control de visibilidad
function show(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
}
function hide(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

// Inyección segura de contenido HTML
function setHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

// Destruir instancia de Chart.js antes de recrear
const charts = {};
function killChart(id) {
    if (charts[id]) {
        charts[id].destroy();
        delete charts[id];
    }
}

// Opciones base consistentes para gráficos Chart.js
// Opciones base consistentes para gráficos Chart.js (Adaptado al Dark Sci-Fi)
function baseOpts(yLabel) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#f8fafc', font: { family: "'Inter', sans-serif" } } },
            tooltip: { mode: 'index', intersect: false, backgroundColor: 'rgba(15, 23, 42, 0.9)', titleColor: '#38bdf8', bodyColor: '#cbd5e1', borderColor: 'rgba(56, 189, 248, 0.3)', borderWidth: 1 }
        },
        scales: {
            y: {
                title: { display: true, text: yLabel, color: '#9ca3af', font: { family: "'JetBrains Mono', monospace" } },
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#64748b', font: { family: "'JetBrains Mono', monospace" } }
            },
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#64748b', font: { family: "'JetBrains Mono', monospace" } }
            }
        }
    };
}