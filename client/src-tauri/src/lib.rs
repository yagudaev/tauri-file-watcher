use notify::{Watcher, RecursiveMode};
use tauri::Emitter;
use tauri::Manager;
use tauri_plugin_dialog::DialogExt;
use tauri::{menu::{Menu, MenuItem}, tray::TrayIconBuilder};

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
            // Create menu items as shown in the docs
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

            // Build menu with items
            let menu = Menu::with_items(app, &[&quit_item])?;

            // Create tray with menu
            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app_handle, event| {
                    match event.id.as_ref() {
                        "quit" => {
                            println!("Quit menu item clicked");
                            app_handle.app_handle().exit(0);
                        }
                        _ => {
                            println!("Menu item {:?} not handled", event.id);
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })

        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![select_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
