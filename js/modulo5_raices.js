// ============================================================================
// FANI LAB - Módulo E: Umbral de Propulsión de Equilibrio Térmico
// Resolución de raíces de ecuaciones no lineales
// Modelo matemático: f(v) = E_rad * (1 - e^(-k*v)) - E_sensor
// ============================================================================

// 1. Algoritmo de Newton-Raphson (Convergencia Cuadrática)
function newtonRaphson(f, df, x0, tol=1e-8, maxIter=50) {
    let x = x0, tabla = [], error = Infinity, iter = 0;
    while (iter < maxIter && error > tol) {
        const fx = f(x), dfx = df(x);
        if (Math.abs(dfx) < 1e-12) break; // Evitar división por cero
        const xnew = x - fx/dfx;
        error = Math.abs(xnew - x);
        tabla.push([iter+1, fmt(x,6), fmt(fx,6), fmt(dfx,6), fmt(error,8)]);
        x = xnew;
        iter++;
    }
    return { raiz: x, tabla };
}

// 2. Método de la Secante (Convergencia Superlineal)
function secante(f, x0, x1, tol=1e-8, maxIter=50) {
    let tabla = [];
    for (let i = 0; i < maxIter; i++) {
        let f0 = f(x0), f1 = f(x1);
        if (Math.abs(f1 - f0) < 1e-12) break;
        let x2 = x1 - f1 * (x1 - x0) / (f1 - f0);
        let error = Math.abs(x2 - x1);
        tabla.push([i+1, fmt(x2,6), fmt(f(x2),6), '—', fmt(error,8)]);
        if (error < tol) return { raiz: x2, tabla };
        x0 = x1; x1 = x2;
    }
    return { raiz: x1, tabla };
}

// 3. Método de Bisección (Convergencia Lineal por Enclave)
function biseccion(f, a, b, tol=1e-8, maxIter=50) {
    let tabla = [], c = a;
    if (f(a) * f(b) >= 0) return { error: true, msg: "El intervalo no contiene un cambio de signo [f(a)*f(b) >= 0]" };
    for (let i = 0; i < maxIter; i++) {
        c = (a + b) / 2;
        let fc = f(c);
        let error = Math.abs(b - a) / 2;
        tabla.push([i+1, fmt(c,6), fmt(fc,6), '—', fmt(error,8)]);
        if (error < tol || Math.abs(fc) < 1e-12) break;
        if (f(a) * fc < 0) b = c; else a = c;
    }
    return { raiz: c, tabla };
}

