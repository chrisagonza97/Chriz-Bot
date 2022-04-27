const {
  Client,
  Intents,
  Message,
  MessageButton,
  MessageActionRow,
} = require('discord.js');
const { token } = require('./config.json');
const { TicTacToe } = require('./databaseObjects.js');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.once('ready', () => {
  console.log('Ready!');
});

client.on('messageCreate', (message) => {
  if (message.author.id === client.user.id) return;

  if (message.content === 'hello') {
    message.reply('world');
  }
});

//tic tac toe

let empty = Symbol('empty');
let player = Symbol('player');
let bot = Symbol('bot');
let ttt_state;

function makeGrid() {
  components = [];
  for (let row = 0; row < 3; row++) {
    actionRow = new MessageActionRow();
    for (let col = 0; col < 3; col++) {
      messageButton = new MessageButton().setCustomId(
        'tictactoe_' + row + '_' + col,
      );
      switch (ttt_state[row][col]) {
        case empty:
          messageButton.setLabel(' ').setStyle('SECONDARY');
          break;
        case player:
          messageButton.setLabel('X').setStyle('PRIMARY');
          break;
        case bot:
          messageButton.setLabel('O').setStyle('DANGER');
          break;
      }

      actionRow.addComponents(messageButton);
    }

    components.push(actionRow);
  }

  return components;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function isDraw() {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (ttt_state[row][col] === empty) {
        return false;
      }
    }
  }
  return true;
}

function isGameOver() {
  for (let i = 0; i < 3; i++) {
    if (
      ttt_state[i][0] == ttt_state[i][1] &&
      ttt_state[i][1] == ttt_state[i][2] &&
      ttt_state[i][2] != empty
    ) {
      return true;
    }

    if (
      ttt_state[0][i] == ttt_state[1][i] &&
      ttt_state[1][i] == ttt_state[2][i] &&
      ttt_state[2][i] != empty
    ) {
      return true;
    }
  }

  if (ttt_state[1][1] != empty) {
    if (
      (ttt_state[0][0] == ttt_state[1][1] &&
        ttt_state[1][1] == ttt_state[2][2]) ||
      (ttt_state[2][0] == ttt_state[1][1] && ttt_state[1][1] == ttt_state[0][2])
    ) {
      return true;
    }
  }

  return false;
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith('tictactoe')) return;

  if (isGameOver()) {
    interaction.update({
      components: makeGrid(),
    });
    return;
  }

  let parsedFields = interaction.customId.split('_');
  let row = parsedFields[1];
  let col = parsedFields[2];

  if (ttt_state[row][col] != empty) {
    interaction.update({
      content: "You can't select that position!",
      components: makeGrid(),
    });
    return;
  }

  ttt_state[row][col] = player;

  if (isGameOver()) {
    let user = await TicTacToe.findOne({
      where: {
        user_id: interaction.user.id,
      },
    });
    if (!user) {
      user = await TicTacToe.create({
        user_id: interaction.user.id,
      });
    }

    await user.increment('score');
    interaction.update({
      content:
        'You won the game! You have now won ' +
        (user.get('score') + 1) +
        ' times!',
      components: makeGrid(),
    });
    return;
  }
  if (isDraw()) {
    interaction.update({
      content: 'The game resulted in a draw!',
      components: [],
    });
    return;
  }

  let botRow;
  let botCol;
  do {
    botRow = getRandomInt(3);
    botCol = getRandomInt(3);
  } while (ttt_state[botRow][botCol] !== empty);

  ttt_state[botRow][botCol] = bot;

  if (isGameOver()) {
    interaction.update({
      content: 'You lost the game!',
      components: makeGrid(),
    });
    return;
  }
  if (isDraw()) {
    interaction.update({
      content: 'The game resulted in a draw!',
      components: makeGrid(),
    });
    return;
  }

  interaction.update({
    components: makeGrid(),
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;

  if (commandName === 'tictactoe') {
    ttt_state = [
      [empty, empty, empty],
      [empty, empty, empty],
      [empty, empty, empty],
    ];
    await interaction.reply({
      content: 'playing a game of Tic-tac-toe',
      components: makeGrid(),
    });
  }
});
client.login(token);
