const exercises = {
      "Crazy 8s": 8 * 60,
      "AI Opportunity Mapping": 18 * 60,
      "How Might We (Reframing)": 15 * 60,
      "Dot Voting": 8 * 60,
      "Effort/Impact Grid": 15 * 60,
      "AI Oracle Discussion": 20 * 60
    };

    const timerDisplay = document.getElementById('timer-display');
    const exerciseTitle = document.getElementById('exercise-title');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const resetBtn = document.getElementById('reset-btn');
    const durationInput = document.getElementById('duration-input');
    const exerciseSelector = document.getElementById('exercise-selector');
    const progressBar = document.getElementById('progress-bar');

    let timerInterval = null;
    let totalSeconds = 0;
    let currentExerciseDuration = 0;
    let isRunning = false;
    let selectedExerciseButton = null;

    const audioContext = window.AudioContext || window.webkitAudioContext || null;
    let alertSound = null;
    if (audioContext) {
      alertSound = () => {
        const ctx = new audioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 1);
      };
    } else {
      alertSound = () => alert("Time's up!");
    }

    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remaining = seconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
    }

    function getCustomDuration() {
      const value = parseFloat(durationInput.value);
      if (!isNaN(value) && value > 0) {
        return Math.round(value * 60); // assume minutes
      }
      return null;
    }

    function updateDisplay() {
      timerDisplay.textContent = formatTime(totalSeconds);
      if (currentExerciseDuration > 0) {
        const percent = (totalSeconds / currentExerciseDuration) * 100;
        progressBar.style.width = `${percent}%`;
      }
    }

    function selectExercise(name, duration, button) {
      stopTimer();
      const custom = getCustomDuration();
      if (custom !== null) {
        currentExerciseDuration = custom;
        totalSeconds = custom;
      } else {
        currentExerciseDuration = duration;
        totalSeconds = duration;
      }
      exerciseTitle.textContent = name;
      updateDisplay();
      if (selectedExerciseButton) selectedExerciseButton.classList.remove('active');
      selectedExerciseButton = button;
      selectedExerciseButton.classList.add('active');
      startBtn.disabled = false;
      resetBtn.disabled = false;
      stopBtn.disabled = true;
    }

    function startTimer() {
      if (isRunning || totalSeconds <= 0) return;

      const custom = getCustomDuration();
      if (custom !== null) {
        currentExerciseDuration = custom;
        totalSeconds = custom;
        updateDisplay();
      }

      isRunning = true;
      startBtn.disabled = true;
      stopBtn.disabled = false;
      resetBtn.disabled = true;

      timerInterval = setInterval(() => {
        totalSeconds--;
        updateDisplay();
        if (totalSeconds <= 0) {
          stopTimer();
          alertSound();
          resetBtn.disabled = false;
          startBtn.disabled = true;
          stopBtn.disabled = true;
        }
      }, 1000);
    }

    function stopTimer() {
      clearInterval(timerInterval);
      isRunning = false;
      if (totalSeconds > 0) startBtn.disabled = false;
      stopBtn.disabled = true;
      if (currentExerciseDuration > 0) resetBtn.disabled = false;
    }

    function resetTimer() {
      stopTimer();
      totalSeconds = currentExerciseDuration;
      updateDisplay();
      startBtn.disabled = false;
      stopBtn.disabled = true;
      resetBtn.disabled = false;
    }

    function createExerciseButtons() {
      for (const name in exercises) {
        const duration = exercises[name];
        const button = document.createElement('button');
        button.textContent = name;
        button.onclick = () => selectExercise(name, duration, button);
        exerciseSelector.appendChild(button);
      }
    }

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        isRunning ? stopTimer() : startTimer();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        resetTimer();
      }
    });

    startBtn.addEventListener('click', startTimer);
    stopBtn.addEventListener('click', stopTimer);
    resetBtn.addEventListener('click', resetTimer);
    createExerciseButtons();
    updateDisplay();