// 4. Controlador Principal del Módulo E
function ejecutarRaices() {
    // Captura de variables desde el DOM
    const sensor    = parseFloat(document.getElementById('raiz_sensor').value);
    const radiacion = parseFloat(document.getElementById('raiz_radiacion').value);
    const k_coef    = parseFloat(document.getElementById('raiz_k').value);
    const x0        = parseFloat(document.getElementById('raiz_x0').value);
    const x1        = parseFloat(document.getElementById('raiz_x1').value);
    const metodo    = document.getElementById('raiz_metodo').value;

    // Validación de entradas nulas
    if ([sensor, radiacion, k_coef, x0].some(isNaN)) {
        setHTML('raiz_interp', '❌ Error: ingrese valores numéricos válidos en los campos requeridos.'); 
        show('result-raices'); return;
    }

    // Definición de la Función Objetivo y su Derivada
    // f(v) = E_rad * (1 - e^(-k*v)) - E_sensor
    const f  = v => radiacion * (1 - Math.exp(-k_coef * v)) - sensor;
    
    // f'(v) = E_rad * k * e^(-k*v)
    const df = v => radiacion * k_coef * Math.exp(-k_coef * v);

    let resultado;
    let cabeceras = ['Iter','v (m/s)','f(v)','f\'(v)','Error'];

    // Ejecución del algoritmo seleccionado
    if (metodo === 'newton') {
        resultado = newtonRaphson(f, df, x0);
    } else if (metodo === 'secante') {
        if (isNaN(x1)) { setHTML('raiz_interp', '❌ Secante requiere un valor en el "Punto aux. x₁".'); show('result-raices'); return; }
        resultado = secante(f, x0, x1);
        cabeceras = ['Iter','v (m/s)','f(v)','—','Error'];
    } else if (metodo === 'biseccion') {
        if (isNaN(x1)) { setHTML('raiz_interp', '❌ Bisección requiere un valor en el "Límite b".'); show('result-raices'); return; }
        resultado = biseccion(f, x0, x1);
        cabeceras = ['Iter','v (m/s)','f(v)','—','Error'];
        if (resultado.error) {
            setHTML('raiz_interp', `❌ Error: ${resultado.msg}. Prueba con otros límites (ej. a=1, b=20).`); 
            show('result-raices'); return;
        }
    }

    const { raiz, tabla } = resultado;

    // Actualización de KPIs en la interfaz (5 decimales para precisión)
    document.getElementById('raiz_valor').innerText = fmt(raiz, 5);
    const el_C = document.getElementById('raiz_C');
    if(el_C) el_C.innerText = fmt(radiacion - sensor);
    
    // Generación de la tabla de iteraciones
    buildTable('raiz_tabla_iter', cabeceras, tabla);

    // Preparación de datos para la gráfica (Curva Asintótica)
    const vVals = [], fVals = [];
    const vMax = Math.max(raiz * 2, 20); // Asegurar un rango visual de al menos 0 a 20 m/s
    for (let v = 0; v <= vMax; v += vMax/200) { 
        vVals.push(v);       // Array de números puros para el eje lineal
        fVals.push(f(v)); 
    }

    // Renderizado de Chart.js
    killChart('raiz_chart');
    const ctx = document.getElementById('raiz_chart').getContext('2d');
    const baseOptions = baseOpts('f(v)');
    
    charts.raiz_chart = new Chart(ctx, {
        type: 'line',
        data: { 
            labels: vVals, // ¡Vital! Pasar números, no strings formateados
            datasets: [
                { 
                    label: `f(v) = ${radiacion}(1 - e^(-${k_coef}v)) − ${sensor}`, 
                    data: fVals, 
                    borderColor: '#f43f5e', 
                    fill: false,
                    tension: 0.1
                },
                { 
                    label: 'Raíz / Punto de equilibrio', 
                    data: [{x: raiz, y: 0}], 
                    type: 'scatter', 
                    backgroundColor: '#10b981', 
                    pointRadius: 8,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: { 
            ...baseOptions, 
            scales: { 
                x: { 
                    type: 'linear', 
                    title: { display: true, text: 'Velocidad supersónica (v)', color: '#9ca3af', font: { family: "'JetBrains Mono', monospace" } },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#64748b', font: { family: "'JetBrains Mono', monospace" } }
                },
                y: baseOptions.scales.y
            } 
        }
    });

    // Conclusión final dinámica
    setHTML('raiz_interp', `🔍 Utilizando <strong>${metodo.toUpperCase()}</strong>. Velocidad de equilibrio térmico hallada: v*=${fmt(raiz, 5)} m/s en ${tabla.length} iteraciones. Valor analítico exacto referencial: 9.90501 m/s.`);
    show('result-raices');
}

// Vinculación de Eventos
document.querySelector('[data-modulo="raices"]').addEventListener('click', ejecutarRaices);

// Botón de Caso de Prueba E (Basado en la telemetría FANI Lab)
document.getElementById('pruebaRaizBtn')?.addEventListener('click', () => {
    document.getElementById('raiz_sensor').value    = '500';
    document.getElementById('raiz_radiacion').value = '580';
    document.getElementById('raiz_k').value         = '0.2';
    document.getElementById('raiz_metodo').value    = 'newton';
    // Semillas corregidas para evitar divergencia asintótica
    document.getElementById('raiz_x0').value        = '1'; 
    document.getElementById('raiz_x1').value        = '20'; 
    ejecutarRaices();
});