document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('submit-button');
    const feedback = document.getElementById('feedback');

    async function completeLesson(level, lessonNumber, phone) {
        try {
            const localKey = `completedLessons${level.toUpperCase()}`;
            const completedLessons = JSON.parse(localStorage.getItem(localKey)) || [];
            if (!completedLessons.includes(lessonNumber)) {
                completedLessons.push(lessonNumber);
                localStorage.setItem(localKey, JSON.stringify(completedLessons));
            }

            const response = await fetch('https://picayune-sugar-roadway.glitch.me/api/complete-lesson', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    level,
                    lessonNumber,
                    phone,
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Ошибка при сохранении на сервере');
            }

            window.opener?.postMessage({ type: 'lessonCompleted', level, lessonNumber }, '*');

            setTimeout(() => {
                window.location.href = './lessons.html';
            }, 1000);
        } catch (error) {
            console.error('Ошибка при завершении урока:', error);
            feedback.textContent = 'Ошибка при сохранении прогресса. Попробуйте снова.';
            feedback.className = 'feedback incorrect';
        }
    }

    submitButton.addEventListener('click', async () => {
        const selectedAnswer = document.querySelector('input[name="answer"]:checked');
        if (!selectedAnswer) {
            feedback.textContent = 'Пожалуйста, выберите ответ!';
            feedback.className = 'feedback incorrect';
            return;
        }

        const answer = selectedAnswer.value;
        if (answer === 'were') {
            feedback.textContent = 'Правильно! Урок завершён!';
            feedback.className = 'feedback correct';

            const phone = localStorage.getItem('Phone');
            if (!phone) {
                feedback.textContent = 'Ошибка: пользователь не авторизован';
                feedback.className = 'feedback incorrect';
                return;
            }

            await completeLesson('a', 3, phone);
        } else {
            feedback.textContent = 'Неправильно, попробуйте ещё раз!';
            feedback.className = 'feedback incorrect';
        }
    });
});