/* ===================================================================
   AUTHENTIC RETRO PC ARCADE (C:\ARCADE\VINTAGE_CABIN.EXE)
   - Endless Modes: Flappy Axolotl & Galaga Cyber Defender
   - 8-bit Chiptune Music Loops & SFX via Web Audio API
   - Insert Coin Animation & Metallic Coin Drop Audio
   - Galaga 2D Front/Back/Left/Right Spacecraft Navigation
   - Live Highscore Fanfare & Victory Celebrations
   - Retro PC Window Titlebar (Closes ONLY on Cross [X] Icon)
   =================================================================== */

class MultiRetroArcade {
  constructor() {
    this.modal = document.getElementById('arcadeModal');
    this.openBtn = document.getElementById('arcadeLauncherBtn');
    this.closeBtn = document.getElementById('closeArcadeBtn');
    this.dockContainer = document.getElementById('arcadeDockContainer');
    this.minimizeBtn = document.getElementById('arcadeMinimizeBtn');
    this.minimizedPill = document.getElementById('arcadeMinimizedPill');
    this.cornerZone = document.getElementById('arcadeCornerZone');

    this.canvas = document.getElementById('arcadeCanvas');
    this.scoreDisplay = document.getElementById('arcadeScore');
    this.highScoreDisplay = document.getElementById('arcadeHighScore');
    this.startOverlay = document.getElementById('arcadeStartOverlay');
    this.overlayTitle = document.getElementById('arcadeOverlayTitle');
    this.overlaySubtitle = document.getElementById('arcadeOverlaySubtitle');
    this.startActionBtn = document.getElementById('arcadeStartActionBtn');
    this.sfxToggleBtn = document.getElementById('arcadeSfxToggleBtn');
    this.coinSlotWrap = document.getElementById('coinSlotWrap');

    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.width = 520;
    this.height = 330;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.currentGame = 'flappy'; // 'flappy', 'galaga'
    this.isPlaying = false;
    this.score = 0;
    this.highScores = {
      flappy: parseInt(localStorage.getItem('arcade_hs_flappy') || '0', 10),
      galaga: parseInt(localStorage.getItem('arcade_hs_galaga') || '0', 10)
    };

    // Live highscore milestone tracker
    this.hasPassedHighScore = false;
    this.highScoreFlashTimer = 0;

    // Audio & Chiptune state
    this.soundEnabled = true;
    this.audioCtx = null;
    this.musicTimer = null;
    this.musicStep = 0;

    // Game states
    this.flappy = {
      y: 150,
      vy: 0,
      gravity: 0.38,
      jump: -6.4,
      pillars: [],
      timer: 0
    };

    this.galaga = {
      playerX: 260,
      playerY: 295,
      bullets: [],
      aliens: [],
      particles: [],
      timer: 0,
      keys: {}
    };

    this.initEvents();
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  initEvents() {
    // 1. Arcade Launcher Button
    if (this.openBtn) {
      this.openBtn.addEventListener('click', (e) => {
        if (e.target.id === 'arcadeMinimizeBtn' || e.target.classList.contains('arcade-minimize-btn')) return;
        this.initAudio();
        this.openModal();
      });
    }

    // 2. Dock Top-Right Hover Minimize
    if (this.minimizeBtn) {
      this.minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.minimizeDock();
      });
    }

    // 3. Minimized Corner Zone Hover Pill Click
    if (this.minimizedPill) {
      this.minimizedPill.addEventListener('click', () => {
        this.restoreDock();
      });
    }

