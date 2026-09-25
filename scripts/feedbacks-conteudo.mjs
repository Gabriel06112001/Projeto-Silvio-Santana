// Feedbacks de clientes (usado por scripts/gerar-feedbacks.mjs).
//
// CUIDADOS (Código de Ética da OAB e Provimento 205/2021) — antes de incluir um feedback:
//   - identifique a pessoa só pelo primeiro nome + inicial do sobrenome e cidade/UF (nunca nome completo, foto ou dados do processo);
//   - não publique valores, prazos ou resultados ("consegui X", "ganhei em Y dias");
//   - tenha a autorização por escrito de cada cliente para a publicação;
//   - a publicação depende da aprovação do Silvio Santana.
//
// Para incluir: copie um bloco { ... }, preencha e rode: npm run feedbacks  (também roda no build)
// Campos: texto (obrigatório), autor (ex.: "Maria S."), local (ex.: "São Paulo/SP"), tema (opcional, ex.: "Aposentadoria PcD")

export const feedbacks = [
  {
    texto:
      'Eu tinha bastante dúvida sobre a minha situação e não sabia nem por onde começar. Procurei o Dr. Silvio e gostei muito da forma como ele me atendeu. Ele ouviu tudo com atenção e explicou as possibilidades de um jeito simples, sem complicar. Saí da conversa bem mais tranquilo e sabendo quais seriam os próximos passos.',
    autor: 'Ricardo A.',
    local: 'São Bernardo do Campo/SP',
  },
  {
    texto: 'Estava cheio de dúvidas sobre minha aposentadoria. O Dr. Silvio explicou tudo de forma simples e me orientou muito bem.',
    autor: 'Carlos H.',
    local: 'São Paulo/SP',
  },
  {
    texto: 'Fui muito bem atendida. Explicaram tudo com calma e de um jeito que consegui entender.',
    autor: 'Mariana O.',
    local: 'Osasco/SP',
  },
  {
    // [Nota] Mesmo nome e cidade do primeiro feedback — confirmar se é outra pessoa ou se deve ser juntado/removido
    texto: 'Estava tentando resolver tudo sozinho pelo INSS e estava muito complicado. O Dr. Silvio analisou meu caso e me mostrou o caminho.',
    autor: 'Ricardo A.',
    local: 'São Bernardo do Campo/SP',
  },
  {
    texto: 'Já estava cansada de tentar resolver as coisas pelo INSS. Procurei o escritório e finalmente consegui entender o que precisava fazer.',
    autor: 'Luciana F.',
    local: 'Diadema/SP',
  },
]
