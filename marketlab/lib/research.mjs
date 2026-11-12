// Historical research is read-only. No broker API or execution paths.
import {validateSymbol} from "./market.mjs";
export function indicators(candles){
 const rows=candles.map(c=>({...c,close:Number(c.close)}));
 const sma=(i,n)=>i+1<n?null:rows.slice(i+1-n,i+1).reduce((sum,x)=>sum+x.close,0)/n;
 return rows.map((c,i)=>({...c,sma20:sma(i,20),sma50:sma(i,50)}));
}
export function researchSummary(candles){
 if(!candles.length)throw new Error("No historical data");
 const data=indicators(candles);
 const latest=data.at(-1);
 const first=data[0];
 const pctChange=first.close?((latest.close/first.close)-1)*100:null;
 const trend=latest.sma20===null?"insufficient data":latest.close>latest.sma20?"above 20-day average":latest.close<latest.sma20?"below 20-day average":"at 20-day average";
 return {latestClose:latest.close,firstClose:first.close,periodReturnPercent:pctChange,trend,points:data.length,indicators:{sma20:latest.sma20,sma50:latest.sma50},disclaimer:"Descriptive historical statistics, not a forecast or recommendation."};
}
export async function getHistory(value,{apiKey=process.env.ALPHAVANTAGE_API_KEY,fetchImpl=fetch}={}){
 const symbol=validateSymbol(value);
 if(!apiKey) return {symbol,source:"unavailable",asOf:null,candles:[],note:"Historical prices require an Alpha Vantage API key. No fabricated market history is shown."};
 const url=new URL("https://www.alphavantage.co/query");
 url.searchParams.set("function","TIME_SERIES_DAILY");
 url.searchParams.set("symbol",symbol);
 url.searchParams.set("outputsize","compact");
 url.searchParams.set("apikey",apiKey);
 const response=await fetchImpl(url,{signal:AbortSignal.timeout(9000),cache:"no-store"});
 if(!response.ok)throw new Error("Historical data provider unavailable");
 const json=await response.json();
 const series=json["Time Series (Daily)"];
 if(!series)throw new Error("Historical data unavailable; check symbol, provider quota or plan");
 const candles=Object.entries(series).map(([date,v])=>({date,close:Number(v["4. close"]),volume:Number(v["5. volume"])})).filter(c=>Number.isFinite(c.close)&&c.close>0).sort((a,b)=>a.date.localeCompare(b.date));
 return {symbol,source:"alpha-vantage",asOf:candles.at(-1)?.date??null,candles,note:"Daily historical prices, potentially delayed; not an intraday live feed."};
}
