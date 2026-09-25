export const STANDALONE_HTML_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BraillePad - Braille Typing Tutor for Children</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #131c2e;
      --card-border: #1e2e4a;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --dot-empty: #1e293b;
      --dot-empty-border: #334155;
      --dot-active-bg: #f59e0b;
      --dot-active-glow: rgba(245, 158, 11, 0.55);
      --accent: #38bdf8;
      --success: #10b981;
      --warning: #f59e0b;
      --error: #f43f5e;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      height: 100vh;
      max-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 0.75rem 1.25rem;
      overflow: hidden;
    }

    /* Top Bar */
    header {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.6rem 1.2rem;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1rem;
    }

    .brand {
      font-size: 1.15rem;
      font-weight: 800;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .brand-icon {
      width: 26px;
      height: 26px;
      flex-shrink: 0;
    }

    .brand span {
      color: var(--accent);
    }

    .stats-badges {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.85rem;
      font-weight: 700;
    }

    .stat-pill {
      background: #090e1a;
      padding: 0.3rem 0.7rem;
      border-radius: 0.6rem;
      border: 1px solid var(--card-border);
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    /* Progress bar */
    .progress-bar-container {
      width: 100%;
      max-width: 1200px;
      margin: 0.4rem auto 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .progress-track {
      width: 100%;
      height: 8px;
      background: #1e293b;
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      width: 20%;
      background: linear-gradient(90deg, #10b981, #38bdf8);
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    /* Main Grid */
    main {
      width: 100%;
      max-width: 1200px;
      margin: 0.4rem auto;
      flex: 1;
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 1.25rem;
      align-items: stretch;
      min-height: 0;
    }

    /* Braille Cell Stage */
    .braille-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1.25rem;
      padding: 1rem 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
    }

    .braille-cell {
      display: grid;
      grid-template-columns: repeat(2, 72px);
      grid-template-rows: repeat(3, 72px);
      gap: 1rem 2rem;
      padding: 1rem 1.5rem;
      background: #090e1a;
      border-radius: 1.25rem;
      border: 1px solid var(--card-border);
    }

    .dot {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--dot-empty);
      border: 3px solid var(--dot-empty-border);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      font-weight: 800;
      color: #64748b;
      transition: all 0.2s ease;
    }

    .dot.active {
      background: radial-gradient(circle at 35% 35%, #fef08a 0%, var(--dot-active-bg) 65%, #b45309 100%);
      border-color: #fde047;
      color: #451a03;
      box-shadow: 0 0 25px var(--dot-active-glow);
      transform: scale(1.05);
    }

    .dot-finger {
      font-size: 0.55rem;
      font-weight: 700;
      text-transform: uppercase;
      opacity: 0.8;
      margin-top: 2px;
    }

    /* Perkins Guide Strip */
    .perkins-strip {
      width: 100%;
      background: #090e1a;
      border: 1px solid var(--card-border);
      border-radius: 0.75rem;
      padding: 0.5rem;
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.35rem;
      text-align: center;
    }

    .perkins-key {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 0.4rem;
      padding: 0.3rem 0.1rem;
      font-size: 0.65rem;
      color: #94a3b8;
    }

    .perkins-key.active {
      background: var(--warning);
      color: #000;
      font-weight: 800;
      border-color: #fde047;
    }

    /* Info Column */
    .info-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1.25rem;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .target-box {
      background: #090e1a;
      border: 1px solid var(--card-border);
      border-radius: 1rem;
      padding: 1rem;
      text-align: center;
    }

    .target-letter {
      font-size: 4rem;
      font-weight: 900;
      line-height: 1;
      color: #fff;
    }

    .target-word {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--accent);
      margin-top: 0.25rem;
    }

    .target-hint {
      font-size: 0.8rem;
      color: #cbd5e1;
      margin-top: 0.25rem;
    }

    .feedback-banner {
      min-height: 3.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 0.6rem;
      border-radius: 0.75rem;
      font-size: 0.95rem;
      font-weight: 700;
      background: #0f172a;
      border: 1px solid var(--card-border);
    }

    .feedback-banner.success {
      background: rgba(16, 185, 129, 0.2);
      border-color: var(--success);
      color: #6ee7b7;
    }

    .feedback-banner.wrong {
      background: rgba(244, 63, 94, 0.2);
      border-color: var(--error);
      color: #fda4af;
    }

    .btn-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .action-btn {
      padding: 0.6rem;
      border-radius: 0.6rem;
      font-size: 0.85rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: opacity 0.2s ease;
    }

    .action-btn.primary {
      background: var(--warning);
      color: #000;
    }

    .action-btn.secondary {
      background: #1e293b;
      color: #f1f5f9;
      border: 1px solid #334155;
    }

    .shortcut-legend {
      font-size: 0.75rem;
      color: var(--text-muted);
      line-height: 1.4;
      border-top: 1px solid var(--card-border);
      padding-top: 0.5rem;
    }

    /* Start Overlay */
    #start-overlay {
      position: fixed;
      inset: 0;
      background: rgba(4, 7, 15, 0.95);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 1.5rem;
      text-align: center;
    }

    .start-dialog {
      background: var(--card-bg);
      border: 2px solid var(--warning);
      padding: 2rem;
      border-radius: 1.5rem;
      max-width: 480px;
    }

    .start-dialog h1 {
      font-size: 2rem;
      margin-bottom: 0.75rem;
    }

    .start-dialog p {
      color: var(--text-muted);
      font-size: 1rem;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    .start-btn {
      background: var(--warning);
      color: #04101e;
      font-size: 1.1rem;
      font-weight: 800;
      padding: 0.85rem 2rem;
      border: none;
      border-radius: 0.75rem;
      cursor: pointer;
      width: 100%;
    }
  </style>
</head>
<body>

  <div id="start-overlay">
    <div class="start-dialog">
      <h1>BraillePad</h1>
      <p>Audio-First Braille Tutor for Children. Compatible with ESP32 Bluetooth Braille keyboards and standard keyboards. Click or press any key to start with audio speech.</p>
      <button class="start-btn" id="start-btn" autofocus>Start BraillePad Session</button>
    </div>
  </div>

  <header>
    <div class="brand">
      <svg class="brand-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="36" height="36" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
        <rect x="5" y="5" width="30" height="30" rx="7" fill="#060913" stroke="#1e293b" stroke-width="1"/>
        <circle cx="15" cy="13" r="3.2" fill="#f59e0b"/>
        <circle cx="15" cy="20" r="3.2" fill="#f59e0b"/>
        <circle cx="15" cy="27" r="2.8" fill="#1e293b" stroke="#334155"/>
        <circle cx="25" cy="13" r="2.8" fill="#1e293b" stroke="#334155"/>
        <circle cx="25" cy="20" r="2.8" fill="#1e293b" stroke="#334155"/>
        <circle cx="25" cy="27" r="2.8" fill="#1e293b" stroke="#334155"/>
      </svg>
      <div>Braille<span>Pad</span></div>
    </div>
    <div class="stats-badges">
      <div class="stat-pill" title="Streak">🔥 <span id="streak-val">0</span></div>
      <div class="stat-pill" title="XP">💎 <span id="xp-val">0</span> XP</div>
      <div class="stat-pill" title="Level">⭐ Level <span id="level-val">1</span></div>
    </div>
  </header>

  <div class="progress-bar-container">
    <div class="progress-header">
      <span id="level-title-display">Level 1: Top Row Triad (A, B, C)</span>
      <span id="step-counter-display">Step 1 of 5</span>
    </div>
    <div class="progress-track">
      <div class="progress-fill" id="progress-fill"></div>
    </div>
  </div>

  <main>
    <div class="braille-card">
      <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">
        Parent Visual Dashboard: 6-Dot Cell
      </div>
      <div class="braille-cell">
        <div class="dot" id="dot-1" style="grid-column: 1; grid-row: 1;">1<span class="dot-finger">L.Idx</span></div>
        <div class="dot" id="dot-2" style="grid-column: 1; grid-row: 2;">2<span class="dot-finger">L.Mid</span></div>
        <div class="dot" id="dot-3" style="grid-column: 1; grid-row: 3;">3<span class="dot-finger">L.Rng</span></div>
        <div class="dot" id="dot-4" style="grid-column: 2; grid-row: 1;">4<span class="dot-finger">R.Idx</span></div>
        <div class="dot" id="dot-5" style="grid-column: 2; grid-row: 2;">5<span class="dot-finger">R.Mid</span></div>
        <div class="dot" id="dot-6" style="grid-column: 2; grid-row: 3;">6<span class="dot-finger">R.Rng</span></div>
      </div>
      <div class="perkins-strip">
        <div class="perkins-key" id="pk-3">Dot 3<br>Ring</div>
        <div class="perkins-key" id="pk-2">Dot 2<br>Mid</div>
        <div class="perkins-key" id="pk-1">Dot 1<br>Idx</div>
        <div class="perkins-key" id="pk-0">Space<br>Thumb</div>
        <div class="perkins-key" id="pk-4">Dot 4<br>Idx</div>
        <div class="perkins-key" id="pk-5">Dot 5<br>Mid</div>
        <div class="perkins-key" id="pk-6">Dot 6<br>Ring</div>
      </div>
    </div>

    <div class="info-card">
      <div class="target-box">
        <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">Current Target</div>
        <div class="target-letter" id="letter-display">-</div>
        <div class="target-word" id="word-display">Ready</div>
        <div class="target-hint" id="dots-summary">Waiting for input...</div>
      </div>

      <div class="feedback-banner" id="feedback-banner">
        Press any Braille key on your ESP32 keyboard to start!
      </div>

      <div class="btn-row">
        <button class="action-btn secondary" id="btn-repeat">🔊 Repeat Voice</button>
        <button class="action-btn primary" id="btn-next">Next Step ➔</button>
      </div>

      <div class="shortcut-legend">
        <strong>Shortcuts:</strong> <kbd class="kbd">Space</kbd> = Toggle/Advance · <kbd class="kbd">Backspace</kbd> = Repeat voice · <kbd class="kbd">A-Z</kbd> = Braille Keystrokes
      </div>
    </div>
  </main>

  <script>
    const BRAILLE_MAP = {
      a: { dots: [1], word: 'Apple', example: 'Apple, the smooth round fruit that gives a sweet, crunchy bite', buttons: 'Press Dot 1 using your left index finger.' },
      b: { dots: [1, 2], word: 'Bell', example: 'Bell, the cool metal chime that rings with a cheerful ding when shaken', buttons: 'Press Dot 1 with your left index finger, and Dot 2 with your left middle finger.' },
      c: { dots: [1, 4], word: 'Cat', example: 'Cat, the soft furry pet that curls in your lap and purrs warmly when stroked', buttons: 'Press Dot 1 with your left index finger, and Dot 4 with your right index finger at the same time.' },
      d: { dots: [1, 4, 5], word: 'Drum', example: 'Drum, the round instrument that makes a deep boom boom sound when tapped', buttons: 'Press Dot 1 with your left index finger, plus Dots 4 and 5 with your right index and middle fingers.' },
      e: { dots: [1, 5], word: 'Elephant', example: 'Elephant, the giant gentle animal with big floppy ears and a loud trumpet call', buttons: 'Press Dot 1 with your left index finger, and Dot 5 with your right middle finger.' },
      f: { dots: [1, 2, 4], word: 'Feather', example: 'Feather, the light silky soft plume that tickles gently when brushed on your cheek', buttons: 'Press Dots 1 and 2 on your left hand, and Dot 4 on your right hand.' },
      g: { dots: [1, 2, 4, 5], word: 'Guitar', example: 'Guitar, the musical instrument with tight strings that hum and vibrate under your fingers', buttons: 'Press all four top dots: Dots 1 and 2 on your left hand, and Dots 4 and 5 on your right hand.' },
      h: { dots: [1, 2, 5], word: 'Honey', example: 'Honey, the warm, thick, sticky sweet treat made by humming bees', buttons: 'Press Dots 1 and 2 on your left hand, and Dot 5 with your right middle finger.' },
      i: { dots: [2, 4], word: 'Ice', example: 'Ice, the slippery and freezing cold cube that melts into cool water in your palm', buttons: 'Press Dot 2 with your left middle finger, and Dot 4 with your right index finger.' },
      j: { dots: [2, 4, 5], word: 'Jingle', example: 'Jingle, the merry tiny bells that ring and tinkle together', buttons: 'Press Dot 2 with your left middle finger, and Dots 4 and 5 on your right hand.' }
    };

    const LEVELS = [
      { id: 1, title: 'Top Row Triad (A, B, C)', letters: ['a', 'b', 'c'], totalSteps: 5 },
      { id: 2, title: 'Right Hand Reach (D, E)', letters: ['a', 'b', 'c', 'd', 'e'], totalSteps: 5 },
      { id: 3, title: 'Decade One Finale (A - J)', letters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'], totalSteps: 6 }
    ];

    let currentLevelIdx = 0;
    let currentStep = 1;
    let targetLetter = 'a';
    let streak = 0;
    let xp = 0;
    let audioUnlocked = false;
    let audioCtx = null;

    const dotElements = {
      1: document.getElementById('dot-1'),
      2: document.getElementById('dot-2'),
      3: document.getElementById('dot-3'),
      4: document.getElementById('dot-4'),
      5: document.getElementById('dot-5'),
      6: document.getElementById('dot-6')
    };
    const pkElements = {
      1: document.getElementById('pk-1'),
      2: document.getElementById('pk-2'),
      3: document.getElementById('pk-3'),
      4: document.getElementById('pk-4'),
      5: document.getElementById('pk-5'),
      6: document.getElementById('pk-6'),
      0: document.getElementById('pk-0')
    };

    function getAudioContext() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    }

    function playBeep(freq, type, dur, gainVal) {
      try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + dur);
      } catch (e) {}
    }

    function speak(text, onEnd) {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.75;
      u.pitch = 1.08;
      if (onEnd) u.onend = onEnd;
      window.speechSynthesis.speak(u);
    }

    function updateVisuals(dots) {
      for (let i = 1; i <= 6; i++) {
        const isActive = dots.includes(i);
        dotElements[i].classList.toggle('active', isActive);
        if (pkElements[i]) pkElements[i].classList.toggle('active', isActive);
      }
    }

    function loadTarget() {
      const lvl = LEVELS[currentLevelIdx];
      const letters = lvl.letters;
      targetLetter = letters[Math.floor(Math.random() * letters.length)];
      const info = BRAILLE_MAP[targetLetter] || { dots: [1], word: 'Letter', example: '', buttons: '' };

      document.getElementById('letter-display').textContent = targetLetter.toUpperCase();
      document.getElementById('word-display').textContent = info.word;
      document.getElementById('dots-summary').textContent = info.buttons;
      document.getElementById('step-counter-display').textContent = 'Step ' + currentStep + ' of ' + lvl.totalSteps;
      document.getElementById('progress-fill').style.width = ((currentStep / lvl.totalSteps) * 100) + '%';
      document.getElementById('level-title-display').textContent = 'Level ' + lvl.id + ': ' + lvl.title;

      updateVisuals(info.dots);
      speak('Type the letter ' + targetLetter.toUpperCase() + ', as in ' + info.example + '. ' + info.buttons);
    }

    function startApp() {
      if (audioUnlocked) return;
      audioUnlocked = true;
      getAudioContext();
      document.getElementById('start-overlay').style.display = 'none';
      speak('Welcome to BraillePad! Level 1 is ready. Type the letter ' + targetLetter.toUpperCase());
      loadTarget();
    }

    document.getElementById('start-btn').addEventListener('click', startApp);
    document.getElementById('btn-repeat').addEventListener('click', () => {
      speak('Type the letter ' + targetLetter.toUpperCase());
    });
    document.getElementById('btn-next').addEventListener('click', () => {
      loadTarget();
    });

    window.addEventListener('keydown', (e) => {
      if (!audioUnlocked) {
        startApp();
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        loadTarget();
        return;
      }
      if (e.code === 'Backspace') {
        e.preventDefault();
        speak('Type the letter ' + targetLetter.toUpperCase());
        return;
      }

      const key = e.key.toLowerCase();
      if (/^[a-z]$/.test(key)) {
        e.preventDefault();
        const banner = document.getElementById('feedback-banner');
        if (key === targetLetter) {
          streak++;
          xp += 10;
          document.getElementById('streak-val').textContent = streak;
          document.getElementById('xp-val').textContent = xp;
          banner.className = 'feedback-banner success';
          banner.textContent = 'Awesome! Correct: ' + key.toUpperCase();
          playBeep(523, 'triangle', 0.2, 0.2);

          currentStep++;
          const lvl = LEVELS[currentLevelIdx];
          if (currentStep > lvl.totalSteps) {
            currentStep = 1;
            if (currentLevelIdx < LEVELS.length - 1) currentLevelIdx++;
            speak('Awesome! Level completed! Moving to the next level.', () => {
              setTimeout(loadTarget, 500);
            });
          } else {
            speak('Awesome!', () => {
              setTimeout(loadTarget, 400);
            });
          }
        } else {
          streak = 0;
          document.getElementById('streak-val').textContent = 0;
          banner.className = 'feedback-banner wrong';
          banner.textContent = 'Oops, you typed ' + key.toUpperCase() + '. Try again!';
          playBeep(220, 'sine', 0.25, 0.2);
          const targetInfo = BRAILLE_MAP[targetLetter] || { buttons: '' };
          speak('Oops, you typed ' + key.toUpperCase() + '. Let us try again for ' + targetLetter.toUpperCase() + '. ' + targetInfo.buttons);
        }
      }
    });
  </script>
</body>
</html>`;
