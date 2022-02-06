require('dotenv').config();

const fs = require('fs');
const { Telegraf } = require('telegraf');
const NodeWebcam = require('node-webcam');

// create images folder
const imageFolder = './images';

if (!fs.existsSync(imageFolder)) {
  fs.mkdirSync(imageFolder);
}

const webcamOptions = {
  width: 640,
  height: 480,
  quality: 100,
  delay: 0,
  saveShots: true,
  output: 'jpeg',
  device: false,
  callbackReturn: 'location',
  location: '/images',
  verbose: false
};

const bot = new Telegraf(process.env.BOT_API_KEY);
const allowedIds = process.env.USER_IDS.split(',');

bot.command('start', (ctx) => {
  console.log(ctx.from);
  bot.telegram.sendMessage(ctx.chat.id, 'Hello there! Welcome!');
});

bot.command('pic', (ctx) => {
  console.log(ctx.from);
  if (allowedIds.includes(ctx.from.id.toString())) {
    try {
      bot.telegram.sendMessage(
        ctx.chat.id,
        `Hello ${ctx.from.first_name}! Taking photo, one moment please...`
      );
      NodeWebcam.capture(
        `images/pic_${Date.now()}`,
        webcamOptions,
        (err, data) => {
          if (err) {
            console.log(`Error in webcam ${err}`);
          }
          console.log(`Sending photo ${data}`);
          bot.telegram.sendPhoto(ctx.chat.id, { source: data });
        }
      );
    } catch (err) {
      console.log(`General error in /pic ${err}`);
    }
  } else {
    bot.telegram.sendMessage(ctx.chat.id, 'Sorry, not allowed!');
  }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
