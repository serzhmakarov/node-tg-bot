const TelegramBot = require('node-telegram-bot-api');
const Game = require('./game');
const limitFunctionCalls = require('./helpers/limitFunctionCalls');

const token = '6703166879:AAE50ld-RgdeXZMRXktoPb90ah_c26xzNkw';
const bot = new TelegramBot(token, { polling: true });
const game = new Game(bot);

const callbackQueries = {
  dice: 'dice',
}

const listeners = {
  start: /\/start/,
  callbackQuery: /callback_query/,
}

const maxFunctionCalls = 6;
const callsInterval = 30 * 60 * 1000; // 30 min

const limitedRollDice = limitFunctionCalls({
  callback: game.rollDice.bind(game), 
  maxFunctionCalls, 
  callsInterval,
  handleLimitExceeded: game.handleLimitExceeded.bind(game),
});

bot.onText(listeners.start, (msg) => {
  const isStarted = game.isStarted();
  // TODO: Ask user if he's really want to restart the game? 
  // Add additional command for user with /restart, /score, /callsInterval and etc.
  if (isStarted) return;  

  game.start(msg.chat.id);
});

bot.on(listeners.callbackQuery, (callbackQuery) => {
  const message = callbackQuery.message;
  const data = callbackQuery.data;

  // Process the callback query
  if (data === callbackQueries.dice) {
    game.setChatId(message.chat.id);
    limitedRollDice();
  }
});

bot.on("polling_error", console.log);