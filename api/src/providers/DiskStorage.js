const fs = require("fs");
const path = require("path");
const upload = require("../configs/upload");

class DiskStorage {
  async saveFile(file) {
    await fs.promises.rename(
      path.resolve(upload.TMP_FOLDER, file),
      path.resolve(upload.UPLOAD_FOLDER, file)
    );

    return file;
  }

  async deleteFile(file) {
    const filePath = path.resolve(upload.UPLOAD_FOLDER, file);

    try {
      await fs.promises.stat(filePath);
    } catch {
      return;
    }

    await fs.promises.unlink(filePath);
  }
}

module.exports = DiskStorage;
