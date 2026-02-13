// convert-font.js
import fs from "fs";

const font = fs.readFileSync("./Cairo-Regular.ttf");
const base64 = font.toString("base64");

fs.writeFileSync("./Cairo-Regular-base64.txt", base64);

console.log("✅ Base64 file created successfully");
