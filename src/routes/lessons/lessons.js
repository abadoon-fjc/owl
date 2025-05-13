document.addEventListener('DOMContentLoaded', async () => {
    let userLevel = localStorage.getItem('level') || 'A1';
    let completedLessons = {
        a: JSON.parse(localStorage.getItem('completedLessonsA')) || [],
        b: JSON.parse(localStorage.getItem('completedLessonsB')) || [],
        c: JSON.parse(localStorage.getItem('completedLessonsC')) || []
    };

    const phone = localStorage.getItem('Phone');
    if (phone) {
        try {
            const response = await fetch('https://picayune-sugar-roadway.glitch.me/api/get-completed-lessons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone })
            });

            const data = await response.json();
            if (response.ok && data.completed_lessons && data.level) {
                completedLessons = {
                    a: data.completed_lessons.a || [],
                    b: data.completed_lessons.b || [],
                    c: data.completed_lessons.c || []
                };
                localStorage.setItem('completedLessonsA', JSON.stringify(completedLessons.a));
                localStorage.setItem('completedLessonsB', JSON.stringify(completedLessons.b));
                localStorage.setItem('completedLessonsC', JSON.stringify(completedLessons.c));
                localStorage.setItem('level', data.level);
                userLevel = data.level;
            }
        } catch (error) {
            console.error('Ошибка при загрузке завершённых уроков и уровня:', error);
        }
    }

    const availableLevels = getAvailableLevels(userLevel, completedLessons);
    updateLevelSections(availableLevels, completedLessons);

    updateProgressBars(completedLessons);

    if (areAllLessonsCompleted(availableLevels, completedLessons)) {
        document.getElementById('completion-message').classList.add('active');
        showSubscriptionModal();
    }

    document.querySelectorAll('.lesson-button').forEach(button => {
        button.addEventListener('click', () => {
            const level = button.getAttribute('data-level');
            const lessonNumber = parseInt(button.getAttribute('data-lesson'));
            window.location.href = `./lesson-${level}-${lessonNumber}.html`;
        });
    });

    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('subscription-modal').style.display = 'none';
        document.getElementById('modal-overlay').style.display = 'none';
    });
});

function getAvailableLevels(userLevel, completedLessons) {
    const levels = ['a'];
    if (['B1', 'B2', 'C1', 'C2'].includes(userLevel) || completedLessons.a.length >= 5) {
        levels.push('b');
    }
    if (['C1', 'C2'].includes(userLevel) || completedLessons.b.length >= 5) {
        levels.push('c');
    }
    return levels;
}

function updateLevelSections(availableLevels, completedLessons) {
    ['a', 'b', 'c'].forEach(level => {
        const section = document.getElementById(`level-${level}`);
        if (availableLevels.includes(level)) {
            section.classList.remove('locked');
            updateLessons(level, completedLessons[level]);
        } else {
            section.classList.add('locked');
        }
    });
}

function updateLessons(level, completedLessons) {
    for (let i = 1; i <= 5; i++) {
        const lessonElement = document.getElementById(`lesson-${level}-${i}`);
        const button = lessonElement.querySelector('.lesson-button');

        if (i === 1 || completedLessons.includes(i - 1)) {
            lessonElement.classList.remove('locked');
            button.disabled = false;
        } else {
            lessonElement.classList.add('locked');
            button.disabled = true;
        }

        if (completedLessons.includes(i)) {
            button.textContent = 'Завершено';
            button.classList.add('completed');
            button.disabled = true;
        } else {
            button.textContent = `Урок ${i}`;
            button.classList.remove('completed');
        }
    }
}

function updateProgressBars(completedLessons) {
    ['a', 'b', 'c'].forEach(level => {
        const progressFill = document.getElementById(`progress-fill-${level}`);
        const progressPercentage = (completedLessons[level].length / 5) * 100;
        progressFill.style.width = `${progressPercentage}%`;
    });
}

function areAllLessonsCompleted(availableLevels, completedLessons) {
    return availableLevels.every(level => completedLessons[level].length >= 5);
}

function showSubscriptionModal() {
    document.getElementById('subscription-modal').style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';
}

async function updateUserLevel(newLevel) {
    const nickName = localStorage.getItem('NickName');
    const phone = localStorage.getItem('Phone');
    try {
        await fetch('https://picayune-sugar-roadway.glitch.me/api/user/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nickName, phone, level: newLevel }),
        });
        localStorage.setItem('level', newLevel);
    } catch (error) {
        console.error('Error updating user level:', error);
    }
}

window.addEventListener('message', (event) => {
    if (event.data.type === 'lessonCompleted') {
        const level = event.data.level;
        const lessonNumber = event.data.lessonNumber;
        const completedLessons = {
            a: JSON.parse(localStorage.getItem('completedLessonsA')) || [],
            b: JSON.parse(localStorage.getItem('completedLessonsB')) || [],
            c: JSON.parse(localStorage.getItem('completedLessonsC')) || []
        };

        if (!completedLessons[level].includes(lessonNumber)) {
            completedLessons[level].push(lessonNumber);
            localStorage.setItem(`completedLessons${level.toUpperCase()}`, JSON.stringify(completedLessons[level]));
        }

        if (level === 'a' && completedLessons.a.length >= 5 && !['B1', 'B2', 'C1', 'C2'].includes(localStorage.getItem('level'))) {
            localStorage.setItem('level', 'B1');
            updateUserLevel('B1');
        } else if (level === 'b' && completedLessons.b.length >= 5 && !['C1', 'C2'].includes(localStorage.getItem('level'))) {
            localStorage.setItem('level', 'C1');
            updateUserLevel('C1');
        }

        const availableLevels = getAvailableLevels(localStorage.getItem('level') || 'A1', completedLessons);
        updateLevelSections(availableLevels, completedLessons);
        updateProgressBars(completedLessons);

        if (areAllLessonsCompleted(availableLevels, completedLessons)) {
            document.getElementById('completion-message').classList.add('active');
            showSubscriptionModal();
        }
    }
});