"use client";
import {useEffect,useState} from "react";
import ResearchPanel from "./ResearchPanel";
import SkillsPanel from "./SkillsPanel";
import AIResearchPanel from "./AIResearchPanel";
type Quote={symbol:string;price:number|null;previousClose:number|null;source:string;asOf:string|null;note:string};
type Entry={id:string;symbol:string;side:"buy"|"sell";quantity:number;price:number;time:string};
const KEY="marketlab-paper-v1";
const cashStart=10000;
function money(n:number){return n.toLocaleString("en-US",{style:"currency",currency:"USD"});}
export default function Home(){
 const [symbol,setSymbol]=useState("SPY"),[quote,setQuote]=useState<Quote|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(false);
 const [ledger,setLedger]=useState<Entry[]>([]),[ready,setReady]=useState(false),[qty,setQty]=useState(1);
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(KEY)||"[]");if(Array.isArray(saved))setLedger(saved)}catch{}setReady(true)},[]);
 useEffect(()=>{if(ready)localStorage.setItem(KEY,JSON.stringify(ledger))},[ledger,ready]);
 async function load(){setLoading(true);setError("");try{const r=await fetch("/api/quote?symbol="+encodeURIComponent(symbol));const j=await r.json();if(!r.ok)throw new Error(j.error||"Quote unavailable");setQuote(j)}catch(e){setError(e instanceof Error?e.message:"Failed to load quote")}finally{setLoading(false)}}
 useEffect(()=>{void load()},[]);
 const cash=ledger.reduce((v,e)=>v+(e.side==="buy"?-1:1)*e.quantity*e.price,cashStart);
 const positions=ledger.reduce<Record<string,number>>((a,e)=>({...a,[e.symbol]:(a[e.symbol]||0)+(e.side==="buy"?1:-1)*e.quantity}),{});
 function trade(side:"buy"|"sell"){
  if(!quote?.price||quote.source==="demo"){setError("Paper orders require an actual provider quote. Configure the API key.");return}
  if(!Number.isInteger(qty)||qty<1){setError("Quantity must be a positive whole number.");return}
  if(side==="buy"&&qty*quote.price>cash+1e-6){setError("Insufficient simulated cash.");return}
  if(side==="sell"&&qty>(positions[quote.symbol]||0)){setError("Not enough simulated shares.");return}
  setLedger(v=>[{id:crypto.randomUUID(),symbol:quote.symbol,side,quantity:qty,price:quote.price!,time:new Date().toISOString()},...v]);setError("");
 }
 return <main className="shell"><header><div><div className="eyebrow">RESEARCH WORKSPACE / V0.1</div><h1>MarketLab <span>AI</span></h1><p>Market research and a simulated portfolio. No brokerage connection or real orders.</p></div><div className="pill">● PAPER ONLY</div></header>
 <div className="cards"><section className="metric"><small>Simulated cash</small><strong>{money(cash)}</strong><span>Starting balance: $10,000</span></section><section className="metric"><small>Simulated transactions</small><strong>{ledger.length}</strong><span>Saved in this browser only</span></section><section className="metric"><small>Tracked symbols</small><strong>{Object.values(positions).filter(v=>v>0).length}</strong><span>Long positions only</span></section></div>
 <div className="columns"><section className="panel"><h2>Market lookup</h2><p>Provider data when configured. Quotes may be delayed.</p><div className="search"><input aria-label="Ticker" value={symbol} maxLength={10} onChange={e=>setSymbol(e.target.value.toUpperCase())}/><button onClick={load} disabled={loading}>{loading?"Loading…":"Get quote"}</button></div>{quote&&<div className="quote"><div className="eyebrow">{quote.symbol} · {quote.source==="demo"?"DEMO DATA":"PROVIDER QUOTE"}</div><strong>{quote.price==null?"Unavailable":money(quote.price)}</strong><p>{quote.note}</p><small>Data date: {quote.asOf??"not available"}</small></div>}
 <h2>Research toolkit</h2><div className="skills"><span>Technical analysis</span><span>Backtesting</span><span>Position sizing</span><span>Trading journal</span></div><p className="muted">The 74 imported Codex skills remain in the repository. Website integration is incremental; this MVP does not execute those skills.</p></section>
 <section className="panel"><h2>Paper trading simulator</h2><p>Hypothetical buy/sell entries only. No leverage, shorting, or broker connectivity.</p><label>Shares <input type="number" min="1" step="1" value={qty} onChange={e=>setQty(Number(e.target.value))}/></label><div className="actions"><button onClick={()=>trade("buy")}>Simulate buy</button><button className="outline" onClick={()=>trade("sell")}>Simulate sell</button></div><p className="muted">Execution uses the displayed quote, not a real fill. It excludes fees, spreads, slippage and market impact.</p><h3>Holdings (share counts)</h3>{Object.entries(positions).filter(([,n])=>n>0).length?Object.entries(positions).filter(([,n])=>n>0).map(([s,n])=><div className="line" key={s}><b>{s}</b><span>{n} shares</span></div>):<p className="muted">No simulated positions yet.</p>}</section></div>
 <ResearchPanel/><AIResearchPanel/><SkillsPanel/><section className="panel"><div className="line"><h2>Paper transaction journal</h2><button className="outline small" onClick={()=>{if(confirm("Reset the local paper portfolio?"))setLedger([])}}>Reset simulation</button></div>{ledger.length?<div className="scroll"><table><thead><tr><th>Time</th><th>Symbol</th><th>Side</th><th>Shares</th><th>Illustrative fill</th></tr></thead><tbody>{ledger.map(e=><tr key={e.id}><td>{new Date(e.time).toLocaleString()}</td><td>{e.symbol}</td><td>{e.side}</td><td>{e.quantity}</td><td>{money(e.price)}</td></tr>)}</tbody></table></div>:<p className="muted">Transactions will appear here when you simulate a trade using provider data.</p>}</section>{error&&<div role="alert" className="error">{error}</div>}
 <footer>Research and educational simulation only. MarketLab does not provide investment advice or place real trades.</footer></main>
}
