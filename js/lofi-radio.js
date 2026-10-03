/* ===================================================================
   24/7 REAL INTERNET RADIO ENGINE (CONTINUOUS STREAMING MUSIC)
   - Real 24/7 Internet Radio Streams (Chillhop, Vaporwave, Sunset Ambient)
   - Top-right hover minimize & corner hover zone reveal
   - Dynamic canvas equalizer visualizer
   - Volume control & mute toggle
   =================================================================== */

class LiveInternetRadio {
  constructor() {
    this.stations = [
      {
        name: "I Love Chillhop",
        genre: "24/7 Lo-Fi & Beats",
        url: "https://streams.ilovemusic.de/iloveradio17.mp3"
      },
      {
        name: "Nightwave Plaza",
        genre: "Vaporwave & Chill",
        url: "https://radio.plaza.one/mp3"
      },
      {
        name: "Sunset Lounge",
        genre: "Deep Ambient & Sun",
        url: "https://streams.ilovemusic.de/iloveradio16.mp3"
      },
      {
        name: "Lofi Beats Cafe",
        genre: "Study & Relax Stream",
        url: "https://stream.zeno.fm/f3wvbbqmdg8uv"
      }
    ];

    this.currentStationIndex = 0;
    this.isPlaying = false;
    this.isMuted = false;
    this.volume = 0.35;

    // Audio Element
    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous";
    this.audio.preload = "none";

    // Visualizer state
    this.visualizerBars = [12, 18, 8, 22, 15, 6, 20];
    this.animId = null;

    this.initUI();
    this.initEvents();
  }

  initUI() {
    this.dock = document.getElementById('lofiRadioDock');
    this.minimizeBtn = document.getElementById('lofiMinimizeBtn');
    this.minimizedPill = document.getElementById('lofiMinimizedPill');
    this.cornerZone = document.getElementById('lofiCornerZone');

    this.playBtn = document.getElementById('lofiPlayBtn');
    this.playIcon = document.getElementById('lofiPlayIcon');
    this.prevBtn = document.getElementById('lofiPrevBtn');
    this.nextBtn = document.getElementById('lofiNextBtn');
    this.muteBtn = document.getElementById('lofiMuteBtn');
    this.volumeSlider = document.getElementById('lofiVolumeSlider');
    this.stationName = document.getElementById('lofiStationName');
    this.stationGenre = document.getElementById('lofiStationGenre');
    this.canvas = document.getElementById('lofiVisualizer');

    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.updateStationInfo();
    this.drawVisualizer();
  }

