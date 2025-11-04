// === НОВОГОДНИЙ СНЕГ ===
function initSnow() {
    var mainContent = document.getElementById("mainContent");
    if (!mainContent || getComputedStyle(mainContent).display === "none") {
        setTimeout(initSnow, 100);
        return;
    }

    var oldSnow = document.querySelector('.snowfall');
    if (oldSnow) {
        oldSnow.remove();
    }

    var canvas = document.createElement('canvas');
    canvas.className = 'snowfall';
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }

    var w = canvas.width = window.innerWidth;
    var h = canvas.height = window.innerHeight;

    var resize = function() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    var flakes = [];
    var symbols = "❄*+.";
    for (var i = 0; i < 100; i++) {
        flakes.push({
            x: Math.random() * w,
            y: Math.random() * h,
            speed: Math.random() * 1 + 0.5,
            char: symbols.charAt(Math.floor(Math.random() * symbols.length)),
            opacity: Math.random() * 0.7 + 0.3
        });
    }

    var draw = function() {
        ctx.clearRect(0, 0, w, h);
        ctx.font = "16px 'JetBrains Mono', monospace";
        for (var j = 0; j < flakes.length; j++) {
            var flake = flakes[j];
            if (flake.char === '❄') {
                ctx.fillStyle = "rgba(255, 215, 0, " + flake.opacity + ")";
            } else {
                ctx.fillStyle = "rgba(255, 255, 255, " + flake.opacity + ")";
            }
            ctx.fillText(flake.char, flake.x, flake.y);
            flake.y += flake.speed;
            flake.x += Math.sin(flake.y * 0.02) * 0.5;
            if (flake.y > h) {
                flake.y = -10;
                flake.x = Math.random() * w;
            }
        }
        requestAnimationFrame(draw);
    };
    draw();
}

// === ПОЛУЧЕНИЕ ПАРОЛЯ ===
function getLessonPassword() {
    var meta = document.querySelector('meta[name="lesson-password"]');
    if (!meta || !meta.getAttribute('content')) {
        return "cHl0aG9uMjAyNQ==";
    }
    return meta.getAttribute('content');
}

// === ПРОВЕРКА ПАРОЛЯ ===
function checkPassword() {
    var passwordScreen = document.getElementById("passwordScreen");
    var mainContent = document.getElementById("mainContent");
    var passwordInput = document.getElementById("passwordInput");
    var passwordError = document.getElementById("passwordError");

    if (!passwordScreen || !mainContent || !passwordInput || !passwordError) {
        alert("Ошибка загрузки урока!");
        return;
    }

    var userInput = passwordInput.value.trim();
    var correctPassword = "";
    try {
        correctPassword = atob(getLessonPassword());
    } catch (e) {
        correctPassword = "python2025";
    }

    if (userInput === correctPassword) {
        passwordScreen.style.display = "none";
        mainContent.style.display = "block";
        setTimeout(initSnow, 100);
    } else {
        passwordError.style.display = "block";
        setTimeout(function() {
            passwordError.style.display = "none";
        }, 2000);
    }
}

// === АККОРДЕОН ===
function toggleAccordion(header) {
    var content = header.nextElementSibling;
    var isActive = header.classList.contains('active');

    var allHeaders = document.querySelectorAll('.accordion-header');
    for (var i = 0; i < allHeaders.length; i++) {
        var h = allHeaders[i];
        if (h !== header) {
            h.classList.remove('active');
            var c = h.nextElementSibling;
            if (c) {
                c.classList.remove('expanded');
            }
        }
    }

    if (isActive) {
        header.classList.remove('active');
        if (content) {
            content.classList.remove('expanded');
        }
    } else {
        header.classList.add('active');
        if (content) {
            content.classList.add('expanded');
        }
    }
}

// === ПОЛУЧЕНИЕ ОТВЕТОВ НА ТЕСТ ===
function getTestAnswers() {
    var script = document.getElementById('lesson-answers');
    if (!script) {
        return {};
    }
    var base64Str = (script.textContent || script.innerText).trim();
    if (!base64Str) {
        return {};
    }
    try {
        var jsonString = atob(base64Str);
        return JSON.parse(jsonString);
    } catch (e) {
        return {};
    }
}

// === ЛОГИКА ТЕСТА ===
var currentQuestion = 1;
var totalQuestions = 5;

function nextOrSubmit() {
    var selected = document.querySelector('input[name="q' + currentQuestion + '"]:checked');
    if (!selected) {
        alert("Пожалуйста, выберите ответ!");
        return;
    }

    if (currentQuestion < totalQuestions) {
        var currentQ = document.querySelector('.test-question[data-question="' + currentQuestion + '"]');
        if (currentQ) {
            currentQ.classList.remove('active');
        }

        currentQuestion++;
        var nextQ = document.querySelector('.test-question[data-question="' + currentQuestion + '"]');
        if (nextQ) {
            nextQ.classList.add('active');
        }

        if (currentQuestion === totalQuestions) {
            var nextBtn = document.getElementById('nextBtn');
            var submitBtn = document.getElementById('submitBtn');
            if (nextBtn) {
                nextBtn.style.display = 'none';
            }
            if (submitBtn) {
                submitBtn.style.display = 'inline-block';
            }
        }
    }
}

// === АНИМАЦИЯ +1 ===
function createPlusOne(x, y) {
    var plusOne = document.createElement('div');
    plusOne.className = 'plus-one';
    plusOne.textContent = '+1';
    plusOne.style.left = x + 'px';
    plusOne.style.top = y + 'px';
    var container = document.getElementById('testContainer');
    if (container) {
        container.appendChild(plusOne);
        setTimeout(function() {
            if (plusOne.parentNode) {
                plusOne.parentNode.removeChild(plusOne);
            }
        }, 1200);
    }
}

// === ОТПРАВКА ТЕСТА ===
function submitTest() {
    var answers = getTestAnswers();
    var score = 0;
    var testContainer = document.getElementById('testContainer');
    var rect;
    if (testContainer) {
        rect = testContainer.getBoundingClientRect();
    } else {
        rect = { width: 400, height: 300 };
    }

    for (var i = 1; i <= totalQuestions; i++) {
        var selected = document.querySelector('input[name="q' + i + '"]:checked');
        if (selected && selected.value === answers['q' + i]) {
            score++;
            var x = Math.random() * (rect.width - 40);
            var y = Math.random() * (rect.height - 60) + 20;
            createPlusOne(x, y);
        }
    }

    var resultEl = document.getElementById('result');
    if (!resultEl) {
        return;
    }

    var percent = Math.round((score / totalQuestions) * 100);
    var message = "Вы набрали " + score + " из " + totalQuestions + " (" + percent + "%)<br>";

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