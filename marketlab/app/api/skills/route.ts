import {NextRequest,NextResponse} from "next/server";
import {listSkills,getSkill} from "../../../lib/skills.mjs";
export const runtime="nodejs";
export async function GET(req:NextRequest){
 try{
  const id=req.nextUrl.searchParams.get("id");
  return NextResponse.json(id?await getSkill(id):{skills:await listSkills()},{headers:{"Cache-Control":"public, max-age=300"}});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Skills unavailable"},{status:400})}
}
