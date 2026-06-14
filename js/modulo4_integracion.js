// Módulo D: Integración numérica

function integracionTrapecio(v, a, b, n) {
    const h = (b - a) / n;
    let sum = v(a) + v(b);
    for (let i = 1; i < n; i++) sum += 2 * v(a + i * h);
    return (h / 2) * sum;
}

function integracionSimpson38(v, a, b, n) {
    let n3 = n; 
    if (n3 % 3 !== 0) n3 += 3 - (n3 % 3); 
    const h = (b - a) / n3;
    let sum = v(a) + v(b);
    for (let i = 1; i < n3; i++) {
        sum += (i % 3 === 0) ? 2 * v(a + i * h) : 3 * v(a + i * h);
    }
    return ((3 * h) / 8) * sum;
}

function ejecutarIntegracion() {
    const a = parseFloat(document.getElementById('int_a').value);
    let   b = parseFloat(document.getElementById('int_b').value);
    let   n = parseInt(document.getElementById('int_n').value);
    const metodo = document.getElementById('int_metodo').value;

    if (isNaN(a) || isNaN(b) || isNaN(n) || b <= a || n < 2) {
        setHTML('int_interp', '❌ Error: verifique que a < b y n ≥ 2.'); show('result-integracion'); return;
    }
    
    const v = t => 20 + 5*Math.sin(0.5*t) + 0.2*t;
    let distancia = 0;

    if (metodo === 'simpson13') {
        if (n % 2 !== 0) n++; 
        const h = (b - a) / n;
        let sum = v(a) + v(b);
        for (let i = 1; i < n; i++) sum += (i % 2 === 0) ? 2*v(a + i*h) : 4*v(a + i*h);
        distancia = (h/3)*sum;
    } else if (metodo === 'trapecio') {
        distancia = integracionTrapecio(v, a, b, n);
    } else if (metodo === 'simpson38') {
        distancia = integracionSimpson38(v, a, b, n);
        if (n % 3 !== 0) n += 3 - (n % 3); // Reflejar ajuste
    }

    const distanciaLineal = ((v(a)+v(b))/2)*(b-a);
    const anomalia = ((distancia - distanciaLineal)/distanciaLineal)*100;

    document.getElementById('int_dist').innerText    = fmt(distancia);
    document.getElementById('int_lineal').innerText  = fmt(distanciaLineal);
    document.getElementById('int_anomalia').innerText = fmt(Math.abs(anomalia));

    const rows = [];
    const h = (b - a) / n;
    const paso = Math.max(1, Math.floor(n/10));
    for (let i = 0; i <= n; i += paso) {
        const t = a + i*h;
        rows.push([fmt(t,2), fmt(v(t),4)]);
    }
    buildTable('int_tabla', ['t (s)', 'v(t) m/s'], rows);

    const tVals = [], vVals = [];
    for (let t = a; t <= b; t += (b-a)/200) { tVals.push(t); vVals.push(v(t)); }

    killChart('int_chart');
    const ctx = document.getElementById('int_chart').getContext('2d');
    charts.int_chart = new Chart(ctx, {
        type: 'line',
        data: { labels: tVals.map(t => fmt(t,1)), datasets: [
            { label: 'v(t) [m/s] — área = distancia', data: vVals, borderColor: '#a78bfa', backgroundColor: 'rgba(167,139,250,0.15)', fill: true },
            { label: 'Modelo lineal (v media)', data: tVals.map(() => (v(a)+v(b))/2), borderColor: '#fbbf24', borderDash:[6,4], pointRadius:0 }
        ]},
        options: baseOpts('Velocidad (m/s)')
    });

    setHTML('int_interp', `📐 Método de <strong>${metodo.toUpperCase()}</strong> con n=${n} subintervalos. Distancia total = ${fmt(distancia)} m. Desviación del ${fmt(Math.abs(anomalia))}% respecto a la física newtoniana lineal.`);
    show('result-integracion');
}

document.querySelector('[data-modulo="integracion"]').addEventListener('click', ejecutarIntegracion);

document.getElementById('pruebaIntegBtn')?.addEventListener('click', () => {
    document.getElementById('int_a').value = '0';
    document.getElementById('int_b').value = '3600';
    document.getElementById('int_n').value = '1000';
    document.getElementById('int_metodo').value = 'simpson13';
    ejecutarIntegracion();
});