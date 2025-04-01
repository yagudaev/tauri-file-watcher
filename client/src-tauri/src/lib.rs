#[tauri::command]
async fn select_directory(app: tauri::AppHandle) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app.dialog()
        .file()
        .blocking_pick_folder();

    match file_path {
        Some(path) => Ok(path.to_string()),
        None => Err("No directory selected".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![select_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
