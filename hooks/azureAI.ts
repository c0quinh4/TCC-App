/* ------------------------------------------------------------------
 * Comunicação com Phi-4-mini-instruct (serverless)
 * ------------------------------------------------------------------ */
export type ChatRole   = 'user' | 'assistant' | 'system';
export interface ChatMessage { role: ChatRole; content: string }

/** 1. Endpoint real do HUB  (substitua pelo seu) */
const AZURE_ENDPOINT = 'https://hub-tcc.eastus2.models.ai.azure.com';
/** 1b. Serverless key (troque para variável de ambiente depois) */
const AZURE_API_KEY  = 'D3ISw8Q3e8YC5J1xl1hTB5CTz9RcdBXN';

/** 2. URL base já com versão da API */
const BASE_URL =
  `${AZURE_ENDPOINT}/models/chat/completions?api-version=2024-05-01-preview`;

/** 3. Parâmetros de controle */
const MIN_GAP_MS      = 3000;    // 3 s (mude p/ 10000 se 429 persistir)
const MAX_HISTORY_MSG = 10;
const MAX_RETRIES     = 3;
const INITIAL_BACKOFF = 1500;

let lastCall = 0;

export async function sendMessageToAI(
  userText: string,
  history: ChatMessage[],
): Promise<string> {

  /*--- Throttle ---------------------------------------------------*/
  const now = Date.now();
  if (now - lastCall < MIN_GAP_MS) {
    return 'Aguarde alguns segundos antes de enviar outra pergunta…';
  }
  lastCall = now;

  /*--- Monta payload ---------------------------------------------*/
  const trimmedHistory = history.slice(-MAX_HISTORY_MSG);
  const body = JSON.stringify({
    messages: [
      { role: 'system', content: 'Você é um assistente útil. Responda em português.' },
      ...trimmedHistory,
      { role: 'user', content: userText },
    ],
    max_tokens: 128          // IMPORTANTE: limita gasto de tokens
  });

  /*--- Loop com retry / back-off ----------------------------------*/
  let backoff = INITIAL_BACKOFF;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const res = await fetch(BASE_URL, {
      method : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AZURE_API_KEY}`,
      },
      body,
    });

    console.log({
      reqRemaining : res.headers.get('x-ratelimit-remaining-requests'),
      tokRemaining : res.headers.get('x-ratelimit-remaining-tokens'),
      retryAfter   : res.headers.get('retry-after'),
    });

    if (res.ok) {
      const json = await res.json();
      return json.choices?.[0]?.message?.content ?? 'Resposta vazia.';
    }

    if (res.status === 429) {
      const retryAfterSec =
        Number(res.headers.get('retry-after')) || backoff / 1000;
      console.warn(
        `429 → aguardando ${retryAfterSec}s (tentativa ${attempt + 1}/${MAX_RETRIES})`,
      );
      await new Promise(r => setTimeout(r, retryAfterSec * 1000));
      backoff *= 2;
      continue;
    }

    const errTxt = await res.text();
    throw new Error(`Azure ${res.status}: ${errTxt}`);
  }

  return 'Limite de requisições excedido. Tente novamente mais tarde.';
}
