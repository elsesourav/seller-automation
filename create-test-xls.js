import fs from "fs";
import XLSX from "xlsx";

// Read CSV data
const csvData = fs.readFileSync("./test-data.csv", "utf8");
const lines = csvData.trim().split("\n");
const data = lines.map((line) => line.split(","));

// Create workbook and worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet(data);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

// Write .xls file
XLSX.writeFile(workbook, "./test-products.xls", { bookType: "xls" });

console.log("Test .xls file created successfully!");
