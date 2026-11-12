// Shared, read-only market data adapter. Never exposes broker/order functionality.
const DEMO = Object.freeze({
  AAPL:{price:195.2,previousClose:193.5},MSFT:{price:420.5,previousClose:417.1},
  SPY:{price:555.2,previousClose:552.8},NVDA:{price:124.4,previousClose:123.8}
});
export function validateSymbol(value) {
  const symbol=String(value??"").trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9.]{0,9}$/.test(symbol)) throw new Error("Use a valid ticker (letters, digits or dot).");
  return symbol;
}
export function demoQuote(value) {
  const symbol=validateSymbol(value);
  const item=DEMO[symbol];
  if(!item) return {symbol,source:"demo",asOf:null,price:null,previousClose:null,note:"No demo quote for this symbol. Configure ALPHAVANTAGE_API_KEY."};
  return {symbol,...item,source:"demo",asOf:null,note:"Illustrative sample values. Not actual or current market prices."};
}
export async function getQuote(value,{apiKey=process.env.ALPHAVANTAGE_API_KEY,fetchImpl=fetch}={}) {
  const symbol=validateSymbol(value);
  if(!apiKey) return demoQuote(symbol);
  const url=new URL("https://www.alphavantage.co/query");
  url.searchParams.set("function","GLOBAL_QUOTE");
  url.searchParams.set("symbol",symbol);
  url.searchParams.set("apikey",apiKey);
  const response=await fetchImpl(url,{signal:AbortSignal.timeout(9000),cache:"no-store"});
  if(!response.ok) throw new Error("Market data provider unavailable");
  const payload=await response.json();
  const data=payload["Global Quote"];
  const price=Number(data?.["05. price"]);
  const previousClose=Number(data?.["08. previous close"]);
  if(!Number.isFinite(price)||price<=0) throw new Error("No provider quote available (check symbol, quota or API key)");
  return {symbol,price,previousClose:Number.isFinite(previousClose)?previousClose:null,asOf:data?.["07. latest trading day"]??null,source:"alpha-vantage",note:"Provider quote may be delayed or end-of-day; not a streaming real-time feed."};
}
export function hypotheticalPosition({capital,riskPercent,entry,stop}) {
  for(const n of [capital,riskPercent,entry,stop]) if(!Number.isFinite(n)||n<=0) throw new Error("Values must be positive.");
  if(stop>=entry) throw new Error("Long-position stop must be below entry.");
  if(riskPercent>100) throw new Error("Risk percent must not exceed 100.");
  const riskBudget=capital*riskPercent/100;
  const shares=Math.floor(Math.min(riskBudget/(entry-stop),capital/entry));
  return {riskBudget,shares,notional:shares*entry,maxHypotheticalLoss:shares*(entry-stop)};
}
