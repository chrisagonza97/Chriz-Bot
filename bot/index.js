const {
  Client,
  Intents,
  Message,
  MessageButton,
  MessageActionRow,
} = require('discord.js');
const { token } = require('./config.json');
const { TicTacToe, StocksOwned } = require('./databaseObjects.js');
const getStockPrice = require('./util/stock-scraper.js');

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

//paper trading
//handler for /paper balance
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;
  //print out subcommand name
  //console.log(interaction.options._subcommand);

  if (
    commandName === 'paper' &&
    interaction.options._subcommand === 'balance'
  ) {
    const user = await TicTacToe.findOne({
      where: {
        user_id: interaction.user.id,
        guild_id: interaction.guild.id,
      },
    });
    if (!user) {
      user = await TicTacToe.create({
        user_id: interaction.user.id,
        guild_id: interaction.guild.id,
      });
    }
    interaction.reply(
      'Your cash balance is $' + user.get('cash_balance').toFixed(2),
    );
  }
});
//handler for /paper price, replys with the price of input ticker
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;
  if (commandName === 'paper' && interaction.options._subcommand === 'price') {
    //console.log(interaction.options.getString('ticker'));

    const ticker = interaction.options.getString('ticker');
    try {
      const price = await getStockPrice(ticker);
      interaction.reply(`The price of ${ticker.toUpperCase()} is $${price}`);
    } catch (err) {
      interaction.reply(`Could not find $${ticker.toUpperCase()}`);
    }
  }
});
//handler for /buy
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;
  if (commandName === 'paper' && interaction.options._subcommand === 'buy') {
    const ticker = interaction.options.getString('ticker');
    const amount = interaction.options.getString('amount');
    const name = interaction.user.username;
    let price;
    try {
      price = await getStockPrice(ticker);
    } catch (err) {
      interaction.reply(`Could not find $${ticker.toUpperCase()}`);
      return;
    }
    if (amount.startsWith('$')) {
      let parsedNum = parseFloat(amount.slice(1));

      //check if parsedNum is a number
      if (
        isNaN(parsedNum) ||
        parsedNum < 0.01 ||
        ((parsedNum * 100) % 1) / 100 != 0
      ) {
        console.log(isNaN(parsedNum));
        console.log(parsedNum < 0.01);
        console.log(parsedNum % 0.01);

        interaction.reply(`Amount entered is not valid. Please try again`);
        return;
      }
      //check if user has enough money.
      let user = await TicTacToe.findOne({
        where: {
          user_id: interaction.user.id,
          guild_id: interaction.guild.id,
        },
      });
      //if user does not exist, create user that means he has the default value of 10000.0
      if (!user) {
        user = await TicTacToe.create({
          user_id: interaction.user.id,
          guild_id: interaction.guild.id,
        });
      }
      if (user.get('cash_balance') < parsedNum) {
        interaction.reply(
          `You do not have enough money to buy $${parsedNum} of ${ticker.toUpperCase()} your balance is $${user
            .get('cash_balance')
            .toFixed(2)}`,
        );
        return;
      }
      //otherwise amount is greater than or equal to
      interaction.reply({
        content: `${
          interaction.user.username
        } Are you sure you want to buy $${parsedNum} of ${ticker.toUpperCase()}?`,
        components: makeButtons(interaction.user.id, ticker, parsedNum),
      });
    } else {
      //else amount is amount of stock to be bought
      //check if amount is a number
      const cost = parseFloat(amount) * price;

      if (isNaN(amount) || parseFloat(amount) < 0.01 || cost < 0.01) {
        interaction.reply(`Amount entered is not valid. Please try again`);
        return;
      }

      //check if user has enough money.
      const user = await TicTacToe.findOne({
        where: {
          user_id: interaction.user.id,
          guild_id: interaction.guild.id,
        },
      });
      //if user does not exist, create user that means he has the default value of 10000
      if (!user) {
        user = await TicTacToe.create({
          user_id: interaction.user.id,
          guild_id: interaction.guild.id,
        });
      }
      if (user.get('cash_balance') < cost) {
        interaction.reply(
          `${name}, you do not have enough money to buy ${amount} shares  of ${ticker.toUpperCase()} ($${cost}) your balance is $${user
            .get('cash_balance')
            .toFixed(2)}`,
        );
        return;
      }
      //otherwise amount is greater than or equal to
      interaction.reply({
        content: `${name}, Are you sure you want to buy ${amount} shares of ${ticker.toUpperCase()} ($${cost.toFixed(
          2,
        )})?`,
        components: makeButtons(interaction.user.id, ticker, cost),
      });
    }
  }
});

