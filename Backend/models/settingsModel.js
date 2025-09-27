const db = require("../config/db");

const Settings = {
    update: (userId, settingsData, callback) => {
        const sql = `
            INSERT INTO user_settings (user_id, notify_new_requests, notify_responses, notify_updates)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            notify_new_requests = VALUES(notify_new_requests),
            notify_responses = VALUES(notify_responses),
            notify_updates = VALUES(notify_updates),
            theme = VALUES(theme),
            language = VALUES(language)
        `;
        db.query(sql, [
            userId,
            settingsData.notify_new_requests,
            settingsData.notify_responses,
            settingsData.notify_updates,
            settingsData.theme,
            settingsData.language
        ], callback);
    }
};

module.exports = Settings;