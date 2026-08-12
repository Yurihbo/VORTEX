# VORTEX — Biblioteca Virtual Mística
## Estratégia Visual e Direção Artística

---

## Abordagem Escolhida: **Biblioteca Ancestral Encantada**

A VORTEX é uma **biblioteca virtual que parece ter sido projetada por uma civilização mágica antiga, mas transformada em um aplicativo moderno sofisticado**. Combina a elegância de grimórios medievais com a funcionalidade de uma aplicação web contemporânea.

---

## Design Movement
**Neoclassicismo Fantástico com Influências Art Déco**

Inspirado em:
- Bibliotecas medievais reais (Trinity College, Biblioteca Vaticana)
- Grimórios e manuscritos antigos
- Castelos e torres de magia
- Elementos Art Déco (linhas geométricas, simetria, luxo contido)
- Minimalismo sofisticado com detalhes ornamentais

---

## Core Principles

1. **Sofisticação Contida**: Fantasia elegante, nunca infantil ou exagerada
2. **Funcionalidade Primária**: A interface é intuitiva e moderna, a magia é contextual
3. **Hierarquia Visual Clara**: Títulos serifados elegantes + interface moderna legível
4. **Detalhes Narrativos**: Dragões, runas e criaturas mitológicas contam histórias, não decoram

---

## Color Philosophy

### Dark Mode (Tema Principal)
**Paleta Inspirada em Noites Mágicas em Bibliotecas Ancestrais**

- **Fundo Principal**: `oklch(0.12 0.02 260)` — Azul profundo quase preto, como a noite em uma biblioteca subterrânea
- **Fundo Secundário**: `oklch(0.18 0.025 260)` — Azul escuro para cards e superfícies
- **Dourado Envelhecido**: `oklch(0.65 0.15 65)` — Ouro antigo, usado com moderação em destaques
- **Bronze**: `oklch(0.55 0.12 45)` — Tom quente para elementos secundários
- **Roxo Mágico**: `oklch(0.45 0.18 290)` — Acentos mágicos sutis
- **Azul Arcano**: `oklch(0.50 0.16 260)` — Azul místico para interações
- **Texto Principal**: `oklch(0.92 0.01 65)` — Quase branco, legível
- **Texto Secundário**: `oklch(0.70 0.02 65)` — Cinza claro para contexto

### Light Mode
**Paleta de Pergaminho e Biblioteca Diurna**

- **Fundo Principal**: `oklch(0.96 0.005 65)` — Creme muito claro, como pergaminho
- **Fundo Secundário**: `oklch(0.92 0.008 80)` — Bege suave para cards
- **Dourado Suave**: `oklch(0.70 0.12 65)` — Ouro claro e quente
- **Verde Floresta**: `oklch(0.35 0.10 140)` — Verde escuro para detalhes
- **Marrom Antigo**: `oklch(0.45 0.08 45)` — Marrom para elementos estruturais
- **Texto Principal**: `oklch(0.20 0.02 65)` — Marrom muito escuro
- **Texto Secundário**: `oklch(0.50 0.03 65)` — Marrom médio

---

## Layout Paradigm

**Sidebar + Main Content + Floating Elements**

- **Desktop**: Sidebar fixa à esquerda com navegação, conteúdo principal amplo
- **Tablet**: Sidebar recolhível com drawer
- **Mobile**: Bottom navigation com drawer lateral, botão flutuante para adicionar livro

O layout não é centralizado e simétrico — usa assimetria elegante com espaço em branco estratégico.

---

## Signature Elements

1. **Molduras Ornamentais Sutis**: Linhas finas douradas em torno de cards e seções importantes
2. **Partículas Mágicas Flutuantes**: Pequenas partículas que aparecem em hover e transições
3. **Runas e Símbolos**: Pequenos símbolos alquímicos e runas como separadores e ícones
4. **Silhuetas de Dragões**: Pequenas silhuetas discretas em detalhes visuais
5. **Brilho Encantado**: Efeito de brilho suave em elementos interativos

---

## Interaction Philosophy

**Magia Responsiva**: Cada interação deve parecer mágica mas controlada.

- **Hover**: Brilho suave, elevação sutil, mudança de cor
- **Click**: Feedback imediato com animação de escala
- **Transições**: Suaves e elegantes, nunca abruptas
- **Feedback**: Toasts com linguagem mágica ("Tesouro adicionado", "Relíquia favoritada")

---

## Animation Guidelines

- **Duração**: 200-300ms para transições de UI
- **Easing**: `cubic-bezier(0.23, 1, 0.32, 1)` para entrada, `cubic-bezier(0.77, 0, 0.175, 1)` para movimento
- **Partículas**: Animação contínua suave, respeitando `prefers-reduced-motion`
- **Entrada de Cards**: Fade + slide suave com stagger de 30-50ms
- **Hover de Livros**: Escala 1.02, sombra aumentada, brilho discreto
- **Modal**: Fade in com escala de 0.95 → 1.0

---

## Typography System

