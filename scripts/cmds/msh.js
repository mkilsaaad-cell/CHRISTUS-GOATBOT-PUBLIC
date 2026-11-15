const runningHh = new Map();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  config: {
    name: "هح",
    aliases: ["hh"],
    version: "1.1.0",
    author: "shtot",
    countDown: 3,
    role: 1,
    shortDescription: "Clear 2 existing nicknames every second",
    category: "group",

    guide: {
      en: "{pn}\n{pn} off"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    const threadID = event.threadID;
    const action = args[0]?.toLowerCase();

    // ==============================
    // STOP
    // ==============================

    if (action === "off") {
      if (!runningHh.has(threadID)) {
        return message.reply(
          "ℹ️ No clear process is running."
        );
      }

      runningHh.set(threadID, false);

      return message.reply(
        "🛑 Nickname clearing stopped."
      );
    }

    // ==============================
    // CHECK RUNNING
    // ==============================

    if (runningHh.has(threadID)) {
      return message.reply(
        "⚠️ A clear process is already running.\n" +
        "Use /هح off to stop it."
      );
    }

    runningHh.set(threadID, true);

    try {
      // ==============================
      // GET GROUP INFO
      // ==============================

      const info = await api.getThreadInfo(threadID);

      const nicknames = info.nicknames || {};

      // ==============================
      // ONLY MEMBERS WITH NICKNAMES
      // ==============================

      const membersWithNicknames =
        info.participantIDs.filter(uid => {
          const nickname = nicknames[uid];

          return (
            typeof nickname === "string" &&
            nickname.trim().length > 0
          );
        });

      // ==============================
      // NOTHING TO CLEAR
      // ==============================

      if (membersWithNicknames.length === 0) {
        runningHh.delete(threadID);

        return message.reply(
          "ℹ️ No nicknames
