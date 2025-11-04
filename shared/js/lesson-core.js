// === НОВОГОДНИЙ СНЕГ ===
function initSnow() {
    const mainContent = document.getElementById("mainContent");
    if (!mainContent || getComputedStyle(mainContent).display === "none") {
        setTimeout(initSnow, 100);
        return;
    }

    const oldSnow = document.querySelector('.snowfall');
    if (oldSnow) oldSnow.remove();

    const canvas = document.createElement('canvas');
    canvas.className = 'snowfall';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const resize = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const flakes = [];
    const symbols = "❄*+.";
    for (let i = 0; i < 100; i++) {
        flakes.push({
            x: Math.random() * w,
            y: Math.random() * h,
            speed: Math.random() * 1 + 0.5,
            char: symbols[Math.floor(Math.random() * symbols.length)],
            opacity: Math.random() * 0.7 + 0.3
        });
    }

    const draw = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.font = "16px 'JetBrains Mono', monospace";
        flakes.forEach(flake => {
            ctx.fillStyle = flake.char === '❄' 
                ? `rgba(255, 215, 0, ${flake.opacity})` 
                : `rgba(255, 255, 255, ${flake.opacity})`;
            ctx.fillText(flake.char, flake.x, flake.y);
            flake.y += flake.speed;
            flake.x += Math.sin(flake.y * 0.02) * 0.5;
            if (flake.y > h) {
                flake.y = -10;
                flake.x = Math.random() * w;
            }
        });
        requestAnimationFrame(draw);
    };
    draw();
}

// === ПАРОЛЬ ===
function getLessonPassword() {
    const meta = document.querySelector('meta[name="lesson-password"]');
    return meta ? meta.getAttribute('content') : "cHl0aG9uMjAyNQ==";
}

function checkPassword() {
    const ps = document.getElementById("passwordScreen");
    const mc = document.getElementById("mainContent");
    const pi = document.getElementById("passwordInput");
    const pe = document.getElementById("passwordError");

    if (!ps || !mc || !pi || !pe) {
        alert("Ошибка загрузки урока!");
        return;
    }

    const user = pi.value.trim();
    let correct = "";
    try {
        correct = atob(getLessonPassword());
    } catch (e) {
        correct = "python2025";
    }

    if (user === correct) {
        ps.style.display = "none";
        mc.style.display = "block";
        setTimeout(initSnow, 100);
    } else {
        pe.style.display = "block";
        setTimeout(() => pe.style.display = "none", 2000);
    }
}

// === АККОРДЕОН ===
function toggleAccordion(h) {
    const c = h.nextElementSibling;
    const isActive = h.classList.contains('active');
    
    document.querySelectorAll('.accordion-header').forEach(el => {
        if (el !== h) {
            el.classList.remove('active');
            const ec = el.nextElementSibling;
            if (ec) ec.classList.remove('expanded');
        }
    });

    if (isActive) {
        h.classList.remove('active');
        if (c) c.classList.remove('expanded');
    } else {
        h.classList.add('active');
        if (c) c.classList.add('expanded');
    }
}

// === ТЕСТ ===
function getTestAnswers() {
    const script = document.getElementById('lesson-answers');
    if (!script) return {};
    try {
        return JSON.parse(atob(script.textContent.trim()));
    } catch (e) {
        return {};
    }
}

let currentQuestion = 1;
const totalQuestions = 5;

function nextOrSubmit() {
    const selected = document.querySelector(`input[name="q${currentQuestion}"]:checked`);
    if (!selected) {
        alert("Выберите ответ!");
        return;
    }
    if (currentQuestion < totalQuestions) {
        document.querySelector(`.test-question[data-question="${currentQuestion}"]`)?.classList.remove('active');
        currentQuestion++;
        document.querySelector(`.test-question[data-question="${currentQuestion}"]`)?.classList.add('active');
        if (currentQuestion === totalQuestions) {
            document.getElementById('nextBtn')?.style.display = 'none';
            document.getElementById('submitBtn')?.style.display = 'inline-block';
        }
    }
}

function createPlusOne(x, y) {
    const plusOne = document.createElement('div');
    plusOne.className = 'plus-one';
    plusOne.textContent = '+1';
    plusOne.style.left = x + 'px';
    plusOne.style.top = y + 'px';
    const container = document.getElementById('testContainer');
    if (container) {
        container.appendChild(plusOne);
        setTimeout(() => {
            if (plusOne.parentNode) plusOne.parentNode.removeChild(plusOne);
        }, 1200);
    }
}

function submitTest() {
    const answers = getTestAnswers();
    let score = 0;
    const testContainer = document.getElementById('testContainer');
    const rect = testContainer ? testContainer.getBoundingClientRect() : { width: 400, height: 300 };

    for (let i = 1; i <= totalQuestions; i++) {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if (selected && selected.value === answers[`q${i}`]) {
            score++;
            const x = Math.random() * (rect.width - 40);
            const y = Math.random() * (rect.height - 60) + 20;
            createPlusOne(x, y);
        }
    }

    const resultEl = document.getElementById('result');
    if (!resultEl) return;

    const percent = Math.round((score / totalQuestions) * 100);
    let message = `Вы набрали ${score} из ${totalQuestions} (${percent}%)<br>`;

    if (score === totalQuestions) {
        message += "Ёлка зажглась! Вы — главный эльф-программист года! 🎄✨";
        resultEl.style.backgroundColor = '#e8f5e9';
        resultEl.style.color = '#2e7d32';
    } else if (score >= 3) {
        message += "Снеговик доволен! Почти идеально! ⛄";
        resultEl.style.backgroundColor = '#fffde7';
        resultEl.style.color = '#5d4037';
    } else {
        message += "Не грусти! Дед Мороз верит в тебя! 🎅";
        resultEl.style.backgroundColor = '#ffebee';
        resultEl.style.color = '#c62828';
    }

    resultEl.innerHTML = message;
    resultEl.style.display = 'block';
}