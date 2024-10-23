import csv from "csv-parser";
import moment from "moment-timezone";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

dotenv.config();

function createStationsKeyboard(origin) {
  const originsData = fs.readFileSync(__dirname + "/origins.json", "utf8");
  const buttonLabels = JSON.parse(originsData);
  const keyboard = [];
  for (const label in buttonLabels[origin]) {
    keyboard.push({ text: buttonLabels[origin][label], callback_data: label });
  }
  keyboard.push({ text: "بازگشت", callback_data: "back" });
  return keyboard;
}
function divideObject(obj, maxSize = 4) {
  const keys = Object.keys(obj);
  const result = [];
  let temp = [];
  let index = 0;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    temp.push(obj[key]);
    if (Object.keys(temp).length === maxSize || i === keys.length - 1) {
      result.push(temp);
      temp = [];
      index++;
    }
  }
  return Object.values(result);
}
function findMinimumTime(origin, userLine) {
  return new Promise((resolve, reject) => {
    try {
      let minimumTime = 0;
      let lineFile = "";
      if (userLine === "احسان به دستغیب") {
        lineFile = __dirname + "/../lines/ehsanDastgheyb.csv";
      } else if (userLine === "دستغیب به احسان") {
        lineFile = __dirname + "/../lines/dastgheybEhsan.csv";
      } else {
        return;
      }
      fs.createReadStream(lineFile)
        .pipe(csv())
        .on("data", (row) => {
          const targetTime = moment.tz(row[origin], "HH:mm:ss", process.env.TZ);
          const now = moment.tz(process.env.TZ);
          const timeDiffMilliseconds = targetTime.diff(now);
          const diffMinutes = moment.duration(timeDiffMilliseconds).asMinutes();
          if (minimumTime === 0 || diffMinutes < minimumTime) {
            if (diffMinutes > 0) {
              minimumTime = diffMinutes;
            }
          }
        })
        .on("error", (err) => {
          reject(err);
        })
        .on("end", () => {
          const minFinaltime = Math.round(minimumTime);
          resolve(minFinaltime);
        });
    } catch (error) {
      console.error("Error in findMinimumTime:", error.message);
    }
  });
}
export { divideObject, findMinimumTime, createStationsKeyboard };
