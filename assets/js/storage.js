/**
 * storage.js — Sistema de persistência via LocalStorage
 * Gerencia: estatísticas, ranking, conquistas, configurações e save/resume.
 */

const Storage = (() => {
    'use strict';

    const PREFIX = 'cp_'; // caca-palavras
    const KEYS = {
        stats: `${PREFIX}stats`,
        ranking: `${PREFIX}ranking`,
        achievements: `${PREFIX}achievements`,
        settings: `${PREFIX}settings`,
        savedGame: `${PREFIX}saved_game`,
        recentWords: `${PREFIX}recent_words`
    };

    // ---- Helper: Safe JSON ----

    function read(key, fallback = null) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            console.warn(`Storage: erro ao ler ${key}`, e);
            return fallback;
        }
    }

    function write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn(`Storage: erro ao escrever ${key}`, e);
            return false;
        }
    }

    function remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    }

    // ---- Estatísticas ----

    const DEFAULT_STATS = {
        totalGames: 0,
        totalWins: 0,
        totalWordsFound: 0,
        bestTimes: { facil: null, medio: null, dificil: null },
        bestScores: { facil: 0, medio: 0, dificil: 0 },
        avgTimes: { facil: [], medio: [], dificil: [] },
        maxStreak: 0,
        currentStreak: 0,
        levelPlayed: { facil: 0, medio: 0, dificil: 0 },
        dailyPlayed: 0,
        dailyWon: 0,
        perfectGames: 0,
        flawlessGames: 0
    };

    function getStats() {
        return { ...DEFAULT_STATS, ...read(KEYS.stats, {}) };
    }

    function saveStats(stats) {
        return write(KEYS.stats, stats);
    }

    function recordGame(result) {
        const stats = getStats();
        stats.totalGames++;
        stats.levelPlayed[result.level] = (stats.levelPlayed[result.level] || 0) + 1;

        if (result.won) {
            stats.totalWins++;
            stats.currentStreak++;
            stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
            stats.totalWordsFound += result.wordsFound;

            if (result.perfect) stats.perfectGames++;
            if (result.flawless) stats.flawlessGames++;

            // Atualiza melhores tempos
            const best = stats.bestTimes[result.level];
            if (best === null || result.time < best) {
                stats.bestTimes[result.level] = result.time;
            }

            // Atualiza melhores pontuações
            if (result.score > (stats.bestScores[result.level] || 0)) {
                stats.bestScores[result.level] = result.score;
            }

            // Atualiza tempo médio (mantém últimos 50)
            stats.avgTimes[result.level].push(result.time);
            if (stats.avgTimes[result.level].length > 50) {
                stats.avgTimes[result.level].shift();
            }

            if (result.isDaily) {
                stats.dailyPlayed++;
                stats.dailyWon++;
            }
        } else {
            stats.currentStreak = 0;
            if (result.isDaily) stats.dailyPlayed++;
        }

        saveStats(stats);
        return stats;
    }

    function getFavoriteLevel() {
        const stats = getStats();
        const levels = Object.entries(stats.levelPlayed);
        if (levels.every(([, v]) => v === 0)) return null;
        levels.sort((a, b) => b[1] - a[1]);
        return levels[0][0];
    }

    function getAverageTime(level) {
        const stats = getStats();
        const times = stats.avgTimes[level] || [];
        if (times.length === 0) return null;
        return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    }

    // ---- Ranking ----

    function getRanking() {
        return read(KEYS.ranking, { facil: [], medio: [], dificil: [] });
    }

    function addToRanking(entry) {
        const ranking = getRanking();
        const list = ranking[entry.level] || [];

        list.push({
            name: entry.name || 'Anônimo',
            score: entry.score,
            time: entry.time,
            wordsFound: entry.wordsFound,
            totalWords: entry.totalWords,
            date: new Date().toISOString(),
            level: entry.level,
            isDaily: entry.isDaily || false
        });

        // Ordena por pontuação (desc) e tempo (asc)
        list.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.time - b.time;
        });

        // Mantém apenas top 50
        ranking[entry.level] = list.slice(0, 50);
        write(KEYS.ranking, ranking);
        return ranking;
    }

    function getRankingForLevel(level) {
        const ranking = getRanking();
        return ranking[level] || [];
    }

    function getRankPosition(level, score, time) {
        const list = getRankingForLevel(level);
        let pos = 1;
        for (const entry of list) {
            if (entry.score > score || (entry.score === score && entry.time < time)) {
                pos++;
            }
        }
        return pos;
    }

    // ---- Conquistas ----

    const ACHIEVEMENTS_DEF = [
        { id: 'first_win', name: 'Primeira Vitória', description: 'Vença seu primeiro jogo', icon: '🏆' },
        { id: 'wins_10', name: 'Veterano', description: 'Vença 10 jogos', icon: '🎖️' },
        { id: 'wins_50', name: 'Mestre', description: 'Vença 50 jogos', icon: '👑' },
        { id: 'wins_100', name: 'Lenda', description: 'Vença 100 jogos', icon: '💎' },
        { id: 'flawless', name: 'Sem Erros', description: 'Vença sem nenhum erro', icon: '✨' },
        { id: 'perfect', name: 'Jogo Perfeito', description: 'Encontre todas as palavras sem dicas', icon: '⭐' },
        { id: 'speed_demon', name: 'Velocista', description: 'Vença em menos de 60 segundos', icon: '⚡' },
        { id: 'speed_master', name: 'Relâmpago', description: 'Vença em menos de 30 segundos', icon: '🌩️' },
        { id: 'streak_5', name: 'Em Chamas', description: 'Vença 5 jogos seguidos', icon: '🔥' },
        { id: 'streak_10', name: 'Imparável', description: 'Vença 10 jogos seguidos', icon: '🚀' },
        { id: 'daily_first', name: 'Desafio Diário', description: 'Complete o desafio diário', icon: '📅' },
        { id: 'all_levels', name: 'Completo', description: 'Vença em todos os níveis', icon: '🎯' },
        { id: 'word_master', name: 'Caçador', description: 'Encontre 500 palavras no total', icon: '🔍' },
        { id: 'word_legend', name: 'Caçador Lendário', description: 'Encontre 2000 palavras no total', icon: '🔬' }
    ];

    function getAchievements() {
        const unlocked = read(KEYS.achievements, []);
        return ACHIEVEMENTS_DEF.map(def => ({
            ...def,
            unlocked: unlocked.includes(def.id)
        }));
    }

    function unlockAchievement(id) {
        const unlocked = read(KEYS.achievements, []);
        if (unlocked.includes(id)) return false;
        unlocked.push(id);
        write(KEYS.achievements, unlocked);
        return true;
    }

    function checkAchievements(gameResult) {
        const newlyUnlocked = [];
        const stats = getStats();

        // Primeira vitória
        if (gameResult.won && stats.totalWins === 1) {
            if (unlockAchievement('first_win')) newlyUnlocked.push('first_win');
        }
        // 10 vitórias
        if (stats.totalWins >= 10) {
            if (unlockAchievement('wins_10')) newlyUnlocked.push('wins_10');
        }
        // 50 vitórias
        if (stats.totalWins >= 50) {
            if (unlockAchievement('wins_50')) newlyUnlocked.push('wins_50');
        }
        // 100 vitórias
        if (stats.totalWins >= 100) {
            if (unlockAchievement('wins_100')) newlyUnlocked.push('wins_100');
        }
        // Sem erros
        if (gameResult.won && gameResult.flawless) {
            if (unlockAchievement('flawless')) newlyUnlocked.push('flawless');
        }
        // Jogo perfeito
        if (gameResult.won && gameResult.perfect) {
            if (unlockAchievement('perfect')) newlyUnlocked.push('perfect');
        }
        // Velocista (< 60s)
        if (gameResult.won && gameResult.time < 60) {
            if (unlockAchievement('speed_demon')) newlyUnlocked.push('speed_demon');
        }
        // Relâmpago (< 30s)
        if (gameResult.won && gameResult.time < 30) {
            if (unlockAchievement('speed_master')) newlyUnlocked.push('speed_master');
        }
        // Sequência de 5
        if (stats.currentStreak >= 5) {
            if (unlockAchievement('streak_5')) newlyUnlocked.push('streak_5');
        }
        // Sequência de 10
        if (stats.currentStreak >= 10) {
            if (unlockAchievement('streak_10')) newlyUnlocked.push('streak_10');
        }
        // Desafio diário
        if (gameResult.won && gameResult.isDaily) {
            if (unlockAchievement('daily_first')) newlyUnlocked.push('daily_first');
        }
        // Todos os níveis
        const levelWins = ['facil', 'medio', 'dificil'].every(l =>
            stats.bestTimes[l] !== null
        );
        if (levelWins) {
            if (unlockAchievement('all_levels')) newlyUnlocked.push('all_levels');
        }
        // 500 palavras
        if (stats.totalWordsFound >= 500) {
            if (unlockAchievement('word_master')) newlyUnlocked.push('word_master');
        }
        // 2000 palavras
        if (stats.totalWordsFound >= 2000) {
            if (unlockAchievement('word_legend')) newlyUnlocked.push('word_legend');
        }

        return newlyUnlocked.map(id =>
            ACHIEVEMENTS_DEF.find(a => a.id === id)
        ).filter(Boolean);
    }

    function getAchievementProgress() {
        const achievements = getAchievements();
        const unlocked = achievements.filter(a => a.unlocked).length;
        return { unlocked, total: achievements.length, achievements };
    }

    // ---- Configurações ----

    const DEFAULT_SETTINGS = {
        soundEnabled: true,
        volume: 0.5,
        theme: 'dark',
        showTimer: true,
        showHints: true,
        highlightFound: true,
        language: 'pt-BR'
    };

    function getSettings() {
        return { ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) };
    }

    function saveSettings(settings) {
        const current = getSettings();
        const merged = { ...current, ...settings };
        write(KEYS.settings, merged);
        return merged;
    }

    // ---- Save / Resume ----

    function saveGame(gameState) {
        return write(KEYS.savedGame, {
            ...gameState,
            savedAt: Date.now()
        });
    }

    function loadGame() {
        return read(KEYS.savedGame, null);
    }

    function clearSavedGame() {
        return remove(KEYS.savedGame);
    }

    function hasSavedGame() {
        return loadGame() !== null;
    }

    // ---- Palavras recentes (evita repetição) ----

    function getRecentWords() {
        return read(KEYS.recentWords, []);
    }

    function addRecentWords(words) {
        const recent = getRecentWords();
        recent.push(...words);
        // Mantém as últimas 200 palavras
        if (recent.length > 200) {
            recent.splice(0, recent.length - 200);
        }
        write(KEYS.recentWords, recent);
    }

    // ---- Reset ----

    function resetAll() {
        Object.values(KEYS).forEach(key => remove(key));
    }

    return {
        // Stats
        getStats,
        recordGame,
        getFavoriteLevel,
        getAverageTime,
        // Ranking
        getRanking,
        addToRanking,
        getRankingForLevel,
        getRankPosition,
        // Achievements
        getAchievements,
        getAchievementProgress,
        checkAchievements,
        // Settings
        getSettings,
        saveSettings,
        // Save/Resume
        saveGame,
        loadGame,
        clearSavedGame,
        hasSavedGame,
        // Recent words
        getRecentWords,
        addRecentWords,
        // Reset
        resetAll
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}
