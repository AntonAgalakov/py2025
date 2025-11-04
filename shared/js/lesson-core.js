// === НОВОГОДНИЙ СНЕГ ИЗ СИМВОЛОВ ===
function initSnow() {
    const canvas = document.createElement('canvas');
    canvas.className = 'snowfall';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let w, h;
    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const flakes = [];
    const symbols = "❄*+."; // Снежинки, звёзды, снежинки-плюсы и точки
    const total = 120;

    for (let i = 0; i < total; i++) {
        flakes.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 4 + 1,
            speed: Math.random() * 1.2 + 0.3,
            char: symbols[Math.floor(Math.random() * symbols.length)],
            opacity: Math.random() * 0.7 + 0.3
        });
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        ctx.font = "16px 'JetBrains Mono', monospace";

        flakes.forEach(flake => {
            // Снежинки — золотые, остальное — белое с прозрачностью
            if (flake.char === '❄') {
                ctx.fillStyle = `rgba(255, 215, 0, ${flake.opacity})`; // Золото
            } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity * 0.9})`;
            }
            ctx.fillText(flake.char, flake.x, flake.y);
            flake.y += flake.speed;
            // Сбоку — волнистое движение для мультяшности
            flake.x += Math.sin(flake.y * 0.02) * 0.5;
            if (flake.y > h) {
                flake.y = -10;
                flake.x = Math.random() * w;
            }
        });
        requestAnimationFrame(draw);
    }

    draw();
}

// === ПОЛУЧЕНИЕ ПАРОЛЯ ИЗ МЕТА-ТЕГА ===
function getLessonPassword() {
    const meta = document.querySelector('meta[name="lesson-password"]');
    if (!meta || !meta.getAttribute('content')) {
        throw new Error('Не задан пароль урока. Добавьте: <meta name="lesson-password" content="base64_пароль">');
    }
    return meta.getAttribute('content');
}

// === ПРОВЕРКА ПАРОЛЯ ===
function checkPassword() {
    const inputEl = document.getElementById("passwordInput");
    const errorEl = document.getElementById("passwordError");
    
    if (!inputEl || !errorEl) {
        console.error("Элементы ввода пароля не найдены");
        return;
    }

    const userInput = inputEl.value.trim();
    let correctPassword = "";

    try {
        const encrypted = getLessonPassword();
        correctPassword = atob(encrypted);
    } catch (e) {
        alert("Ошибка инициализации урока: " + e.message);
        return;
    }

    if (userInput === correctPassword) {
        document.getElementById("passwordScreen")?.style.display = "none";
        document.getElementById("mainContent")?.style.display = "block";
        initSnow(); // Запускаем снег!
    } else {
        errorEl.style.display = "block";
        setTimeout(() => {
            errorEl.style.display = "none";
        }, 2000);
    }
}

// === АККОРДЕОН ДЛЯ ЗАДАЧ ===
function toggleAccordion(header) {
    const content = header.nextElementSibling;
    const isActive = header.classList.contains('active');

    document.querySelectorAll('.accordion-header').forEach(h => {
        if (h !== header) {
            h.classList.remove('active');
            const otherContent = h.nextElementSibling;
            if (otherContent) {
                otherContent.classList.remove('expanded');
            }
        }
    });

    if (isActive) {
        header.classList.remove('active');
        content?.classList.remove('expanded');
    } else {
        header.classList.add('active');
        content?.classList.add('expanded');
    }
}

// === ПОЛУЧЕНИЕ ОТВЕТОВ ИЗ BASE64-СТРОКИ В HTML ===
function getTestAnswers() {
    const scriptEl = document.getElementById('lesson-answers');
    if (!scriptEl) {
        throw new Error('Не найден блок с ответами. Добавьте: <script type="application/json" id="lesson-answers">base64_ответы</script>');
    }

    const base64Str = (scriptEl.textContent || scriptEl.innerText).trim();
    if (!base64Str) {
        throw new Error('Блок с ответами пуст');
    }

    try {
        const jsonString = atob(base64Str);
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Ошибка обработки ответов:", e);
        throw new Error("Некорректный формат ответов на тест (ожидается base64-encoded JSON)");
    }
}

// === ЛОГИКА ТЕСТА ===
let currentQuestion = 1;
const totalQuestions = 5;

function nextOrSubmit() {
    const selected = document.querySelector(`input[name="q${currentQuestion}"]:checked`);
    if (!selected) {
        alert("Пожалуйста, выберите ответ, эльф! 🧝‍♂️");
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

// === АНИМАЦИЯ +1 (теперь золотая и с искрами!) ===
function createPlusOne(x, y) {
    const plusOne = document.createElement('div');
    plusOne.className = 'plus-one';
    plusOne.textContent = '+1';
    plusOne.style.left = x + 'px';
    plusOne.style.top = y + 'px';
    plusOne.style.color = '#ffd700'; // Золотой цвет
    plusOne.style.textShadow = '0 0 8px rgba(255, 215, 0, 0.8)';
    const container = document.getElementById('testContainer');
    if (container) {
        container.appendChild(plusOne);
        setTimeout(() => {
            if (plusOne.parentNode) {
                plusOne.parentNode.removeChild(plusOne);
            }
        }, 1200);
    }
}

// === ОТПРАВКА ТЕСТА С НОВОГОДНИМИ СООБЩЕНИЯМИ ===
function submitTest() {
    let answers = {};
    try {
        answers = getTestAnswers();
    } catch (e) {
        alert(e.message);
        return;
    }

    if (Object.keys(answers).length === 0) {
        alert("Нет данных с правильными ответами!");
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
    resultEl.classList.add('show');
    resultEl.style.display = 'block';
}