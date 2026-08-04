/**
 * ui.js — Gerenciamento de interface, telas, animações e efeitos visuais
 * Responsável por: navegação entre telas, tema dark/light, partículas,
 * animações de palavras encontradas, efeito de vitória, toasts.
 */

const UI = (() => {
    'use strict';

    const screens = {};
    let currentScreen = null;
    let particleCanvas = null;
    let particleCtx = null;
    let particles = [];
    let particleAnimId = null;
    let theme = 'dark';

    // ---- Inicialização ----

    function init() {
        // Registra todas as telas
        document.querySelectorAll('[data-screen]').forEach(el => {
            screens[el.dataset.screen] = el;
        });

        // Carrega tema salvo
        const settings = Storage.getSettings();
        theme = settings.theme || 'dark';
        applyTheme(theme);

        // Configura canvas de partículas
        setupParticleCanvas();

        // Listener para mudança de tamanho da janela
        window.addEventListener('resize', () => {
            if (particleCanvas) {
                particleCanvas.width = window.innerWidth;
                particleCanvas.height = window.innerHeight;
            }
        });
    }

    // ---- Navegação entre telas ----

    function showScreen(name) {
        // Esconde todas as telas
        Object.values(screens).forEach(el => {
            el.classList.remove('active');
            el.setAttribute('aria-hidden', 'true');
        });

        // Mostra a tela solicitada
        if (screens[name]) {
            screens[name].classList.add('active');
            screens[name].setAttribute('aria-hidden', 'false');
            currentScreen = name;

            // Atualiza conteúdo dinâmico
            if (name === 'stats') renderStats();
            if (name === 'ranking') renderRanking();
            if (name === 'achievements') renderAchievements();

            // Foca na tela para acessibilidade
            screens[name].focus();
        }

        AudioManager.playWhoosh();
    }

    function getCurrentScreen() {
        return currentScreen;
    }

    // ---- Tema ----

    function applyTheme(t) {
        theme = t;
        document.documentElement.setAttribute('data-theme', t);
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.textContent = t === 'dark' ? '☀️' : '🌙';
            toggle.setAttribute('aria-label',
                t === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro');
        }
    }

    function toggleTheme() {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        Storage.saveSettings({ theme: newTheme });
    }

    function getTheme() {
        return theme;
    }

    // ---- Toast / Notificações ----

    function showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <span class="toast-icon">${getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        // Animação de entrada
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto-remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    function getToastIcon(type) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            achievement: '🏆'
        };
        return icons[type] || icons.info;
    }

    function showAchievementNotification(achievement) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast toast-achievement achievement-popup';
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="achievement-toast-content">
                <span class="achievement-toast-icon">${achievement.icon}</span>
                <div class="achievement-toast-text">
                    <div class="achievement-toast-title">Conquista Desbloqueada!</div>
                    <div class="achievement-toast-name">${achievement.name}</div>
                    <div class="achievement-toast-desc">${achievement.description}</div>
                </div>
            </div>
        `;

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 5000);
    }

    // ---- Partículas ----

    function setupParticleCanvas() {
        particleCanvas = document.getElementById('particle-canvas');
        if (!particleCanvas) {
            particleCanvas = document.createElement('canvas');
            particleCanvas.id = 'particle-canvas';
            particleCanvas.className = 'particle-canvas';
            particleCanvas.setAttribute('aria-hidden', 'true');
            document.body.appendChild(particleCanvas);
        }
        particleCtx = particleCanvas.getContext('2d');
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
    }

    function spawnParticles(x, y, count = 15, colors = null) {
        const palette = colors || ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe'];

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = 2 + Math.random() * 4;
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                size: 3 + Math.random() * 4,
                color: palette[Math.floor(Math.random() * palette.length)],
                life: 1.0,
                decay: 0.015 + Math.random() * 0.015,
                gravity: 0.15
            });
        }

        if (!particleAnimId) {
            animateParticles();
        }
    }

    function animateParticles() {
        if (particles.length === 0) {
            particleAnimId = null;
            if (particleCtx) {
                particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
            }
            return;
        }

        particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

        particles = particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.98;
            p.life -= p.decay;

            if (p.life <= 0) return false;

            particleCtx.save();
            particleCtx.globalAlpha = p.life;
            particleCtx.fillStyle = p.color;
            particleCtx.beginPath();
            particleCtx.arc(p.x, p.y, Math.max(0.5, p.size * p.life), 0, Math.PI * 2);
            particleCtx.fill();
            particleCtx.restore();

            return true;
        });

        particleAnimId = requestAnimationFrame(animateParticles);
    }

    function spawnConfetti() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'];

        for (let i = 0; i < 80; i++) {
            particles.push({
                x: w / 2 + (Math.random() - 0.5) * w * 0.5,
                y: h / 2 + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 12,
                vy: -Math.random() * 12 - 5,
                size: 4 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1.0,
                decay: 0.008 + Math.random() * 0.008,
                gravity: 0.2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3
            });
        }

        // Animação de confete com rotação
        const renderConfetti = () => {
            if (particles.length === 0) {
                particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
                return;
            }

            particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

            particles = particles.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.vx *= 0.99;
                p.life -= p.decay;
                if (p.rotation !== undefined) p.rotation += p.rotationSpeed;

                if (p.life <= 0 || p.y > h + 50) return false;

                particleCtx.save();
                particleCtx.globalAlpha = p.life;
                particleCtx.fillStyle = p.color;
                particleCtx.translate(p.x, p.y);
                if (p.rotation !== undefined) particleCtx.rotate(p.rotation);
                particleCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                particleCtx.restore();

                return true;
            });

            if (particles.length > 0) {
                requestAnimationFrame(renderConfetti);
            } else {
                particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
            }
        };
        renderConfetti();
    }

    // ---- Animação de palavra encontrada ----

    function animateFoundWord(cells) {
        cells.forEach((cell, index) => {
            const el = document.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
            if (el) {
                el.style.animationDelay = `${index * 50}ms`;
                el.classList.add('cell-found-animation');
                setTimeout(() => el.classList.remove('cell-found-animation'), 800);
            }
        });

        // Partículas no centro da palavra
        if (cells.length > 0) {
            const midCell = cells[Math.floor(cells.length / 2)];
            const el = document.querySelector(`[data-row="${midCell.row}"][data-col="${midCell.col}"]`);
            if (el) {
                const rect = el.getBoundingClientRect();
                spawnParticles(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    20
                );
            }
        }
    }

    // ---- Efeito de vitória ----

    function playVictoryEffect() {
        spawnConfetti();

        // Pulso de vitória na grade
        const grid = document.getElementById('game-grid');
        if (grid) {
            grid.classList.add('victory-pulse');
            setTimeout(() => grid.classList.remove('victory-pulse'), 1000);
        }
    }

    // ---- Renderização de telas dinâmicas ----

    function renderStats() {
        const stats = Storage.getStats();
        const container = document.getElementById('stats-content');
        if (!container) return;

        const favLevel = Storage.getFavoriteLevel();
        const favLevelName = favLevel ? Levels.getLevel(favLevel).name : '—';

        const winRate = stats.totalGames > 0
            ? ((stats.totalWins / stats.totalGames) * 100).toFixed(1)
            : '0.0';

        const avgTimeFacil = Storage.getAverageTime('facil');
        const avgTimeMedio = Storage.getAverageTime('medio');
        const avgTimeDificil = Storage.getAverageTime('dificil');

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">🎮</div>
                    <div class="stat-value">${stats.totalGames}</div>
                    <div class="stat-label">Jogos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-value">${stats.totalWins}</div>
                    <div class="stat-label">Vitórias</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value">${winRate}%</div>
                    <div class="stat-label">Taxa de vitória</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-value">${stats.maxStreak}</div>
                    <div class="stat-label">Maior sequência</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🔍</div>
                    <div class="stat-value">${stats.totalWordsFound}</div>
                    <div class="stat-label">Palavras encontradas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-value">${favLevelName}</div>
                    <div class="stat-label">Nível favorito</div>
                </div>
            </div>

            <div class="stats-detail">
                <h3>Melhores Tempos</h3>
                <div class="best-times">
                    <div class="best-time-row">
                        <span class="level-badge level-facil">🟢 Fácil</span>
                        <span class="time-value">${stats.bestTimes.facil ? formatTime(stats.bestTimes.facil) : '—'}</span>
                        <span class="score-value">${stats.bestScores.facil || 0} pts</span>
                    </div>
                    <div class="best-time-row">
                        <span class="level-badge level-medio">🟡 Médio</span>
                        <span class="time-value">${stats.bestTimes.medio ? formatTime(stats.bestTimes.medio) : '—'}</span>
                        <span class="score-value">${stats.bestScores.medio || 0} pts</span>
                    </div>
                    <div class="best-time-row">
                        <span class="level-badge level-dificil">🔴 Difícil</span>
                        <span class="time-value">${stats.bestTimes.dificil ? formatTime(stats.bestTimes.dificil) : '—'}</span>
                        <span class="score-value">${stats.bestScores.dificil || 0} pts</span>
                    </div>
                </div>
            </div>

            <div class="stats-detail">
                <h3>Tempos Médios</h3>
                <div class="avg-times">
                    <div class="avg-time-row">
                        <span class="level-badge level-facil">🟢</span>
                        <span>${avgTimeFacil ? formatTime(avgTimeFacil) : '—'}</span>
                    </div>
                    <div class="avg-time-row">
                        <span class="level-badge level-medio">🟡</span>
                        <span>${avgTimeMedio ? formatTime(avgTimeMedio) : '—'}</span>
                    </div>
                    <div class="avg-time-row">
                        <span class="level-badge level-dificil">🔴</span>
                        <span>${avgTimeDificil ? formatTime(avgTimeDificil) : '—'}</span>
                    </div>
                </div>
            </div>

            <div class="stats-detail">
                <h3>Desafios Diários</h3>
                <div class="daily-stats">
                    <div class="daily-stat">
                        <span class="stat-value">${stats.dailyPlayed}</span>
                        <span class="stat-label">Participações</span>
                    </div>
                    <div class="daily-stat">
                        <span class="stat-value">${stats.dailyWon}</span>
                        <span class="stat-label">Vitórias</span>
                    </div>
                </div>
            </div>
        `;
    }

    function renderRanking() {
        const container = document.getElementById('ranking-content');
        if (!container) return;

        const levels = Levels.getAllLevels();
        let html = '<div class="ranking-tabs">';

        levels.forEach((level, i) => {
            html += `<button class="ranking-tab ${i === 0 ? 'active' : ''}" data-level="${level.id}" role="tab" aria-selected="${i === 0}">${level.icon} ${level.name}</button>`;
        });
        html += '</div>';

        levels.forEach((level, i) => {
            const entries = Storage.getRankingForLevel(level.id);
            html += `<div class="ranking-list ${i === 0 ? 'active' : ''}" data-level="${level.id}" role="tabpanel">`;

            if (entries.length === 0) {
                html += `
                    <div class="ranking-empty">
                        <div class="ranking-empty-icon">🏅</div>
                        <p>Nenhum recorde ainda. Seja o primeiro!</p>
                    </div>
                `;
            } else {
                html += `
                    <div class="ranking-table">
                        <div class="ranking-header-row">
                            <span class="rank-col">#</span>
                            <span class="name-col">Jogador</span>
                            <span class="score-col">Pontos</span>
                            <span class="time-col">Tempo</span>
                        </div>
                `;
                entries.slice(0, 20).forEach((entry, idx) => {
                    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
                    html += `
                        <div class="ranking-row ${idx < 3 ? 'rank-medal' : ''}">
                            <span class="rank-col">${medal}</span>
                            <span class="name-col">${escapeHtml(entry.name)}${entry.isDaily ? ' 📅' : ''}</span>
                            <span class="score-col">${entry.score}</span>
                            <span class="time-col">${formatTime(entry.time)}</span>
                        </div>
                    `;
                });
                html += '</div>';
            }

            html += '</div>';
        });

        container.innerHTML = html;

        // Tab switching
        container.querySelectorAll('.ranking-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.ranking-tab').forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                container.querySelectorAll('.ranking-list').forEach(l => l.classList.remove('active'));
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                const levelId = tab.dataset.level;
                container.querySelector(`.ranking-list[data-level="${levelId}"]`).classList.add('active');
                AudioManager.playClick();
            });
        });
    }

    function renderAchievements() {
        const container = document.getElementById('achievements-content');
        if (!container) return;

        const progress = Storage.getAchievementProgress();
        const achievements = progress.achievements;

        let html = `
            <div class="achievements-progress-bar">
                <div class="progress-label">
                    <span>Conquistas Desbloqueadas</span>
                    <span>${progress.unlocked} / ${progress.total}</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width: ${(progress.unlocked / progress.total) * 100}%"></div>
                </div>
            </div>
            <div class="achievements-grid">
        `;

        achievements.forEach(a => {
            html += `
                <div class="achievement-card ${a.unlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">${a.unlocked ? a.icon : '🔒'}</div>
                    <div class="achievement-info">
                        <div class="achievement-name">${a.name}</div>
                        <div class="achievement-desc">${a.description}</div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    // ---- Modal ----

    function showModal(title, content, actions = []) {
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById('modal');
        if (!overlay || !modal) return;

        let html = `<h2 class="modal-title">${title}</h2>`;
        html += `<div class="modal-body">${content}</div>`;

        if (actions.length > 0) {
            html += '<div class="modal-actions">';
            actions.forEach(action => {
                html += `<button class="btn btn-${action.type || 'primary'}" data-action="${action.id}">${action.label}</button>`;
            });
            html += '</div>';
        }

        modal.innerHTML = html;
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        modal.focus();

        // Bind actions
        modal.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const actionId = btn.dataset.action;
                const action = actions.find(a => a.id === actionId);
                if (action && action.callback) action.callback();
                if (!action || action.closeOnClick !== false) hideModal();
            });
        });
    }

    function hideModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
        }
    }

    // ---- Helpers ----

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return {
        init,
        showScreen,
        getCurrentScreen,
        applyTheme,
        toggleTheme,
        getTheme,
        showToast,
        showAchievementNotification,
        animateFoundWord,
        playVictoryEffect,
        spawnParticles,
        spawnConfetti,
        showModal,
        hideModal,
        formatTime,
        renderStats,
        renderRanking,
        renderAchievements
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}
