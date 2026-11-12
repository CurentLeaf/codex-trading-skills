"use client";
import {useState} from "react";
type Candle={date:string;close:number;sma20:number|null;sma50:number|null};
type Research={symbol:string;source:string;asOf:string|null;candles:Candle[];note:string;summary:null|{periodReturnPercent:number|null;trend:string;indicators:{sma20:number|null;sma50:number|null};points:number}};
export default function ResearchPanel(){
 const [symbol,setSymbol]=useState("SPY"),[data,setData]=useState<Research|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(false);
 async function analyze(){
  setLoading(true);setError("");
  try{const r=await fetch("/api/research?symbol="+encodeURIComponent(symbol));const j=await r.json();if(!r.ok)throw new Error(j.error||"Research unavailable");setData(j)}
  catch(e){setError(e instanceof Error?e.message:"Research unavailable")}finally{setLoading(false)}
 }
 const points=data?.candles??[];
 const values=points.flatMap(p=>[p.close,p.sma20,p.sma50].filter((x):x is number=>x!==null));
 const min=values.length?Math.min(...values):0,max=values.length?Math.max(...values):1,span=max-min||1;
 const plot=(key:"close"|"sma20"|"sma50")=>points.map((p,i)=>{
  const v=p[key];return v===null?null:`${(i/Math.max(1,points.length-1))*700},${180-(v-min)/span*160}`;
 }).filter(Boolean).join(" ");
 return <section className="panel research"><h2>Historical research</h2><p>Daily price history and moving averages. Data is descriptive, not a trading signal.</p>
 <div className="search"><input aria-label="Research ticker" value={symbol} maxLength={10} onChange={e=>setSymbol(e.target.value.toUpperCase())}/><button onClick={analyze} disabled={loading}>{loading?"Loading…":"Analyze"}</button></div>
 {error&&<p role="alert" className="error">{error}</p>}
 {data&&<><div className="line"><strong>{data.symbol}</strong><small>{data.asOf??"No provider data"} · {data.source}</small></div><p className="muted">{data.note}</p>
 {points.length>0&&<><div className="chartWrap"><svg viewBox="0 0 700 195" role="img" aria-label="Historical closing prices and moving averages"><line x1="0" x2="700" y1="180" y2="180" stroke="#4c6483"/><polyline fill="none" stroke="#78aaff" strokeWidth="2.5" points={plot("close")}/><polyline fill="none" stroke="#63d6b1" strokeWidth="2" points={plot("sma20")}/><polyline fill="none" stroke="#f3b96a" strokeWidth="2" points={plot("sma50")}/></svg></div>
 <div className="legend"><span>● Close</span><span>● SMA 20</span><span>● SMA 50</span></div>
 <div className="cards"><div className="metric"><small>Period change</small><strong>{data.summary?.periodReturnPercent?.toFixed(2)??"N/A"}%</strong></div><div className="metric"><small>20-day SMA</small><strong>{data.summary?.indicators.sma20?.toFixed(2)??"N/A"}</strong></div><div className="metric"><small>50-day SMA</small><strong>{data.summary?.indicators.sma50?.toFixed(2)??"N/A"}</strong></div></div><p className="muted">Last close is {data.summary?.trend}. Historical patterns do not predict future returns.</p></>}
 </>}</section>
}
