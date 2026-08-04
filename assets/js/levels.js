/**
 * levels.js — Configurações de dificuldade do Caça-Palavras
 * Define tamanho do tabuleiro, número de palavras, direções permitidas
 * e pontuação para cada nível.
 */

const Levels = (() => {
    'use strict';

    // 8 direções possíveis: [deltaRow, deltaCol]
    const DIRECTIONS = {
        RIGHT:       [0, 1],
        LEFT:        [0, -1],
        DOWN:        [1, 0],
        UP:          [-1, 0],
        DOWN_RIGHT:  [1, 1],
        DOWN_LEFT:   [1, -1],
        UP_RIGHT:    [-1, 1],
        UP_LEFT:     [-1, -1]
    };

    const CONFIG = {
        facil: {
            id: 'facil',
            name: 'Fácil',
            icon: '🟢',
            gridSize: 10,
            wordCount: 8,
            minWordLength: 3,
            maxWordLength: 7,
            // Fácil: apenas horizontal e vertical (sem invertidas para começar)
            directions: [
                DIRECTIONS.RIGHT,
                DIRECTIONS.DOWN,
                DIRECTIONS.DOWN_RIGHT,
                DIRECTIONS.DOWN_LEFT
            ],
            reversedChance: 0.2,  // 20% de chance de inverter
            baseScore: 10,
            timeBonus: 2,
            hintsAllowed: 3,
            description: 'Tabuleiro 10×10 com 8 palavras curtas. Ideal para iniciantes.'
        },

        medio: {
            id: 'medio',
            name: 'Médio',
            icon: '🟡',
            gridSize: 15,
            wordCount: 15,
            minWordLength: 4,
            maxWordLength: 10,
            // Médio: todas as direções exceto diagonais invertidas
            directions: [
                DIRECTIONS.RIGHT,
                DIRECTIONS.LEFT,
                DIRECTIONS.DOWN,
                DIRECTIONS.UP,
                DIRECTIONS.DOWN_RIGHT,
                DIRECTIONS.DOWN_LEFT,
                DIRECTIONS.UP_RIGHT,
                DIRECTIONS.UP_LEFT
            ],
            reversedChance: 0.4,  // 40% de chance de inverter
            baseScore: 25,
            timeBonus: 5,
            hintsAllowed: 2,
            description: 'Tabuleiro 15×15 com 15 palavras. Desafio equilibrado.'
        },

        dificil: {
            id: 'dificil',
            name: 'Difícil',
            icon: '🔴',
            gridSize: 20,
            wordCount: 25,
            minWordLength: 5,
            maxWordLength: 15,
            // Difícil: todas as 8 direções
            directions: [
                DIRECTIONS.RIGHT,
                DIRECTIONS.LEFT,
                DIRECTIONS.DOWN,
                DIRECTIONS.UP,
                DIRECTIONS.DOWN_RIGHT,
                DIRECTIONS.DOWN_LEFT,
                DIRECTIONS.UP_RIGHT,
                DIRECTIONS.UP_LEFT
            ],
            reversedChance: 0.5,  // 50% de chance de inverter
            baseScore: 50,
            timeBonus: 10,
            hintsAllowed: 1,
            description: 'Tabuleiro 20×20 com 25 palavras longas. Para especialistas.'
        }
    };

    const LEVEL_ORDER = ['facil', 'medio', 'dificil'];

    /**
     * Retorna a configuração de um nível.
     * @param {string} id - ID do nível ('facil', 'medio', 'dificil').
     * @returns {object}
     */
    function getLevel(id) {
        return CONFIG[id] || CONFIG.facil;
    }

    /**
     * Retorna todos os níveis em ordem.
     * @returns {object[]}
     */
    function getAllLevels() {
        return LEVEL_ORDER.map(id => CONFIG[id]);
    }

    /**
     * Retorna os IDs dos níveis em ordem.
     * @returns {string[]}
     */
    function getLevelIds() {
        return [...LEVEL_ORDER];
    }

    /**
     * Calcula a pontuação de uma partida.
     * @param {string} levelId - ID do nível.
     * @param {number} wordsFound - Palavras encontradas.
     * @param {number} totalWords - Total de palavras.
     * @param {number} timeSeconds - Tempo em segundos.
     * @param {number} hintsUsed - Dicas usadas.
     * @returns {object} { score, breakdown }
     */
    function calculateScore(levelId, wordsFound, totalWords, timeSeconds, hintsUsed = 0) {
        const level = getLevel(levelId);
        const wordScore = wordsFound * level.baseScore;
        const completionBonus = wordsFound === totalWords ? level.baseScore * 5 : 0;

        // Bônus de tempo: quanto mais rápido, mais pontos
        const targetTime = totalWords * 30; // 30s por palavra como meta
        const timeSaved = Math.max(0, targetTime - timeSeconds);
        const timeBonus = Math.floor(timeSaved * level.timeBonus);

        // Penalidade por dicas
        const hintPenalty = hintsUsed * (level.baseScore / 2);

        const score = Math.max(0, wordScore + completionBonus + timeBonus - hintPenalty);

        return {
            score,
            breakdown: {
                words: wordScore,
                completion: completionBonus,
                time: timeBonus,
                hints: -hintPenalty
            }
        };
    }

    return {
        DIRECTIONS,
        getLevel,
        getAllLevels,
        getLevelIds,
        calculateScore
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Levels;
}
