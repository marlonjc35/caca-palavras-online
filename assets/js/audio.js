/**
 * audio.js — Sistema de áudio sintetizado via Web Audio API
 * Gera todos os efeitos sonoros programaticamente (sem arquivos externos).
 */

const AudioManager = (() => {
    'use strict';

    let audioCtx = null;
    let masterGain = null;
    let enabled = true;
    let volume = 0.5;
    let initialized = false;

    /**
     * Inicializa o contexto de áudio (deve ser chamado após interação do usuário).
     */
    function init() {
        if (initialized) return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) {
                console.warn('AudioManager: Web Audio API não suportada');
                return;
            }
            audioCtx = new AudioContextClass();
            masterGain = audioCtx.createGain();
            masterGain.gain.value = volume;
            masterGain.connect(audioCtx.destination);
            initialized = true;
        } catch (e) {
            console.warn('AudioManager: erro ao inicializar', e);
        }
    }

    /**
     * Retoma o contexto de áudio (necessário em alguns navegadores).
     */
    function resume() {
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    /**
     * Cria um oscilador com envelope ADSR simplificado.
     * @param {object} options
     * @param {number} options.frequency - Frequência em Hz
     * @param {string} options.type - Tipo de onda ('sine', 'square', 'triangle', 'sawtooth')
     * @param {number} options.duration - Duração em segundos
     * @param {number} options.attack - Tempo de ataque (s)
     * @param {number} options.decay - Tempo de decaimento (s)
     * @param {number} options.sustain - Nível de sustentação (0-1)
     * @param {number} options.release - Tempo de release (s)
     * @param {number} options.gain - Ganho (0-1)
     * @param {number} options.startTime - Offset de início (s)
     */
    function playTone({ frequency, type = 'sine', duration = 0.2, attack = 0.01, decay = 0.05, sustain = 0.3, release = 0.1, gain = 0.5, startTime = 0 }) {
        if (!enabled || !initialized || !audioCtx) return;

        const now = audioCtx.currentTime + startTime;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, now);

        // Envelope ADSR
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(gain, now + attack);
        gainNode.gain.linearRampToValueAtTime(gain * sustain, now + attack + decay);
        gainNode.gain.setValueAtTime(gain * sustain, now + duration - release);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        osc.connect(gainNode);
        gainNode.connect(masterGain);

        osc.start(now);
        osc.stop(now + duration);
    }

    /**
     * Cria um ruído branco filtrado (para percussão e efeitos).
     * @param {number} duration - Duração em segundos
     * @param {number} frequency - Frequência do filtro
     * @param {string} filterType - Tipo do filtro ('lowpass', 'highpass', 'bandpass')
     * @param {number} gain - Ganho
     */
    function playNoise(duration = 0.1, frequency = 1000, filterType = 'bandpass', gain = 0.3) {
        if (!enabled || !initialized || !audioCtx) return;

        const now = audioCtx.currentTime;
        const bufferSize = audioCtx.sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = frequency;

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(gain, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(masterGain);

        noise.start(now);
        noise.stop(now + duration);
    }

    // ---- Efeitos sonoros pré-definidos ----

    /**
     * Som de clique ao selecionar uma letra.
     */
    function playClick() {
        if (!enabled) return;
        playTone({
            frequency: 800,
            type: 'sine',
            duration: 0.05,
            attack: 0.001,
            decay: 0.02,
            sustain: 0.1,
            release: 0.03,
            gain: 0.15
        });
    }

    /**
     * Som ao encontrar uma palavra (arpejo ascendente).
     */
    function playCorrect() {
        if (!enabled) return;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            playTone({
                frequency: freq,
                type: 'triangle',
                duration: 0.15,
                attack: 0.01,
                decay: 0.05,
                sustain: 0.3,
                release: 0.08,
                gain: 0.3,
                startTime: i * 0.06
            });
        });
    }

    /**
     * Som de erro (tom descendente).
     */
    function playError() {
        if (!enabled) return;
        playTone({
            frequency: 200,
            type: 'sawtooth',
            duration: 0.15,
            attack: 0.01,
            decay: 0.05,
            sustain: 0.2,
            release: 0.08,
            gain: 0.2,
            startTime: 0
        });
        playTone({
            frequency: 150,
            type: 'sawtooth',
            duration: 0.15,
            attack: 0.01,
            decay: 0.05,
            sustain: 0.2,
            release: 0.08,
            gain: 0.2,
            startTime: 0.08
        });
    }

    /**
     * Som de vitória (fanfarra curta).
     */
    function playVictory() {
        if (!enabled) return;
        // Acorde majórico ascendente
        const melody = [
            { freq: 523.25, time: 0 },     // C5
            { freq: 659.25, time: 0.1 },   // E5
            { freq: 783.99, time: 0.2 },   // G5
            { freq: 1046.50, time: 0.3 },  // C6
            { freq: 1318.51, time: 0.4 }   // E6
        ];

        melody.forEach(({ freq, time }) => {
            playTone({
                frequency: freq,
                type: 'triangle',
                duration: 0.5,
                attack: 0.02,
                decay: 0.1,
                sustain: 0.4,
                release: 0.3,
                gain: 0.25,
                startTime: time
            });
        });

        // Acorde final
        [523.25, 659.25, 783.99, 1046.50].forEach(freq => {
            playTone({
                frequency: freq,
                type: 'sine',
                duration: 0.8,
                attack: 0.05,
                decay: 0.1,
                sustain: 0.5,
                release: 0.5,
                gain: 0.2,
                startTime: 0.5
            });
        });

        // Confete sonoro (ruído)
        playNoise(0.3, 3000, 'highpass', 0.1);
    }

    /**
     * Som de dica (tom mágico).
     */
    function playHint() {
        if (!enabled) return;
        playTone({
            frequency: 1000,
            type: 'sine',
            duration: 0.3,
            attack: 0.05,
            decay: 0.1,
            sustain: 0.3,
            release: 0.15,
            gain: 0.2,
            startTime: 0
        });
        playTone({
            frequency: 1500,
            type: 'sine',
            duration: 0.3,
            attack: 0.05,
            decay: 0.1,
            sustain: 0.3,
            release: 0.15,
            gain: 0.15,
            startTime: 0.1
        });
    }

    /**
     * Som de derrota/tempo esgotado.
     */
    function playDefeat() {
        if (!enabled) return;
        const notes = [392.00, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
        notes.forEach((freq, i) => {
            playTone({
                frequency: freq,
                type: 'triangle',
                duration: 0.3,
                attack: 0.02,
                decay: 0.1,
                sustain: 0.3,
                release: 0.15,
                gain: 0.25,
                startTime: i * 0.15
            });
        });
    }

    /**
     * Som de transição de tela.
     */
    function playWhoosh() {
        if (!enabled) return;
        playNoise(0.2, 500, 'lowpass', 0.15);
    }

    // ---- Controle ----

    function setEnabled(value) {
        enabled = value;
    }

    function isEnabled() {
        return enabled;
    }

    function setVolume(vol) {
        volume = Math.max(0, Math.min(1, vol));
        if (masterGain) {
            masterGain.gain.value = volume;
        }
    }

    function getVolume() {
        return volume;
    }

    return {
        init,
        resume,
        playClick,
        playCorrect,
        playError,
        playVictory,
        playDefeat,
        playHint,
        playWhoosh,
        setEnabled,
        isEnabled,
        setVolume,
        getVolume
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
