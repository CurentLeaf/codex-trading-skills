import test from "node:test";
import assert from "node:assert/strict";
import {indicators,researchSummary,getHistory} from "../lib/research.mjs";
const candles=Array.from({length:60},(_,i)=>({date:"2026-09-"+String(i+1).padStart(2,"0"),close:100+i,volume:1000}));
test("moving averages use trailing periods",()=>{const rows=indicators(candles);assert.equal(rows[18].sma20,null);assert.equal(rows[19].sma20,109.5);assert.equal(rows[49].sma50,124.5)});
test("research summary is descriptive",()=>{const r=researchSummary(candles);assert.equal(r.points,60);assert.equal(r.trend,"above 20-day average")});
test("history missing key returns no fake candles",async()=>{const r=await getHistory("SPY",{apiKey:""});assert.equal(r.candles.length,0);assert.equal(r.source,"unavailable")});
test("provider historical data parsing",async()=>{const r=await getHistory("SPY",{apiKey:"test",fetchImpl:async()=>({ok:true,json:async()=>({"Time Series (Daily)":{"2026-11-11":{"4. close":"200.1","5. volume":"100"}}})})});assert.equal(r.candles[0].close,200.1)});
