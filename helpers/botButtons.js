module.exports = {
  diceBtn: {
    reply_markup: {
      inline_keyboard: [[{ text: 'Бросить кости! 🎲', callback_data: 'dice' }]],
      resize_keyboard: true,
    },
  },
}