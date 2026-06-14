// Módulo B: EDO — Descenso cinemático
// dH/dt = E·sin(t) − G

// Métodos numéricos para EDO
function rk4(f, t0, y0, h, tmax) {
    let t = t0, y = y0, history = [[t, y]];
    while (t < tmax && y > 0) {
        let k1 = f(t, y);
        let k2 = f(t + h/2, y + h*k1/2);
        let k3 = f(t + h/2, y + h*k2/2);
        let k4 = f(t + h, y + h*k3);
        y = y + (h/6) * (k1 + 2*k2 + 2*k3 + k4);
        t += h;
        history.push([t, y]);
    }
    return history;
}

function euler(f, t0, y0, h, tmax) {
    let t = t0, y = y0, history = [[t, y]];
    while (t < tmax && y > 0) {
        y = y + h * f(t, y);
        t += h;
        history.push([t, y]);
    }
    return history;
}

function heun(f, t0, y0, h, tmax) {
    let t = t0, y = y0, history = [[t, y]];
    while (t < tmax && y > 0) {
        let k1 = f(t, y);
        let k2 = f(t + h, y + h * k1);
        y = y + (h / 2) * (k1 + k2);
        t += h;
        history.push([t, y]);
    }
    return history;
}

function ejecutarEDO() {
    const H0    = parseFloat(document.getElementById('edo_h0').value);
    const E     = parseFloat(document.getElementById('edo_empuje').value);
    const G     = parseFloat(document.getElementById('edo_perdida').value);
    const Hcrit = parseFloat(document.getElementById('edo_critica').value);
    const metodo = document.getElementById('edo_metodo').value;

    if ([H0,E,G,Hcrit].some(isNaN) || H0 <= 0 || Hcrit < 0) {
        setHTML('edo_interp', '❌ Error: verifique que todos los parámetros sean numéricos y positivos.');
        show('result-edo'); return;
    }
    if (Hcrit >= H0) {
        setHTML('edo_interp', '❌ La altura crítica debe ser menor que la altitud inicial.');
        show('result-edo'); return;
    }

    const f = (t, h) => E * Math.sin(t) - G;
    const dt = 0.1;
    const tmax = 500;
    
    let history = [];
    if (metodo === 'rk4') {
        history = rk4(f, 0, H0, dt, tmax);
    } else if (metodo === 'euler') {
        history = euler(f, 0, H0, dt, tmax);
    } else if (metodo === 'heun') {
        history = heun(f, 0, H0, dt, tmax);
    }

    let tCruise = null;
    const cruce = history.find(p => p[1] <= Hcrit);
    if (cruce) tCruise = cruce[0];
    const Hfinal = history[history.length - 1][1];

    document.getElementById('edo_tcruce').innerText = tCruise !== null ? fmt(tCruise, 2) : 'No alcanza';
    document.getElementById('edo_hfinal').innerText = fmt(Hfinal);

    buildTable('edo_tabla', ['Tiempo (s)', 'Altitud (m)'],
        history.filter((_,i) => i % Math.max(1, Math.floor(history.length/20)) === 0)
               .slice(0,20).map(p => [fmt(p[0],2), fmt(p[1],2)])
    );

    killChart('edo_chart');
    const ctx = document.getElementById('edo_chart').getContext('2d');
    charts.edo_chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: history.map(p => fmt(p[0],1)),
            datasets: [
                { label: `Altitud H(t) [m] (${metodo.toUpperCase()})`, data: history.map(p => p[1]), borderColor: '#10b981', tension: 0.2, fill: false },
                { label: `Altura crítica (${fmt(Hcrit)} m)`, data: history.map(() => Hcrit), borderColor: '#f43f5e', borderDash: [6,4], pointRadius: 0 }
            ]
        },
        options: baseOpts('Altitud (m)')
    });

    const tasaMedia = H0 / Math.max(tCruise || 1, 1);
    setHTML('edo_interp', `📉 Simulación mediante <strong>${metodo.toUpperCase()}</strong>. Con H₀=${fmt(H0)} m, empuje E=${fmt(E)}, pérdida G=${fmt(G)} m/s: el objeto cruza los ${fmt(Hcrit)} m en t=${tCruise !== null ? fmt(tCruise,2) : '∞'} s (tasa media ≈ ${fmt(tasaMedia)} m/s). La tasa confirma comportamiento anómalo.`);
    show('result-edo');
}

document.querySelector('[data-modulo="edo"]').addEventListener('click', ejecutarEDO);

document.getElementById('pruebaEDOBtn')?.addEventListener('click', () => {
    document.getElementById('edo_h0').value      = '15000';
    document.getElementById('edo_empuje').value  = '400';
    document.getElementById('edo_perdida').value = '1500';
    document.getElementById('edo_critica').value = '2000';
    document.getElementById('edo_metodo').value  = 'rk4';
    ejecutarEDO();
});