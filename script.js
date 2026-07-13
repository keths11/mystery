const panels = Array.from(document.querySelectorAll('.panel'));
const page1 = document.getElementById('page1');
const page2 = document.getElementById('page2');
const page3 = document.getElementById('page3');
const page4 = document.getElementById('page4');
const overlay = document.getElementById('transitionOverlay');
const ballButtons = Array.from(document.querySelectorAll('.pokeball-button'));
const revealButton = document.getElementById('revealButton');
const itsText = document.getElementById('itsText');
const itsParts = Array.from(document.querySelectorAll('.its-part'));
const nameRevealStage = document.getElementById('nameRevealStage');
const silhouetteImage = document.getElementById('silhouetteImage');
const revealImage = document.getElementById('revealImage');
const posterCta = document.getElementById('posterCta');
const posterPage = document.getElementById('posterPage');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let posterMoveRaf = null;
let posterShiftX = 0;
let posterShiftY = 0;

const sfx = {
  ballOpen: document.getElementById('sfxBallOpen'),
  encounter: document.getElementById('sfxEncounter'),
  reveal: document.getElementById('sfxReveal')
};

let hasChosenBall = false;
let hasTriggeredReveal = false;
let hasStartedNameReveal = false;

function playSfx(audioEl) {
  // Audio remains optional until data-disabled is removed and files are added.
  if (!audioEl || audioEl.dataset.disabled === 'true') {
    return;
  }

  audioEl.currentTime = 0;
  audioEl.play().catch(() => {
    // Ignore autoplay restrictions; interaction events will usually unlock audio.
  });
}

function setActivePanel(nextPanel) {
  panels.forEach((panel) => {
    const isActive = panel === nextPanel;
    panel.classList.toggle('panel-active', isActive);
    panel.setAttribute('aria-hidden', String(!isActive));
  });

  if (nextPanel !== page3) {
    page3.classList.remove('name-revealed');
  }

  if (nextPanel !== page4) {
    resetPosterMotion();
  }
}

function applyPosterMotion() {
  if (!posterPage) {
    return;
  }

  posterMoveRaf = null;
  posterPage.style.setProperty('--poster-shift-x', `${posterShiftX}px`);
  posterPage.style.setProperty('--poster-shift-y', `${posterShiftY}px`);
}

function setPosterShift(x, y) {
  posterShiftX = x;
  posterShiftY = y;

  if (posterMoveRaf === null) {
    posterMoveRaf = window.requestAnimationFrame(applyPosterMotion);
  }
}

function resetPosterMotion() {
  setPosterShift(0, 0);
}

function runTransition(nextPanel, sfxKey, variant = 'default') {
  playSfx(sfx[sfxKey]);

  const isFinalPokeball = variant === 'pokeball-final';
  const switchDelay = isFinalPokeball ? 210 : 120;
  const clearDelay = isFinalPokeball ? 520 : 260;

  overlay.classList.remove('pokeball-final');
  if (isFinalPokeball) {
    overlay.classList.add('pokeball-final');
  }

  overlay.classList.add('active');

  window.setTimeout(() => {
    setActivePanel(nextPanel);
  }, switchDelay);

  window.setTimeout(() => {
    overlay.classList.remove('active');
    if (isFinalPokeball) {
      overlay.classList.remove('pokeball-final');
    }
  }, clearDelay);
}

function handleBallSelect(button) {
  if (hasChosenBall) {
    return;
  }

  hasChosenBall = true;
  ballButtons.forEach((btn) => btn.classList.remove('selected'));
  button.classList.add('selected');

  playSfx(sfx.ballOpen);

  // Simulate ball shake and opening flash before moving to the mystery panel.
  window.setTimeout(() => {
    runTransition(page2, 'encounter');
  }, 280);
}

function triggerFinalReveal() {
  if (hasTriggeredReveal) {
    return;
  }

  hasTriggeredReveal = true;
  itsText.classList.remove('show');
  itsParts.forEach((part) => part.classList.remove('visible'));

  window.setTimeout(() => {
    runTransition(page3, 'reveal');

    window.setTimeout(() => {
      itsText.classList.add('show');
      itsParts.forEach((part, index) => {
        window.setTimeout(() => {
          part.classList.add('visible');
        }, index * 900);
      });
    }, 220);

    window.setTimeout(() => {
      page3.classList.add('name-revealed');
      nameRevealStage.classList.add('visible');
    }, 3200);

    window.setTimeout(() => {
      if (!hasStartedNameReveal) {
        hasStartedNameReveal = true;
        runTransition(page4, 'encounter', 'pokeball-final');
      }
    }, 5800);
  }, 260);
}

ballButtons.forEach((button) => {
  button.addEventListener('click', () => handleBallSelect(button));
});

revealButton.addEventListener('click', triggerFinalReveal);

// Keep both images in sync so replacing one file updates silhouette and final reveal.
function syncRevealImages() {
  // silhouette (page 2) and reveal (page 3) use different source images intentionally
}

if (silhouetteImage) {
  silhouetteImage.addEventListener('load', syncRevealImages);
}
window.addEventListener('DOMContentLoaded', syncRevealImages);

if (posterCta) {
  posterCta.addEventListener('click', () => {
    posterCta.textContent = 'Campaign Locked In';
  });
}

if (posterPage && !prefersReducedMotion) {
  posterPage.addEventListener('pointermove', (event) => {
    if (!page4.classList.contains('panel-active')) {
      return;
    }

    const rect = posterPage.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    setPosterShift(nx * 12, ny * 8);
  });

  posterPage.addEventListener('pointerleave', resetPosterMotion);
}
