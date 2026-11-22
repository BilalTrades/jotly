use std::{fs,io::{Read,Write},path::PathBuf,sync::Mutex};
use flate2::{read::GzDecoder,write::GzEncoder,Compression};
use serde_json::Value;
use tauri::{Manager,State};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_opener::OpenerExt;
struct JournalLock(Mutex<()>);
fn directory(app:&tauri::AppHandle)->Result<PathBuf,String>{
 let base=app.path().local_data_dir().map_err(|e|e.to_string())?;
 let p=base.join("jotly").join("data");fs::create_dir_all(&p).map_err(|e|e.to_string())?;Ok(p)
}
fn valid(v:&Value)->Result<(),String>{if v["version"]!=1||!v["accounts"].is_array()||v["accounts"].as_array().map_or(true,|a|a.is_empty())||!v["trades"].is_array()||!v["strategies"].is_array()||!v["weeklyReviews"].is_array()||!v["settings"].is_object(){Err("Invalid jotly journal format".into())}else{Ok(())}}
#[tauri::command]
fn load_journal_data(app:tauri::AppHandle,lock:State<JournalLock>)->Result<Option<Value>,String>{let _guard=lock.0.lock().map_err(|e|e.to_string())?;let p=directory(&app)?.join("journal.json");if !p.exists(){return Ok(None)}let v=serde_json::from_slice(&fs::read(p).map_err(|e|e.to_string())?).map_err(|e|e.to_string())?;valid(&v)?;Ok(Some(v))}
#[tauri::command]
fn save_journal_data(app:tauri::AppHandle,data:Value,lock:State<JournalLock>)->Result<(),String>{valid(&data)?;let _guard=lock.0.lock().map_err(|e|e.to_string())?;let dir=directory(&app)?;let target=dir.join("journal.json");let temp=dir.join("journal.tmp");let bytes=serde_json::to_vec(&data).map_err(|e|e.to_string())?;let mut file=fs::File::create(&temp).map_err(|e|e.to_string())?;file.write_all(&bytes).map_err(|e|e.to_string())?;file.sync_all().map_err(|e|e.to_string())?;drop(file);
 // Preserve the last valid journal before replacing the destination on Windows.
 if target.exists(){fs::copy(&target,dir.join("journal.previous.json")).map_err(|e|e.to_string())?;}
 fs::rename(&temp,&target).or_else(|_|{if target.exists(){fs::remove_file(&target)?;}fs::rename(&temp,&target)}).map_err(|e|e.to_string())?;Ok(())}
#[tauri::command]
fn open_data_folder(app:tauri::AppHandle)->Result<(),String>{let p=directory(&app)?;app.opener().open_path(p.to_string_lossy(),None::<&str>).map_err(|e|e.to_string())}
#[tauri::command]
async fn export_jotly_backup(app:tauri::AppHandle,data:Value)->Result<(),String>{valid(&data)?;tauri::async_runtime::spawn_blocking(move||{if let Some(file)=app.dialog().file().add_filter("jotly backup",&["jotly"]).set_file_name("jotly-backup.jotly").blocking_save_file(){let path=file.into_path().map_err(|e|e.to_string())?;let mut gz=GzEncoder::new(Vec::new(),Compression::default());serde_json::to_writer(&mut gz,&data).map_err(|e|e.to_string())?;fs::write(path,gz.finish().map_err(|e|e.to_string())?).map_err(|e|e.to_string())?;}Ok(())}).await.map_err(|e|e.to_string())?}
#[tauri::command]
async fn import_jotly_backup(app:tauri::AppHandle)->Result<Option<Value>,String>{tauri::async_runtime::spawn_blocking(move||{if let Some(file)=app.dialog().file().add_filter("jotly backup",&["jotly"]).blocking_pick_file(){let path=file.into_path().map_err(|e|e.to_string())?;let mut text=String::new();GzDecoder::new(fs::File::open(path).map_err(|e|e.to_string())?).take(256*1024*1024+1).read_to_string(&mut text).map_err(|e|e.to_string())?;if text.len()>256*1024*1024{return Err("Backup exceeds 256 MB uncompressed".into())}let data=serde_json::from_str(&text).map_err(|e|e.to_string())?;valid(&data)?;return Ok(Some(data))}Ok(None)}).await.map_err(|e|e.to_string())?}
#[tauri::command]
async fn read_local_csv(app:tauri::AppHandle)->Result<Option<String>,String>{tauri::async_runtime::spawn_blocking(move||{if let Some(file)=app.dialog().file().set_title("Select MT4 MQL4/Files/jotly or MT5 Common/Files/jotly folder").blocking_pick_folder(){let p=file.into_path().map_err(|e|e.to_string())?.join("closed_trades.csv");let bytes=fs::read(p).map_err(|e|e.to_string())?;if bytes.len()>25*1024*1024{return Err("CSV exceeds 25 MB".into())}return String::from_utf8(bytes).map(Some).map_err(|e|e.to_string())}Ok(None)}).await.map_err(|e|e.to_string())?}
#[cfg_attr(mobile,tauri::mobile_entry_point)]
pub fn run(){tauri::Builder::default().manage(JournalLock(Mutex::new(()))).plugin(tauri_plugin_dialog::init()).plugin(tauri_plugin_opener::init()).invoke_handler(tauri::generate_handler![load_journal_data,save_journal_data,open_data_folder,export_jotly_backup,import_jotly_backup,read_local_csv]).run(tauri::generate_context!()).expect("could not start jotly");}
