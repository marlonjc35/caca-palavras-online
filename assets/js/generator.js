/**
 * generator.js — Algoritmo de geração procedural de tabuleiros de Caça-Palavras
 *
 * Características:
 * - PRNG seeded (Mulberry32) para geração reproduzível
 * - Modo Aleatório: seed aleatória a cada partida
 * - Modo Diário: seed baseada na data (mesmo desafio para todos no mesmo dia)
 * - 8 direções de放置 (horizontal, vertical, diagonal, normal, invertida)
 * - Preenchimento inteligente de células vazias
 * - Algoritmo de backtracking para maximar palavras colocadas
 * - Interseção inteligente de palavras (cruzamentos)
 */

const Generator = (() => {
    'use strict';

    // Alfabeto português (sem acentos) com frequências aproximadas
    const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
    const LETTER_FREQUENCY = {
        a: 14.6, b: 1.0, c: 3.9, d: 5.0, e: 12.6, f: 1.0, g: 1.3, h: 0.5,
        i: 6.3, j: 0.4, k: 0.1, l: 2.8, m: 2.6, n: 6.5, o: 9.7, p: 2.5,
        q: 0.3, r: 6.5, s: 6.8, t: 4.3, u: 3.6, v: 1.7, w: 0.1, x: 0.2,
        y: 0.1, z: 0.3
    };

    // Constrói array ponderado de letras
    const WEIGHTED_LETTERS = (() => {
        const arr = [];
        for (const [letter, weight] of Object.entries(LETTER_FREQUENCY)) {
            const count = Math.round(weight * 10);
            for (let i = 0; i < count; i++) arr.push(letter);
        }
        return arr;
    })();

    /**
     * PRNG Mulberry32 — rápido, deterministic, bom para jogos.
     * @param {number} seed
     * @returns {function} função que retorna float [0, 1)
     */
    function mulberry32(seed) {
        let s = seed >>> 0;
        return function () {
            s = (s + 0x6D2B79F5) >>> 0;
            let t = s;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    /**
     * Hash de string para número (para gerar seeds de strings).
     * @param {string} str
     * @returns {number}
     */
    function hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Converte para 32-bit
        }
        return Math.abs(hash);
    }

    /**
     * Gera uma seed para o modo diário baseada na data.
     * Formato: YYYYMMDD -> seed numérica
     * @param {Date} date - Data para gerar a seed (padrão: hoje)
     * @returns {number}
     */
    function getDailySeed(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return hashString(`${year}${month}${day}`);
    }

    /**
     * Gera uma seed aleatória.
     * @returns {number}
     */
    function getRandomSeed() {
        return Math.floor(Math.random() * 4294967296);
    }

    /**
     * Cria uma instância de RNG com seed.
     * @param {number} seed
     * @returns {object} { next, int, pick, shuffle }
     */
    function createRNG(seed) {
        const rng = mulberry32(seed);

        return {
            next: rng,
            seed,
            /** Inteiro entre min (inclusive) e max (exclusive) */
            int(min, max) {
                return Math.floor(rng() * (max - min)) + min;
            },
            /** Escolhe um elemento aleatório do array */
            pick(arr) {
                return arr[Math.floor(rng() * arr.length)];
            },
            /** Embaralha array (Fisher-Yates com PRNG) */
            shuffle(arr) {
                const result = [...arr];
                for (let i = result.length - 1; i > 0; i--) {
                    const j = Math.floor(rng() * (i + 1));
                    [result[i], result[j]] = [result[j], result[i]];
                }
                return result;
            },
            /** Float entre 0 e 1 */
            float() {
                return rng();
            }
        };
    }

    /**
     * Tenta colocar uma palavra no tabuleiro em uma direção específica.
     * Verifica se há espaço e se as células existentes são compatíveis (cruzamentos).
     * @param {string[][]} grid - Matriz do tabuleiro
     * @param {string} word - Palavra a colocar
     * @param {number} row - Linha inicial
     * @param {number} col - Coluna inicial
     * @param {number[]} direction - [deltaRow, deltaCol]
     * @param {number} gridSize - Tamanho do tabuleiro
     * @returns {boolean} true se colocou com sucesso
     */
    function tryPlaceWord(grid, word, row, col, direction, gridSize) {
        const [dr, dc] = direction;
        const len = word.length;

        // Verifica limites
        const endRow = row + dr * (len - 1);
        const endCol = col + dc * (len - 1);
        if (endRow < 0 || endRow >= gridSize || endCol < 0 || endCol >= gridSize) {
            return false;
        }

        // Verifica compatibilidade das células
        let hasIntersection = false;
        for (let i = 0; i < len; i++) {
            const r = row + dr * i;
            const c = col + dc * i;
            const existing = grid[r][c];

            if (existing !== '') {
                if (existing !== word[i]) {
                    return false; // Conflito de letras
                }
                hasIntersection = true;
            }

            // Verifica se a célula antes da palavra está vazia (evita colisão)
            if (i === 0) {
                const prevR = row - dr;
                const prevC = col - dc;
                if (prevR >= 0 && prevR < gridSize && prevC >= 0 && prevC < gridSize) {
                    if (grid[prevR][prevC] !== '') return false;
                }
            }
            // Verifica se a célula depois da palavra está vazia
            if (i === len - 1) {
                const nextR = endRow + dr;
                const nextC = endCol + dc;
                if (nextR >= 0 && nextR < gridSize && nextC >= 0 && nextC < gridSize) {
                    if (grid[nextR][nextC] !== '') return false;
                }
            }
        }

        // Coloca a palavra
        for (let i = 0; i < len; i++) {
            const r = row + dr * i;
            const c = col + dc * i;
            grid[r][c] = word[i];
        }

        return true;
    }

    /**
     * Encontra todas as posições válidas para uma palavra em todas as direções.
     * @param {string[][]} grid
     * @param {string} word
     * @param {number[][]} directions
     * @param {number} gridSize
     * @param {object} rng - Instância de PRNG
     * @returns {object[]} Lista de tentativas válidas {row, col, direction, intersections}
     */
    function findValidPlacements(grid, word, directions, gridSize, rng) {
        const placements = [];
        const shuffledDirections = rng.shuffle(directions);

        for (const direction of shuffledDirections) {
            for (let row = 0; row < gridSize; row++) {
                for (let col = 0; col < gridSize; col++) {
                    const [dr, dc] = direction;
                    const endRow = row + dr * (word.length - 1);
                    const endCol = col + dc * (word.length - 1);

                    if (endRow < 0 || endRow >= gridSize || endCol < 0 || endCol >= gridSize) {
                        continue;
                    }

                    // Conta interseções
                    let intersections = 0;
                    let canPlace = true;
                    for (let i = 0; i < word.length; i++) {
                        const r = row + dr * i;
                        const c = col + dc * i;
                        const existing = grid[r][c];
                        if (existing !== '') {
                            if (existing !== word[i]) {
                                canPlace = false;
                                break;
                            }
                            intersections++;
                        }
                    }

                    // Verifica células adjacentes ao início e fim
                    if (canPlace) {
                        const prevR = row - dr;
                        const prevC = col - dc;
                        if (prevR >= 0 && prevR < gridSize && prevC >= 0 && prevC < gridSize) {
                            if (grid[prevR][prevC] !== '') canPlace = false;
                        }
                    }
                    if (canPlace) {
                        const nextR = endRow + dr;
                        const nextC = endCol + dc;
                        if (nextR >= 0 && nextR < gridSize && nextC >= 0 && nextC < gridSize) {
                            if (grid[nextR][nextC] !== '') canPlace = false;
                        }
                    }

                    if (canPlace) {
                        placements.push({ row, col, direction, intersections });
                    }
                }
            }
        }

        return placements;
    }

    /**
     * Preenche células vazias com letras aleatórias ponderadas.
     * @param {string[][]} grid
     * @param {number} gridSize
     * @param {object} rng
     */
    function fillEmptyCells(grid, gridSize, rng) {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (grid[row][col] === '') {
                    grid[row][col] = WEIGHTED_LETTERS[rng.int(0, WEIGHTED_LETTERS.length)];
                }
            }
        }
    }

    /**
     * Gera um tabuleiro completo de caça-palavras.
     *
     * @param {object} config - Configuração do nível (de Levels.getLevel)
     * @param {string[]} words - Palavras para colocar no tabuleiro
     * @param {number} seed - Seed para geração reproduzível
     * @returns {object} { grid, placedWords, unplacedWords, seed }
     */
    function generate(config, words, seed) {
        const rng = createRNG(seed);
        const gridSize = config.gridSize;

        // Inicializa grid vazio
        const grid = Array.from({ length: gridSize }, () =>
            Array.from({ length: gridSize }, () => '')
        );

        const placedWords = [];
        const unplacedWords = [];
        const wordPositions = [];

        // Ordena palavras por tamanho (maiores primeiro) para melhor aproveitamento
        const sortedWords = [...words].sort((a, b) => b.length - a.length);

        for (const word of sortedWords) {
            const placements = findValidPlacements(grid, word, config.directions, gridSize, rng);

            if (placements.length === 0) {
                unplacedWords.push(word);
                continue;
            }

            // Prefere posições com interseções (cruzamentos)
            placements.sort((a, b) => b.intersections - a.intersections);

            // Pega as melhores posições e escolhe aleatoriamente entre elas
            const topPlacements = placements.filter(p => p.intersections === placements[0].intersections);
            const chosen = topPlacements.length > 0
                ? topPlacements[rng.int(0, topPlacements.length)]
                : placements[0];

            // Decide se inverte a palavra
            let actualWord = word;
            if (rng.float() < config.reversedChance) {
                actualWord = word.split('').reverse().join('');
            }

            // Re-verifica se a palavra invertida cabe na posição escolhida
            const placed = tryPlaceWord(grid, actualWord, chosen.row, chosen.col, chosen.direction, gridSize);

            if (placed) {
                placedWords.push(word); // Guarda a palavra original (não invertida)
                wordPositions.push({
                    word,
                    row: chosen.row,
                    col: chosen.col,
                    direction: chosen.direction,
                    reversed: actualWord !== word,
                    length: word.length
                });
            } else {
                // Tenta novamente sem inverter
                if (tryPlaceWord(grid, word, chosen.row, chosen.col, chosen.direction, gridSize)) {
                    placedWords.push(word);
                    wordPositions.push({
                        word,
                        row: chosen.row,
                        col: chosen.col,
                        direction: chosen.direction,
                        reversed: false,
                        length: word.length
                    });
                } else {
                    unplacedWords.push(word);
                }
            }
        }

        // Preenche células vazias
        fillEmptyCells(grid, gridSize, rng);

        return {
            grid,
            placedWords,
            unplacedWords,
            wordPositions,
            seed,
            gridSize,
            config
        };
    }

    /**
     * Gera um novo jogo no modo aleatório.
     * @param {object} config - Configuração do nível
     * @param {string[]} words - Palavras selecionadas
     * @returns {object} Resultado da geração
     */
    function generateRandom(config, words) {
        const seed = getRandomSeed();
        return generate(config, words, seed);
    }

    /**
     * Gera um jogo no modo diário (seed baseada na data).
     * @param {object} config - Configuração do nível
     * @param {string[]} words - Palavras selecionadas
     * @param {Date} date - Data (padrão: hoje)
     * @returns {object} Resultado da geração
     */
    function generateDaily(config, words, date = new Date()) {
        const seed = getDailySeed(date);
        // Combina a seed diária com o nível para diferentes tabuleiros por nível
        const levelSeed = seed + hashString(config.id);
        return generate(config, words, levelSeed);
    }

    /**
     * Verifica se uma seleção de células forma uma palavra válida.
     * @param {string[][]} grid - Matriz do tabuleiro
     * @param {Array<{row: number, col: number}>} cells - Células selecionadas em ordem
     * @param {object[]} wordPositions - Posições das palavras no tabuleiro
     * @returns {object|null} A palavra encontrada ou null
     */
    function checkSelection(grid, cells, wordPositions) {
        if (cells.length < 2) return null;

        // Constrói a string da seleção
        const selectedWord = cells.map(c => grid[c.row][c.col]).join('');

        // Verifica se forma uma palavra válida
        for (const wp of wordPositions) {
            if (wp.found) continue;

            // Constrói as células esperadas da palavra
            const [dr, dc] = wp.direction;
            const expectedCells = [];
            for (let i = 0; i < wp.length; i++) {
                expectedCells.push({
                    row: wp.row + dr * i,
                    col: wp.col + dc * i
                });
            }

            // Constrói a palavra esperada
            const expectedWord = expectedCells.map(c => grid[c.row][c.col]).join('');
            const reversedWord = expectedWord.split('').reverse().join('');

            // Verifica se a seleção corresponde (em qualquer direção)
            if (selectedWord === expectedWord || selectedWord === reversedWord) {
                // Verifica se as células correspondem (em qualquer ordem)
                const cellSet = new Set(cells.map(c => `${c.row},${c.col}`));
                const expectedSet = new Set(expectedCells.map(c => `${c.row},${c.col}`));

                if (cellSet.size === expectedSet.size) {
                    let allMatch = true;
                    for (const key of cellSet) {
                        if (!expectedSet.has(key)) {
                            allMatch = false;
                            break;
                        }
                    }
                    if (allMatch) {
                        return wp;
                    }
                }
            }
        }

        return null;
    }

    /**
     * Retorna a data formatada para o modo diário.
     * @param {Date} date
     * @returns {string} Formato: "DD/MM/YYYY"
     */
    function formatDailyDate(date = new Date()) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    /**
     * Retorna a seed diária como string para exibição.
     * @param {Date} date
     * @returns {string}
     */
    function getDailySeedString(date = new Date()) {
        const seed = getDailySeed(date);
        return `#${seed.toString(36).toUpperCase()}`;
    }

    return {
        generate,
        generateRandom,
        generateDaily,
        checkSelection,
        getDailySeed,
        getRandomSeed,
        formatDailyDate,
        getDailySeedString,
        createRNG,
        hashString
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Generator;
}
