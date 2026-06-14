// Módulo A: Triangulación 3D completa por radar (Gauss-Seidel sobre sistema 3x3)
function triangulacionRadar(x1,y1,z1,d1, x2,y2,z2,d2, x3,y3,z3,d3) {
    // Sistema Ax=b derivado de restar la ecuación de distancia de la estación 1
    // a las estaciones 2 y 3, y añadir una tercera ecuación usando estaciones 1 y 3
    // para obtener la coordenada z cuando las estaciones no son coplanares en z=0.
    // Si z1=z2=z3=0, z queda indeterminado; se añade restricción z≈0 como tercera ecuación degenerada.
    const A = [
        [2*(x2-x1), 2*(y2-y1), 2*(z2-z1)],
        [2*(x3-x1), 2*(y3-y1), 2*(z3-z1)],
        [2*(x3-x2), 2*(y3-y2), 2*(z3-z2)]
    ];
    const b = [
        d1*d1 - d2*d2 - (x1*x1+y1*y1+z1*z1) + (x2*x2+y2*y2+z2*z2),
        d1*d1 - d3*d3 - (x1*x1+y1*y1+z1*z1) + (x3*x3+y3*y3+z3*z3),
        d2*d2 - d3*d3 - (x2*x2+y2*y2+z2*z2) + (x3*x3+y3*y3+z3*z3)
    ];

    // Gauss-Seidel con pivoteo parcial por filas
    function gaussSeidel(A, b, tol=1e-8, maxIter=200) {
        const n = A.length;
        // Pivoteo: reordenar filas para que diagonal sea dominante
        for (let col = 0; col < n; col++) {
            let maxRow = col;
            for (let row = col+1; row < n; row++)
                if (Math.abs(A[row][col]) > Math.abs(A[maxRow][col])) maxRow = row;
            [A[col], A[maxRow]] = [A[maxRow], A[col]];
            [b[col], b[maxRow]] = [b[maxRow], b[col]];
        }
        let x = [0, 0, 0];
        const iterTable = [];
        for (let iter = 0; iter < maxIter; iter++) {
            const xOld = [...x];
            for (let i = 0; i < n; i++) {
                if (Math.abs(A[i][i]) < 1e-14) continue;
                let s = b[i];
                for (let j = 0; j < n; j++) if (j !== i) s -= A[i][j]*x[j];
                x[i] = s / A[i][i];
            }
            const err = Math.max(...x.map((xi,i) => Math.abs(xi - xOld[i])));
            iterTable.push([iter+1, fmt(x[0],4), fmt(x[1],4), fmt(x[2],4), fmt(err,6)]);
            if (err < tol) break;
        }
        return { x, iterTable };
    }

    // Verificar que la matriz no sea singular
    function det3(M) {
        const [[a,b,c],[d,e,f],[g,h,ii]] = M;
        return a*(e*ii-f*h) - b*(d*ii-f*g) + c*(d*h-e*g);
    }
    const detVal = det3(A);
    if (Math.abs(detVal) < 1e-8) {
        // Sistema singular: estaciones coplanares en z → resolver 2D y fijar z promedio
        const A2 = [[2*(x2-x1), 2*(y2-y1)], [2*(x3-x1), 2*(y3-y1)]];
        const b2 = [b[0], b[1]];
        const det2 = A2[0][0]*A2[1][1] - A2[0][1]*A2[1][0];
        if (Math.abs(det2) < 1e-8) return { error: true, message: "Sistema singular: estaciones colineales o coincidentes" };
        const xv = (b2[0]*A2[1][1] - A2[0][1]*b2[1]) / det2;
        const yv = (A2[0][0]*b2[1] - b2[0]*A2[1][0]) / det2;
        const zv = (z1+z2+z3)/3;
        // Número de condición 2D
        const invA2 = [[A2[1][1]/det2, -A2[0][1]/det2],[-A2[1][0]/det2, A2[0][0]/det2]];
        const n2A = Math.max(Math.abs(A2[0][0])+Math.abs(A2[1][0]), Math.abs(A2[0][1])+Math.abs(A2[1][1]));
        const n2I = Math.max(Math.abs(invA2[0][0])+Math.abs(invA2[1][0]), Math.abs(invA2[0][1])+Math.abs(invA2[1][1]));
        const cond = n2A*n2I;
        const b_pert = b2.map(v => v*1.05);
        const xp = (b_pert[0]*A2[1][1] - A2[0][1]*b_pert[1]) / det2;
        const yp = (A2[0][0]*b_pert[1] - b_pert[0]*A2[1][0]) / det2;
        return { x:xv, y:yv, z:zv, cond,
            error_rel_x: Math.abs(xp-xv)/Math.max(Math.abs(xv),1e-9),
            error_rel_y: Math.abs(yp-yv)/Math.max(Math.abs(yv),1e-9),
            error_rel_z: 0,
            A: A2, b: b2, x_pert:xp, y_pert:yp, z_pert:zv,
            iterTable: [], error: false, mode:'2D' };
    }

    // Resolver 3D con Gauss-Seidel
    const Acopy = A.map(r=>[...r]);
    const bcopy = [...b];
    const { x: sol, iterTable } = gaussSeidel(Acopy, bcopy);

    // Número de condición por norma 1 (usando inversa 3x3)
    function inv3(M) {
        const [[a,b,c],[d,e,f],[g,h,ii]] = M;
        const dt = a*(e*ii-f*h)-b*(d*ii-f*g)+c*(d*h-e*g);
        if (Math.abs(dt)<1e-12) return null;
        const inv = 1/dt;
        return [
            [(e*ii-f*h)*inv,(c*h-b*ii)*inv,(b*f-c*e)*inv],
            [(f*g-d*ii)*inv,(a*ii-c*g)*inv,(c*d-a*f)*inv],
            [(d*h-e*g)*inv,(b*g-a*h)*inv,(a*e-b*d)*inv]
        ];
    }
    function norm1(M) {
        let max=0;
        for(let j=0;j<M[0].length;j++){let s=0;for(let i=0;i<M.length;i++)s+=Math.abs(M[i][j]);if(s>max)max=s;}
        return max;
    }
    const invA = inv3(A);
    const cond = invA ? norm1(A)*norm1(invA) : 999999;

    // Perturbación Δb=5%
    const b_pert = b.map(v=>v*1.05);
    const Ap2 = A.map(r=>[...r]);
    const { x: solP } = gaussSeidel(Ap2, b_pert);

    return {
        x: sol[0], y: sol[1], z: sol[2],
        cond,
        error_rel_x: Math.abs(solP[0]-sol[0])/Math.max(Math.abs(sol[0]),1e-9),
        error_rel_y: Math.abs(solP[1]-sol[1])/Math.max(Math.abs(sol[1]),1e-9),
        error_rel_z: Math.abs(solP[2]-sol[2])/Math.max(Math.abs(sol[2]),1e-9),
        A, b, x_pert:solP[0], y_pert:solP[1], z_pert:solP[2],
        iterTable, error: false, mode:'3D'
    };
}

