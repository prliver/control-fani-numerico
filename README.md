# 🛸 FANI Lab — Sistema Interactivo de Simulación y Análisis de Fenómenos Aéreos No Identificados

**Autor:** Iver Rafael Quispe Huanca

**Materia:** Métodos Numéricos  
**Gestión:** 2026  
 
---

## Descripción general

FANI Lab es una plataforma web interactiva que aplica siete métodos numéricos para modelar, simular y analizar fenómenos aéreos anómalos (FANI / OVNIs). Cada módulo corresponde a un escenario del enunciado del Desafío Final y fue diseñado para demostrar cómo la matemática aplicada permite cuantificar, contrastar y explicar comportamientos físicos que desafían los modelos convencionales.

La plataforma opera completamente en el navegador sin backend, utilizando HTML5, CSS3 y JavaScript modular con Chart.js para visualización.

\---

## Estructura del proyecto

```
control-fani-numerico/
│
├── index.html                  # Estructura principal y DOM de todos los módulos
├── css/
│   └── estilos.css             # Estilos globales, layout responsive, variables CSS
└── js/
    ├── utils.js                # Funciones compartidas: fmt(), buildTable(), killChart(), baseOpts()
    ├── main.js                 # Sidebar móvil, scroll activo, tabs dinámicos
    ├── modulo1\_sistemas.js     # Escenario A: Triangulación 3D — Gauss-Seidel
    ├── modulo2\_edo.js          # Escenario B: Descenso cinemático — RK4
    ├── modulo3\_interpolacion.js# Escenario C: Reconstrucción de ruta — Spline cúbico natural
    ├── modulo4\_integracion.js  # Escenario D: Desplazamiento total — Simpson 1/3
    ├── modulo5\_raices.js       # Escenario E: Equilibrio térmico — Newton-Raphson
    ├── modulo6\_mal\_condicionado.js # Escenario F: Número de condición + perturbación
    └── modulo7\_social.js       # Escenario G: Dinámica social — RK4 vectorizado
```

\---

## Módulos implementados y modelos matemáticos

### Escenario A — Triangulación espacial 3D (Álgebra Lineal)

**Método:** Gauss-Seidel con pivoteo parcial  
**Problema:** Tres estaciones de radar detectan un objeto y conocen su distancia a él. Restando pares de ecuaciones de distancia al cuadrado se eliminan los términos cuadráticos, obteniendo el sistema lineal:

$$Ax = b \\quad \\text{donde} \\quad A \\in \\mathbb{R}^{3 \\times 3}, ; x = (x, y, z)^T$$

**Por qué Gauss-Seidel:** Es un método iterativo que actualiza cada variable usando los valores más recientes de la misma iteración, convergiendo más rápido que Jacobi para matrices diagonalmente dominantes.

**Resultado:** Coordenadas 3D del objeto, número de condición $\\kappa(A) = |A|\_1 \\cdot |A^{-1}|\_1$ y análisis de sensibilidad ante perturbación $\\Delta b = 5%$.

\---

### Escenario B — Descenso cinemático (EDO)

**Método:** Runge-Kutta de 4º orden (RK4)  
**Modelo:**

$$\\frac{dH}{dt} = E \\cdot \\sin(t) - G, \\quad H(0) = H\_0$$

donde $E$ es el empuje electromagnético y $G$ la pérdida gravitacional constante.

**Por qué RK4:** La función de empuje sinusoidal impide solución analítica cerrada. RK4 evalúa cuatro pendientes por paso y las promedia con pesos $(1, 2, 2, 1)/6$, logrando error local $O(h^5)$ y error global $O(h^4)$, muy superior a Euler ($O(h)$) o Heun ($O(h^2)$).

**Resultado:** Gráfico de $H(t)$, tiempo exacto de cruce del umbral crítico y altitud final.

\---

### Escenario C — Reconstrucción de ruta (Interpolación)

**Método:** Spline cúbico natural  
**Problema:** Dado un conjunto de pares $(t\_i, H\_i)$ medidos en instantes discretos, reconstruir $H(t)$ para cualquier $t$ intermedio.

**Por qué Spline cúbico:** A diferencia de Lagrange (un único polinomio de grado $n-1$ que oscila violentamente para $n$ grande), el spline ajusta polinomios cúbicos por tramos garantizando:

* Continuidad $C^0$: la curva no tiene saltos.
* Continuidad $C^1$: la primera derivada (velocidad) es continua.
* Continuidad $C^2$: la segunda derivada (aceleración) es continua.

La condición natural impone $S''(t\_0) = S''(t\_n) = 0$.

**Resultado:** Curva continua trazada sobre los puntos originales y valor interpolado en el instante solicitado.

\---

### Escenario D — Desplazamiento total acumulado (Integración numérica)

