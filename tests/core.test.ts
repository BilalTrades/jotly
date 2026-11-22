import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {defaults,csvRows,autoMap,parseTrades,validateData} from '../src/lib/core';
test('new journal has six strategies and no fictional trades',()=>{const d=defaults();assert.equal(d.strategies.length,6);assert.equal(d.trades.length,0);assert.ok(validateData(d));});
test('CSV handles quoted separators, escaped quotes, CRLF, semicolon',()=>{assert.deepEqual(csvRows('a,b\r\n"x,y","a""b"'),[['a','b'],['x,y','a"b']]);assert.deepEqual(csvRows('a;b\n1;2'),[['a','b'],['1','2']]);});
test('MT CSV maps, nets fees, starts unreviewed with zero risk and deduplicates',()=>{const rows=csvRows(readFileSync('fixtures/example-mt5.csv','utf8'));const m=autoMap(rows[0]);const result=parseTrades(rows,m,'paper',[]);assert.equal(result.trades.length,2);assert.equal(result.trades[0].pnl,247);assert.equal(result.trades[0].plannedRisk,0);assert.equal(result.trades[0].unreviewed,true);const again=parseTrades(rows,m,'paper',result.trades);assert.equal(again.trades.length,0);assert.equal(again.skipped,2);});
test('invalid date rows are skipped',()=>{const rows=csvRows('Ticket,Symbol,Open Time,Close Time,Profit\n1,EURUSD,no,no,5');assert.equal(parseTrades(rows,autoMap(rows[0]),'paper',[]).skipped,1);});
test('rejects an unrelated backup shape',()=>assert.equal(validateData({version:1}),false));
