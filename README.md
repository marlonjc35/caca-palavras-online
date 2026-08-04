# 🎯 Caça-Palavras Online

# 🌐 Demonstração Online
https://caca-palavras-online-black.vercel.app

# 📂 Código Fonte
https://github.com/marlonjc35/caca-palavras-online

---

## 📝 Descrição

Jogo de **Caça-Palavras** profissional, gratuito e em português, com tabuleiros gerados proceduralmente. Cada partida é única — o algoritmo seleciona palavras aleatoriamente de um banco com mais de 1.000 palavras em 27 categorias e posiciona-as em 8 direções diferentes (horizontal, vertical, diagonal, normal e invertida).

O jogo oferece dois modos:
- **Modo Aleatório**: cada partida gera um tabuleiro diferente.
- **Modo Diário**: todos os jogadores recebem o mesmo desafio do dia (estilo Wordle), incentivando competição e compartilhamento de resultados.

## 📸 Screenshots

> *Adicione screenshots aqui após o deploy.*

| Menu Principal | Tabuleiro de Jogo | Vitória |
|---|---|---|
| ![Menu](assets/screenshots/menu.png) | ![Game](assets/screenshots/game.png) | ![Victory](assets/screenshots/victory.png) |

## 🛠️ Tecnologias

- **HTML5** — Estrutura semântica e acessível
- **CSS3** — Variáveis CSS, Grid, Flexbox, animações, glassmorphism
- **JavaScript ES6+** — Modules, IIFE, classes, async/await
- **Web Audio API** — Sons sintetizados (sem arquivos externos)
- **PWA** — manifest.json + service-worker.js (funciona offline)
- **LocalStorage** — Persistência de dados sem backend

### ❌ Não utilizados
Bootstrap, Tailwind, React, Vue, Angular — 100% JavaScript puro.

## 🚀 Como Executar

### Localmente
```bash
# Clone o repositório
git clone https://github.com/marlonjc35/caca-palavras-online.git

# Entre no diretório
cd caca-palavras-online

# Abra o index.html no navegador
# Ou use um servidor local:
python -m http.server 8000
# Acesse: http://localhost:8000
```

### Deploy na Vercel
```bash
# Instale a CLI da Vercel (se necessário)
npm i -g vercel

# Deploy
vercel
```

## ✨ Funcionalidades

### Jogabilidade
- ✅ Tabuleiros gerados proceduralmente (nunca se repetem)
- ✅ 8 direções: horizontal, vertical, diagonal (normal e invertida)
- ✅ Seleção por mouse (clique e arraste) e toque (touch)
- ✅ Cronômetro em tempo real
- ✅ Sistema de pontuação com bônus de tempo
- ✅ Dicas limitadas por nível
- ✅ Pausar/retomar jogo
- ✅ Salvar progresso automaticamente (continuar jogo)

### Modos de Jogo
- ✅ **Modo Aleatório** — tabuleiro único a cada partida
- ✅ **Modo Diário** — mesmo desafio para todos (seed baseada na data)
- ✅ Compartilhamento de resultados do desafio diário

### Níveis de Dificuldade
| Nível | Tabuleiro | Palavras | Tamanho | Direções |
|---|---|---|---|---|
| 🟢 Fácil | 10×10 | 8 | Curtas (3-7) | 4 direções |
| 🟡 Médio | 15×15 | 15 | Médias (4-10) | 8 direções |
| 🔴 Difícil | 20×20 | 25 | Longas (5-15) | 8 direções |

### Banco de Palavras
- ✅ Mais de **1.000 palavras** em português (sem acentuação)
- ✅ **27 categorias**: Animais, Países, Estados, Cidades, Frutas, Legumes, Verduras, Profissões, Esportes, Tecnologia, Ciência, História, Corpo Humano, Música, Natureza, Matemática, Português, Objetos, Veículos, Empresas, Marcas, Programação, Internet, Astronomia, Mitologia, Culinária e mais
- ✅ Seleção aleatória com histórico anti-repetição

### Estatísticas
- ✅ Jogos realizados, vitórias, taxa de vitória
- ✅ Melhor tempo e melhor pontuação por nível
- ✅ Tempo médio por nível
- ✅ Maior sequência de vitórias
- ✅ Total de palavras encontradas
- ✅ Nível favorito
- ✅ Participações e vitórias no desafio diário

### Ranking
- ✅ Ranking local separado por dificuldade
- ✅ Top 50 por nível
- ✅ Ordenação por pontuação e tempo

### Conquistas
- ✅ 14 conquistas desbloqueáveis
- ✅ Primeira vitória, 10/50/100 vitórias
- ✅ Sem erros, jogo perfeito
- ✅ Velocista (< 60s), Relâmpago (< 30s)
- ✅ Sequências de 5 e 10 vitórias
- ✅ Desafio diário, todos os níveis
- ✅ 500 e 2000 palavras encontradas