**Método:** Regla de Simpson 1/3  
**Modelo:**

$$d = \\int\_a^b v(t), dt, \\quad v(t) = 20 + 5\\sin(0.5t) + 0.2t ;; \[\\text{m/s}]$$

**Por qué Simpson 1/3:** Aproxima la función con parábolas en cada par de subintervalos, capturando la curvatura del término sinusoidal. Su error es $O(h^4)$, frente a $O(h^2)$ del trapecio. Requiere $n$ par.

$$\\int\_a^b f(x),dx \\approx \\frac{h}{3}\\left\[f(x\_0) + 4f(x\_1) + 2f(x\_2) + \\cdots + 4f(x\_{n-1}) + f(x\_n)\\right]$$

**Resultado:** Distancia total, modelo lineal de referencia (velocidad media) y porcentaje de anomalía entre ambos.

\---

### Escenario E — Equilibrio térmico (Raíces de ecuaciones)

**Método:** Newton-Raphson  
**Modelo:**

$$f(v) = k \\cdot v^2 - C = 0, \\quad C = E\_{\\text{radiación}} - E\_{\\text{sensor}}, \\quad k = 0.05$$

**Por qué Newton-Raphson:** Dada una función diferenciable con derivada conocida $f'(v) = 2kv$, Newton-Raphson converge cuadráticamente: cada iteración duplica los dígitos correctos. La fórmula de actualización es:

$$v\_{n+1} = v\_n - \\frac{f(v\_n)}{f'(v\_n)}$$

**Caso de prueba (PDF):** $E\_{\\text{sensor}} = 500$ u., $E\_{\\text{radiación}} = 580$ u. → $C = 80$ → $v^\* \\approx 40$ m/s.

**Resultado:** Tabla de iteraciones completa (v, f(v), f'(v), error) y gráfico con la raíz marcada.

\---

### Escenario F — Sistemas mal condicionados (Análisis de estabilidad)

**Cálculo:** Número de condición por norma 1

$$\\kappa(A) = |A|\_1 \\cdot |A^{-1}|\_1$$

**Interpretación:**

|Rango de κ|Estado|
|-|-|
|κ < 100|Bien condicionado (estable)|
|100 ≤ κ < 1000|Moderadamente mal condicionado|
|κ ≥ 1000|Mal condicionado (inestable)|

**Análisis de perturbación:** Se calcula $x$ con el vector $b$ original y con $b' = 1.05 \\cdot b$, comparando la solución resultante. Un κ alto amplifica esa diferencia proporcional en la solución.

**Resultado:** Número de condición, clasificación del sistema, tabla comparativa original vs perturbado, y matriz inversa $A^{-1}$.

\---

### Escenario G — Dinámica de propagación social (Sistema de EDO)

**Método:** RK4 vectorizado  
**Modelo:**

$$\\frac{dE}{dt} = -aEA + bMA$$

$$\\frac{dA}{dt} = aEA - cAM$$

$$\\frac{dM}{dt} = kA - rM$$

donde $E$ = Escépticos, $A$ = Alarmados, $M$ = Medios de comunicación.

**Por qué RK4 vectorizado:** El sistema acoplado requiere evaluar las tres ecuaciones simultáneamente en cada paso. RK4 se aplica al vector $Y = (E, A, M)^T$ completo, calculando $k\_1, k\_2, k\_3, k\_4$ como vectores de tres componentes.

**Resultado:** Gráfico multilínea evolutivo de las tres poblaciones y valores finales de $E$, $A$ y $M$.

\---

## Casos de prueba obligatorios (PDF)

|Módulo|Datos|Resultado esperado|
|-|-|-|
|C — Interpolación|seg1=800 m, seg5=1200 m, seg10=2500 m|Altitud en seg3 ≈ 917 m|
|B — EDO|H₀=15000 m, E=400, G=1500 m/s, H\_crit=2000 m|Tiempo de cruce calculado por RK4|
|E — Raíces|Sensor=500 u., Radiación=580 u., v₀=30 m/s|v\* ≈ 40.00 m/s en < 10 iteraciones|
|D — Integración|a=0, b=3600 s, n=1000|Distancia total en 1 hora + % anomalía|

Cada caso cuenta con un botón de carga automática en la interfaz para facilitar la verificación del evaluador.

\---

## Tecnologías utilizadas

|Tecnología|Uso|
|-|-|
|HTML5 semántico|Estructura y DOM de la aplicación|
|CSS3 con variables|Layout, responsive design, tema visual|
|JavaScript ES6 (modular)|Implementación de todos los métodos numéricos|
|Chart.js 4.4.0|Visualización gráfica interactiva|
|Google Fonts (Inter + JetBrains Mono)|Tipografía|
|GitHub Pages|Despliegue público gratuito|

\---

