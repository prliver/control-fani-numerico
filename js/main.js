// Sidebar toggle móvil
const hamburger = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
if (hamburger) {
    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !hamburger.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
}

// Scroll suave y resaltado de sección activa
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.modulo, #conclusiones');

function updateActiveNav() {
    let current = '';
    const scrollPos = window.scrollY + 150;
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href').substring(1);
        if (href === current) link.classList.add('active');
    });
}

window.addEventListener('scroll', updateActiveNav);
window.addEventListener('load', updateActiveNav);

// Tabs dinámicos
document.querySelectorAll('.tabs-container').forEach(container => {
    const btns = container.querySelectorAll('.tab-btn');
    const contents = container.querySelectorAll('.tab-content');
    btns.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            contents[idx].classList.add('active');
        });
    });
});