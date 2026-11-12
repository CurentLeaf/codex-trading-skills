import test from "node:test";import assert from "node:assert/strict";import {listSkills,getSkill} from "../lib/skills.mjs";
test("imported skills are discoverable",async()=>{const skills=await listSkills();assert.ok(skills.length>=70);assert.ok(skills.some(s=>s.id==="position-sizer"))});
test("skill traversal is rejected",async()=>{await assert.rejects(getSkill("../secret"),/Invalid skill/)});
test("skill instructions can be read",async()=>{const s=await getSkill("position-sizer");assert.match(s.instructions,/position/i)});