### Títulos (Serifados Elegantes)
- **Font**: Cormorant Garamond (elegância clássica)
- **Pesos**: 600 (títulos), 700 (destaques)
- **Tamanhos**: 
  - H1: 3.5rem (desktop), 2.5rem (mobile)
  - H2: 2.5rem (desktop), 1.8rem (mobile)
  - H3: 1.8rem (desktop), 1.4rem (mobile)

### Interface (Moderna e Legível)
- **Font**: Manrope (moderna, humanista)
- **Pesos**: 400 (corpo), 500 (ênfase), 600 (labels)
- **Tamanhos**:
  - Body: 1rem
  - Small: 0.875rem
  - Tiny: 0.75rem

### Combinação
Títulos em Cormorant Garamond + corpo em Manrope cria contraste visual elegante entre fantasia e modernidade.

---

## Brand Essence

**Posicionamento**: Uma biblioteca virtual onde cada livro é um tesouro, cada leitura é uma jornada mágica, e a organização é um ato de magia.

**Personalidade**: Sofisticada, Mística, Intuitiva

**Tagline**: "Sua biblioteca. Seus mundos. Suas histórias."

---

## Brand Voice

**Tons de Voz**:
- Sofisticado mas acessível
- Poético mas funcional
- Mágico mas confiável

**Exemplos de Microcopy**:
- "Bem-vindo à Vortex — Entre nas histórias. Descubra novos mundos."
- "Tesouros conquistados" (livros concluídos)
- "Relíquias favoritas" (favoritos)
- "Desafio do Guardião" (meta de leitura)
- "Grimório do Dia" (livro do dia)
- "Pergaminhos Pessoais" (notas)
- "Fragmentos" (citações)
- "Os corredores estão vazios..." (estado vazio)

---

## Logo & Wordmark

**Símbolo**: Um portal em espiral com elementos de dragão e runa
- Forma: Espiral concêntrica com um pequeno dragão estilizado no centro
- Estilo: Geométrico mas orgânico, linhas finas em dourado
- Versão Mobile: Apenas o símbolo da espiral

**Wordmark**: "VORTEX" em Cormorant Garamond, maiúsculas, com pequena runa abaixo

---

## Signature Brand Color

**Azul Arcano**: `oklch(0.50 0.16 260)`

Este azul místico é imediatamente reconhecível como a cor da VORTEX — aparece em botões primários, links, e elementos de destaque interativos.

---

## Style Decisions (Adições Específicas)

1. **Sem Excesso**: Evitar gradientes excessivos, glassmorphism exagerado, neon, ou partículas demais
2. **Texturas Sutis**: Apenas em backgrounds, nunca prejudicando leitura
3. **Contraste Garantido**: Texto sempre legível contra backgrounds
4. **Responsividade Elegante**: Não é apenas versão menor — é uma experiência própria no mobile
5. **Performance Primeiro**: Animações otimizadas, lazy loading onde faz sentido
6. **Acessibilidade Integrada**: HTML semântico, ARIA labels, navegação por teclado, foco visível

---

## Implementação Priorizada

1. ✅ Tema visual (cores, tipografia, componentes base)
2. ✅ Layout responsivo (desktop, tablet, mobile)
3. ✅ Dashboard com estatísticas
4. ✅ Biblioteca com grid de livros
5. ✅ Página de detalhes do livro
6. ✅ Favoritos, Metas, Conquistas
7. ✅ Estatísticas e Histórico
8. ✅ PWA (manifest, service worker)
9. ✅ Animações e detalhes visuais
10. ✅ Testes e otimizações


## Style Decisions

- Every primary surface uses the VORTEX frame language: dark navy material, thin aged-gold/bronze linework, restrained Art Déco corners, and one small rune/portal accent instead of plain rounded dashboard cards.
- Azul Arcano is reserved for active/primary interactions and must appear as a jewel-like magical signal paired with gold or bronze detail, never as a generic flat SaaS blue button.
- Book covers are treated as artifacts: even placeholder covers require tactile paper/leather texture, a seal, rune, archive mark, or ornamental plate so every tomo feels collected from an ancient library.
- Dashboard, goals, and statistics modules receive subtle celestial, manuscript, and rune motifs so the narrative appears in the material of the interface, not only in its copy.
- The VORTEX spiral mark, ceremonial wordmark, and gold linework recur in navigation, major section headers, and primary panels as a consistent identity stamp.


### Decisões adicionais do perfil

- A sidebar é um fólio de biblioteca em pergaminho: estados ativos cerimoniais, separadores de manuscrito e molduras em ouro/bronze devem substituir a aparência de menu comum.
- Painéis de métricas e perfil devem parecer artefatos arquivados, com moldura ornamental, marca simbólica e categoria narrativa.
- Azul Arcano funciona como sinal de joia: aparece em ações primárias/estados ativos e sempre recebe acabamento de ouro envelhecido ou bronze.
- O mini-ícone do guardião usa avatar circular com aro rúnico e permanece no canto superior esquerdo para criar continuidade entre as abas.
- A varinha de clique é uma microinteração breve, com um único brilho dourado e respeito a prefers-reduced-motion.
