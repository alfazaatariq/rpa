import puppeteer from "puppeteer";
import cypress from "cypress";
import * as path from "path";
import * as fs from "fs";
import { isNumber } from "../helpers/isNumber.js";
import { createSchema } from "../helpers/createSchema.js";
import connectToDB from "../database/connection.js";
import { configDotenv } from "dotenv";
import { xlsxToJson } from "../helpers/xlsxToJson.js";
import { saveXlsxFile } from "../helpers/saveXlsxFile.js";
import { olibsLogin } from "../helpers/olibsLogin.js";
import { isEmptyString } from "../helpers/isEmptyString.js";
import { generateXLSX } from "../helpers/generateXLSX.js";
import { generateJSON } from "../helpers/generateJSON.js";
import Joi from "joi";

configDotenv({ path: "env/.env.db" });

export const logToDB = (req, res) => {
  const loggingSchema = Joi.object({
    web: Joi.string()
      .uri({ scheme: ["http", "https"] })
      .required(),
    input: Joi.object().required(),
    output: Joi.object().required(),
    created_by: Joi.string().email().required(),
    updated_by: Joi.string().email().required(),
  });

  const { error, value } = loggingSchema.validate(req.body);

  if (error) {
    console.error(error);
    return res.status(400).json({ message: error.details[0].message });
  }

  const connection = connectToDB(
    process.env.HOST,
    process.env.USERNAME,
    process.env.PASSWORD,
    process.env.DATABASE
  );

  const sql = `INSERT INTO log (web, input, output, created_by, updated_by) VALUES (?, JSON_UNQUOTE(?), JSON_UNQUOTE(?), ?, ?)`;

  connection.query(
    sql,
    [
      value.web,
      JSON.stringify(value.input),
      JSON.stringify(value.output),
      value.created_by,
      value.updated_by,
    ],
    (err) => {
      if (err) {
        console.error("Error inserting data: " + err);
        res.status(500).json({ message: "Error inserting data" });
        return;
      }

      console.log("Data inserted successfully");
      res.status(200).json({ message: "Data inserted successfully" });
    }
  );
};