### Interface
- ✅ **Dark Mode** e **Light Mode** (alternância instantânea)
- ✅ Visual premium com glassmorphism e gradientes
- ✅ Animações suaves (partículas, confete, efeitos de palavra encontrada)
- ✅ Totalmente responsivo (desktop, tablet, celular)
- ✅ Sons sintetizados via Web Audio API (clique, acerto, erro, vitória)
- ✅ Navegação por teclado (Espaço = pausar, H = dica, Esc = fechar)
- ✅ ARIA labels e contraste adequado para acessibilidade

### PWA
- ✅ Instalável no celular e desktop
- ✅ Funciona **totalmente offline** após o primeiro carregamento
- ✅ manifest.json com ícones e atalhos

### SEO
- ✅ Meta tags otimizadas
- ✅ Open Graph e Twitter Cards
- ✅ Schema.org (WebApplication)
- ✅ robots.txt e sitemap.xml
- ✅ Preparado para Lighthouse 95+

## 🏗️ Arquitetura

```
caca-palavras-online/
├── index.html              # Estrutura HTML, telas e SEO
├── manifest.json           # Configuração PWA
├── service-worker.js       # Cache offline (PWA)
├── robots.txt              # SEO
├── sitemap.xml             # SEO
├── LICENSE                 # Licença MIT
├── README.md               # Este arquivo
└── assets/
    ├── css/
    │   └── style.css       # Estilos, temas, responsividade
    ├── js/
    │   ├── dictionary.js   # Banco de palavras (27 categorias, 1000+ palavras)
    │   ├── levels.js       # Configurações de dificuldade (Fácil, Médio, Difícil)
    │   ├── generator.js    # Algoritmo de geração procedural com seed
    │   ├── storage.js      # LocalStorage: stats, ranking, conquistas, settings
    │   ├── audio.js        # Web Audio API: sons sintetizados
    │   ├── ui.js           # Telas, tema, partículas, toasts, modais
    │   └── game.js         # Controlador principal: tabuleiro, input, fluxo
    ├── images/
    │   └── icons/          # Favicon SVG e ícones PWA
    ├── sounds/             # (vazio — sons são sintetizados)
    └── screenshots/         # Screenshots para o README
```

### Padrão de Arquitetura

O projeto utiliza o padrão **Module Pattern** (IIFE) em todos os módulos JavaScript:

```javascript
const Module = (() => {
    'use strict';
    // Estado privado
    // Funções privadas
    return { /* API pública */ };
})();
```

Cada módulo é independente e expõe apenas sua API pública:

| Módulo | Responsabilidade |
|---|---|
| `Dictionary` | Banco de palavras e seleção aleatória |
| `Levels` | Configurações de dificuldade e pontuação |
| `Generator` | Geração procedural de tabuleiros com seed |
| `Storage` | Persistência via LocalStorage |
| `AudioManager` | Síntese de efeitos sonoros |
| `UI` | Gerenciamento de telas e efeitos visuais |
| `Game` | Controlador principal do jogo |

## 🧮 Algoritmo de Geração Procedural

O algoritmo de geração é o coração do jogo, garantindo tabuleiros únicos e reproduzíveis.

### PRNG (Pseudo-Random Number Generator)

Utiliza o algoritmo **Mulberry32** — rápido, determinístico e com boa distribuição estatística:

```javascript
function mulberry32(seed) {
    let s = seed >>> 0;
    return function() {
        s = (s + 0x6D2B79F5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
```

### Seed

- **Modo Aleatório**: seed gerada com `Math.random()` — tabuleiro único a cada partida.
- **Modo Diário**: seed derivada da data (`YYYYMMDD` → hash) — mesmo tabuleiro para todos no mesmo dia, variando por nível.

### Colocação de Palavras

1. **Ordenação**: palavras são ordenadas por tamanho (maiores primeiro) para melhor aproveitamento do espaço.
2. **Busca de posições**: para cada palavra, o algoritmo busca todas as posições válidas em todas as direções permitidas.
3. **Interseções**: prioriza posições que criam cruzamentos com palavras já colocadas (maximiza densidade).
4. **Inversão**: com probabilidade configurável por nível, a palavra é invertida (lê-se de trás para frente).
5. **Validação**: verifica que células adjacentes ao início e fim da palavra estão vazias (evita colisões).
6. **Preenchimento**: células vazias são preenchidas com letras aleatórias ponderadas pela frequência na língua portuguesa.

### Combinações Possíveis

Com 1.000+ palavras em 27 categorias, 3 níveis de dificuldade, 8 direções e seeds aleatórias de 32 bits, o número de tabuleiros únicos possíveis é praticamente infinito.

## 🔮 Melhorias Futuras

- [ ] Suporte a múltiplos idiomas (i18n completo)
- [ ] Modo multijogador online (tempo real)
- [ ] Tabuleiros temáticos (categoria obrigatória)
- [ ] Mais categorias de palavras
- [ ] Importar palavras customizadas
- [ ] Modo competitivo com timer regressivo
- [ ] Estatísticas com gráficos SVG
- [ ] Exportar/importar dados (JSON)
- [ ] Sincronização na nuvem (opcional)

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

© 2026 [marlonjc35](https://github.com/marlonjc35) — Feito com ❤️ em JavaScript puro.
