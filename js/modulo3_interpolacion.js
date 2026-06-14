// Módulo C: Reconstrucción de ruta continua

// Spline Cúbico Natural
function splineNatural(points) {
    const n = points.length;
    const h = [], alpha = [], l = [], mu = [], z = [], c = [], b = [], d = [];
    for (let i = 0; i < n-1; i++) h[i] = points[i+1].x - points[i].x;
    for (let i = 1; i < n-1; i++) alpha[i] = (3/h[i])*(points[i+1].y - points[i].y) - (3/h[i-1])*(points[i].y - points[i-1].y);
    l[0] = 1; mu[0] = 0; z[0] = 0;
    for (let i = 1; i < n-1; i++) {
        l[i] = 2*(points[i+1].x - points[i-1].x) - h[i-1]*mu[i-1];
        mu[i] = h[i]/l[i];
        z[i] = (alpha[i] - h[i-1]*z[i-1])/l[i];
    }
    l[n-1] = 1; z[n-1] = 0; c[n-1] = 0;
    for (let j = n-2; j >= 0; j--) {
        c[j] = z[j] - mu[j]*c[j+1];
        b[j] = (points[j+1].y - points[j].y)/h[j] - h[j]*(c[j+1] + 2*c[j])/3;
        d[j] = (c[j+1] - c[j])/(3*h[j]);
    }
    return { a: points.map(p => p.y), b, c, d, x: points.map(p => p.x), h };
}

function evaluarSpline(spline, x) {
    let i = 0;
    while (i < spline.x.length-1 && x > spline.x[i+1]) i++;
    const dx = x - spline.x[i];
    return spline.a[i] + spline.b[i]*dx + spline.c[i]*dx*dx + spline.d[i]*dx*dx*dx;
}

// Polinomio de Lagrange
function interpolacionLagrange(puntos, xEst) {
    let resultado = 0;
    const n = puntos.length;
    for (let i = 0; i < n; i++) {
        let termino = puntos[i].y;
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                termino = termino * (xEst - puntos[j].x) / (puntos[i].x - puntos[j].x);
            }
        }
        resultado += termino;
    }
    return resultado;
}

document.querySelector('[data-modulo="interpolacion"]').addEventListener('click', function() {
    const puntosStr = document.getElementById('interp_puntos').value;
    const tEst = parseFloat(document.getElementById('interp_tiempo').value);
    const metodo = document.getElementById('interp_metodo').value;
    
    const pares = puntosStr.split(';').map(p => { const [x,y] = p.split(',').map(Number); return { x, y }; }).filter(p => !isNaN(p.x) && !isNaN(p.y));
    if (pares.length < 2) return;
    pares.sort((a,b) => a.x - b.x);

    let valor;
    const minX = pares[0].x, maxX = pares[pares.length-1].x;
    const xVals = [], yVals = [];

    if (metodo === 'spline') {
        const spline = splineNatural(pares);
        valor = evaluarSpline(spline, tEst);
        for (let x = minX; x <= maxX; x += (maxX-minX)/200) { xVals.push(x); yVals.push(evaluarSpline(spline, x)); }
    } else {
        valor = interpolacionLagrange(pares, tEst);
        for (let x = minX; x <= maxX; x += (maxX-minX)/200) { xVals.push(x); yVals.push(interpolacionLagrange(pares, x)); }
    }

    document.getElementById('interp_valor').innerText = fmt(valor);
    buildTable('interp_tabla', ['Tiempo (s)', 'Altitud (m)'], pares.map(p => [p.x, p.y]));

    killChart('interp_chart');
    const ctx = document.getElementById('interp_chart').getContext('2d');
    charts.interp_chart = new Chart(ctx, {
        type: 'line',
        data: { datasets: [
            { label: metodo === 'spline' ? 'Spline Cúbico' : 'Polinomio Lagrange', data: xVals.map((x,i) => ({x, y: yVals[i]})), borderColor: '#fbbf24', fill: false, tension: 0.1 },
            { label: 'Puntos medidos', data: pares.map(p => ({x: p.x, y: p.y})), borderColor: 'white', backgroundColor: '#38bdf8', type: 'scatter', pointRadius: 5 }
        ] },
        options: { ...baseOpts('Altitud (m)'), scales: { x: { type: 'linear', title: { display: true, text: 'Tiempo (s)' } } } }
    });

    setHTML('interp_interp', `🔍 Utilizando <strong>${metodo === 'spline' ? 'Spline Cúbico Natural' : 'Lagrange'}</strong>: para t = ${tEst} s, la altitud interpolada es ${fmt(valor)} m. Reconstruye la ruta de vuelo del FANI basándose en los registros de radar.`);
    show('result-interpolacion');
});

document.getElementById('pruebaInterpBtn')?.addEventListener('click', () => {
    document.getElementById('interp_puntos').value = '1,800;5,1200;10,2500';
    document.getElementById('interp_tiempo').value = '3';
    document.getElementById('interp_metodo').value = 'spline';
    document.querySelector('[data-modulo="interpolacion"]').click();
});