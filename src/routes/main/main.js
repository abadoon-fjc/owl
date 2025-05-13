const questions = [
    {
        type: "grammar",
        level: "A1",
        question: "Choose the correct form: He ___ a student.",
        options: ["is", "are", "am", "be"],
        correct: "is"
    },
    {
        type: "vocabulary",
        level: "A1",
        question: "What is the opposite of 'big'?",
        options: ["Small", "Tall", "Fast", "Old"],
        correct: "Small"
    },
    {
        type: "grammar",
        level: "A2",
        question: "Fill in the blank: She ___ to school yesterday.",
        options: ["go", "goes", "went", "going"],
        correct: "went"
    },
    {
        type: "vocabulary",
        level: "A2",
        question: "What does 'quick' mean?",
        options: ["Slow", "Fast", "Big", "Quiet"],
        correct: "Fast"
    },
    {
        type: "listening",
        level: "B1",
        question: "Listen and choose what you hear: [Audio: 'I enjoy swimming.']",
        options: ["I enjoy swimming.", "I enjoy running.", "I enjoy reading.", "I enjoy cooking."],
        correct: "I enjoy swimming."
    },
    {
        type: "grammar",
        level: "B1",
        question: "Choose the correct form: If it ___ tomorrow, we will stay home.",
        options: ["rain", "rains", "raining", "rained"],
        correct: "rains"
    },
    {
        type: "vocabulary",
        level: "B2",
        question: "What is a synonym for 'difficult'?",
        options: ["Easy", "Hard", "Simple", "Quick"],
        correct: "Hard"
    },
    {
        type: "grammar",
        level: "B2",
        question: "Fill in the blank: I wish I ___ more time to study.",
        options: ["have", "had", "has", "having"],
        correct: "had"
    },
    {
        type: "vocabulary",
        level: "C1",
        question: "What does 'meticulous' mean?",
        options: ["Careless", "Very careful", "Quick", "Confused"],
        correct: "Very careful"
    },
    {
        type: "grammar",
        level: "C1",
        question: "Choose the correct form: By the time we arrived, the meeting ___ .",
        options: ["has finished", "had finished", "finishes", "was finished"],
        correct: "had finished"
    }
];

let currentQuestion = 0;
let score = 0;
let Phrase; 

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function startTest() {
    currentQuestion = 0;
    score = 0;
    showSection('test');
    loadQuestion();
}

function loadQuestion() {
    const question = questions[currentQuestion];
    document.getElementById('question-number').textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('progress').style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;

    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.onclick = () => handleAnswer(option);
        optionsDiv.appendChild(button);
    });
}

function handleAnswer(answer) {
    if (answer === questions[currentQuestion].correct) {
        score++;
    }

    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        loadQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    const level = score >= 9 ? "C2" :
                  score >= 7 ? "C1" :
                  score >= 5 ? "B2" :
                  score >= 3 ? "B1" :
                  score >= 1 ? "A2" : "A1";

    document.getElementById('result-level').textContent = `Your Level: ${level}`;
    showSection('result');

    const resultContainer = document.querySelector('.result-container');
    const existingButton = resultContainer.querySelector('.action-button');
    if (existingButton) existingButton.remove();

    if (localStorage.getItem('reg') === 'yes') {
        const nickName = localStorage.getItem('NickName') || 'Unknown';
        const phone = localStorage.getItem('Phone') || 'Unknown';
        sendResultToServer(level, nickName, phone);
    } else {
        const registerButton = document.createElement('button');
        registerButton.className = 'action-button';
        registerButton.textContent = 'Register';
        registerButton.onclick = () => {
            showRegisterModal(true, false);
        };
        resultContainer.insertBefore(registerButton, resultContainer.querySelector('.cta-button'));
    }
}

async function sendResultToServer(level, nickName, phone) {
    if (localStorage.getItem('level')) {
        if (Phrase) {
            Phrase.textContent = `You have already passed this test before. We know your level)`;
        } else {
            console.error('Element with id "after-phrase" not found');
        }
        return;
    } else {
        localStorage.setItem('level', level);
        Phrase.textContent = `Based on your results, we recommend a personalized learning plan for you!`;
        try {
            const response = await fetch('https://picayune-sugar-roadway.glitch.me/api/submit-level', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ level, nickName, phone, score })
            });

            if (response.ok) {
                createNotification('Level successfully saved!', '#22c55e');
            } else {
                createNotification('Failed to save level', '#dc2626');
            }
        } catch (error) {
            createNotification('Error connecting to server', '#dc2626');
        }
    }
}

function closeTest() {
    showSection('home');
}

function reset() {
    showSection('home');
}

document.addEventListener('DOMContentLoaded', () => {
    Phrase = document.getElementById('after-phrase'); 
    showSection('home');

    const testContainer = document.querySelector('.test-container');
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = '←';
    closeButton.onclick = closeTest;
    testContainer.prepend(closeButton);

    window.addEventListener('message', (event) => {
        if (event.data.type === 'registrationComplete') {
            localStorage.setItem('reg', 'yes');
            localStorage.setItem('NickName', event.data.nickName);
            localStorage.setItem('Phone', event.data.phone);
            showResult();
        } else if (event.data.type === 'closeRegisterModal') {
            
        }
    });
});