
// Web Audio API context wrapper
// Optimized for mobile performance (preventing memory leaks)

let audioCtx: AudioContext | null = null;

// Initialize Audio Context (Lazy load)
export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
};

const createOscillator = (type: OscillatorType, freq: number, duration: number, volume: number = 0.1) => {
  if (!audioCtx) return;
  
  // Safety limiter: If excessive number of nodes, don't play to prevent crash
  // (Not implemented strictly here, but kept simple for performance)
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

// 1. Button Click
export const playClickSound = () => {
  if (!audioCtx) initAudio();
  createOscillator('sine', 800, 0.1, 0.1);
};

// 2. Shaking Sound - OPTIMIZED
// Previously used setInterval which crashes mobile browsers.
// Now plays a single "Ratchet" sound effect once.
export const playShakingSound = () => {
  if (!audioCtx) initAudio();
  // Play a single "cranking" sound instead of a continuous loop
  createOscillator('sawtooth', 150, 0.2, 0.1);
};

// 2.5 Stop Shaking - No-op now as we removed the loop
export const stopShakingSound = () => {
  // No-op to prevent errors in components calling this
};

// 3. Fanfare
export const playFanfareSound = () => {
  if (!audioCtx) initAudio();

  const now = audioCtx!.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50]; 

  notes.forEach((freq, i) => {
    const osc = audioCtx!.createOscillator();
    const gain = audioCtx!.createGain();

    osc.connect(gain);
    gain.connect(audioCtx!.destination);

    osc.type = 'sawtooth'; 
    osc.frequency.setValueAtTime(freq, now + i * 0.1); 

    gain.gain.setValueAtTime(0, now + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.05, now + i * 0.1 + 0.05); 
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.6);

    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.6);
  });
};

// 4. Coin Sound
export const playCoinSound = () => {
  if (!audioCtx) initAudio();
  createOscillator('sine', 1500, 0.3, 0.1);
};

// 4-1. Mining Reward Sound
export const playMiningRewardSound = () => {
  if (!audioCtx) initAudio();
  createOscillator('sine', 1200, 0.1, 0.1);
  setTimeout(() => createOscillator('sine', 1800, 0.3, 0.1), 100);
};

// 5. Payment Sound
export const playPaymentSound = () => {
  if (!audioCtx) initAudio();
  createOscillator('sine', 2000, 0.15, 0.1);
};

// 6. Synthesis Start
export const playSynthStartSound = () => {
  if (!audioCtx) initAudio();
  createOscillator('sine', 200, 0.5, 0.05);
};

// 7. Synthesis Success
export const playSynthSuccessSound = () => {
  playFanfareSound();
};

// 8. Slot Tick
export const playSlotTickSound = () => {
  if (!audioCtx) initAudio();
  // Very short, low volume tick
  createOscillator('square', 600, 0.03, 0.02); 
};

// 9. Slot Land
export const playSlotLandSound = () => {
  if (!audioCtx) initAudio();
  createOscillator('triangle', 300, 0.1, 0.1);
};

// 10. Wooden Fish
export const playWoodenFishSound = () => {
  if (!audioCtx) initAudio();
  createOscillator('sine', 600, 0.1, 0.2); 
};

// 11. Scan Sound (Sonar Ping)
export const playScanSound = () => {
  if (!audioCtx) initAudio();
  // High pitched sonar beep
  createOscillator('sine', 1200, 0.15, 0.05);
};

// 12. Box Drop Sound (Whistle + Thud)
export const playBoxDropSound = () => {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;
  
  const now = audioCtx.currentTime;

  // Falling whistle
  const osc1 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(800, now);
  osc1.frequency.exponentialRampToValueAtTime(100, now + 0.3);
  gain1.gain.setValueAtTime(0.1, now);
  gain1.gain.linearRampToValueAtTime(0, now + 0.3);
  
  osc1.connect(gain1);
  gain1.connect(audioCtx.destination);
  osc1.start(now);
  osc1.stop(now + 0.3);

  // Impact thud
  setTimeout(() => {
      if (!audioCtx) return;
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(100, audioCtx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.2);
      gain2.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start();
      osc2.stop(audioCtx.currentTime + 0.2);
  }, 250);
};
