import {readdir,readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,"../../.agents/skills");
export async function listSkills(){
 const dirs=await readdir(root,{withFileTypes:true});
 const skills=[];
 for(const d of dirs){
  if(!d.isDirectory()||!/^[a-z0-9-]+$/.test(d.name))continue;
  try{
   const raw=await readFile(path.join(root,d.name,"SKILL.md"),"utf8");
   const front=raw.match(/^---\s*\n([\s\S]*?)\n---/);
   const name=front?.[1].match(/^name:\s*(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g,"")||d.name;
   const description=front?.[1].match(/^description:\s*(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g,"")||"Imported research skill";
   skills.push({id:d.name,name,description:description.slice(0,500)});
  }catch{/* omit invalid skill */}
 }
 return skills.sort((a,b)=>a.id.localeCompare(b.id));
}
export async function getSkill(id){
 if(!/^[a-z0-9-]+$/.test(id))throw new Error("Invalid skill identifier");
 const skills=await listSkills();
 const found=skills.find(s=>s.id===id);
 if(!found)throw new Error("Skill not found");
 const instructions=await readFile(path.join(root,id,"SKILL.md"),"utf8");
 return {...found,instructions:instructions.slice(0,18000),note:"Imported skill instructions are reference material, not executable tools. Scripts and commands are not run by the web service."};
}