  initEvents() {
    // Play / Pause
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.togglePlay());
    }

    // Prev / Next
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.changeStation(-1));
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.changeStation(1));
    }

    // Volume & Mute
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        this.setVolume(parseFloat(e.target.value));
      });
    }

    if (this.muteBtn) {
      this.muteBtn.addEventListener('click', () => this.toggleMute());
    }

    // Minimize & Corner Restore
    if (this.minimizeBtn) {
      this.minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.minimize();
      });
    }

    if (this.minimizedPill) {
      this.minimizedPill.addEventListener('click', () => {
        this.restore();
      });
    }

    // Audio error handling & auto-recovery
    this.audio.addEventListener('error', () => {
      console.warn('Radio stream encountered error, switching to next station...');
      if (this.isPlaying) {
        this.changeStation(1);
      }
    });

    this.audio.addEventListener('playing', () => {
      this.isPlaying = true;
      if (this.playIcon) this.playIcon.textContent = '⏸';
      this.startVisualizer();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      if (this.playIcon) this.playIcon.textContent = '▶';
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
      this.drawVisualizer();
    });
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    const station = this.stations[this.currentStationIndex];
    if (this.audio.src !== station.url) {
      this.audio.src = station.url;
    }

    this.audio.volume = this.isMuted ? 0 : this.volume;
    this.audio.play()
      .then(() => {
        this.isPlaying = true;
        if (this.playIcon) this.playIcon.textContent = '⏸';
        this.startVisualizer();
      })
      .catch((err) => {
        console.warn('Audio playback error, trying next station:', err);
        this.changeStation(1);
      });
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    if (this.playIcon) this.playIcon.textContent = '▶';
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.drawVisualizer();
  }

  changeStation(direction) {
    this.currentStationIndex = (this.currentStationIndex + direction + this.stations.length) % this.stations.length;
    this.updateStationInfo();

    if (this.isPlaying) {
      const station = this.stations[this.currentStationIndex];
      this.audio.src = station.url;
      this.audio.volume = this.isMuted ? 0 : this.volume;
      this.audio.play().catch(() => {});
    }
  }

  updateStationInfo() {
    const station = this.stations[this.currentStationIndex];
    if (this.stationName) this.stationName.textContent = station.name;
    if (this.stationGenre) this.stationGenre.textContent = station.genre;
  }

  setVolume(val) {
    this.volume = val;
    if (!this.isMuted) {
      this.audio.volume = val;
    }

    // Dynamic color shift on volume slider based on level
    let col = '#00d2ff'; // Cyan for soft volume
    if (val > 0.65) {
      col = '#ff2a85'; // Pink for high volume
    } else if (val > 0.3) {
      col = '#9d4edd'; // Purple for mid volume
    }

    if (this.volumeSlider) {
      this.volumeSlider.style.accentColor = col;
      this.volumeSlider.style.setProperty('--vol-accent-color', col);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;
    this.audio.volume = this.isMuted ? 0 : this.volume;
    if (this.muteBtn) {
      this.muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
    }
  }

  minimize() {
    if (this.dock) {
      this.dock.style.opacity = '0';
      this.dock.style.pointerEvents = 'none';
      setTimeout(() => {
        if (this.dock) this.dock.style.display = 'none';
      }, 350);
    }
    if (this.cornerZone) {
      this.cornerZone.classList.add('active-minimized');
    }
  }

  restore() {
    if (this.cornerZone) {
      this.cornerZone.classList.remove('active-minimized');
    }
    if (this.dock) {
      this.dock.style.display = 'flex';
      requestAnimationFrame(() => {
        this.dock.style.opacity = '1';
        this.dock.style.pointerEvents = 'auto';
      });
    }
  }

  initAudioAnalyser() {
    if (this.analyser) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const source = this.audioCtx.createMediaElementSource(this.audio);
      source.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    } catch (e) {
      // Cross-origin audio or browser policy fallback
      this.analyser = null;
    }
  }

  startVisualizer() {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.initAudioAnalyser();

    const startTime = performance.now();

    const updateBars = () => {
      if (!this.ctx || !this.canvas) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const numBars = 6;
      const barWidth = 4;
      const gap = 3;
      const maxH = this.canvas.height;

      let hasRealData = false;
      if (this.analyser && this.isPlaying && !this.isMuted) {
        try {
          this.analyser.getByteFrequencyData(this.dataArray);
          // Check if stream returned real non-zero values
          const sum = this.dataArray.reduce((acc, v) => acc + v, 0);
          if (sum > 10) {
            hasRealData = true;
          }
        } catch (e) {}
      }

      const now = (performance.now() - startTime) / 1000;
      // Lo-Fi Tempo ~84 BPM (0.714s per beat)
      const beatPeriod = 0.714;
      const beatPhase = (now % beatPeriod) / beatPeriod; // 0 to 1 within each beat
      const measure = Math.floor(now / beatPeriod);
      const isKickBeat = (measure % 4 === 0 || measure % 4 === 2);
      const isSnareBeat = (measure % 4 === 1 || measure % 4 === 3);

      for (let i = 0; i < numBars; i++) {
        let targetHeight = 3;

        if (this.isPlaying && !this.isMuted) {
          if (hasRealData) {
            // Real frequency data mapped to 6 bands
            const binIdx = Math.floor((i / numBars) * (this.dataArray.length * 0.5));
            const binVal = this.dataArray[binIdx] / 255;
            targetHeight = Math.max(3, binVal * (maxH - 3) * (this.volume / 0.5));
          } else {
            // Rhythmic Beat & Loudness Engine
            // Bass Kick on beats 1 & 3:
            const kickEnv = isKickBeat ? Math.max(0, 1 - beatPhase * 3.5) : 0;
            // Snare / Rimshot on beats 2 & 4:
            const snareEnv = isSnareBeat ? Math.max(0, 1 - beatPhase * 4.0) : 0;
            // Hi-hat groove on 8th notes:
            const hatPhase = ((now * 2) % beatPeriod) / beatPeriod;
            const hatEnv = Math.max(0, 1 - hatPhase * 5.0) * 0.45;
            // Melodic wave breathing:
            const melodySway = Math.sin(now * 3 + i * 0.8) * 0.25 + 0.35;

            let intensity = 0;
            if (i <= 1) {
              // Sub-bass & Bass: heavy kick pulse
              intensity = kickEnv * 0.9 + melodySway * 0.35;
            } else if (i === 2 || i === 3) {
              // Mid-range & Snare body:
              intensity = snareEnv * 0.85 + melodySway * 0.4;
            } else {
              // Treble & Hi-hats:
              intensity = hatEnv * 0.75 + melodySway * 0.3;
            }

            // Scale with actual loudness volume
            const volFactor = Math.min(1.2, Math.max(0.25, this.volume / 0.4));
            targetHeight = Math.max(3, Math.min(maxH, intensity * maxH * volFactor));
          }
        }

        // Smooth physical bounce physics (attack 0.45, decay 0.22)
        const smoothing = targetHeight > this.visualizerBars[i] ? 0.45 : 0.22;
        this.visualizerBars[i] += (targetHeight - this.visualizerBars[i]) * smoothing;
        const h = Math.max(3, Math.min(maxH, this.visualizerBars[i]));

        const x = i * (barWidth + gap) + 4;
        const y = maxH - h;

        const grad = this.ctx.createLinearGradient(0, y, 0, maxH);
        grad.addColorStop(0, '#ff2a85');
        grad.addColorStop(0.5, '#9d4edd');
        grad.addColorStop(1, '#00d2ff');

        this.ctx.fillStyle = grad;
        this.ctx.fillRect(x, y, barWidth, h);
      }

      this.animId = requestAnimationFrame(updateBars);
    };

    updateBars();
  }

  drawVisualizer() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const numBars = 6;
    const barWidth = 4;
    const gap = 3;

    for (let i = 0; i < numBars; i++) {
      const x = i * (barWidth + gap) + 4;
      const y = this.canvas.height - 4;
      this.ctx.fillStyle = 'rgba(0, 210, 255, 0.4)';
      this.ctx.fillRect(x, y, barWidth, 4);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new LiveInternetRadio();
});
