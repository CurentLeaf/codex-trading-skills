"use client";
import {useEffect,useState} from "react";
type Skill={id:string;name:string};
type Result={answer:string;model:string;data:{symbol:string;source:string;asOf:string|null;candles:number};skills:string[];disclaimer:string};
export default function AIResearchPanel(){
 const [symbol,setSymbol]=useState("SPY"),[question,setQuestion]=useState("Explain the historical trend and uncertainty."),[skills,setSkills]=useState<Skill[]>([]),[chosen,setChosen]=useState<string[]>([]),[result,setResult]=useState<Result|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(false);
 useEffect(()=>{fetch("/api/skills").then(r=>r.json()).then(j=>setSkills(j.skills??[])).catch(()=>{})},[]);
 async function analyze(){
  setLoading(true);setError("");setResult(null);
  try{
   const r=await fetch("/api/ai/research",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({symbol,question,skillIds:chosen})});
   const j=await r.json();if(!r.ok)throw new Error(j.error??"AI research failed");setResult(j);
  }catch(e){setError(e instanceof Error?e.message:"AI research unavailable")}finally{setLoading(false)}
 }
 return <section className="panel research"><h2>AI research assistant</h2><p>Uses the OpenAI Responses API with historical data and up to three selected imported skill references. Does not execute skill scripts or place orders.</p>
 <label>Symbol <input value={symbol} maxLength={10} onChange={e=>setSymbol(e.target.value.toUpperCase())}/></label>
 <label>Research question <textarea value={question} maxLength={1000} rows={3} onChange={e=>setQuestion(e.target.value)}/></label>
 <label>Research skill references (optional, maximum 3)<select multiple value={chosen} size={Math.min(7,Math.max(3,skills.length))} onChange={e=>setChosen(Array.from(e.target.selectedOptions).map(o=>o.value).slice(0,3))}>{skills.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
 <p className="muted">Use Ctrl+click to select multiple skills. Each request consumes API tokens and may incur charges.</p>
 <button onClick={analyze} disabled={loading}>{loading?"Researching…":"Generate AI research"}</button>
 {error&&<p role="alert" className="error">{error}</p>}
 {result&&<article className="airesult"><div className="line"><b>Research report</b><small>{result.model}</small></div><p className="muted">Source: {result.data.source} · Last data date: {result.data.asOf??"Unavailable"} · {result.data.candles} observations · Skills: {result.skills.join(", ")||"none"}</p><div className="reporttext">{result.answer}</div><p className="muted">{result.disclaimer}</p></article>}
 </section>
}