    // 4. Retro PC Titlebar Close (Window closes ONLY on Cross [X] button!)
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeModal());
    }

    // 5. Sound / Chiptune Toggle
    if (this.sfxToggleBtn) {
      this.sfxToggleBtn.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        this.sfxToggleBtn.textContent = this.soundEnabled ? '🔊' : '🔇';
        if (!this.soundEnabled) {
          this.stopChiptuneMusic();
        } else if (this.isPlaying) {
          this.startChiptuneMusic();
        }
      });
    }

    // 6. Escape key closes window (Backdrop click does NOT close)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });

    // 7. Game switcher tabs (Flappy & Galaga)
    const tabs = document.querySelectorAll('.arcade-tab-btn');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const game = tab.getAttribute('data-game');
        this.setGame(game);
      });
    });

    // 8. Start Button Click with Insert Coin Slot Animation
    if (this.startActionBtn) {
      this.startActionBtn.addEventListener('click', () => {
        this.initAudio();
        this.insertCoinAndStart();
      });
    }

    // 9. Keyboard Controls (Full 2D movement for Galaga)
    window.addEventListener('keydown', (e) => {
      if (!this.modal || !this.modal.classList.contains('active')) return;

      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'KeyW', 'KeyS'].includes(e.code)) {
        e.preventDefault();
      }

      this.initAudio();

      if (!this.isPlaying) {
        if (e.code === 'Space' || e.code === 'Enter') this.insertCoinAndStart();
        return;
      }

      if (this.currentGame === 'flappy') {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
          this.flappy.vy = this.flappy.jump;
          this.playJump();
        }
      } else if (this.currentGame === 'galaga') {
        this.galaga.keys[e.code] = true;
        if (e.code === 'Space') {
          this.fireGalagaLaser();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (this.currentGame === 'galaga') {
        this.galaga.keys[e.code] = false;
      }
    });

    // 10. Canvas Click & Mouse Controls (2D navigation)
    this.canvas.addEventListener('mousedown', () => {
      this.initAudio();
      if (!this.isPlaying) {
        this.insertCoinAndStart();
      } else if (this.currentGame === 'flappy') {
        this.flappy.vy = this.flappy.jump;
        this.playJump();
      } else if (this.currentGame === 'galaga') {
        this.fireGalagaLaser();
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isPlaying && this.currentGame === 'galaga') {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const scaleY = this.height / rect.height;
        this.galaga.playerX = Math.max(20, Math.min(this.width - 20, (e.clientX - rect.left) * scaleX));
        this.galaga.playerY = Math.max(120, Math.min(this.height - 20, (e.clientY - rect.top) * scaleY));
      }
    });

    // Touch support for mobile (2D navigation)
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.initAudio();
      if (!this.isPlaying) {
        this.insertCoinAndStart();
      } else if (this.currentGame === 'flappy') {
        this.flappy.vy = this.flappy.jump;
        this.playJump();
      } else if (this.currentGame === 'galaga') {
        this.fireGalagaLaser();
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.isPlaying && this.currentGame === 'galaga' && e.touches[0]) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const scaleY = this.height / rect.height;
        this.galaga.playerX = Math.max(20, Math.min(this.width - 20, (e.touches[0].clientX - rect.left) * scaleX));
        this.galaga.playerY = Math.max(120, Math.min(this.height - 20, (e.touches[0].clientY - rect.top) * scaleY));
      }
    }, { passive: true });
  }

  insertCoinAndStart() {
    if (this.isPlaying) return;
    const coinWrap = document.getElementById('coinSlotWrap');
    if (coinWrap) {
      coinWrap.classList.add('inserting-coin');
    }
    this.playCoinChime();

    setTimeout(() => {
      if (coinWrap) coinWrap.classList.remove('inserting-coin');
      this.startGame();
    }, 420);
  }

  openModal() {
    if (this.modal) this.modal.classList.add('active');
    this.setGame(this.currentGame);
  }

  closeModal() {
    if (this.modal) this.modal.classList.remove('active');
    this.isPlaying = false;
    this.stopChiptuneMusic();
  }

  minimizeDock() {
    if (this.dockContainer) {
      this.dockContainer.style.opacity = '0';
      this.dockContainer.style.pointerEvents = 'none';
      setTimeout(() => {
        if (this.dockContainer) this.dockContainer.style.display = 'none';
      }, 350);
    }
    if (this.cornerZone) {
      this.cornerZone.classList.add('active-minimized');
    }
  }

  restoreDock() {
    if (this.cornerZone) {
      this.cornerZone.classList.remove('active-minimized');
    }
    if (this.dockContainer) {
      this.dockContainer.style.display = 'block';
      requestAnimationFrame(() => {
        this.dockContainer.style.opacity = '1';
        this.dockContainer.style.pointerEvents = 'auto';
      });
    }
  }

  setGame(game) {
    this.currentGame = game;
    this.isPlaying = false;
    this.score = 0;
    this.hasPassedHighScore = false;
    this.highScoreFlashTimer = 0;
    this.stopChiptuneMusic();
    this.updateScoreDisplay();

    if (this.startOverlay) {
      this.startOverlay.style.display = 'flex';
      if (game === 'flappy') {
        if (this.overlayTitle) this.overlayTitle.textContent = '🐤 FLAPPY AXOLOTL';
        if (this.overlaySubtitle) this.overlaySubtitle.textContent = 'Press SPACE or Click to flap, navigate neon data pillars, and stay alive!';
      } else if (game === 'galaga') {
        if (this.overlayTitle) this.overlayTitle.textContent = '🚀 GALAGA CYBER DEFENDER';
        if (this.overlaySubtitle) this.overlaySubtitle.textContent = 'Arrows / WASD / Mouse to steer in 2D (front & back), SPACE to fire lasers!';
      }
    }
  }

  startGame() {
    this.isPlaying = true;
    this.score = 0;
    this.hasPassedHighScore = false;
    this.highScoreFlashTimer = 0;
    this.updateScoreDisplay();
    if (this.startOverlay) this.startOverlay.style.display = 'none';

    if (this.currentGame === 'flappy') {
      this.flappy = {
        y: 150,
        vy: 0,
        gravity: 0.38,
        jump: -6.4,
        pillars: [],
        timer: 0
      };
    } else if (this.currentGame === 'galaga') {
      this.galaga = {
        playerX: 260,
        playerY: 295,
        bullets: [],
        aliens: [],
        particles: [],
        timer: 0,
        keys: {}
      };
    }

    this.startChiptuneMusic();
    this.loop();
  }

  updateScoreDisplay() {
    if (this.scoreDisplay) this.scoreDisplay.textContent = this.score;
    const hs = this.highScores[this.currentGame] || 0;
    if (this.highScoreDisplay) this.highScoreDisplay.textContent = hs;
  }

  gameOver() {
    this.isPlaying = false;
    this.stopChiptuneMusic();

    const previousHighScore = this.highScores[this.currentGame] || 0;
    const isNewHighScore = this.score > previousHighScore && this.score > 0;

    if (isNewHighScore) {
      this.highScores[this.currentGame] = this.score;
      localStorage.setItem(`arcade_hs_${this.currentGame}`, this.score.toString());
      this.updateScoreDisplay();
      this.playVictoryCelebration();
    } else {
      this.playGameOver();
    }

    if (this.startOverlay) {
      this.startOverlay.style.display = 'flex';
      if (this.overlayTitle) {
        this.overlayTitle.textContent = isNewHighScore ? '🏆 NEW HIGH SCORE! 🏆' : 'GAME OVER';
      }
      if (this.overlaySubtitle) {
        this.overlaySubtitle.textContent = isNewHighScore
          ? `Incredible! New Personal Best: ${this.score} pts! Press SPACE to Play Again`
          : `Score: ${this.score} • Best: ${this.highScores[this.currentGame]} • Press SPACE to Restart`;
      }
    }
  }

  // ===================================================================
  // 8-BIT RETRO SYNTH SOUND EFFECTS & MUSIC ENGINE (WEB AUDIO API)
  // ===================================================================
  playTone(freq, duration, type = 'square', gainLevel = 0.08) {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(gainLevel, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  }

  playCoinChime() {
    if (!this.soundEnabled || !this.audioCtx) return;
    // Dual metallic bell sound (B5: 987.77Hz -> E6: 1318.51Hz)
    this.playTone(987.77, 0.09, 'square', 0.12);
    setTimeout(() => {
      this.playTone(1318.51, 0.28, 'triangle', 0.14);
    }, 75);
  }

  playJump() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      const now = this.audioCtx.currentTime;
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  playLaser() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      const now = this.audioCtx.currentTime;
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.1);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  playExplosion() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'square';
      const now = this.audioCtx.currentTime;
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.22);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  playScorePoint() {
    this.playTone(587.33, 0.08, 'square', 0.08); // D5
    setTimeout(() => {
      this.playTone(880, 0.14, 'square', 0.1); // A5
    }, 70);
  }

  playHighScoreFanfare() {
    if (!this.soundEnabled || !this.audioCtx) return;
    // Celebratory ascending fanfare chime (C5, E5, G5, C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.14, 'square', 0.15);
      }, idx * 80);
    });
  }

  playVictoryCelebration() {
    if (!this.soundEnabled || !this.audioCtx) return;
    const celebration = [
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.12 },
      { f: 1046.5, d: 0.22 },
      { f: 880.00, d: 0.14 },
      { f: 1046.5, d: 0.35 }
    ];
    let time = 0;
    celebration.forEach((note) => {
      setTimeout(() => {
        this.playTone(note.f, note.d, 'triangle', 0.16);
      }, time * 1000);
      time += note.d * 0.9;
    });
  }

  playGameOver() {
    const notes = [440, 392, 349, 293];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.18, 'sawtooth', 0.12);
      }, idx * 110);
    });
  }

  startChiptuneMusic() {
    this.stopChiptuneMusic();
    if (!this.soundEnabled) return;

    this.musicStep = 0;

    // Flappy chiptune melody (Mario-style lively 8-bit scale)
    const flappyNotes = [
      523.25, 659.25, 783.99, 1046.50,
      659.25, 783.99, 1046.50, 1318.51,
      880.00, 783.99, 659.25, 587.33,
      659.25, 523.25, 392.00, 523.25
    ];

    // Galaga chiptune melody (Driving retro space bass arpeggio)
    const galagaNotes = [
      110, 220, 164.81, 329.63,
      130.81, 261.63, 196, 392,
      146.83, 293.66, 220, 440,
      123.47, 246.94, 185, 370
    ];

    this.musicTimer = setInterval(() => {
      if (!this.isPlaying || !this.soundEnabled) return;

      if (this.currentGame === 'flappy') {
        const freq = flappyNotes[this.musicStep % flappyNotes.length];
        this.playTone(freq, 0.1, 'square', 0.035);
        if (this.musicStep % 4 === 0) {
          this.playTone(freq / 2, 0.14, 'triangle', 0.06);
        }
      } else if (this.currentGame === 'galaga') {
        const freq = galagaNotes[this.musicStep % galagaNotes.length];
        this.playTone(freq, 0.09, 'sawtooth', 0.04);
        if (this.musicStep % 2 === 0) {
          this.playTone(freq * 1.5, 0.07, 'square', 0.025);
        }
      }

      this.musicStep++;
    }, 180);
  }

  stopChiptuneMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  // ===================================================================
  // MAIN GAME LOOP & RENDERING
  // ===================================================================
  loop() {
    if (!this.isPlaying) return;

    // Clear retro screen
    this.ctx.fillStyle = '#060914';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Subtle CRT background grid lines
    this.ctx.strokeStyle = 'rgba(0, 210, 255, 0.04)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 24) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    if (this.currentGame === 'flappy') {
      this.loopFlappy();
    } else if (this.currentGame === 'galaga') {
      this.loopGalaga();
    }

    // High Score Milestone Banner Flash
    if (this.highScoreFlashTimer > 0) {
      this.highScoreFlashTimer--;
      this.ctx.save();
      this.ctx.fillStyle = this.highScoreFlashTimer % 10 < 5 ? '#ffd166' : '#ff2a85';
      this.ctx.font = 'bold 15px "Courier New", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = '#ffd166';
      this.ctx.shadowBlur = 12;
      this.ctx.fillText('★ NEW HIGH SCORE! ★', this.width / 2, 35);
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.loop());
  }

  // 1. FLAPPY AXOLOTL GAME LOOP
  loopFlappy() {
    this.flappy.vy += this.flappy.gravity;
    this.flappy.y += this.flappy.vy;

    // Floor and Ceiling bounds
    if (this.flappy.y > this.height - 14 || this.flappy.y < 8) {
      this.gameOver();
      return;
    }

    // Spawn Neon Pillars
    this.flappy.timer++;
    if (this.flappy.timer % 92 === 0) {
      const gap = 115;
      const top = Math.random() * (this.height - gap - 60) + 30;
      this.flappy.pillars.push({
        x: this.width,
        top,
        bottom: top + gap,
        passed: false
      });
    }

    // Draw & update pillars
    for (let i = this.flappy.pillars.length - 1; i >= 0; i--) {
      const p = this.flappy.pillars[i];
      p.x -= 2.6;

      // Glow Pillar
      const grad = this.ctx.createLinearGradient(p.x, 0, p.x + 36, 0);
      grad.addColorStop(0, '#00d2ff');
      grad.addColorStop(1, '#ff2a85');
      this.ctx.fillStyle = grad;

      // Top pipe
      this.ctx.fillRect(p.x, 0, 36, p.top);
      this.ctx.fillRect(p.x - 3, p.top - 8, 42, 8);

      // Bottom pipe
      this.ctx.fillRect(p.x, p.bottom, 36, this.height - p.bottom);
      this.ctx.fillRect(p.x - 3, p.bottom, 42, 8);

      // Axolotl collision box
      const axoX = 85;
      const axoY = this.flappy.y;
      if (
        axoX + 14 > p.x && axoX - 14 < p.x + 36 &&
        (axoY - 12 < p.top || axoY + 12 > p.bottom)
      ) {
        this.gameOver();
        return;
      }

      // Point scoring
      if (!p.passed && p.x + 36 < axoX) {
        p.passed = true;
        this.score++;
        this.updateScoreDisplay();

        // Check live highscore exceed
        const hs = this.highScores[this.currentGame] || 0;
        if (!this.hasPassedHighScore && hs > 0 && this.score > hs) {
          this.hasPassedHighScore = true;
          this.playHighScoreFanfare();
          this.highScoreFlashTimer = 90;
        } else {
          this.playScorePoint();
        }
      }

      // Remove off-screen
      if (p.x < -45) {
        this.flappy.pillars.splice(i, 1);
      }
    }

    // Draw Cute Pixel Axolotl
    this.drawFlappyAxolotl(85, this.flappy.y, this.flappy.vy);
  }

  drawFlappyAxolotl(x, y, vy) {
    this.ctx.save();
    this.ctx.translate(x, y);

    // Dynamic tilt based on velocity
    const angle = Math.max(-0.4, Math.min(0.6, vy * 0.08));
    this.ctx.rotate(angle);

    // Gills
    this.ctx.fillStyle = '#ff2a85';
    this.ctx.beginPath();
    this.ctx.arc(-10, -8, 4, 0, Math.PI * 2);
    this.ctx.arc(-12, 0, 4.5, 0, Math.PI * 2);
    this.ctx.arc(-10, 8, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Chubby Head Body
    this.ctx.fillStyle = '#ff85a2';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Belly
    this.ctx.fillStyle = '#ffccd5';
    this.ctx.beginPath();
    this.ctx.ellipse(2, 3, 10, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Cute Eye
    this.ctx.fillStyle = '#111422';
    this.ctx.beginPath();
    this.ctx.arc(6, -3, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Eye sparkle
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(7, -4, 1.2, 0, Math.PI * 2);
    this.ctx.fill();

    // Rosy Blush
    this.ctx.fillStyle = 'rgba(255, 42, 133, 0.6)';
    this.ctx.beginPath();
    this.ctx.arc(4, 3, 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  // 2. GALAGA CYBER DEFENDER GAME LOOP (WITH 2D FRONT/BACK/LEFT/RIGHT NAVIGATION)
  fireGalagaLaser() {
    const py = this.galaga.playerY || 295;
    this.galaga.bullets.push({
      x: this.galaga.playerX,
      y: py - 14,
      vy: -7.5
    });
    this.playLaser();
  }

  loopGalaga() {
    // Keyboard steer 2D (Left/Right & Front/Back)
    if (this.galaga.keys['ArrowLeft'] || this.galaga.keys['KeyA']) {
      this.galaga.playerX = Math.max(20, this.galaga.playerX - 6);
    }
    if (this.galaga.keys['ArrowRight'] || this.galaga.keys['KeyD']) {
      this.galaga.playerX = Math.min(this.width - 20, this.galaga.playerX + 6);
    }
    if (this.galaga.keys['ArrowUp'] || this.galaga.keys['KeyW']) {
      this.galaga.playerY = Math.max(120, this.galaga.playerY - 5);
    }
    if (this.galaga.keys['ArrowDown'] || this.galaga.keys['KeyS']) {
      this.galaga.playerY = Math.min(this.height - 20, this.galaga.playerY + 5);
    }

    // Spawn Alien Invaders
    this.galaga.timer++;
    if (this.galaga.timer % 45 === 0) {
      const x = Math.random() * (this.width - 60) + 30;
      const speed = Math.random() * 1.5 + 1.2;
      this.galaga.aliens.push({
        x,
        y: -20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: speed,
        hp: 1,
        color: Math.random() > 0.5 ? '#00d2ff' : '#ff2a85'
      });
    }

    // Update & draw bullets
    for (let i = this.galaga.bullets.length - 1; i >= 0; i--) {
      const b = this.galaga.bullets[i];
      b.y += b.vy;

      this.ctx.fillStyle = '#00d2ff';
      this.ctx.shadowColor = '#00d2ff';
      this.ctx.shadowBlur = 8;
      this.ctx.fillRect(b.x - 2, b.y, 4, 10);
      this.ctx.shadowBlur = 0;

      if (b.y < -15) {
        this.galaga.bullets.splice(i, 1);
      }
    }

    const px = this.galaga.playerX;
    const py = this.galaga.playerY || 295;

    // Update & draw aliens
    for (let i = this.galaga.aliens.length - 1; i >= 0; i--) {
      const a = this.galaga.aliens[i];
      a.x += a.vx;
      a.y += a.vy;

      // Alien bounce wall
      if (a.x < 15 || a.x > this.width - 15) a.vx *= -1;

      // Draw Alien Craft
      this.ctx.fillStyle = a.color;
      this.ctx.beginPath();
      this.ctx.moveTo(a.x, a.y + 12);
      this.ctx.lineTo(a.x - 12, a.y - 6);
      this.ctx.lineTo(a.x + 12, a.y - 6);
      this.ctx.closePath();
      this.ctx.fill();

      // Alien Eye
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(a.x - 3, a.y - 2, 6, 3);

      // Check collision with player in 2D
      if (Math.hypot(a.x - px, a.y - py) < 20) {
        this.gameOver();
        return;
      }

      // Check bullet hits
      for (let j = this.galaga.bullets.length - 1; j >= 0; j--) {
        const b = this.galaga.bullets[j];
        if (Math.hypot(a.x - b.x, a.y - b.y) < 18) {
          // Explosion particles
          for (let p = 0; p < 8; p++) {
            this.galaga.particles.push({
              x: a.x,
              y: a.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 1,
              color: a.color
            });
          }

          this.playExplosion();
          this.galaga.aliens.splice(i, 1);
          this.galaga.bullets.splice(j, 1);
          this.score += 10;
          this.updateScoreDisplay();

          // Check live highscore exceed
          const hs = this.highScores[this.currentGame] || 0;
          if (!this.hasPassedHighScore && hs > 0 && this.score > hs) {
            this.hasPassedHighScore = true;
            this.playHighScoreFanfare();
            this.highScoreFlashTimer = 90;
          }
          break;
        }
      }

      // Offscreen alien
      if (a.y > this.height + 25) {
        this.galaga.aliens.splice(i, 1);
      }
    }

    // Update & draw particles
    for (let i = this.galaga.particles.length - 1; i >= 0; i--) {
      const p = this.galaga.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;

      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fillRect(p.x, p.y, 3, 3);
      this.ctx.globalAlpha = 1;

      if (p.life <= 0) {
        this.galaga.particles.splice(i, 1);
      }
    }

    // Draw Player Ship at 2D (px, py)
    // Ship Thruster Flame
    this.ctx.fillStyle = '#ff2a85';
    this.ctx.beginPath();
    this.ctx.moveTo(px - 5, py + 8);
    this.ctx.lineTo(px + 5, py + 8);
    this.ctx.lineTo(px, py + 14 + Math.random() * 5);
    this.ctx.closePath();
    this.ctx.fill();

    // Ship Body
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.moveTo(px, py - 14);
    this.ctx.lineTo(px - 14, py + 8);
    this.ctx.lineTo(px + 14, py + 8);
    this.ctx.closePath();
    this.ctx.fill();

    // Wings Accent
    this.ctx.fillStyle = '#ff2a85';
    this.ctx.fillRect(px - 12, py + 4, 3, 4);
    this.ctx.fillRect(px + 9, py + 4, 3, 4);

    // Cockpit
    this.ctx.fillStyle = '#00d2ff';
    this.ctx.fillRect(px - 3, py - 4, 6, 7);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MultiRetroArcade();
});
