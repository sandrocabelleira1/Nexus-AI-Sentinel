const GAMMA_API = 'https://gamma-api.polymarket.com';
type GammaEventSummary = { id?: string | number; slug?: string; title?: string };
type GammaMarket = {
  question?: string; slug?: string; outcomes?: string | string[];
  outcomePrices?: string | string[]; active?: boolean; closed?: boolean;
  volume?: string | number; endDate?: string;
};
type GammaEvent = GammaEventSummary & { markets?: GammaMarket[] };
export type PolymarketContext = {
  fetchedAt: string;
  events: Array<{
    title: string; url: string;
    markets: Array<{ question: string; yesPrice: number | null; volume: number | null; endDate: string | null; url: string }>;
  }>;
};

function parseArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch { return []; }
}
function parseYesPrice(market: GammaMarket): number | null {
  const outcomes = parseArray(market.outcomes);
  const prices = parseArray(market.outcomePrices);
  const yesIndex = outcomes.findIndex(label => label.toLowerCase() === 'yes');
  const price = Number(prices[yesIndex >= 0 ? yesIndex : 0]);
  return Number.isFinite(price) && price >= 0 && price <= 1 ? price : null;
}
function toFiniteNumber(value: string | number | undefined): number | null {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
async function gammaFetch<T>(path: string): Promise<T> {
  const response = await fetch(GAMMA_API + path, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(7_000),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Polymarket returned ' + response.status);
  return response.json() as Promise<T>;
}
/** Search public Polymarket events and return a small, read-only assistant context. */
export async function searchPolymarket(query: string): Promise<PolymarketContext | null> {
  const normalizedQuery = query.trim().slice(0, 240);
  if (!normalizedQuery) return null;
  try {
    const search = await gammaFetch<{ events?: GammaEventSummary[] }>(
      '/public-search?q=' + encodeURIComponent(normalizedQuery)
    );
    const candidates = (search.events || []).filter(event =>
      (typeof event.id === 'string' || typeof event.id === 'number') && !!event.title
    ).slice(0, 3);
    const events = await Promise.all(candidates.map(async summary => {
      const event = await gammaFetch<GammaEvent>('/events/' + encodeURIComponent(String(summary.id)));
      if (!event.slug) return null;
      const markets = (event.markets || [])
        .filter(market => market.active !== false && market.closed !== true && !!market.question)
        .sort((a, b) => (toFiniteNumber(b.volume) || 0) - (toFiniteNumber(a.volume) || 0))
        .slice(0, 4)
        .map(market => ({
          question: market.question!,
          yesPrice: parseYesPrice(market),
          volume: toFiniteNumber(market.volume),
          endDate: market.endDate || null,
          url: 'https://polymarket.com/event/' + event.slug,
        }));
      if (!markets.length) return null;
      return {
        title: event.title || summary.title || 'Evento Polymarket',
        url: 'https://polymarket.com/event/' + event.slug,
        markets,
      };
    }));
    const availableEvents = events.filter((event): event is NonNullable<typeof event> => event !== null);
    return availableEvents.length ? { fetchedAt: new Date().toISOString(), events: availableEvents } : null;
  } catch (error) {
    console.warn('Polymarket market data is unavailable:', error instanceof Error ? error.message : 'unknown error');
    return null;
  }
}
export function formatPolymarketContext(context: PolymarketContext | null): string {
  if (!context) return 'Polymarket: nenhuma correspondência disponível nesta consulta; não inferir probabilidades ou cobertura.';
  const lines = [
    'Fonte: Polymarket (dados públicos; obtidos em ' + context.fetchedAt + ').',
    'Os preços são indicativos e representam probabilidades implícitas no mercado; não são probabilidades objetivas nem fatos confirmados.',
  ];
  for (const event of context.events) {
    lines.push('Evento: ' + event.title + ' — ' + event.url);
    for (const market of event.markets) {
      const probability = market.yesPrice === null ? 'preço YES indisponível' : 'YES ' + (market.yesPrice * 100).toFixed(1) + '%';
      const volume = market.volume === null ? '' : '; volume ' + market.volume;
      const ending = market.endDate ? '; encerramento ' + market.endDate : '';
      lines.push('- ' + market.question + ': ' + probability + volume + ending + '. Mercado: ' + market.url);
    }
  }
  return lines.join('\n');
}