document.querySelector('[data-modulo="sistemas"]').addEventListener('click', function() {
    const parseCoords = (str) => str.split(',').map(Number);
    const [x1,y1,z1] = parseCoords(document.getElementById('sist_x1').value);
    const [x2,y2,z2] = parseCoords(document.getElementById('sist_x2').value);
    const [x3,y3,z3] = parseCoords(document.getElementById('sist_x3').value);
    const d1 = parseFloat(document.getElementById('sist_d1').value);
    const d2 = parseFloat(document.getElementById('sist_d2').value);
    const d3 = parseFloat(document.getElementById('sist_d3').value);

    if ([x1,y1,z1,x2,y2,z2,x3,y3,z3,d1,d2,d3].some(isNaN)) {
        setHTML('sist_interp', '❌ Error: Coordenadas o distancias inválidas. Use formato "x,y,z".');
        show('result-sistemas'); return;
    }
    const res = triangulacionRadar(x1,y1,z1,d1, x2,y2,z2,d2, x3,y3,z3,d3);
    if (res.error) { setHTML('sist_interp', `❌ ${res.message}`); show('result-sistemas'); return; }

    document.getElementById('sist_x').innerText = fmt(res.x);
    document.getElementById('sist_y').innerText = fmt(res.y);
    document.getElementById('sist_z').innerText = fmt(res.z);

    buildTable('sist_tabla', ['', 'Col1', 'Col2', res.mode==='3D'?'Col3':'', 'b'],
        res.mode==='3D'
            ? res.A.map((row,i) => [`Fila ${i+1}`, ...row.map(v=>fmt(v)), fmt(res.b[i])])
            : res.A.map((row,i) => [`Fila ${i+1}`, ...row.map(v=>fmt(v)), '', fmt(res.b[i])])
    );

    buildTable('sist_iteraciones',
        ['Iter','X (km)','Y (km)', res.mode==='3D'?'Z (km)':'', 'Error'],
        (res.iterTable||[]).slice(0,8).map(r => res.mode==='3D' ? r : [r[0],r[1],r[2],'',r[4]])
    );

    killChart('sist_chart');
    const ctx = document.getElementById('sist_chart').getContext('2d');
    const labels = res.mode==='3D' ? ['X','Y','Z'] : ['X','Y'];
    const orig  = res.mode==='3D' ? [res.x, res.y, res.z] : [res.x, res.y];
    const pert  = res.mode==='3D' ? [res.x_pert, res.y_pert, res.z_pert] : [res.x_pert, res.y_pert];
    charts.sist_chart = new Chart(ctx, {
        type: 'bar',
        data: { labels,
            datasets: [
                { label: 'Solución original (km)', data: orig, backgroundColor: '#2c7da0' },
                { label: 'Solución Δb=5% (km)',    data: pert, backgroundColor: '#e9c46a' }
            ]
        },
        options: baseOpts('km')
    });

    const estabilidad = res.cond < 100 ? "bien condicionado (estable)" : (res.cond < 1000 ? "moderadamente mal condicionado" : "mal condicionado (inestable)");
    const zInfo = res.mode==='3D' ? `, Z=${fmt(res.z)} km` : ` (Z no determinable con estaciones coplanares, Z≈${fmt(res.z)} km promedio)`;
    setHTML('sist_interp', `✅ Solución ${res.mode}: X=${fmt(res.x)}, Y=${fmt(res.y)}${zInfo}. Número de condición κ=${fmt(res.cond)} → ${estabilidad}. Perturbación 5% en b genera errores relativos: ΔX=${fmt(res.error_rel_x*100)}%, ΔY=${fmt(res.error_rel_y*100)}%${res.mode==='3D'?`, ΔZ=${fmt(res.error_rel_z*100)}%`:''}.`);
    show('result-sistemas');
});