/**
 * game.js — Controlador principal do Caça-Palavras
 * Gerencia: tabuleiro, input (mouse+touch), seleção, cronômetro,
 * pontuação, progresso, fluxo do jogo e integração entre módulos.
 */

const Game = (() => {
    'use strict';

    // Estado do jogo
    let state = {
        mode: 'random',         // 'random' | 'daily'
        levelId: 'facil',
        level: null,
        boardData: null,         // Resultado do Generator.generate()
        grid: null,              // Matriz de letras
        gridSize: 0,
        words: [],               // Palavras no tabuleiro
        foundWords: new Set(),
        wordPositions: [],
        startTime: 0,
        elapsedTime: 0,
        timerInterval: null,
        isPaused: false,
        isPlaying: false,
        score: 0,
        hintsUsed: 0,
        hintsAllowed: 3,
        errors: 0,
        seed: null,
        isDaily: false,
        dailyDate: null
    };

    // Seleção atual
    let selection = {
        isSelecting: false,
        startCell: null,
        endCell: null,
        cells: [],
        element: null
    };

    // ---- Inicialização ----

    function init() {
        bindEvents();
        updateMenuState();
    }

    // ---- Novo jogo ----

    function startNewGame(levelId, mode = 'random') {
        UI.hideModal();
        const level = Levels.getLevel(levelId);
        const recentWords = Storage.getRecentWords();

        // Seleciona palavras
        const words = Dictionary.selectRandomWords(
            level.wordCount,
            [],
            level.minWordLength,
            level.maxWordLength,
            recentWords
        );

        // Gera o tabuleiro
        let boardData;
        if (mode === 'daily') {
            boardData = Generator.generateDaily(level, words);
            state.isDaily = true;
            state.dailyDate = Generator.formatDailyDate();
        } else {
            boardData = Generator.generateRandom(level, words);
            state.isDaily = false;
        }

        // Se nem todas as palavras foram colocadas, tenta adicionar mais
        if (boardData.placedWords.length < level.wordCount * 0.7) {
            // Tenta novamente com novas palavras
            const extraWords = Dictionary.selectRandomWords(
                level.wordCount - boardData.placedWords.length,
                [],
                level.minWordLength,
                Math.min(level.maxWordLength, level.gridSize - 1),
                [...recentWords, ...boardData.placedWords]
            );
            const extraBoard = mode === 'daily'
                ? Generator.generateDaily(level, [...words, ...extraWords])
                : Generator.generateRandom(level, [...words, ...extraWords]);

            if (extraBoard.placedWords.length > boardData.placedWords.length) {
                boardData = extraBoard;
            }
        }

        // Atualiza estado
        state.levelId = levelId;
        state.level = level;
        state.boardData = boardData;
        state.grid = boardData.grid;
        state.gridSize = boardData.gridSize;
        state.words = boardData.placedWords;
        state.wordPositions = boardData.wordPositions.map(wp => ({ ...wp, found: false }));
        state.foundWords = new Set();
        state.startTime = Date.now();
        state.elapsedTime = 0;
        state.score = 0;
        state.hintsUsed = 0;
        state.hintsAllowed = level.hintsAllowed;
        state.errors = 0;
        state.seed = boardData.seed;
        state.mode = mode;
        state.isPaused = false;
        state.isPlaying = true;

        // Salva palavras usadas como recentes
        Storage.addRecentWords(boardData.placedWords);

        // Renderiza
        renderBoard();
        renderWordList();
        updateGameInfo();
        startTimer();

        UI.showScreen('game');
        AudioManager.init();
        AudioManager.resume();

        // Atualiza badge do modo diário
        updateDailyBadge();

        // Salva estado para resume
        saveGameState();
    }

    // ---- Renderização do tabuleiro ----

    function renderBoard() {
        const container = document.getElementById('game-grid');
        if (!container) return;

        const size = state.gridSize;
        container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        container.className = `grid-container grid-${size}`;
        container.innerHTML = '';

        // Cria overlay de seleção
        const overlay = document.createElement('div');
        overlay.className = 'selection-overlay';
        overlay.id = 'selection-overlay';
        container.appendChild(overlay);
        selection.element = overlay;

        // Cria células
        const gridWrapper = document.createElement('div');
        gridWrapper.className = 'grid-wrapper';

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.textContent = state.grid[row][col].toUpperCase();
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.setAttribute('role', 'gridcell');
                cell.setAttribute('aria-label', `Linha ${row + 1}, Coluna ${col + 1}, Letra ${state.grid[row][col].toUpperCase()}`);
                cell.setAttribute('tabindex', '0');

                // Mouse events
                cell.addEventListener('mousedown', onCellMouseDown);
                cell.addEventListener('mouseenter', onCellMouseEnter);
                cell.addEventListener('mouseup', onCellMouseUp);

                // Touch events
                cell.addEventListener('touchstart', onCellTouchStart, { passive: false });
                cell.addEventListener('touchmove', onCellTouchMove, { passive: false });
                cell.addEventListener('touchend', onCellTouchEnd);

                gridWrapper.appendChild(cell);
            }
        }

        container.appendChild(gridWrapper);

        // Global mouseup (caso o usuário solte fora da grade)
        document.addEventListener('mouseup', onGlobalMouseUp);
    }

    // ---- Input: Mouse ----

    function onCellMouseDown(e) {
        if (!state.isPlaying || state.isPaused) return;
        e.preventDefault();

        const cell = e.currentTarget;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        selection.isSelecting = true;
        selection.startCell = { row, col };
        selection.endCell = { row, col };
        selection.cells = [{ row, col }];

        updateSelectionHighlight();
        AudioManager.playClick();
    }

    function onCellMouseEnter(e) {
        if (!selection.isSelecting) return;

        const cell = e.currentTarget;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        selection.endCell = { row, col };
        selection.cells = calculateLineCells(selection.startCell, selection.endCell);
        updateSelectionHighlight();
        AudioManager.playClick();
    }

    function onCellMouseUp(e) {
        if (!selection.isSelecting) return;
        finishSelection();
    }

    function onGlobalMouseUp() {
        if (selection.isSelecting) {
            finishSelection();
        }
    }

    // ---- Input: Touch ----

    function onCellTouchStart(e) {
        if (!state.isPlaying || state.isPaused) return;
        e.preventDefault();

        const touch = e.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY);

        if (cell && cell.classList.contains('grid-cell')) {
            selection.isSelecting = true;
            selection.startCell = {
                row: parseInt(cell.dataset.row),
                col: parseInt(cell.dataset.col)
            };
            selection.endCell = { ...selection.startCell };
            selection.cells = [{ ...selection.startCell }];
            updateSelectionHighlight();
            AudioManager.playClick();
        }
    }

    function onCellTouchMove(e) {
        if (!selection.isSelecting) return;
        e.preventDefault();

        const touch = e.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY);

        if (cell && cell.classList.contains('grid-cell')) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);

            if (selection.endCell.row !== row || selection.endCell.col !== col) {
                selection.endCell = { row, col };
                selection.cells = calculateLineCells(selection.startCell, selection.endCell);
                updateSelectionHighlight();
            }
        }
    }

    function onCellTouchEnd(e) {
        if (selection.isSelecting) {
            finishSelection();
        }
    }

    // ---- Cálculo de linha ----

    function calculateLineCells(start, end) {
        const dr = end.row - start.row;
        const dc = end.col - start.col;
        const adr = Math.abs(dr);
        const adc = Math.abs(dc);

        // Só permite linhas retas: horizontal, vertical ou diagonal
        if (dr === 0 && dc === 0) return [start];
        if (dr !== 0 && dc !== 0 && adr !== adc) return [start]; // Não é linha reta

        const length = Math.max(adr, adc) + 1;
        const stepR = dr === 0 ? 0 : dr / adr;
        const stepC = dc === 0 ? 0 : dc / adc;

        const cells = [];
        for (let i = 0; i < length; i++) {
            cells.push({
                row: start.row + Math.round(stepR * i),
                col: start.col + Math.round(stepC * i)
            });
        }
        return cells;
    }

    // ---- Destaque visual da seleção ----

    function updateSelectionHighlight() {
        // Limpa destaque anterior
        document.querySelectorAll('.grid-cell.selecting').forEach(el => {
            el.classList.remove('selecting');
        });

        // Destaca células selecionadas
        selection.cells.forEach(({ row, col }) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) cell.classList.add('selecting');
        });

        // Atualiza overlay de linha
        updateSelectionLine();
    }

    function updateSelectionLine() {
        const overlay = document.getElementById('selection-overlay');
        if (!overlay || selection.cells.length < 1) return;

        if (selection.cells.length < 2) {
            overlay.style.display = 'none';
            return;
        }

        const first = selection.cells[0];
        const last = selection.cells[selection.cells.length - 1];

        const firstEl = document.querySelector(`[data-row="${first.row}"][data-col="${first.col}"]`);
        const lastEl = document.querySelector(`[data-row="${last.row}"][data-col="${last.col}"]`);

        if (!firstEl || !lastEl) return;

        const gridRect = document.getElementById('game-grid').getBoundingClientRect();
        const firstRect = firstEl.getBoundingClientRect();
        const lastRect = lastEl.getBoundingClientRect();

        const x1 = firstRect.left + firstRect.width / 2 - gridRect.left;
        const y1 = firstRect.top + firstRect.height / 2 - gridRect.top;
        const x2 = lastRect.left + lastRect.width / 2 - gridRect.left;
        const y2 = lastRect.top + lastRect.height / 2 - gridRect.top;

        overlay.style.display = 'block';
        overlay.style.left = `${Math.min(x1, x2)}px`;
        overlay.style.top = `${Math.min(y1, y2)}px`;
        overlay.style.width = `${Math.abs(x2 - x1) + firstRect.width}px`;
        overlay.style.height = `${Math.abs(y2 - y1) + firstRect.height}px`;
    }

    // ---- Finalizar seleção ----

    function finishSelection() {
        if (!selection.isSelecting) return;
        selection.isSelecting = false;

        if (selection.cells.length < 2) {
            clearSelection();
            return;
        }

        // Verifica se a seleção forma uma palavra válida
        const result = Generator.checkSelection(state.grid, selection.cells, state.wordPositions);

        if (result) {
            onWordFound(result);
        } else {
            onWrongSelection();
        }

        clearSelection();
    }

    function clearSelection() {
        document.querySelectorAll('.grid-cell.selecting').forEach(el => {
            el.classList.remove('selecting');
        });
        const overlay = document.getElementById('selection-overlay');
        if (overlay) overlay.style.display = 'none';

        selection.cells = [];
        selection.startCell = null;
        selection.endCell = null;
    }

    // ---- Palavra encontrada ----

    function onWordFound(wordPos) {
        wordPos.found = true;
        state.foundWords.add(wordPos.word);

        // Marca células como encontradas
        const [dr, dc] = wordPos.direction;
        for (let i = 0; i < wordPos.length; i++) {
            const r = wordPos.row + dr * i;
            const c = wordPos.col + dc * i;
            const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            if (cell) cell.classList.add('found');
        }

        // Animação
        const cells = [];
        for (let i = 0; i < wordPos.length; i++) {
            cells.push({
                row: wordPos.row + dr * i,
                col: wordPos.col + dc * i
            });
        }
        UI.animateFoundWord(cells);

        // Som
        AudioManager.playCorrect();

        // Atualiza UI
        renderWordList();
        updateGameInfo();

        // Verifica vitória
        if (state.foundWords.size === state.words.length) {
            onVictory();
        }

        // Salva estado
        saveGameState();
    }

    function onWrongSelection() {
        state.errors++;
        AudioManager.playError();

        // Feedback visual de erro
        selection.cells.forEach(({ row, col }) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell && !cell.classList.contains('found')) {
                cell.classList.add('error');
                setTimeout(() => cell.classList.remove('error'), 500);
            }
        });
    }

    // ---- Vitória ----

    function onVictory() {
        state.isPlaying = false;
        stopTimer();

        const time = state.elapsedTime;
        const perfect = state.hintsUsed === 0;
        const flawless = state.errors === 0;

        // Calcula pontuação
        const scoreResult = Levels.calculateScore(
            state.levelId,
            state.foundWords.size,
            state.words.length,
            time,
            state.hintsUsed
        );
        state.score = scoreResult.score;

        // Registra jogo
        const gameResult = {
            level: state.levelId,
            won: true,
            time,
            score: state.score,
            wordsFound: state.foundWords.size,
            totalWords: state.words.length,
            perfect,
            flawless,
            isDaily: state.isDaily
        };

        Storage.recordGame(gameResult);

        // Ranking
        const playerName = getPlayerName();
        Storage.addToRanking({
            name: playerName,
            score: state.score,
            time,
            wordsFound: state.foundWords.size,
            totalWords: state.words.length,
            level: state.levelId,
            isDaily: state.isDaily
        });

        // Conquistas
        const newAchievements = Storage.checkAchievements(gameResult);
        newAchievements.forEach((ach, i) => {
            setTimeout(() => UI.showAchievementNotification(ach), 1000 + i * 2500);
        });

        // Efeito de vitória
        UI.playVictoryEffect();
        AudioManager.playVictory();

        // Limpa jogo salvo
        Storage.clearSavedGame();

        // Mostra tela de vitória
        setTimeout(() => showVictoryScreen(gameResult), 800);
    }

    function showVictoryScreen(result) {
        const rankPos = Storage.getRankPosition(result.level, result.score, result.time);
        const content = `
            <div class="victory-content">
                <div class="victory-icon">🎉</div>
                <h2 class="victory-title">Parabéns!</h2>
                <p class="victory-subtitle">Você completou o caça-palavras!</p>

                <div class="victory-stats">
                    <div class="victory-stat">
                        <span class="victory-stat-value">${UI.formatTime(result.time)}</span>
                        <span class="victory-stat-label">Tempo</span>
                    </div>
                    <div class="victory-stat">
                        <span class="victory-stat-value">${result.score}</span>
                        <span class="victory-stat-label">Pontos</span>
                    </div>
                    <div class="victory-stat">
                        <span class="victory-stat-value">${result.wordsFound}/${result.totalWords}</span>
                        <span class="victory-stat-label">Palavras</span>
                    </div>
                    <div class="victory-stat">
                        <span class="victory-stat-value">#${rankPos}</span>
                        <span class="victory-stat-label">Ranking</span>
                    </div>
                </div>

                ${result.perfect ? '<div class="victory-badge">⭐ Jogo Perfeito (sem dicas)</div>' : ''}
                ${result.flawless ? '<div class="victory-badge">✨ Sem Erros</div>' : ''}
                ${result.isDaily ? `<div class="victory-badge">📅 Desafio Diário - ${state.dailyDate}</div>` : ''}

                ${state.isDaily ? `
                <div class="daily-share">
                    <p>Compartilhe seu resultado:</p>
                    <div class="share-buttons">
                        <button class="btn btn-share" data-share="copy">📋 Copiar</button>
                        <button class="btn btn-share" data-share="whatsapp">💬 WhatsApp</button>
                    </div>
                </div>` : ''}
            </div>
        `;

        UI.showModal('Vitória!', content, [
            { id: 'new-game', label: '🔄 Novo Jogo', type: 'primary', callback: () => startNewGame(state.levelId, state.mode) },
            { id: 'menu', label: '🏠 Menu', type: 'secondary', callback: () => UI.showScreen('menu') }
        ]);

        // Bind share buttons
        setTimeout(() => {
            document.querySelectorAll('[data-share]').forEach(btn => {
                btn.addEventListener('click', () => handleShare(btn.dataset.share, result));
            });
        }, 100);
    }

    function handleShare(type, result) {
        const text = state.isDaily
            ? `🎯 Caça-Palavras Diário ${state.dailyDate}\n${Levels.getLevel(result.level).icon} ${Levels.getLevel(result.level).name}\n⏱️ ${UI.formatTime(result.time)}\n🏆 ${result.score} pontos\n#CaçaPalavrasOnline`
            : `🎯 Caça-Palavras ${Levels.getLevel(result.level).name}\n⏱️ ${UI.formatTime(result.time)}\n🏆 ${result.score} pontos\n#CaçaPalavrasOnline`;

        if (type === 'copy') {
            navigator.clipboard.writeText(text).then(() => {
                UI.showToast('Resultado copiado!', 'success');
            }).catch(() => {
                UI.showToast('Erro ao copiar', 'error');
            });
        } else if (type === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    }

    // ---- Cronômetro ----

    function startTimer() {
        stopTimer();
        state.startTime = Date.now() - state.elapsedTime * 1000;
        state.timerInterval = setInterval(() => {
            if (!state.isPaused && state.isPlaying) {
                state.elapsedTime = Math.floor((Date.now() - state.startTime) / 1000);
                updateTimerDisplay();
            }
        }, 1000);
    }

    function stopTimer() {
        if (state.timerInterval) {
            clearInterval(state.timerInterval);
            state.timerInterval = null;
        }
    }

    function updateTimerDisplay() {
        const timerEl = document.getElementById('game-timer');
        if (timerEl) {
            timerEl.textContent = UI.formatTime(state.elapsedTime);
        }
    }

    // ---- Atualização de info do jogo ----

    function updateGameInfo() {
        const found = state.foundWords.size;
        const total = state.words.length;
        const percent = total > 0 ? Math.round((found / total) * 100) : 0;

        const countEl = document.getElementById('words-remaining');
        if (countEl) countEl.textContent = `${found}/${total}`;

        const progressEl = document.getElementById('progress-bar');
        if (progressEl) progressEl.style.width = `${percent}%`;

        const percentEl = document.getElementById('progress-percent');
        if (percentEl) percentEl.textContent = `${percent}%`;

        const scoreEl = document.getElementById('game-score');
        if (scoreEl) scoreEl.textContent = state.score;

        const hintsEl = document.getElementById('hints-remaining');
        if (hintsEl) hintsEl.textContent = state.hintsAllowed - state.hintsUsed;

        updateTimerDisplay();
    }

    // ---- Lista de palavras ----

    function renderWordList() {
        const container = document.getElementById('word-list');
        if (!container) return;

        let html = '';
        state.wordPositions.forEach(wp => {
            const found = wp.found;
            html += `
                <div class="word-list-item ${found ? 'found' : ''}" data-word="${wp.word}">
                    <span class="word-text">${wp.word.toUpperCase()}</span>
                    ${found ? '<span class="word-check">✓</span>' : ''}
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // ---- Dica ----

    function useHint() {
        if (!state.isPlaying || state.hintsUsed >= state.hintsAllowed) {
            UI.showToast('Sem dicas disponíveis!', 'warning');
            return;
        }

        // Encontra uma palavra não encontrada
        const unfound = state.wordPositions.filter(wp => !wp.found);
        if (unfound.length === 0) return;

        // Escolhe uma palavra aleatória
        const target = unfound[Math.floor(Math.random() * unfound.length)];

        // Revela a primeira letra da palavra
        const [dr, dc] = target.direction;
        const cell = document.querySelector(`[data-row="${target.row}"][data-col="${target.col}"]`);
        if (cell) {
            cell.classList.add('hinted');
            setTimeout(() => cell.classList.remove('hinted'), 3000);
        }

        state.hintsUsed++;
        AudioManager.playHint();
        UI.showToast(`Dica: a palavra começa em (${target.row + 1}, ${target.col + 1})`, 'info');
        updateGameInfo();
    }

    // ---- Pausar / Retomar ----

    function togglePause() {
        if (!state.isPlaying) return;
        state.isPaused = !state.isPaused;

        const overlay = document.getElementById('pause-overlay');
        if (overlay) {
            overlay.classList.toggle('active', state.isPaused);
        }

        if (state.isPaused) {
            UI.showToast('Jogo pausado', 'info', 1500);
        }
    }

    // ---- Salvar / Carregar estado ----

    function saveGameState() {
        if (!state.isPlaying) return;

        Storage.saveGame({
            mode: state.mode,
            levelId: state.levelId,
            grid: state.grid,
            gridSize: state.gridSize,
            words: state.words,
            wordPositions: state.wordPositions.map(wp => ({ ...wp })),
            foundWords: [...state.foundWords],
            elapsedTime: state.elapsedTime,
            score: state.score,
            hintsUsed: state.hintsUsed,
            errors: state.errors,
            seed: state.seed,
            isDaily: state.isDaily,
            dailyDate: state.dailyDate
        });
    }

    function loadSavedGame() {
        const saved = Storage.loadGame();
        if (!saved) return false;

        state.mode = saved.mode;
        state.levelId = saved.levelId;
        state.level = Levels.getLevel(saved.levelId);
        state.grid = saved.grid;
        state.gridSize = saved.gridSize;
        state.words = saved.words;
        state.wordPositions = saved.wordPositions.map(wp => ({ ...wp }));
        state.foundWords = new Set(saved.foundWords);
        state.elapsedTime = saved.elapsedTime || 0;
        state.score = saved.score || 0;
        state.hintsUsed = saved.hintsUsed || 0;
        state.hintsAllowed = state.level.hintsAllowed;
        state.errors = saved.errors || 0;
        state.seed = saved.seed;
        state.isDaily = saved.isDaily || false;
        state.dailyDate = saved.dailyDate;
        state.isPaused = false;
        state.isPlaying = true;

        renderBoard();
        renderWordList();
        updateGameInfo();
        startTimer();
        updateDailyBadge();

        // Re-marca células encontradas
        state.wordPositions.forEach(wp => {
            if (wp.found) {
                const [dr, dc] = wp.direction;
                for (let i = 0; i < wp.length; i++) {
                    const r = wp.row + dr * i;
                    const c = wp.col + dc * i;
                    const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                    if (cell) cell.classList.add('found');
                }
            }
        });

        UI.showScreen('game');
        return true;
    }

    // ---- Badge do modo diário ----

    function updateDailyBadge() {
        const badge = document.getElementById('daily-badge');
        if (badge) {
            if (state.isDaily) {
                badge.style.display = 'inline-flex';
                badge.textContent = `📅 ${state.dailyDate}`;
            } else {
                badge.style.display = 'none';
            }
        }
    }

    // ---- Menu state ----

    function updateMenuState() {
        const continueBtn = document.getElementById('btn-continue');
        if (continueBtn) {
            const hasSaved = Storage.hasSavedGame();
            continueBtn.style.display = hasSaved ? '' : 'none';
            continueBtn.disabled = !hasSaved;
        }

        // Atualiza seed diária
        const dailySeedEl = document.getElementById('daily-seed');
        if (dailySeedEl) {
            dailySeedEl.textContent = Generator.getDailySeedString();
        }
    }

    // ---- Nome do jogador ----

    function getPlayerName() {
        let name = localStorage.getItem('cp_player_name');
        if (!name) {
            name = 'Jogador';
        }
        return name;
    }

    function setPlayerName(name) {
        if (name && name.trim()) {
            localStorage.setItem('cp_player_name', name.trim().substring(0, 20));
        }
    }

    // ---- Abandonar jogo ----

    function abandonGame() {
        UI.showModal('Abandonar Jogo?', 'Seu progresso atual será perdido.', [
            { id: 'cancel', label: 'Cancelar', type: 'secondary', callback: () => {} },
            { id: 'confirm', label: 'Abandonar', type: 'danger', callback: () => {
                stopTimer();
                state.isPlaying = false;
                Storage.clearSavedGame();
                UI.showScreen('menu');
                updateMenuState();
            }}
        ]);
    }

    // ---- Bind events ----

    function bindEvents() {
        // Menu buttons
        document.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (!action) return;

            AudioManager.init();
            AudioManager.resume();

            switch (action) {
                case 'new-game':
                    showLevelSelect('random');
                    break;
                case 'daily-game':
                    showLevelSelect('daily');
                    break;
                case 'continue':
                    loadSavedGame();
                    break;
                case 'ranking':
                    UI.showScreen('ranking');
                    break;
                case 'stats':
                    UI.showScreen('stats');
                    break;
                case 'achievements':
                    UI.showScreen('achievements');
                    break;
                case 'settings':
                    UI.showScreen('settings');
                    loadSettings();
                    break;
                case 'tutorial':
                    UI.showScreen('tutorial');
                    break;
                case 'about':
                    UI.showScreen('about');
                    break;
                case 'back':
                    UI.showScreen('menu');
                    updateMenuState();
                    break;
                case 'pause':
                    togglePause();
                    break;
                case 'hint':
                    useHint();
                    break;
                case 'abandon':
                    abandonGame();
                    break;
                case 'theme-toggle':
                    UI.toggleTheme();
                    break;
                case 'start-level': {
                    const level = e.target.closest('[data-level]')?.dataset.level;
                    const mode = e.target.closest('[data-mode]')?.dataset.mode || 'random';
                    if (level) startNewGame(level, mode);
                    break;
                }
            }
        });

        // Settings
        const soundToggle = document.getElementById('setting-sound');
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                AudioManager.setEnabled(e.target.checked);
                Storage.saveSettings({ soundEnabled: e.target.checked });
                if (e.target.checked) AudioManager.playClick();
            });
        }

        const volumeSlider = document.getElementById('setting-volume');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                AudioManager.setVolume(parseFloat(e.target.value));
                Storage.saveSettings({ volume: parseFloat(e.target.value) });
            });
        }

        const themeSelect = document.getElementById('setting-theme');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                UI.applyTheme(e.target.value);
                Storage.saveSettings({ theme: e.target.value });
            });
        }

        const nameInput = document.getElementById('setting-name');
        if (nameInput) {
            nameInput.addEventListener('change', (e) => {
                setPlayerName(e.target.value);
            });
        }

        const resetBtn = document.getElementById('setting-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                UI.showModal('Resetar Tudo?', 'Isto apagará todas as estatísticas, recordes e conquistas. Esta ação não pode ser desfeita.', [
                    { id: 'cancel', label: 'Cancelar', type: 'secondary' },
                    { id: 'confirm', label: 'Resetar', type: 'danger', callback: () => {
                        Storage.resetAll();
                        UI.showToast('Dados resetados!', 'success');
                        setTimeout(() => window.location.reload(), 1000);
                    }}
                ]);
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (state.isPlaying && !state.isPaused) {
                    togglePause();
                } else {
                    UI.hideModal();
                }
            }
            if (e.key === ' ' && state.isPlaying) {
                e.preventDefault();
                togglePause();
            }
            if (e.key === 'h' && state.isPlaying && !state.isPaused) {
                useHint();
            }
        });

        // Salvar ao sair
        window.addEventListener('beforeunload', () => {
            if (state.isPlaying) saveGameState();
        });
    }

    // ---- Seleção de nível ----

    function showLevelSelect(mode) {
        const modal = document.getElementById('modal-overlay');
        const modalContent = document.getElementById('modal');
        if (!modal || !modalContent) return;

        const levels = Levels.getAllLevels();
        const modeLabel = mode === 'daily' ? 'Desafio Diário' : 'Novo Jogo';
        const modeIcon = mode === 'daily' ? '📅' : '🎮';

        let html = `
            <div class="level-select">
                <div class="level-select-header">
                    <span class="level-select-icon">${modeIcon}</span>
                    <h2>${modeLabel}</h2>
                    ${mode === 'daily' ? `<p class="daily-info">Desafio: ${Generator.formatDailyDate()}<br>Seed: ${Generator.getDailySeedString()}</p>` : ''}
                </div>
                <div class="level-cards">
        `;

        levels.forEach(level => {
            html += `
                <button class="level-card" data-action="start-level" data-level="${level.id}" data-mode="${mode}">
                    <div class="level-card-icon">${level.icon}</div>
                    <div class="level-card-name">${level.name}</div>
                    <div class="level-card-info">
                        ${level.gridSize}×${level.gridSize} • ${level.wordCount} palavras
                    </div>
                    <div class="level-card-desc">${level.description}</div>
                    ${mode === 'daily' ? '' : `
                        <div class="level-card-best">
                            ${Storage.getStats().bestTimes[level.id]
                                ? `⏱️ Melhor: ${UI.formatTime(Storage.getStats().bestTimes[level.id])}`
                                : 'Sem recorde'}
                        </div>
                    `}
                </button>
            `;
        });

        html += `
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="document.getElementById('modal-overlay').classList.remove('active')">Cancelar</button>
                </div>
            </div>
        `;

        modalContent.innerHTML = html;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }

    // ---- Carregar configurações ----

    function loadSettings() {
        const settings = Storage.getSettings();

        const soundToggle = document.getElementById('setting-sound');
        if (soundToggle) soundToggle.checked = settings.soundEnabled;

        const volumeSlider = document.getElementById('setting-volume');
        if (volumeSlider) volumeSlider.value = settings.volume;

        const themeSelect = document.getElementById('setting-theme');
        if (themeSelect) themeSelect.value = settings.theme;

        const nameInput = document.getElementById('setting-name');
        if (nameInput) nameInput.value = getPlayerName();

        AudioManager.setEnabled(settings.soundEnabled);
        AudioManager.setVolume(settings.volume);
    }

    return {
        init,
        startNewGame,
        loadSavedGame,
        togglePause,
        useHint,
        abandonGame,
        saveGameState,
        updateMenuState,
        getState: () => state
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
}
