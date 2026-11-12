"use client";
import {useEffect,useState} from "react";
type Skill={id:string;name:string;description:string;instructions?:string;note?:string};
export default function SkillsPanel(){
 const [skills,setSkills]=useState<Skill[]>([]),[filter,setFilter]=useState(""),[selected,setSelected]=useState<Skill|null>(null),[error,setError]=useState("");
 useEffect(()=>{fetch("/api/skills").then(r=>r.json()).then(j=>{if(j.error)throw new Error(j.error);setSkills(j.skills)}).catch(e=>setError(String(e)))},[]);
 async function inspect(id:string){
  try{const r=await fetch("/api/skills?id="+encodeURIComponent(id));const j=await r.json();if(!r.ok)throw new Error(j.error);setSelected(j)}catch(e){setError(String(e))}
 }
 const shown=skills.filter(s=>(s.id+" "+s.description).toLowerCase().includes(filter.toLowerCase()));
 return <section className="panel research"><h2>Codex skill library</h2><p>Browse the imported research instructions. Skills are displayed as references; no untrusted scripts run on the server.</p>
 <input aria-label="Filter skills" placeholder="Filter skills…" value={filter} onChange={e=>setFilter(e.target.value)}/>
 <p className="muted">{shown.length} of {skills.length} skills</p>
 <div className="skillgrid">{shown.map(s=><button className="skillitem" key={s.id} onClick={()=>inspect(s.id)}><b>{s.name}</b><small>{s.description}</small></button>)}</div>
 {selected&&<div className="skilldetail"><div className="line"><h3>{selected.name}</h3><button className="outline small" onClick={()=>setSelected(null)}>Close</button></div><p className="muted">{selected.note}</p><pre>{selected.instructions}</pre></div>}
 {error&&<p role="alert" className="error">{error}</p>}</section>
}
