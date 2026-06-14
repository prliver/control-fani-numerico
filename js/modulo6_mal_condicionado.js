// Módulo F: Sistemas mal condicionados — Número de condición + perturbación Δb=5%

function norma1Matriz(M) {
    let max = 0;
    for (let j = 0; j < M[0].length; j++) {
        let sum = 0;
        for (let i = 0; i < M.length; i++) sum += Math.abs(M[i][j]);
        if (sum > max) max = sum;
    }
    return max;
}

function invertirMatriz3x3(A) {
    const [[a,b,c],[d,e,f],[g,h,i]] = A;
    const det = a*(e*i-f*h) - b*(d*i-f*g) + c*(d*h-e*g);
    if (Math.abs(det) < 1e-12) return null;
    const inv = 1/det;
    return [
        [(e*i-f*h)*inv, (c*h-b*i)*inv, (b*f-c*e)*inv],
        [(f*g-d*i)*inv, (a*i-c*g)*inv, (c*d-a*f)*inv],
        [(d*h-e*g)*inv, (b*g-a*h)*inv, (a*e-b*d)*inv]
    ];
}

function multiplicarMatrizVector(M, v) {
    return M.map(row => row.reduce((s, val, j) => s + val*v[j], 0));
}

document.querySelector('[data-modulo="malcond"]').addEventListener('click', function() {
    const matStr = document.getElementById('mat_a').value.trim();
    const bStr   = document.getElementById('vec_b').value.trim();

    // Validación estructural
    let A, b;
    try {
        A = matStr.split(';').map(row => row.split(',').map(Number));
        b = bStr.split(',').map(Number);
    } catch(e) {
        setHTML('cond_interp', '❌ Error de formato: use "a,b,c;d,e,f;g,h,i" para la matriz y "x,y,z" para el vector.');
        show('result-malcond'); return;
    }

    if (A.length !== 3 || A.some(r => r.length !== 3) || A.flat().some(isNaN)) {
        setHTML('cond_interp', '❌ La matriz debe ser exactamente 3×3. Verifique filas separadas por ";" y columnas por ",".');
        show('result-malcond'); return;
    }
    if (b.length !== 3 || b.some(isNaN)) {
        setHTML('cond_interp', '❌ El vector b debe tener exactamente 3 componentes separadas por coma.');
        show('result-malcond'); return;
    }

    const invA = invertirMatriz3x3(A);
    if (!invA) {
        setHTML('cond_interp', '❌ Matriz singular (determinante ≈ 0): no existe solución única. El sistema de rastreo es completamente inestable.');
        show('result-malcond'); return;
    }

    const normA    = norma1Matriz(A);
    const normInvA = norma1Matriz(invA);
    const cond     = normA * normInvA;

    document.getElementById('cond_num').innerText = fmt(cond);
    const estado = cond > 1000 ? 'Mal condicionado ⚠️ (inestable)'
                 : cond > 100  ? 'Moderadamente mal condicionado'
                 :               'Bien condicionado ✅ (estable)';
    document.getElementById('cond_estado').innerText = estado;

    const x_orig = multiplicarMatrizVector(invA, b);
    const b_pert = b.map(val => val*1.05);
    const x_pert = multiplicarMatrizVector(invA, b_pert);

    const errs = x_orig.map((x,i) => Math.abs(x-x_pert[i]) / Math.max(Math.abs(x), 1e-9));
    const errMedio = errs.reduce((a,b)=>a+b,0)/3;

    buildTable('cond_tabla',
        ['Variable','x original','x perturbado (Δb=5%)','Error relativo (%)'],
        [
            ['x', fmt(x_orig[0]), fmt(x_pert[0]), fmt(errs[0]*100)],
            ['y', fmt(x_orig[1]), fmt(x_pert[1]), fmt(errs[1]*100)],
            ['z', fmt(x_orig[2]), fmt(x_pert[2]), fmt(errs[2]*100)]
        ]
    );

    // Mostrar también la inversa para completitud
    buildTable('cond_inversa',
        ['A⁻¹ fila','Col 1','Col 2','Col 3'],
        invA.map((row,i) => [`Fila ${i+1}`, ...row.map(v=>fmt(v,4))])
    );

    setHTML('cond_interp', `📊 Número de condición κ(A) = ${fmt(cond)} → ${estado}. Una perturbación del 5% en b produce un error relativo promedio del ${fmt(errMedio*100)}% en la solución. ${cond>1000 ? 'Este sistema es altamente sensible a interferencias electromagnéticas; el campo de camuflaje del FANI lo vuelve completamente inestable para el rastreo.' : cond>100 ? 'El sistema presenta sensibilidad moderada a perturbaciones.' : 'El sistema es estable ante perturbaciones menores.'}`);
    show('result-malcond');
});