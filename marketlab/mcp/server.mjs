import express from "express";
import {randomUUID} from "node:crypto";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StreamableHTTPServerTransport} from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {z} from "zod";
import {getQuote,hypotheticalPosition} from "../lib/market.mjs";

const app=express();
app.disable("x-powered-by");
app.use(express.json({limit:"32kb"}));
function buildServer(){
 const server=new McpServer({name:"marketlab-ai",version:"0.1.0"},{instructions:"Educational market research only. No real orders, broker access or trading recommendations. Clearly disclose data freshness and hypothetical results."});
 server.tool("get_market_quote","Read a market-data quote. May be delayed; demo quotes are fictional.",{symbol:z.string().min(1).max(10)},async({symbol})=>{
  try{const quote=await getQuote(symbol);return {content:[{type:"text",text:JSON.stringify(quote)}]}}
  catch(e){return {isError:true,content:[{type:"text",text:e instanceof Error?e.message:"Quote unavailable"}]}}
 });
 server.tool("calculate_hypothetical_position","Calculate a purely hypothetical long position size; does not trade.",{
  capital:z.number().positive(),riskPercent:z.number().positive().max(100),entry:z.number().positive(),stop:z.number().positive()
 },async(args)=>{
  try{return {content:[{type:"text",text:JSON.stringify(hypotheticalPosition(args))}]}}
  catch(e){return {isError:true,content:[{type:"text",text:e instanceof Error?e.message:"Invalid values"}]}}
 });
 return server;
}
const sessions=new Map();
app.get("/",(_req,res)=>res.json({name:"MarketLab AI",status:"ok",scope:"research only"}));
app.post("/mcp",async(req,res)=>{
 try{
  const id=req.headers["mcp-session-id"];
  let session=id&&sessions.get(id);
  if(!session){
   const server=buildServer();
   const transport=new StreamableHTTPServerTransport({sessionIdGenerator:()=>randomUUID(),onsessioninitialized:(sid)=>sessions.set(sid,{server,transport})});
   transport.onclose=()=>{if(transport.sessionId)sessions.delete(transport.sessionId)};
   await server.connect(transport);
   session={server,transport};
  }
  await session.transport.handleRequest(req,res,req.body);
 }catch(e){if(!res.headersSent)res.status(500).json({error:"MCP request failed"});console.error(e)}
});
app.get("/mcp",async(req,res)=>{
 const session=sessions.get(req.headers["mcp-session-id"]);
 if(!session)return res.status(400).send("MCP session required");
 await session.transport.handleRequest(req,res);
});
app.delete("/mcp",async(req,res)=>{
 const session=sessions.get(req.headers["mcp-session-id"]);
 if(!session)return res.status(400).send("MCP session required");
 await session.transport.handleRequest(req,res);
});
const port=Number(process.env.PORT||8787);
app.listen(port,()=>console.log("MarketLab MCP listening on http://localhost:"+port+"/mcp"));
