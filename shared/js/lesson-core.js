// === НОВОГОДНИЙ СНЕГ (устойчивый к ошибкам) ===
function initSnow() {
    const mainContent = document.getElementById("mainContent");
    if (!mainContent || getComputedStyle(mainContent).display === "none") {
        // Если контент ещё не виден — ждём
        setTimeout(initSnow, 100);
        return;
    }

    // Удаляем старый снег, если есть
    const oldSnow = document.querySelector('.snowfall');
    if (oldSnow) oldSnow.remove();

    const canvas = document.createElement('canvas');
    canvas.className = 'snowfall';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.warn("Не удалось создать canvas для снега");
        return;
    }

    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const flakes = [];
    const symbols = "❄*+.";
    const total = 100;

    for (let i = 0; i < total; i++) {
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
            if (flake.char === '❄') {
                ctx.fillStyle = `rgba(255, 215, 0, ${flake.opacity})`;
            } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
            }
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

// === ПОЛУЧЕНИЕ ПАРОЛЯ ===
function getLessonPassword() {
    const meta = document.querySelector('meta[name="lesson-password"]');
    if (!meta || !meta.getAttribute('content')) {
        throw new Error('Не задан пароль урока');
    }
    return meta.getAttribute('content');
}

// === ПРОВЕРКА ПАРОЛЯ (надёжная) ===
function checkPassword() {
    const passwordScreen = document.getElementById("passwordScreen");
    const mainContent = document.getElementById("mainContent");
    const passwordInput = document.getElementById("passwordInput");
    const passwordError = document.getElementById("passwordError");

    // Проверка наличия всех элементов
    if (!passwordScreen || !mainContent || !passwordInput || !passwordError) {
        alert("Ошибка: не удалось загрузить интерфейс урока. Обновите страницу.");
        return;
    }

    const userInput = passwordInput.value.trim();
    if (!userInput) {
        passwordError.style.display = "block";
        setTimeout(() => passwordError.style.display = "none", 2000);
        return;
    }

    let correctPassword = "";
    try {
        correctPassword = atob(getLessonPassword());
    } catch (e) {
        alert("Ошибка: некорректный пароль урока.");
        return;
    }

    if (userInput === correctPassword) {
        passwordScreen.style.display = "none";
        mainContent.style.display = "block";
        // Запускаем снег с небольшой задержкой
        setTimeout(initSnow, 100);
    } else {
        passwordError.style.display = "block";
        setTimeout(() => passwordError.style.display = "none", 2000);
    }
}

// === АККОРДЕОН ===
function toggleAccordion(header) {
    const content = header.nextElementSibling;
    const isActive = header.classList.contains('active');

    document.querySelectorAll('.accordion-header').forEach(h => {
        if (h !== header) {
            h.classList.remove('active');
            const c = h.nextElementSibling;
            if (c) c.classList.remove('expanded');
        }
    });

    if (isActive) {
        header.classList.remove('active');
        if (content) content.classList.remove('expanded');
    } else {
        header.classList.add('active');
        if (content) content.classList.add('expanded');
    }
}

// === ОТВЕТЫ НА ТЕСТ (из base64) ===
function getTestAnswers() {
    const script = document.getElementById('lesson-answers');
    if (!script) {
        throw new Error('Не найден блок с ответами');
    }
    const base64 = (script.textContent || script.innerText).trim();
    if (!base64) throw new Error('Блок с ответами пуст');
    try {
        return JSON.parse(atob(base64));
    } catch (e) {
        throw new Error('Некорректный формат ответов');
    }
}

// === ТЕСТ ===
let currentQuestion = 1;
const totalQuestions = 5;

function nextOrSubmit() {
    const selected = document.querySelector(`input[name="q${currentQuestion}"]:checked`);
    if (!selected) {
        alert("Пожалуйста, выберите ответ!");
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

// === АНИМАЦИЯ +1 ===
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

// === ОТПРАВКА ТЕСТА ===
function submitTest() {
    let answers = {};
    try {
        answers = getTestAnswers();
    } catch (e) {
        alert(e.message);
        return;
    }

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