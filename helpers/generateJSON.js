import * as fs from "fs";

/**
 * Generates a JSON file with the given fileName and object.
 *
 * @param {string} fileName - The name of the JSON file.
 * @param {object} object - The object to be converted to JSON and written to the file.
 * @return {void} This function does not return anything.
 */

export const generateJSON = (fileName, object) => {
  fs.writeFile(
    `cypress/data/${fileName}_${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}.json`,
    JSON.stringify(object),
    (err) => {
      if (err) throw err;
      console.log("JSON FILE CREATED SUCCESSFULLY!");
    }
  );
};
