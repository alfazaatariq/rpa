import * as fs from "fs";

export const saveXlsxFile = (uploadedFilePath, destinationPath) => {
  fs.copyFile(uploadedFilePath, destinationPath, (err) => {
    if (err) {
      console.error("Error saving the XLSX file:", err);
      return;
    } else {
      console.log("XLSX file saved to", destinationPath);
      return;
    }
  });
};
