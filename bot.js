import fs from "fs";
import TelegramBot from "node-telegram-bot-api";
import { registerUser, setLine, getLine } from "./src/database/db.js";
import dotenv from "dotenv";

import {
  findMinimumTime,
  divideObject,
  createStationsKeyboard,
} from "./src/functions.js";

dotenv.config();

try {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const bot = new TelegramBot(token, { polling: true });
  bot.addListener("message", async (msg) => {
    registerUser(msg.chat.id.toString());
    if (["احسان به دستغیب", "دستغیب به احسان"].includes(msg.text)) {
      await setLine(msg.chat.id.toString(), msg.text);
      bot.sendMessage(msg.chat.id, "خط با موفقیت تنظیم شد");
    }
    const keyboard = createStationsKeyboard("Shiraz");
    const userLine = await getLine(msg.chat.id.toString());
    if (userLine) {
      await bot
        .sendMessage(msg.chat.id, userLine + "\n" + "مبدا را انتخاب کنید", {
          reply_markup: {
            inline_keyboard: divideObject(keyboard),
            resize_keyboard: true,
          },
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      await bot.sendMessage(msg.chat.id, "لطفا خط مورد نظر را انتخاب کنید", {
        reply_markup: {
          keyboard: [
            [{ text: "احسان به دستغیب" }],
            [{ text: "دستغیب به احسان" }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
    }
  });

  bot.addListener("callback_query", async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;

    if (callbackQuery.data === "back") {
      setLine(chatId.toString(), null);
      await bot.deleteMessage(chatId, callbackQuery.message.message_id);
      await bot.sendMessage(chatId, "لطفا خط مورد نظر را انتخاب کنید", {
        reply_markup: {
          keyboard: [
            [{ text: "احسان به دستغیب" }],
            [{ text: "دستغیب به احسان" }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
      return;
    }

    const origin = callbackQuery.data;
    const buttonLabels = JSON.parse(
      fs.readFileSync("./src/origins.json", "utf8")
    ).Shiraz;
    const userLine = await getLine(callbackQuery.message.chat.id.toString());
    let messageText = userLine + "\n" + `مبدا شما ${buttonLabels[origin]}:`;
    findMinimumTime(origin, userLine).then((minTime) => {
      if (minTime === 0) {
        messageText += "\nمترو کمتر از یک دقیقه دیگه میرسه";
      } else if (minTime === 15) {
        messageText += "\nمترو تازه رفته! ربع ساعت دیگه میرسه";
      } else {
        messageText += "\nمترو تقریبا " + minTime + " دقیقه دیگه میرسه";
      }
      bot.sendMessage(chatId, messageText);
    });
  });

  console.log("Bot running...");
} catch (error) {
  console.error("Error in bot.js:", error.message);
}
