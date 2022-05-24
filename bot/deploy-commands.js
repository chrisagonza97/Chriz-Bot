const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [
  new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('Play a game of tic tac toe'),
  new SlashCommandBuilder()
    .setName('paper')
    .setDescription('execute paper trading commands')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('balance')
        .setDescription('Check your paper trading cash balance'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('price')
        .setDescription(
          'Check the real-time price of a stock. (example usage: /paper price TSLA )',
        )
        .addStringOption((option) =>
          option
            .setName('ticker')
            .setRequired(true)
            .setDescription('Enter a ticker'),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('buy')
        .setDescription(
          'Buy a stock. example usage: /paper buy TSLA .6 or /paper buy TSLA $500 ',
        )
        .addStringOption((option) =>
          option
            .setName('ticker')
            .setRequired(true)
            .setDescription('Enter ticker of the stock you would like to buy'),
        )
        .addStringOption((option) =>
          option
            .setName('amount')
            .setRequired(true)
            .setDescription(
              "Enter the amount of shares you'd like to buy or start amount with $ to buy in terms of dollar amount",
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('sell')
        .setDescription(
          'Sell a stock. example usage: /paper sell TSLA .6 or /paper sell TSLA $500 or /paper sell TSLA all',
        )
        .addStringOption((option) =>
          option
            .setName('ticker')
            .setRequired(true)
            .setDescription('Enter ticker of the stock you would like to sell'),
        )
        .addStringOption((option) =>
          option
            .setName('amount')
            .setRequired(true)
            .setDescription(
              "Enter the amount of shares you'd like to sell or start amount with $ to sell in terms of $ amount",
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('portfolio')
        .setDescription('Lists your paper trading portfolio'),
    ),
];

const rest = new REST({ version: '9' }).setToken(token);

rest
  .put(Routes.applicationGuildCommands(clientId, guildId), {
    body: commands.map((command) => command.toJSON()),
  })
  .then(() => console.log('Successfully registered commands'))
  .catch(console.error);
