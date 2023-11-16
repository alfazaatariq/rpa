import pkg from "exceljs";
import { numberToExcelColumn } from "./numberToExcelColumn.js";

const { Workbook } = pkg;

/**
 * Generates an XLSX file based on the provided schema, file name, and number of rows.
 *
 * @param {Object} schema - The schema object containing the data schemas.
 * @param {string} fileName - The name of the file to be generated.
 * @param {number} [rows=2] - The number of rows to be generated in the file.
 * @return {void} This function does not return a value.
 */

export const generateXLSX = (schema, fileName, rows = 2) => {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Data");

  const schemas = schema.components.schemas; // access data schemas
  const headers = Object.keys(schemas); // get all keys from schemas and store it in an array

  worksheet.addRow(headers); // add headers to the first row

  const options = {};

  headers.forEach((key, columnIndex) => {
    const schema = schemas[key]; // get the schema for the key
    const column = numberToExcelColumn(columnIndex + 1); // convert the column index to Excel column name

    // Set data validation if "values" property is present and not empty
    if (schema.values && schema.values.length > 0) {
      // loop to add data validation to each n rows
      for (let i = 2; i <= rows + 1; i++) {
        const cell = worksheet.getCell(`${column}${i}`); // Target the cell to add data validation
        options[key] = schema.values; // Add the values to the object key

        // add data validation, in this case is a dropdown
        cell.dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: ['"' + options[key].join(",") + '"'], // this will list all the options for the dropdown
        };
      }
    }
  });

  // save the workbook
  workbook.xlsx
    .writeFile(
      `cypress/data/${fileName}_${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}.xlsx`
    )
    .then(function () {
      console.log("EXCEL FILE CREATED SUCCESSFULLY!");
    });
};