export const automate = async (req, res) => {
  const automateSchema = Joi.object({
    cy_test: Joi.string().required(),
    url: Joi.string()
      .uri({ scheme: ["http", "https"] })
      .required(),
  });

  const { error, value } = automateSchema.validate(req.body);

  if (error) {
    console.error(error);
    return res.status(400).json({ message: error.details[0].message });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const uploadedFilePath = req.file.path;
  const dataDirectory = "cypress/data"; // Directory for XLSX files
  const fixturesDirectory = "cypress/fixtures"; // Directory for JSON files

  // Create the full destination path for the XLSX file in the data directory
  const dataDestinationPath = path.join(dataDirectory, req.file.originalname);

  // Create the full destination path for the JSON file in the fixtures directory
  const jsonDestinationPath = path.join(
    fixturesDirectory,
    req.file.originalname.replace(/\.xlsx$/, ".json")
  );

  try {
    saveXlsxFile(uploadedFilePath, dataDestinationPath);
    xlsxToJson(dataDestinationPath, jsonDestinationPath);

    let result = await cypress.run({
      headed: true,
      spec: `cypress/e2e/${value.cy_test}.cy.js`,
      config: {
        e2e: {
          baseUrl: value.url,
        },
      },
      env: {
        json: req.file.originalname.replace(/\.xlsx$/, ".json"),
      },
    });

    if (
      result.status == "failed" &&
      result.message == "Could not find Cypress test run results"
    ) {
      return res.status(400).send({ message: result.message });
    }

    res.status(200).json({ message: "RPA DONE", result });

    fs.unlinkSync(dataDestinationPath);
    fs.unlinkSync(jsonDestinationPath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
};

export const olibsScrape = async (page, browser, json_name) => {
  const schema = {
    components: {
      schemas: {},
    },
  };

  try {
    // Get all <input> elements without hidden/submit/button type
    const inputElements = await page.$$(
      "input:not([type='hidden']):not([type='submit']):not([type='button'])"
    );

    const selectElements = await page.$$("select"); //Get all <select> elements

    const spanElements = await page.$$("span.z-label");

    for (let i = 4; i < inputElements.length; i++) {
      const name = await page.evaluate((el) => el.name, inputElements[i]); // get the input element name
      const id = await page.evaluate((el) => el.id, inputElements[i]); // get the input element id
      const type = await page.evaluate((el) => el.type, inputElements[i]); // get the input element type
      const inputLabel = await page.evaluate(
        (el) => el.textContent.toLowerCase().replace(" ", "_"),
        spanElements[i + 7]
      );

      // check if the input element type is checkbox/radio
      if (type === "checkbox" || type === "radio") {
        // If it is, then get all label elements with attribute for == id of the input element
        const label = await page.evaluate(
          (id) => document.querySelector(`label[for="${id}"]`).textContent,
          id
        );
        // create inputSchema for the labels
        const inputSchema = createSchema("string", [label]);

        // check if the key is already exist in the schema
        if (
          schema.components.schemas[
            isEmptyString(name) ? `${inputLabel}` : `${name}`
          ]
        ) {
          schema.components.schemas[
            isEmptyString(name) ? `${inputLabel}` : `${name}`
          ].values.push(label); // If exist, then add the values to the key
        } else {
          schema.components.schemas[
            isEmptyString(name) ? `${inputLabel}` : `${name}`
          ] = inputSchema; // else, create an initial type and values
          schema.components.schemas[
            isEmptyString(name) ? `${inputLabel}` : `${name}`
          ];
        }
      } else {
        // check data type
        const inputElementValue = await page.evaluate(
          (el) => el.value,
          inputElements[i]
        );

        const dataType = isNumber(inputElementValue) ? "number" : "string";

        schema.components.schemas[
          isEmptyString(name) ? `${inputLabel}` : `${name}`
        ] = {
          type: dataType,
        }; // else, create data type only to the key
      }
    }

    // loop through the inputElements array

    // loop through the selectElements array
    for (const selectElement of selectElements) {
      const name = await page.evaluate((el) => el.name, selectElement); // get the select element name
      // Get <option> from select element
      const options = await page.$$eval(
        `select[name="${name}"] option`,
        (option) => option.map((option) => option.value)
      );

      // create selectSchema for the labels
      const selectSchema = createSchema("string", options);

      schema.components.schemas[name] = selectSchema; // Add select element type to the schema
    }

    generateJSON(json_name, schema);

    browser.close();

    return {
      isSuccess: true,
      schema,
    };
  } catch (error) {
    console.error("message: ", error.message);
    browser.close();

    return {
      isSuccess: false,
      schema,
    };
  }
};

export const genericScrape = async (req, res) => {
  const requestSchema = Joi.object({
    url: Joi.string()
      .uri({ scheme: ["http", "https"] })
      .required(),
    rows: Joi.number(),
  });

  const { error, value } = requestSchema.validate(req.body);

  if (error) {
    console.error(error);
    return res.status(400).json({ message: error.details[0].message });
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(10000);

  const schema = {
    components: {
      schemas: {},
    },
  };

  try {
    await page.goto(value.url);

    // Get all <input> elements without hidden/submit/button type
    const inputElements = await page.$$(
      "input:not([type='hidden']):not([type='submit']):not([type='button'])"
    );

    const selectElements = await page.$$("select"); //Get all <select> elements

    // loop through the inputElements array
    for (const inputElement of inputElements) {
      const name = await page.evaluate((el) => el.name, inputElement); // get the input element name
      const id = await page.evaluate((el) => el.id, inputElement); // get the input element id
      const type = await page.evaluate((el) => el.type, inputElement); // get the input element type

      // check if the input element type is checkbox/radio
      if (type === "checkbox" || type === "radio") {
        // If it is, then get all label elements with attribute for == id of the input element
        // const label = await page.evaluate(
        //   (id) => document.querySelector(`label[for="${id}"]`).textContent,
        //   id
        // );

        const value = await page.evaluate((el) => el.value, inputElement);

        // create inputSchema for the labels
        // const inputSchema = createSchema("string", [label]);
        const inputSchema = createSchema("string", [value]);

        // // check if the key is already exist in the schema
        // if (schema.components.schemas[isEmptyString(id) ? name : id]) {
        //   schema.components.schemas[isEmptyString(id) ? name : id].values.push(
        //     label
        //   ); // If exist, then add the values to the key
        // } else {
        //   schema.components.schemas[isEmptyString(id) ? name : id] =
        //     inputSchema; // else, create an initial type and values
        // }

        // check if the key is already exist in the schema
        if (schema.components.schemas[isEmptyString(name) ? id : name]) {
          schema.components.schemas[
            isEmptyString(name) ? id : name
          ].values.push(value); // If exist, then add the values to the key
        } else {
          schema.components.schemas[isEmptyString(name) ? id : name] =
            inputSchema; // else, create an initial type and values
        }
      } else {
        // check data type
        const inputElementValue = await page.evaluate(
          (el) => el.value,
          inputElement
        );

        const dataType = isNumber(inputElementValue) ? "number" : "string";

        schema.components.schemas[isEmptyString(name) ? id : name] = {
          type: dataType,
        }; // else, create data type only to the key
      }
    }

    // loop through the selectElements array
    for (const selectElement of selectElements) {
      const name = await page.evaluate((el) => el.name, selectElement); // get the select element name
      // Get <option> from select element
      const options = await page.$$eval(
        `select[name="${name}"] option`,
        (option) => option.map((option) => option.value)
      );

      // create selectSchema for the labels
      const selectSchema = createSchema("string", options);

      schema.components.schemas[name] = selectSchema; // Add select element type to the schema
    }

    const parsedURL = new URL(value.url);
    const domainName = parsedURL.hostname;
    const protocol = parsedURL.protocol.split(":")[0];
    const path = parsedURL.pathname.split("/")[1];
    const fileName = `${protocol}_${domainName}_${path}`;

    generateJSON(fileName, schema);

    generateXLSX(schema, fileName, (value.rows = 2));

    browser.close();

    res.status(200).send({
      message: "FILE CREATED SUCCESSFULLY!",
    });
  } catch (error) {
    console.error("message: ", error.message);
    browser.close();

    res.status(500).send({
      message: "ERROR CREATING FILES!",
      error: error.message,
    });
  }
};

export const downloadXLSX = (req, res) => {
  const downloadSchema = Joi.object({
    name: Joi.string().required(),
  });

  const { error, value } = downloadSchema.validate(req.params);

  if (error) {
    console.error(error);
    return res.status(400).json({ message: error.details[0].message });
  }

  const filePath = `cypress/data/${
    value.name.split(".xlsx")[0]
  }_${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}.xlsx`;

  res.download(filePath);
};

export const entryPembukaanCDDSederhana = async (req, res) => {
  const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    file_name: Joi.string().required(),
  });

  const { error, value } = loginSchema.validate(req.body);

  if (error) {
    console.error(error);
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { isLoggedIn, login_id, page, browser } = await olibsLogin(
      value.username,
      value.password
    );

    if (!isLoggedIn) {
      return res.status(500).json({ message: "Login Failed" });
    }

    const entryMenu = `#${login_id}d0-cave`;
    await page.click(entryMenu);
    const customerBaseMenu = `#${login_id}h0-cave`;
    await page.click(customerBaseMenu);
    const cddSederhanaPeroranganMenu = `#${login_id}41-cave`;
    await page.click(cddSederhanaPeroranganMenu);

    const pembukaanCDDSederhanaPerorangan = `#${login_id}81-cave`;
    await page.waitForSelector(pembukaanCDDSederhanaPerorangan);
    await page.click(pembukaanCDDSederhanaPerorangan, {
      clickCount: 2,
    });
    // await page.waitForSelector(`input[id*='_m']`); //tunggu sampai element muncul

    const { isSuccess, schema } = await olibsScrape(
      page,
      browser,
      value.file_name
    );

    if (!isSuccess) {
      return res.status(500).json({ message: "Failed to scrape" });
    }

    generateXLSX(schema, value.file_name);

    res.status(200).send({ message: "Scraped successfully" });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};

export const inquiryRekapRekeningPembiayaanPerNasabah = async (req, res) => {
  const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    file_name: Joi.string().required(),
  });

  const { error, value } = loginSchema.validate(req.body);

  if (error) {
    console.error(error);
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { isLoggedIn, login_id, page, browser } = await olibsLogin(
      value.username,
      value.password
    );

    if (!isLoggedIn) {
      return res.status(500).json({ message: "Login Failed" });
    }

    const inquiryMenu = `#${login_id}bc-cave`;
    await page.click(inquiryMenu);

    const inquiryRekapRekeningPembiayaanPerNasabah = `#${login_id}oc-cave`;
    await page.waitForSelector(inquiryRekapRekeningPembiayaanPerNasabah);
    await page.click(inquiryRekapRekeningPembiayaanPerNasabah, {
      clickCount: 2,
    });
    await page.waitForSelector(`input[id*='_m']`);

    const { isSuccess, schema } = await olibsScrape(
      page,
      browser,
      value.file_name
    );

    if (!isSuccess) {
      return res.status(500).json({ message: "Failed to scrape" });
    }

    generateXLSX(schema, value.file_name);

    res.status(200).send({ message: "Scraped successfully" });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};
