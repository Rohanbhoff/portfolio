/* ===================================================================
   PLAYGROUND TOYS:
   1. Random-Location Cute Small Green Plant (Watering Animation, Cute Sound, Zero Shaking, No Text)
   2. Bottom Scared Fish (Mouth Idle Bubbles, Cute Swim-Away Sound on Click & Scatter Flee)
   =================================================================== */

// 1. RANDOM SIDE LOCATION CUTE SMALL GREEN PLANT
class RandomPlantToy {
  constructor() {
    this.wrap = document.getElementById('randomPlantWrap');
    this.canvas = document.getElementById('randomPlantCanvas');
    if (!this.wrap || !this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.width = 70;
    this.height = 76;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.growth = 30; // 0 to 100
    this.blossoms = 0;
    this.waterDroplets = [];
    this.splashParticles = [];
    this.hasBeenWatered = false;

    this.positionOnSides();
    this.initEvents();
    this.loop();
  }

  positionOnSides() {
    // Random side: Left or Right
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const randomTop = Math.floor(22 + Math.random() * 50); // 22vh to 72vh

    if (side === 'left') {
      this.wrap.style.left = '1.25rem';
      this.wrap.style.right = 'auto';
    } else {
      this.wrap.style.right = '1.25rem';
      this.wrap.style.left = 'auto';
    }
    this.wrap.style.top = `${randomTop}vh`;
  }

  initEvents() {
    this.wrap.addEventListener('click', () => {
      if (this.hasBeenWatered) return;
      this.hasBeenWatered = true;
      this.waterAndDisappear();
    });
  }

  playWateringSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!window._portfolioAudioCtx) window._portfolioAudioCtx = new AudioCtx();
      const ctx = window._portfolioAudioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      // 1. Gentle Musical Droplet Shower (Charming aquatic trickle)
      const drops = [987.77, 1318.5, 1567.98, 1975.53]; // B5, E6, G6, B6
      drops.forEach((freq, idx) => {
        const delay = idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + delay + 0.05);

        gain.gain.setValueAtTime(0.12, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.1);
      });

      // 2. Soft Vanish Sparkle Chime (Peaceful & cute)
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'triangle';
          const tNow = ctx.currentTime;
          osc2.frequency.setValueAtTime(1046.5, tNow);
          osc2.frequency.exponentialRampToValueAtTime(1760.0, tNow + 0.22);

          gain2.gain.setValueAtTime(0.08, tNow);
          gain2.gain.exponentialRampToValueAtTime(0.001, tNow + 0.28);

          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(tNow);
          osc2.stop(tNow + 0.28);
        } catch (err) {}
      }, 750);
    } catch (e) {}
  }

  showRealisticWateringCan() {
    const can = document.createElement('div');
    can.className = 'realistic-watering-can';
    can.innerHTML = `
      <svg viewBox="0 0 54 44" fill="none" class="watering-can-svg" xmlns="http://www.w3.org/2000/svg">
        <!-- Can Body -->
        <path d="M14 18 C14 14, 34 14, 34 18 L36 38 C36 41, 12 41, 12 38 Z" fill="url(#canGradient)" stroke="#00d2ff" stroke-width="1.4"/>
        <!-- Handle -->
        <path d="M12 21 C4 21, 4 35, 12 35" stroke="#00d2ff" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <!-- Long Spout -->
        <path d="M34 26 L45 15 L47 17 L35 30 Z" fill="#00d2ff"/>
        <!-- Rose Sprinkler Head -->
        <ellipse cx="46.5" cy="15.5" rx="3.5" ry="5" transform="rotate(-35 46.5 15.5)" fill="#9d4edd" stroke="#ffffff" stroke-width="0.8"/>
        <!-- Gradients -->
        <defs>
          <linearGradient id="canGradient" x1="12" y1="18" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop stop-color="#00d2ff"/>
            <stop offset="0.5" stop-color="#9d4edd"/>
            <stop offset="1" stop-color="#ff2a85"/>
          </linearGradient>
        </defs>
      </svg>
      <!-- Glistening Water Stream -->
      <div class="watering-can-stream"></div>
    `;

    this.wrap.appendChild(can);

    setTimeout(() => {
      if (can && can.parentNode) {
        can.remove();
      }
    }, 1300);
  }

  waterAndDisappear() {
    // 1. Play cute authentic watering audio
    this.playWateringSound();

    // 2. Realistic Watering Can Animation tilting and pouring
    this.showRealisticWateringCan();

    // 3. Dense stream of sparkling water droplets pouring into pot
    for (let i = 0; i < 28; i++) {
      setTimeout(() => {
        this.waterDroplets.push({
          x: this.width / 2 + 10 + (Math.random() * 16 - 8),
          y: 4 + Math.random() * 6,
          vy: Math.random() * 2.5 + 4.2,
          size: Math.random() * 1.5 + 1.2
        });
      }, i * 24);
    }

    // 4. Sprout growth spurt & blooming flowers
    setTimeout(() => {
      this.growth = 90;
      this.blossoms = 2;
    }, 450);

    // 5. Peaceful, smooth vanish with ZERO shaking effects (after 1.25s)
    setTimeout(() => {
      this.createGentlePuffCloud();
      this.wrap.classList.add('plant-puff-vanish');

      setTimeout(() => {
        if (this.wrap) this.wrap.style.display = 'none';
      }, 750);
    }, 1250);
  }

  createGentlePuffCloud() {
    const rect = this.wrap.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const particleCount = 14;
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'puff-smoke-particle';
      document.body.appendChild(p);

      const angle = (Math.PI * 2 / particleCount) * i + (Math.random() * 0.3 - 0.15);
      const speed = Math.random() * 32 + 22;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = Math.random() * 10 + 6;

      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${centerX}px`;
      p.style.top = `${centerY}px`;
      p.style.opacity = '1';
      p.style.transition = 'all 0.65s cubic-bezier(0.2, 0.8, 0.2, 1)';

      requestAnimationFrame(() => {
        p.style.transform = `translate(${vx}px, ${vy}px) scale(1.4)`;
        p.style.opacity = '0';
      });

      setTimeout(() => p.remove(), 700);
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const potX = this.width / 2;
    const potY = this.height - 20;

    // Gentle natural leaf sway
    const time = Date.now() * 0.0025;
    const sway = Math.sin(time) * 0.06;

    // 1. Tiny Terracotta / Cyber Planter Pot
    const grad = this.ctx.createLinearGradient(potX - 15, potY, potX + 15, potY + 16);
    grad.addColorStop(0, '#9d4edd');
    grad.addColorStop(1, '#00d2ff');

    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.moveTo(potX - 14, potY);
    this.ctx.lineTo(potX + 14, potY);
    this.ctx.lineTo(potX + 10, potY + 15);
    this.ctx.lineTo(potX - 10, potY + 15);
    this.ctx.closePath();
    this.ctx.fill();

    // Pot Rim
    this.ctx.fillStyle = '#ff2a85';
    this.ctx.beginPath();
    this.ctx.roundRect(potX - 16, potY - 3, 32, 4, 2);
    this.ctx.fill();

    // Cute smiling pot face: ( ˘ ◡ ˘ )
    this.ctx.fillStyle = '#ffffff';
    // Left eye dot
    this.ctx.beginPath();
    this.ctx.arc(potX - 5, potY + 6, 1.1, 0, Math.PI * 2);
    this.ctx.fill();
    // Right eye dot
    this.ctx.beginPath();
    this.ctx.arc(potX + 5, potY + 6, 1.1, 0, Math.PI * 2);
    this.ctx.fill();
    // Tiny smile curve
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(potX, potY + 8, 2.5, 0.1 * Math.PI, 0.9 * Math.PI);
    this.ctx.stroke();
    // Rosy pink blush dots
    this.ctx.fillStyle = 'rgba(255, 42, 133, 0.7)';
    this.ctx.beginPath();
    this.ctx.arc(potX - 8, potY + 7.5, 1.2, 0, Math.PI * 2);
    this.ctx.arc(potX + 8, potY + 7.5, 1.2, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. Fresh Green Sprout Stem
    const stemH = 14 + (this.growth / 100) * 18;
    const topX = potX + Math.sin(sway) * 6;
    const topY = potY - stemH;

    this.ctx.strokeStyle = '#00ff87';
    this.ctx.lineWidth = 2.4;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(potX, potY);
    this.ctx.quadraticCurveTo(potX + sway * 8, potY - stemH * 0.5, topX, topY);
    this.ctx.stroke();

    // 3. Cute Fresh Green Leaves
    this.drawLeaf(topX - 3, topY + 4, -0.65 + sway, 10);
    this.drawLeaf(topX + 3, topY + 4, 0.65 + sway, 10);

    // 4. Blooming Flowers (when watered)
    if (this.blossoms >= 1) {
      this.drawFlower(topX, topY - 2, '#ff2a85');
    }
    if (this.blossoms >= 2) {
      this.drawFlower(topX - 6, topY + 6, '#00d2ff');
      this.drawFlower(topX + 6, topY + 6, '#ff85a2');
    }

    // 5. Water Droplets
    for (let i = this.waterDroplets.length - 1; i >= 0; i--) {
      const drop = this.waterDroplets[i];
      drop.y += drop.vy;

      this.ctx.fillStyle = '#00d2ff';
      this.ctx.beginPath();
      this.ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
      this.ctx.fill();

      if (drop.y >= potY - 2) {
        for (let s = 0; s < 2; s++) {
          this.splashParticles.push({
            x: drop.x,
            y: potY - 2,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 2,
            alpha: 1
          });
        }
        this.waterDroplets.splice(i, 1);
      }
    }

    // Splash Particles
    for (let i = this.splashParticles.length - 1; i >= 0; i--) {
      const p = this.splashParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.1;

      this.ctx.fillStyle = `rgba(0, 210, 255, ${p.alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
      this.ctx.fill();

      if (p.alpha <= 0) this.splashParticles.splice(i, 1);
    }

    if (!this.hasBeenWatered || this.waterDroplets.length > 0 || this.splashParticles.length > 0) {
      requestAnimationFrame(() => this.loop());
    }
  }

  drawLeaf(x, y, angle, size) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);
    this.ctx.fillStyle = '#00ff87';
    this.ctx.beginPath();
    this.ctx.ellipse(size / 2, 0, size / 2, size / 3.2, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawFlower(x, y, color) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) {
      this.ctx.rotate((Math.PI * 2) / 5);
      this.ctx.beginPath();
      this.ctx.arc(0, 3, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 1.4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }
}

