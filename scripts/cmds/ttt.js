module.exports = {
  config: {
    name: "ttt",
    aliases: [],
    version: "1.0",
    author: "rifat",
    countDown: 3,
    role: 0,
    shortDescription: {
      en: "Play Tic Tac Toe"
    },
    longDescription: {
      en: "Play a game of Tic Tac Toe with emoji board"
    },
    category: "games",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, event }) {
    const board = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const state = {
      board,
      turn: "user"
    };
    const msg = renderBoard(board) + "\nReply with a number (1-9) to make your move.";
    const sent = await message.reply(msg);
    global.GoatBot.onReply.set(sent.messageID, {
      commandName: "ttt",
      author: event.senderID,
      state
    });
  },

  onReply: async function ({ message, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const input = event.body.trim();
    const pos = parseInt(input);
    const board = Reply.state.board;

    if (isNaN(pos) || pos < 1 || pos > 9 || board[pos - 1] === "❌" || board[pos - 1] === "⭕") {
      return message.reply("Invalid move. Try a number between 1-9 on an empty spot.");
    }

    board[pos - 1] = "❌"; // user's move

    if (checkWin(board, "❌")) {
      return message.reply(renderBoard(board) + "\nYou win!");
    }

    if (isDraw(board)) {
      return message.reply(renderBoard(board) + "\nIt's a draw!");
    }

    // Bot's move
    const empty = board.map((val, idx) => (val !== "❌" && val !== "⭕" ? idx : -1)).filter(i => i !== -1);
    const botMove = empty[Math.floor(Math.random() * empty.length)];
    board[botMove] = "⭕";

    if (checkWin(board, "⭕")) {
      return message.reply(renderBoard(board) + "\nBot wins!");
    }

    if (isDraw(board)) {
      return message.reply(renderBoard(board) + "\nIt's a draw!");
    }

    const sent = await message.reply(renderBoard(board) + "\nYour turn! Reply with a number (1-9).");
    global.GoatBot.onReply.set(sent.messageID, {
      commandName: "ttt",
      author: event.senderID,
      state: { board }
    });
  }
};

// Utility to show the board with emojis
function renderBoard(b) {
  return (
    `${symbol(b[0])} ${symbol(b[1])} ${symbol(b[2])}\n` +
    `${symbol(b[3])} ${symbol(b[4])} ${symbol(b[5])}\n` +
    `${symbol(b[6])} ${symbol(b[7])} ${symbol(b[8])}`
  );
}

function symbol(val) {
  if (val === "❌" || val === "⭕") return val;
  return "➖";
}

function checkWin(b, s) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  return winPatterns.some(p => p.every(i => b[i] === s));
}

function isDraw(b) {
  return b.every(val => val === "❌" || val === "⭕");
}
