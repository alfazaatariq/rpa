import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import {
  automate,
  logToDB,
  inquiryRekapRekeningPembiayaanPerNasabah,
  genericScrape,
  downloadXLSX,
  entryPembukaanCDDSederhana,
} from "./controllers/controllers.js";
import multer from "multer";
import * as path from "path";

configDotenv({ path: "env/.env" });

const app = express();

app.use(express.json());
app.use(cors());

// Configure multer to store uploaded files in a directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "cypress/data"); // Change the destination directory to 'cypress/data' for XLSX files
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep the original filename
  },
});

const fileFilter = (req, file, cb) => {
  // Check if the file has a valid XLSX file extension (e.g., .xlsx)
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (fileExtension === ".xlsx") {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Invalid file format. Only XLSX files are allowed."));
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

app.post(
  "/inquiry_rekap_rekening_pembiayaan_per_nasabah",
  inquiryRekapRekeningPembiayaanPerNasabah
);

app.post("/entry_pembukaan_cdd_sederhana", entryPembukaanCDDSederhana);
app.post("/scrape", genericScrape);
app.post("/automate", upload.single("file"), automate);
app.post("/log", logToDB);
app.get("/download/:name", downloadXLSX);

app.listen(process.env.PORT, () => {
  console.log(`LISTENING ON PORT ${process.env.PORT}`);
});
