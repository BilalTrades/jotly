import {invoke} from '@tauri-apps/api/core';
import {JotlyData} from '../types';
import {defaults,validateData} from './core';
export const desktop=()=> '__TAURI_INTERNALS__' in window;
export async function load(){try{const x=desktop()?await invoke('load_journal_data'):JSON.parse(localStorage.getItem('jotly')||'null');if(x&&validateData(x))return x as JotlyData;if(x)throw Error('Invalid journal data');return defaults();}catch(e){throw e;}}
export async function save(data:JotlyData){if(desktop())await invoke('save_journal_data',{data});else localStorage.setItem('jotly',JSON.stringify(data));}
export async function backup(data:JotlyData){if(desktop()){await invoke('export_jotly_backup',{data});return;}const stream=new Blob([JSON.stringify(data)]).stream().pipeThrough(new CompressionStream('gzip'));const blob=await new Response(stream).blob();const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='jotly-backup.jotly';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
export async function restore(file?:File){if(desktop())return invoke<JotlyData|null>('import_jotly_backup');if(!file)return null;const text=await new Response(file.stream().pipeThrough(new DecompressionStream('gzip'))).text();return JSON.parse(text) as JotlyData;}