// 2. BOTTOM SCARED FISH (SURFACES AT FOOTER, MOUTH IDLE BUBBLES & SCATTER FLEE)
class BottomScaredFishToy {
  constructor() {
    this.fish = document.getElementById('bottomScaredFish');
    this.bubbleContainer = document.getElementById('fishIdleBubbles');
    if (!this.fish) return;

    this.hasFled = false;
    this.idleBubbleTimer = null;

    // Random horizontal position along bottom (12% to 78%)
    const randomPercent = Math.floor(12 + Math.random() * 66);
    this.fish.style.left = `${randomPercent}%`;

    // Random initial orientation (facing left or right)
    this.facingRight = Math.random() > 0.5;
    if (this.facingRight) {
      this.fish.classList.add('facing-right');
    } else {
      this.fish.classList.remove('facing-right');
    }

    this.initEvents();
  }

  initEvents() {
    // Only visible when scrolled to the very bottom of the page
    window.addEventListener('scroll', () => {
      if (this.hasFled) return;

      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollBottom >= docHeight - 280) {
        if (!this.fish.classList.contains('visible-at-bottom')) {
          this.fish.classList.add('visible-at-bottom');
          this.startIdleBubbles();
        }
      } else {
        this.fish.classList.remove('visible-at-bottom');
        this.stopIdleBubbles();
      }
    }, { passive: true });

