import * as xlsx from "xlsx";
import * as fs from "fs";

export const xlsxToJson = (dataDestinationPath, jsonDestinationPath) => {
  try {
    const fileData = fs.readFileSync(dataDestinationPath);
    const workbook = xlsx.read(fileData, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    fs.writeFileSync(jsonDestinationPath, JSON.stringify(jsonData, null, 2));
    console.log("JSON file saved to", jsonDestinationPath);
  } catch (error) {
    console.error(error);
    throw new Error("Error converting XLSX to JSON");
  }
};
