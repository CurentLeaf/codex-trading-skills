import test from "node:test";import assert from "node:assert/strict";import {validateSymbol,demoQuote,hypotheticalPosition,getQuote} from "../lib/market.mjs";
test("symbol validation",()=>{assert.equal(validateSymbol("spy"),"SPY");assert.throws(()=>validateSymbol("SPY&evil"))});
test("demo quotes are labeled",()=>{assert.equal(demoQuote("SPY").source,"demo");assert.match(demoQuote("SPY").note,/Not actual/)});
test("position sizing is bounded by capital",()=>{assert.deepEqual(hypotheticalPosition({capital:10000,riskPercent:1,entry:50,stop:47}),{riskBudget:100,shares:33,notional:1650,maxHypotheticalLoss:99})});
test("live provider adapter parses quote",async()=>{const q=await getQuote("SPY",{apiKey:"test",fetchImpl:async()=>({ok:true,json:async()=>({"Global Quote":{"05. price":"123.45","08. previous close":"120","07. latest trading day":"2026-11-11"}})})});assert.equal(q.price,123.45);assert.equal(q.source,"alpha-vantage")});