//paper trading confirmCancelSell listener
client.on('interactionCreate', async (interaction) => {
  const name = interaction.user.username;
  if (!interaction.isButton()) return;
  if (
    !interaction.customId.includes('confirmSell') &&
    !interaction.customId.includes('cancelSell')
  ) {
    return;
  }
  if (!interaction.customId.includes(interaction.user.id)) {
    const prevContent = interaction.content;
    const prevComponents = interaction.components;
    interaction.update({
      content: `${name}, This is not your transaction to Confirm or Cancel`,
    });
    setTimeout(() => {
      interaction.update({
        content: prevContent,
        components: prevComponents,
      });
    }, 3000);
    return;
  }
  //for splitting the array, first val is buttonid then userid, then ticker, then amount, then stock price
  const paramAray = interaction.customId.split('_');
  const ticker = paramAray[2].toUpperCase();
  const amount = parseFloat(paramAray[3]); //amount is amount of shares not cash value
  const price = parseFloat(paramAray[4]);
  const fixedAmount = amount.toFixed(2);

  if (interaction.customId.includes('cancelSell')) {
    interaction.update({
      content: `${name}, Your transaction for selling ${fixedAmount} shares of ${ticker} ($${(
        amount * price
      ).toFixed(2)}) has been cancelled`,
      components: [],
    });
    return;
  }
  //at this point user is guaranteed to exist
  const user = await TicTacToe.findOne({
    where: {
      user_id: interaction.user.id,
      guild_id: interaction.guild.id,
    },
  });
  //make sure to check again if user has shares to sell
  //at this point existing stake is also guaranteed to exist
  //actually looking back, this is not the case, what if a user sold their stake in a different command?

  const existingStake = await StocksOwned.findOne({
    where: {
      user_id: interaction.user.id,
      guild_id: interaction.guild.id,
      stock_ticker: ticker,
    },
  });
  if (!existingStake) {
    //console.log('Something went wrong!');
    interaction.update({
      content: `${name}, You do not own any shares of ${ticker} to sell!`,
      components: [],
    });
    return;
  }
  //update existingStake or delete it, depending on difference between amount and amount_owned
  const existingAmount = existingStake.get('amount_owned');
  const existingValue = existingAmount * price;
  const sellValue = amount * price;
  if (existingValue < sellValue) {
    interaction.update({
      content: `${name}, You can't sell more than you own, please try again`,
      components: [],
    });
  }
  if (existingValue - sellValue < 0.01) {
    await existingStake.destroy();
    await user.update({
      cash_balance: user.get('cash_balance') + existingValue,
    });
  } else {
    await existingStake.update({
      amount_owned: existingAmount - amount,
    });
    await user.update({
      cash_balance: user.get('cash_balance') + sellValue,
    });
  }
  const newCash = user.get('cash_balance').toFixed(2);
  interaction.update({
    content: `${name}, You have just sold ${fixedAmount} shares of ${ticker} ($${sellValue.toFixed(
      2,
    )}) your cash balance is now ${newCash}`,
    components: [],
  });
});

//paper trading confirmCancelBuy listener

