const answers = require('./helpers/answers.js');
const snakesAndArrowsCells = require('./squares.json')
const botBtns = require('./helpers/botButtons.js');

module.exports = class Game {
  started = false;
  playerCell = 0;
  repeatsLength = 0;
  minRoll = 1;
  maxRoll = 6;
  
  cells = {
    start: 1,
    end: 68,
    total: 72,
  };

  constructor(bot) {
    this.bot = bot;
  };

  start(chatId) {
    this.chatId = chatId;
    this.started = true;
    this.playerCell = 0;
    this.sendMessage('Бросьте кубик что бы начать!')
  };

  restart(chatId) {
    this.playerCell = 0;
    this.repeatsLength = 0;
    this.started = true;
    this.chatId = chatId ?? this.chatId;
    this.sendMessage('Бросьте кубик что бы начать!')
  }

  isStarted() {
    return this.started;
  };

  getPlayerCell() {
    console.log('player cell: ', this.playerCell);
    return this.playerCell;
  };

  incrementRepeats() {
    this.repeatsLength += 1;
  }

  clearRepeatsLength() {
    this.repeatsLength = 0;
  };

  setChatId(chatId) {
    console.log('setChatID', chatId);
    this.chatId = chatId;
  };

  getSumOfRepeats() {
    return this.maxRoll * this.repeatsLength;
  };

  movePlayer(cell) {
    // TODO: Change variable name
    let greateCell = snakesAndArrowsCells[cell];

    if (greateCell) {
      this.playerCell = greateCell.cells.to;
      console.log(`This is a ${greateCell.name}! Move to ${this.playerCell}`);

    } else {
      this.playerCell = cell;
      console.log('Move player to: ', this.playerCell);
    }    
  };

  sendMessage(message) {
    console.log('sendMessage: ', message);

    this.bot.sendMessage(this.chatId, message, botBtns.diceBtn);
  };

  async rollDice() {
    console.log('Rolling dice...');
    
    try {
      const diceResult = await this.bot.sendDice(this.chatId);
      const diceValue = diceResult.dice.value;

      this.handleDiceValue(diceValue);
    } catch (error) {
      console.log(error);
    }
  }

  handleDiceValue(diceValue) {
    console.log('Rolling dice: ', diceValue);

    const validates = {
      isDiceValueMaxRoll: diceValue === this.maxRoll,
      isThreeRepeats: this.repeatsLength === 3,
      isRepatsMoreOrEqualFour: his.repeatsLength >= 4,
      isRepeatsLessThenThree: this.repeatsLength > 0 && this.repeatsLength > 3,
      isScoreOverTotal: this.playerCell >= this.cells.total, // TODO: Prevent this freak behavior
      isFinishGame: this.playerCell > this.cells.end && this.diceValue === (this.cells.total - this.playerCell) // TODO: Cut string
    };

    if (validates.isScoreOverTotal) {
      console.log('Error: Play scores over the total size! Restart!');
      this.restart();
      return;
    }

    if (validates.isFinishGame) {
      console.log('FINISH OF THE GAME! Restart!');
      this.restart();
      return;
    } 

    if (validates.isDiceValueMaxRoll) {
      this.incrementRepeats();
      this.sendMessage(answers.rollSixMessage);
      return;
    }

    if (validates.isRepeatsLessThenThree) {
      let firstMove = this.playerCell + (this.maxRoll * this.repeatsLength);

      this.movePlayer(firstMove);
      this.movePlayer(this.playerCell + diceValue);
      return;
    }

    if (validates.isThreeRepeats) {
      this.clearRepeatsLength();
      this.movePlayer(diceValue);
      return;
    } 

    if (validates.isRepatsMoreOrEqualFour) {
      let nextCell = this.playerCell + diceValue + this.getSumOfRepeats();
      
      this.movePlayer(nextCell);
      this.clearRepeatsLength();
      return;
    }

    this.movePlayer(this.playerCell + diceValue);
    this.sendMessage(`Выпало число: ${diceValue}. Клетка: ${this.playerCell}`);
  };

  handleLimitExceeded(timeLeft) {
    let limitInfoText = `Лимит превышен. Пожалуйста, подождите еще ${timeLeft} минут.`

    this.sendMessage(limitInfoText);
  }
}