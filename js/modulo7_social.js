document.querySelector('[data-modulo="social"]').addEventListener('click', function() {
    const a = parseFloat(document.getElementById('social_a').value);
    const b = parseFloat(document.getElementById('social_b').value);
    const c = parseFloat(document.getElementById('social_c').value);
    const k = parseFloat(document.getElementById('social_k').value);
    const r = parseFloat(document.getElementById('social_r').value);
    const tmax = parseFloat(document.getElementById('social_tmax').value);
    const h = parseFloat(document.getElementById('social_h').value);
    let y = [100, 10, 5];
    const tValues = [0], E_hist = [y[0]], A_hist = [y[1]], M_hist = [y[2]];
    const f = (t, Y) => {
        const [E, A, M] = Y;
        return [-a*E*A + b*M*A, a*E*A - c*A*M, k*A - r*M];
    };
    let t = 0;
    while (t < tmax) {
        const k1 = f(t, y);
        const k2 = f(t + h/2, y.map((yi, idx) => yi + (h/2)*k1[idx]));
        const k3 = f(t + h/2, y.map((yi, idx) => yi + (h/2)*k2[idx]));
        const k4 = f(t + h, y.map((yi, idx) => yi + h*k3[idx]));
        const ynew = y.map((yi, idx) => yi + (h/6)*(k1[idx] + 2*k2[idx] + 2*k3[idx] + k4[idx]));
        y = ynew;
        t += h;
        tValues.push(t);
        E_hist.push(y[0]); A_hist.push(y[1]); M_hist.push(y[2]);
        if (tValues.length > 1000) break;
    }
    document.getElementById('social_Ef').innerText = fmt(y[0]);
    document.getElementById('social_Af').innerText = fmt(y[1]);
    document.getElementById('social_Mf').innerText = fmt(y[2]);
    killChart('social_chart');
    const ctx = document.getElementById('social_chart').getContext('2d');
    charts.social_chart = new Chart(ctx, {
        type: 'line',
        data: { labels: tValues, datasets: [
            { label: 'Escépticos (E)', data: E_hist, borderColor: '#2a9d8f', fill: false },
            { label: 'Alarmados (A)', data: A_hist, borderColor: '#e76f51', fill: false },
            { label: 'Medios (M)', data: M_hist, borderColor: '#e9c46a', fill: false }
        ] },
        options: baseOpts('Población')
    });
    setHTML('social_interp', `📢 La dinámica social muestra cómo la alarma se estabiliza. Según los parámetros, la información controlada por 'c' regula la magnitud del pánico. Compare con un modelo clásico de rumor: aquí hay una retroalimentación entre medios y alarmados que puede amplificar o disipar el fenómeno.`);
    show('result-social');
});