client.on('interactionCreate', async (interaction) => {
  //get users name from interaction
  const name = interaction.user.username;
  if (!interaction.isButton()) return;
  if (
    !interaction.customId.includes('confirmBuy') &&
    !interaction.customId.includes('cancelBuy')
  ) {
    return;
  }

  if (!interaction.customId.includes(interaction.user.id)) {
    const prevContent = interaction.content;
    const prevComponents = interaction.components;
    interaction.update({
      content: `${name}, This is not your transaction to Confirm or Cancel!`,
      components: [],
    });
    setTimeout(() => {
      interaction.update({
        content: prevContent,
        components: prevComponents,
      });
    }, 3000);
    return;
  }
  const ticker = interaction.customId.split('_')[2].toUpperCase();

  const amount = parseFloat(interaction.customId.split('_')[3]);
  const fixedAmount = amount.toFixed(2);
  const price = await getStockPrice(ticker);
  const stockAmount = amount / price;
  if (interaction.customId.includes('cancelBuy')) {
    interaction.update({
      content: `${name} Your transaction for buying $${fixedAmount} of ${ticker} was canceled!`,
      components: [],
    });

    return;
  }
  let user = await TicTacToe.findOne({
    where: {
      user_id: interaction.user.id,
      guild_id: interaction.guild.id,
    },
  });
  //check balance again (in case user has been updated)

  if (user.get('cash_balance') < amount) {
    interaction.reply(
      `You do not have enough money to buy $${amount} of ${ticker}`,
    );
    return;
  }
  //otherwise amount is greater than or equal to
  const existingStake = await StocksOwned.findOne({
    where: {
      user_id: interaction.user.id,
      guild_id: interaction.guild.id,
      stock_ticker: ticker,
    },
  });
  if (!existingStake) {
    await StocksOwned.create({
      user_id: interaction.user.id,
      guild_id: interaction.guild.id,
      stock_ticker: ticker,
      amount_owned: stockAmount,
    });
    await user.update({
      cash_balance: user.get('cash_balance') - amount,
    });
    interaction.update({
      content: `${name}, you have purchased $${fixedAmount} (${stockAmount.toFixed(
        4,
      )} shares) of ${ticker}, you now have $${user
        .get('cash_balance')
        .toFixed(2)} left`,
      components: [],
    });
  } else {
    await existingStake.update({
      amount_owned: existingStake.get('amount_owned') + stockAmount,
    });
    await user.update({
      cash_balance: user.get('cash_balance') - amount,
    });
    interaction.update({
      content: `${name}, you have purchased $${fixedAmount} (${stockAmount} shares) of ${ticker}, you now have ${existingStake
        .get('amount_owned')
        .toFixed(2)} shares of ${ticker} and $${user
        .get('cash_balance')
        .toFixed(2)} left`,
      components: [],
    });
  }

  //at this stage, user is guaranteed to exist so there is no need to cover such a case where they dont
});
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;
  if (
    commandName !== 'paper' ||
    interaction.options._subcommand !== 'portfolio'
  )
    return;
  const sharesOwned = await StocksOwned.findAll({
    where: {
      user_id: interaction.user.id,
      guild_id: interaction.guild.id,
    },
  });
  if (sharesOwned.length === 0) {
    interaction.reply(
      `${interaction.user.username}, you do not own any shares`,
    );
  }
  let sharesArray = [];
  for (let i = 0; i < sharesOwned.length; i++) {
    sharesArray.push(
      `${sharesOwned[i].get('amount_owned').toFixed(4)} shares of ${sharesOwned[
        i
      ].get('stock_ticker')}`,
    );
  }
  let user = await TicTacToe.findOne({
    where: {
      user_id: interaction.user.id,
      guild_id: interaction.guild.id,
    },
  });
  let replyString = sharesArray.join('\n');
  /*interaction.reply(
    `${interaction.user.username}'s portfolio: \n${replyString}`,
  );*/
  //after displaying individual stakes, display total value of portfolio
  let totalValue = 0;
  const cash = await user.get('cash_balance');
  for (let i = 0; i < sharesOwned.length; i++) {
    const ticker = sharesOwned[i].get('stock_ticker');
    const amount = sharesOwned[i].get('amount_owned');
    const price = await getStockPrice(ticker);

    totalValue += price * amount;
  }
  interaction.reply(
    `${interaction.user.username}'s portfolio: \n${replyString} \n${
      interaction.user.username
    }'s portfolio total value: $${totalValue.toFixed(2)}\n${
      interaction.user.username
    }'s cash balance: $${cash.toFixed(2)}\nTotal net worth: $${(
      totalValue + cash
    ).toFixed(2)}`,
  );
});

