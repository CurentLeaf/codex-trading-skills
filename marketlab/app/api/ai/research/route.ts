import {NextRequest,NextResponse} from "next/server";
import {generateResearch} from "../../../../lib/ai.mjs";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function POST(req:NextRequest){
 try{
  const type=req.headers.get("content-type")??"";
  if(!type.includes("application/json"))return NextResponse.json({error:"Expected JSON"},{status:415});
  const length=Number(req.headers.get("content-length")??0);
  if(length>8000)return NextResponse.json({error:"Request too large"},{status:413});
  const body=await req.json();
  const result=await generateResearch(body);
  return NextResponse.json(result,{headers:{"Cache-Control":"no-store"}});
 }catch(e){
  const msg=e instanceof Error?e.message:"Research unavailable";
  const status=msg.includes("not configured")?503:msg.includes("provider")?502:400;
  return NextResponse.json({error:msg},{status,headers:{"Cache-Control":"no-store"}});
 }
}
