const os = require("os");
const path = require("path");
const fs = require("fs");

const homeDir = os.homedir();
const settingJson = require("./setting-brave.json");
const braveProfileDir = path.join(homeDir, "AppData", "Local", "BraveSoftware", "Brave-Browser", "User Data");

fs.readdir(braveProfileDir, (err, files) => {
    if (err) {
        return console.log("Error reading dir: ", err);
    }

    const profileFolders = files.filter((file) => file.startsWith("Profile") || file === "Default");

    profileFolders.forEach((folder) => {
        const profilePath = path.join(braveProfileDir, folder);
        const preferencesPath = path.join(profilePath, "Preferences");

        if (fs.existsSync(preferencesPath)) {
            let oldJson;
            try {
                const data = fs.readFileSync(preferencesPath, "utf8");
                oldJson = JSON.parse(data);
            } catch (error) {
                console.error(`Lỗi khi đọc hoặc phân tích tệp ${preferencesPath}:`, error);
                return;
            }

            const updatedJson = updateJson(oldJson, settingJson);

            const jsonData = JSON.stringify(updatedJson, null, 2);

            fs.writeFile(preferencesPath, jsonData, (err) => {
                if (err) {
                    console.error(`Lỗi khi ghi vào tệp ${preferencesPath}:`, err);
                } else {
                    console.log(`Tệp ${preferencesPath} đã được ghi thành công!`);
                }
            });
        } else {
            console.log(`Không tìm thấy tệp Preferences trong ${profilePath}`);
        }
    });
});

function updateJson(oldJson, newJson) {
    function updateObject(oldObj, newObj) {
        for (const key in newObj) {
            if (newObj.hasOwnProperty(key)) {
                if (oldObj.hasOwnProperty(key)) {
                    if (typeof newObj[key] === "object" && newObj[key] !== null) {
                        updateObject(oldObj[key], newObj[key]);
                    } else {
                        oldObj[key] = newObj[key];
                    }
                } else {
                    oldObj[key] = newObj[key];
                }
            }
        }
    }

    updateObject(oldJson, newJson);
    return oldJson;
}