//create listener for paper sell subcommand
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;
  if (commandName !== 'paper' || interaction.options._subcommand !== 'sell')
    return;
  const ticker = interaction.options.getString('ticker').toUpperCase();
  const amount = interaction.options.getString('amount');
  let stockPrice;

  /*const user = await TicTacToe.findOne({
    where: {
      user_id: interaction.user.id,
      guild_id: interaction.guild.id,
    }
  })*/

  const stockOwned = await StocksOwned.findOne({
    where: {
      user_id: interaction.user.id,
      guild_id: interaction.guild.id,
      stock_ticker: ticker,
    },
  });
  if (!stockOwned) {
    interaction.reply(
      `${interaction.user.username}, You do have any shares of ${ticker} to sell`,
    );
    return;
  }

  try {
    stockPrice = await getStockPrice(ticker);
  } catch (e) {
    interaction.reply(`Could not get stock price. Please try again`);
  }
  const user = await TicTacToe.findOne({
    where: {
      user_id: interaction.user.id,
      guild_id: interaction.guild.id,
    },
  });

  if (isNaN(amount) && amount[0] !== '$') {
    //if amount is not a number, it could still be 'all
    if (amount === 'all') {
      //if amount is all, then reply to interaction with confirm or cancel
      const amountOwned = stockOwned.get('amount_owned');
      interaction.reply({
        content: `${
          interaction.user.username
        }, are you sure you want to sell all shares (${amountOwned.toFixed(
          4,
        )}) of ${ticker} for $${(amountOwned * stockPrice).toFixed(2)}?`,
        components: makeSellButtons(
          interaction.user.id,
          ticker,
          amountOwned,
          stockPrice,
        ),
      });
      return;
    } else {
      interaction.reply(
        `${interaction.user.username}, please enter a valid amount`,
      );
      return;
    }
  }
  if (amount.startsWith('$')) {
    const cashAmount = parseFloat(amount.slice(1));

    const fixedCash = cashAmount.toFixed(2);
    //then check if cashAmount is a number
    if (isNaN(cashAmount) || cashAmount < 0) {
      interaction.reply(
        `${interaction.user.username}, please enter a valid amount`,
      );
      return;
    }
    //if it is a number, check if the number is more than the amount actually stockOwned
    //if it is more, reply with you do not have amount shares you only have amountOwned (t0 sell all your shares try //paper sell TICKER all)
    const cashToShare = cashAmount / stockPrice;
    const amountOwned = stockOwned.get('amount_owned');
    if (cashToShare > amountOwned) {
      interaction.reply({
        content: `${name}, you do not have $${fixedCash} of ${ticker}, you only have ${amountOwned.toFixed(
          4,
        )} shares (${(amountOwned * stockPrice).toFixed(
          2,
        )}), would you like to sell all of your shares?`,
        components: makeSellButtons(
          interaction.user.id,
          ticker,
          amountOwned,
          stockPrice,
        ),
      });
      return;
    }
    const cashInShares = cashAmount / stockPrice;
    //otherwise if it is less than sell the shares
    interaction.reply({
      content: `${
        interaction.user.username
      }, would you like to sell $${fixedCash} of ${ticker} (${cashInShares.toFixed(
        4,
      )} shares)`,
      components: makeSellButtons(
        interaction.user.id,
        ticker,
        cashInShares,
        stockPrice,
      ),
    });
    return;
  }
  //same thing but user input is just a number, the amount of shares to be sold
  const numAmount = parseFloat(amount);
  const fixedAmount = numAmount.toFixed(4);

  const amountOwned = stockOwned.get('amount_owned');
  const fixedOwned = amountOwned.toFixed(4);
  const sharesInCash = amountOwned * stockPrice;
  const amountInCash = numAmount * stockPrice;
  if (isNaN(amount) || numAmount < 0) {
    interaction.reply(
      `${interaction.user.username}, please enter a valid amount`,
    );
    return;
  }
  if (amount > amountOwned) {
    interaction.reply({
      content: `${
        interaction.user.username
      }, you do not have ${fixedAmount} shares of ${ticker} you only have ${fixedOwned} shares ($${sharesInCash.toFixed(
        2,
      )}), would you like to sell all of your shares?`,
      components: makeSellButtons(
        interaction.user.id,
        ticker,
        amountOwned,
        stockPrice,
      ),
    });
    return;
  }
  //otherwise it is less so sell the sharesInCash
  interaction.reply({
    content: `${
      interaction.user.username
    }, would you like to sell ${fixedAmount} shares of ${ticker} ($${amountInCash.toFixed(
      2,
    )})?`,
    components: makeSellButtons(
      interaction.user.id,
      ticker,
      numAmount,
      stockPrice,
    ),
  });
  return;
});

function makeSellButtons(user_id, ticker, amount_sold, stockPrice) {
  let components = [];
  const buttonActionRow = new MessageActionRow();
  const confirmButton = new MessageButton()
    .setLabel('Confirm')
    .setStyle('SUCCESS')
    .setCustomId(
      `confirmSell_${user_id}_${ticker}_${amount_sold}_${stockPrice}`,
    );
  const cancelButton = new MessageButton()
    .setLabel('Cancel')
    .setStyle('DANGER')
    .setCustomId(
      `cancelSell_${user_id}_${ticker}_${amount_sold}_${stockPrice}`,
    );
  components.push(confirmButton, cancelButton);
  buttonActionRow.addComponents(...components);
  return [buttonActionRow];
}

function makeButtons(user_id, ticker, amount) {
  components = [];
  const buttonActionRow = new MessageActionRow();
  const confirmButton = new MessageButton()
    .setLabel('Confirm')
    .setStyle('SUCCESS')
    .setCustomId(`confirmBuy_${user_id}_${ticker}_${amount}`);
  const cancelButton = new MessageButton()
    .setLabel('Cancel')
    .setStyle('DANGER')
    .setCustomId(`cancelBuy_${user_id}_${ticker}_${amount}`);
  components.push(confirmButton, cancelButton);
  buttonActionRow.addComponents(...components);
  return [buttonActionRow];
}
//paper trading end

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
//tictactoe button click listener
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
        guild_id: interaction.guild.id,
      },
    });
    if (!user) {
      user = await TicTacToe.create({
        user_id: interaction.user.id,
        guild_id: interaction.guild.id,
      });
    }
    //console.log(await user.increment('score'));
    //await user.increment('score');
    await user.update({ score: user.get('score') + 1 });
    //await user.reload()

    interaction.update({
      content:
        'You won the game! You have now won ' + user.get('score') + ' times!',
      components: makeGrid(),
    });
    await user.save();
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
