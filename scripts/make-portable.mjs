import {mkdir,copyFile} from 'node:fs/promises';
if(process.platform!=='win32')throw Error('Build the Windows portable executable on Windows.');
await mkdir('dist-portable',{recursive:true});
await copyFile('src-tauri/target/release/jotly.exe','dist-portable/jotly.exe');
console.log('Portable executable: dist-portable/jotly.exe (requires WebView2; data remains in LOCALAPPDATA).');
