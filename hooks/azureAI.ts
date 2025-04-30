/* ------------------------------------------------------------------
 * services/azureAI.ts
 * ------------------------------------------------------------------
 *  – Comunica-se com o endpoint serverless do Azure AI Foundry
 *  – Usa header  Authorization: Bearer <KEY>
 *  – Faz corte de histórico, throttle de 3 s entre chamadas
 *    e retry/back-off exponencial para lidar com HTTP 429
 * ------------------------------------------------------------------ */

export type ChatRole = 'user' | 'assistant' | 'system';
export interface ChatMessage { role: ChatRole; content: string }

/* ▸ 1.  Endpoint e chave
 *      – Em produção leia de process.env (EXPO_PUBLIC_…)
 *      – Aqui deixados “in-file” para teste rápido                 */
  const AZURE_ENDPOINT = "https://DeepSeek-R1-TCC.eastus2.models.ai.azure.com";
  const AZURE_API_KEY  = "idZiZXMfuhfv20GAzhXEZzKm2Bzy6ZXf";
  
/* ▸ 2.  Parâmetros de controle */
const MIN_GAP_MS      = 3000;   // espaçamento mínimo entre requisições
const MAX_HISTORY_MSG = 10;     // mantém só as 10 últimas mensagens
const MAX_RETRIES     = 3;      // antes de desistir de vez
const INITIAL_BACKOFF = 1500;   // 1,5 s

let lastCall = 0;               // controla throttle

export async function sendMessageToAI(
  userText: string,
  history: ChatMessage[],
): Promise<string> {
  /* THROTTLE ------------------------------------------------------ */
  const now = Date.now();
  if (now - lastCall < MIN_GAP_MS) {
    return 'Aguarde alguns segundos antes de enviar outra pergunta…';
  }
  lastCall = now;

  /* PREPARA PAYLOAD ---------------------------------------------- */
  const trimmedHistory = history.slice(-MAX_HISTORY_MSG); // reduz tokens
  const body = JSON.stringify({
    messages: [
      { role: 'system', content: 'Você é um assistente de IA útil. Responda sempre em português.' },
      ...trimmedHistory,
      { role: 'user', content: userText },
    ],
  });

  /* LOOP COM BACK-OFF -------------------------------------------- */
  let backoff = INITIAL_BACKOFF;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const res = await fetch(
      `${AZURE_ENDPOINT}/models/chat/completions?api-version=2024-05-01-preview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AZURE_API_KEY}`,
        },
        body,
      },
    );

    console.log({
      reqRemaining : res.headers.get('x-ratelimit-remaining-requests'),
      tokRemaining : res.headers.get('x-ratelimit-remaining-tokens'),
      retryAfter   : res.headers.get('retry-after'),
    });

    /* Sucesso → devolve a resposta ------------------------------- */
    if (res.ok) {
      const json = await res.json();
      return json.choices?.[0]?.message?.content ?? 'Resposta vazia.';
    }

    /* 429 → espera e tenta de novo ------------------------------- */
    if (res.status === 429) {
      const retryAfter =
        Number(res.headers.get('retry-after')) || backoff / 1000;
      console.warn(
        `429 recebido – tentando novamente em ${retryAfter}s (tentativa ${
          attempt + 1
        }/${MAX_RETRIES})`,
      );
      await new Promise(r => setTimeout(r, retryAfter * 1000));
      backoff *= 2; // back-off exponencial
      continue;
    }

    /* Qualquer outro erro ---------------------------------------- */
    const errText = await res.text();
    throw new Error(`Azure ${res.status}: ${errText}`);
  }

  /* Se todas as tentativas falharem ------------------------------ */
  return 'Limite de requisições excedido. Tente novamente mais tarde.';
}