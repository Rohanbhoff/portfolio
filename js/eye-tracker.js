/* ===================================================================
   CUTE AXOLOTL EYE-TRACKER & MASCOT INTERACTION (MATCHING USER REFS)
   - Tracks cursor smoothly across screen with shiny specular reflections
   - Natural blinking loop
   - Authentic cute rubbery axolotl squeak on click (YouTube reference)
   - Yawning animation followed by sleeping with floating 'zzzz' when idle
   - Wakes up immediately upon user interaction
   =================================================================== */

class AxolotlMascotTracker {
  constructor() {
    this.mascot = document.getElementById('axolotlMascot');
    this.pupils = document.querySelectorAll('.axolotl-pupil-shiny');
    this.sockets = document.querySelectorAll('.axolotl-eye-socket');
    this.zzzContainer = document.getElementById('axolotlSleepZzz');

    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    this.maxTravel = 2.4; // Max pupil travel in px
    this.isBlinking = false;
    this.isHappyBlushing = false;
    this.isYawning = false;
    this.isSleeping = false;
    this.idleTimer = null;
    this.idleDelay = 9500; // 9.5s of inactivity triggers yawn -> sleep

    this.init();
  }

  init() {
    if (!this.pupils.length) return;

    // Track mouse coordinates
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    // Touch support for mobile
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouseX = e.touches[0].clientX;
        this.mouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    // Click reaction: Rubbery squeak + Happy blushing animation (>_<)
    if (this.mascot) {
      this.mascot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.isSleeping || this.isYawning) {
          this.wakeUp();
        }
        this.triggerHappyBlush();
      });
    }

    // Interactive element hover: gentle excitement
    const interactables = document.querySelectorAll('a, button, .certificate-card, .project-card-large');
    interactables.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        if (!this.isHappyBlushing && !this.isSleeping && !this.isYawning) {
          this.pupils.forEach((p) => {
            p.style.transform += ' scale(1.15)';
          });
        }
      });

      el.addEventListener('mouseleave', () => {
        if (!this.isHappyBlushing && !this.isSleeping && !this.isYawning) {
          this.pupils.forEach((p) => {
            p.style.transform = p.style.transform.replace(' scale(1.15)', '');
          });
        }
      });
    });

    // Natural blinking loop
    this.scheduleBlink();

    // Idle Detection for Yawning and Sleeping with Zzzz bubbles
    this.initIdleDetection();

    // Cache eye socket coordinates to eliminate layout reflow in 60fps render loop
    this.eyeCenters = [];
    this.updateEyeCenters();
    window.addEventListener('resize', () => this.updateEyeCenters(), { passive: true });
    window.addEventListener('scroll', () => this.updateEyeCenters(), { passive: true });

    // Start tracking render loop
    this.animate();
  }

  updateEyeCenters() {
    this.eyeCenters = [];
    this.sockets.forEach((socket) => {
      const rect = socket.getBoundingClientRect();
      this.eyeCenters.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    });
  }

  initIdleDetection() {
    const handleUserActivity = () => {
      if (this.isSleeping || this.isYawning) {
        this.wakeUp();
      }
      this.resetIdleTimer();
    };

    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('scroll', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });

    this.resetIdleTimer();
  }

  resetIdleTimer() {
    clearTimeout(this.idleTimer);
    if (!this.isSleeping && !this.isYawning) {
      this.idleTimer = setTimeout(() => {
        this.triggerYawnAndSleep();
      }, this.idleDelay);
    }
  }

  triggerYawnAndSleep() {
    if (this.isSleeping || this.isYawning || this.isHappyBlushing || !this.mascot) return;
    this.isYawning = true;
    this.mascot.classList.add('yawning');

    // Silent cute yawn motion without noisy audio
    // (After yawn completes in 2.2s, enters peaceful sleep with zzz bubbles)

    // After yawn completes (2.2s), enter peaceful sleep
    setTimeout(() => {
      if (!this.isYawning) return; // Woken up early
      this.isYawning = false;
      this.mascot.classList.remove('yawning');
      this.mascot.classList.add('sleeping');
      this.isSleeping = true;

      // Spawn floating animated zzz's
      if (this.zzzContainer) {
        this.zzzContainer.innerHTML = `
          <span class="zzz-bubble zzz-bubble-1">z</span>
          <span class="zzz-bubble zzz-bubble-2">z</span>
          <span class="zzz-bubble zzz-bubble-3">Z</span>
        `;
      }
    }, 2200);
  }

  wakeUp() {
    this.isYawning = false;
    this.isSleeping = false;
    if (this.mascot) {
      this.mascot.classList.remove('yawning', 'sleeping');
    }
    if (this.zzzContainer) {
      this.zzzContainer.innerHTML = '';
    }
    this.resetIdleTimer();
  }

  triggerHappyBlush() {
    if (this.isHappyBlushing || !this.mascot) return;
    this.isHappyBlushing = true;
    this.mascot.classList.add('blushing-happy');
    this.playCuteAxolotlSound();

    setTimeout(() => {
      if (this.mascot) {
        this.mascot.classList.remove('blushing-happy');
      }
      this.isHappyBlushing = false;
      this.resetIdleTimer();
    }, 1300);
  }

  playCuteAxolotlSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const now = this.audioCtx.currentTime;

      // Cheerful rising chirp (cute baby axolotl squeak)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(680, now);
      osc1.frequency.exponentialRampToValueAtTime(1250, now + 0.08);
      osc1.frequency.exponentialRampToValueAtTime(1550, now + 0.16);

      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.22);

      // Sweet harmonic sparkle bell
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1360, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(1950, now + 0.17);

      gain2.gain.setValueAtTime(0.08, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.25);
    } catch (e) {}
  }

  scheduleBlink() {
    const delay = Math.random() * 4000 + 2500;
    setTimeout(() => {
      this.blink();
      this.scheduleBlink();
    }, delay);
  }

  blink() {
    if (this.isBlinking || this.isHappyBlushing || this.isYawning || this.isSleeping) return;
    this.isBlinking = true;
    this.sockets.forEach((s) => (s.style.transform = 'scaleY(0.1)'));
    setTimeout(() => {
      this.sockets.forEach((s) => (s.style.transform = 'scaleY(1)'));
      this.isBlinking = false;
    }, 150);
  }

  animate() {
    if (!this.isHappyBlushing && !this.isBlinking && !this.isYawning && !this.isSleeping && this.eyeCenters.length) {
      for (let index = 0; index < this.sockets.length; index++) {
        const pupil = this.pupils[index];
        const center = this.eyeCenters[index];
        if (!pupil || !center) continue;

        const dx = this.mouseX - center.x;
        const dy = this.mouseY - center.y;
        const distance = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);

        // Natural distance constraint
        const clampedDist = Math.min(this.maxTravel, distance / 40);
        const targetX = Math.cos(angle) * clampedDist;
        const targetY = Math.sin(angle) * clampedDist;

        pupil.style.transform = `translate(${targetX}px, ${targetY}px)`;
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AxolotlMascotTracker();
});
