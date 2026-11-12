import {NextRequest,NextResponse} from "next/server";
import {getQuote} from "../../../lib/market.mjs";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
 try {const result=await getQuote(req.nextUrl.searchParams.get("symbol")??"SPY");return NextResponse.json(result,{headers:{"Cache-Control":"no-store"}})}
 catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Quote unavailable"},{status:400})}
}
