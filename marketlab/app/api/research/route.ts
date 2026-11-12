import {NextRequest,NextResponse} from "next/server";
import {getHistory,researchSummary} from "../../../lib/research.mjs";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
 try{
  const result=await getHistory(req.nextUrl.searchParams.get("symbol")??"SPY");
  return NextResponse.json({...result,summary:result.candles.length?researchSummary(result.candles):null},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Research unavailable"},{status:400})}
}
