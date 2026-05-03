const timerGrid = document.querySelector('#timerGrid');
const timerTemplate = document.querySelector('#timerTemplate');

const LIFE_LOSS_INTERVAL_MINUTES = 5;

function createHeart(isActive) {
  const heart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  heart.setAttribute('viewBox', '0 0 24 24');
  heart.classList.add('heart');

  if (!isActive) {
    heart.classList.add('lost');
  }

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute(
    'd',
    'M12 21L10.5 19.7C5.4 15.1 2 12 2 8.5C2 6 4 4 6.5 4C8.04 4 9.54 4.79 10.5 6.02L12 7.5L13.5 6.02C14.46 4.79 15.96 4 17.5 4C20 4 22 6 22 8.5C22 12 18.6 15.1 13.5 19.7L12 21Z'
  );
  path.setAttribute('fill', isActive ? '#e07b7b' : '#999999');
  path.setAttribute('stroke', isActive ? '#c96565' : '#777777');
  path.setAttribute('stroke-width', '1');

  heart.appendChild(path);
  return heart;
}

function formatTime(minutes, seconds) {
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function setupTimer(sectionElement, sectionNumber) {
  const timeDisplay = sectionElement.querySelector('.time-display');
  const sectionNumberElement = sectionElement.querySelector('.section-number');
  const startButton = sectionElement.querySelector('.btn-start');
  const pauseButton = sectionElement.querySelector('.btn-pause');
  const resetButton = sectionElement.querySelector('.btn-reset');
  const minutesInput = sectionElement.querySelector('.minutes-input');
  const livesContainer = sectionElement.querySelector('.lives');

  let minutes = 5;
  let seconds = 0;
  let lives = 3;
  let initialMinutes = 5;
  let isActive = false;
  let intervalId = null;
  let elapsedSeconds = 0;
  const lifeLossSound = new Audio('Sounds/WarningSound.mp3');

  sectionNumberElement.textContent = sectionNumber;

  function renderLives() {
    livesContainer.innerHTML = '';

    for (let index = 0; index < 3; index += 1) {
      livesContainer.appendChild(createHeart(index < lives));
    }
  }

  function render() {
    timeDisplay.textContent = formatTime(minutes, seconds);
    startButton.disabled = isActive || lives === 0;
    pauseButton.disabled = !isActive;
    renderLives();
  }

  function stopTimer() {
  isActive = false;

  clearInterval(intervalId);
  intervalId = null;

  render();
  }


  function loseLife() {
    if (lives <= 0) return;

    lives -= 1;

    const sound = new Audio('Sounds/WarningSound.mp3');
    sound.volume = 1;
    sound.play().catch((error) => {
      console.log('No se pudo reproducir el sonido:', error);
    });

    render();

    if (lives === 0) {
      stopTimer();
    }
  }

  function tick() {
    elapsedSeconds += 1;

    if (elapsedSeconds % (LIFE_LOSS_INTERVAL_MINUTES * 60) === 0) {
      loseLife();
    }

    if (seconds === 0) {
      if (minutes === 0) {
        minutes = initialMinutes;
        seconds = 0;
        render();
        return;
      }

      minutes -= 1;
      seconds = 59;
    } else {
      seconds -= 1;
    }

    render();
  }

  startButton.addEventListener('click', () => {
    if (isActive || lives === 0) return;

    isActive = true;
    intervalId = setInterval(tick, 1000);

    render();
  });

  pauseButton.addEventListener('click', stopTimer);

  resetButton.addEventListener('click', () => {
    clearInterval(intervalId);

    intervalId = null;
    elapsedSeconds = 0;

    isActive = false;
    minutes = initialMinutes;
    seconds = 0;
    lives = 3;

    render();
  }); 

  minutesInput.addEventListener('input', (event) => {
    const value = Number.parseInt(event.target.value, 10);
    initialMinutes = Number.isNaN(value) ? 1 : Math.min(Math.max(value, 1), 60);

    if (!isActive) {
      minutes = initialMinutes;
      seconds = 0;
      render();
    }
  });

  render();
}

for (let sectionNumber = 1; sectionNumber <= 4; sectionNumber += 1) {
  const timerNode = timerTemplate.content.cloneNode(true);
  const timerCard = timerNode.querySelector('.timer-card');

  setupTimer(timerCard, sectionNumber);
  timerGrid.appendChild(timerNode);
}
