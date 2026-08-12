# Verificação visual do perfil e conquistas

A tela `/profile` foi verificada em desktop (1280×720) e mobile (390×844). O avatar circular, o botão de recorte, as métricas de livros/horas/medalhas e a navegação com mini-ícone de perfil aparecem corretamente. O layout mobile reorganiza o retrato e os cartões em coluna, mantendo o CTA de recorte legível e acessível. O editor de recorte abre em modal responsivo; a validação funcional final depende de selecionar uma imagem no navegador.

A tela `/profile` também foi verificada em viewport desktop de 1280×900 após a inclusão do cartão de conquistas. A área de identidade, métricas, avatar e controles de personalização permanecem alinhados ao tema, e o novo cartão mantém contraste, moldura e hierarquia visual.

A tela `/achievements` foi verificada em viewport desktop de 1280×900. A contagem total inclui os cinco marcos de sequência; a nova seção de medalhas especiais apresenta chama atual, melhor marca, progresso e estados bloqueado/desbloqueado com a mesma linguagem de ouro envelhecido, azul arcano e molduras de arquivo.

O build e a verificação TypeScript foram concluídos com sucesso. O compartilhamento usa a Web Share API quando disponível; em navegadores sem suporte, baixa o PNG do cartão e tenta copiar o resumo para a área de transferência.