    // Click to scare fish away!
    this.fish.addEventListener('click', () => {
      if (this.hasFled) return;
      this.hasFled = true;
      this.stopIdleBubbles();

      // Play cute swim away sound
      this.playFishSwimSound();

      // Scatter bubbles as it swims away scared!
      this.scatterBubbles();

      // Random direction: left or right
      // The fish faces the direction it escapes in (no backward swimming!)
      const fleeLeft = Math.random() > 0.5;
      if (fleeLeft) {
        this.fish.classList.remove('facing-right', 'fish-flee-right');
        this.fish.classList.add('fish-flee-left');
      } else {
        this.fish.classList.remove('fish-flee-left');
        this.fish.classList.add('fish-flee-right', 'facing-right');
      }

      setTimeout(() => {
        if (this.fish) this.fish.remove();
      }, 2200);
    });
  }

  playFishSwimSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!window._portfolioAudioCtx) window._portfolioAudioCtx = new AudioCtx();
      const ctx = window._portfolioAudioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      // Cute underwater bubbly swoosh dart
      // 1. Watery pitch-bend bubble
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(340, now);
      osc1.frequency.exponentialRampToValueAtTime(720, now + 0.08);
      osc1.frequency.exponentialRampToValueAtTime(460, now + 0.16);

      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.18);

      // 2. High sparkle bubble pops (plink-plink!)
      [0.04, 0.09, 0.14].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const freq = 1200 + idx * 350;
        osc.frequency.setValueAtTime(freq, now + delay);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + delay + 0.04);

        gain.gain.setValueAtTime(0.08, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.05);
      });
    } catch (e) {}
  }

  startIdleBubbles() {
    if (this.idleBubbleTimer) return;
    this.createIdleBubble();
    this.idleBubbleTimer = setInterval(() => {
      this.createIdleBubble();
    }, 1400);
  }

  stopIdleBubbles() {
    clearInterval(this.idleBubbleTimer);
    this.idleBubbleTimer = null;
  }

  createIdleBubble() {
    if (!this.bubbleContainer || this.hasFled) return;

    const b = document.createElement('div');
    b.className = 'mouth-idle-bubble';
    const size = Math.floor(Math.random() * 4 + 4);
    b.style.width = `${size}px`;
    b.style.height = `${size}px`;

    // Position at fish mouth
    if (this.facingRight) {
      b.style.right = '-2px';
      b.style.left = 'auto';
    } else {
      b.style.left = '-2px';
      b.style.right = 'auto';
    }

    b.style.bottom = `${Math.floor(Math.random() * 8 + 10)}px`;
    this.bubbleContainer.appendChild(b);

    setTimeout(() => {
      if (b.parentNode) b.remove();
    }, 1800);
  }

  scatterBubbles() {
    const rect = this.fish.getBoundingClientRect();
    const count = 12;

    for (let i = 0; i < count; i++) {
      const b = document.createElement('div');
      b.className = 'fish-escape-bubble';
      const size = Math.floor(Math.random() * 6 + 4);
      b.style.width = `${size}px`;
      b.style.height = `${size}px`;
      b.style.left = `${rect.left + rect.width / 2 + (Math.random() * 20 - 10)}px`;
      b.style.top = `${rect.top + rect.height / 2 + (Math.random() * 20 - 10)}px`;

      document.body.appendChild(b);

      const vx = (Math.random() - 0.5) * 45;
      const vy = -(Math.random() * 55 + 25);

      requestAnimationFrame(() => {
        b.style.transform = `translate(${vx}px, ${vy}px) scale(0)`;
        b.style.opacity = '0';
      });

      setTimeout(() => b.remove(), 1200);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new RandomPlantToy();
  new BottomScaredFishToy();
});
