/**
 * Converts a number to an Excel column string.
 *
 * @param {number} number - The number to convert.
 * @return {string} The Excel column string.
 */

export const numberToExcelColumn = (number) => {
  let column = "";
  while (number > 0) {
    const remainder = (number - 1) % 26; // Calculate the remainder
    column = String.fromCharCode(65 + remainder) + column; // Convert to character and prepend
    number = Math.floor((number - 1) / 26); // Update number for the next iteration
  }
  return column;
};
