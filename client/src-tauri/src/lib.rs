use notify::{Watcher, RecursiveMode};
use tauri::Manager;
use tauri::Emitter;
use tauri_plugin_dialog::DialogExt;
use tauri::tray::TrayIconBuilder;

#[tauri::command]
async fn select_directory(app: tauri::AppHandle) -> Result<String, String> {

    let path = app.dialog().file().blocking_pick_folder().ok_or("No selection")?;
    let path_str = path.to_string();
    let path_for_thread = path_str.clone();

    std::thread::spawn(move || {
        let mut w = notify::recommended_watcher(move |r: Result<notify::Event, notify::Error>| {
            if let Ok(e) = r {
                if matches!(e.kind, notify::EventKind::Create(_)) && !e.paths.is_empty() {
                    println!("[RUST]: File added: {}", e.paths[0].to_string_lossy());
                    app.emit("file-added", e.paths[0].to_string_lossy()).unwrap_or(());
                }
            }
        }).unwrap();
        w.watch(path_for_thread.as_ref(), RecursiveMode::Recursive).unwrap();
        std::thread::park();
    });

    Ok(path_str.clone())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let tray = TrayIconBuilder::new().build(app)?;
            // tray.set_icon("icon.png").unwrap();
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![select_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
