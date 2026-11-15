
module.exports = {
  config: {
    name: "uptime",
    aliases: ["وقت", "مدة", "تشغيل"],
    version: "1.0.0",
    author: "SHTOT",
    countDown: 3,
    role: 0,
    shortDescription: "مدة تشغيل البوت",
    longDescription: "عرض مدة تشغيل بوت SHTOT",
    category: "info",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    const time = process.uptime();

    const days = Math.floor(time / 86400);
    const hours = Math.floor((time % 86400) / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    const format = (n) => String(n).padStart(2, "0");

    const uptime =
      `${days} يوم | ${format(hours)} ساعة | ` +
      `${format(minutes)} دقيقة | ${format(seconds)} ثانية`;

    const startTime = new Date(Date.now() - time * 1000);

    const message = `
╭───────〔 𝗦𝗛𝗧𝗢𝗧 〕───────╮
 
      ✦ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗨𝗣𝗧𝗜𝗠𝗘 ✦

   ♡ اسم البوت : SHTOT
   ♡ الحالة : متصل ويعمل بنجاح
   ♡ مدة التشغيل :
   ${uptime}

   ♡ وقت آخر تشغيل :
   ${startTime.toLocaleString("en-GB", {
     timeZone: "Africa/Casablanca"
   })}

   ♡ النظام : Messenger Bot
   ♡ المطور : SHTOT

╰───────〔 𝗢𝗡𝗟𝗜𝗡 〕───────╯
    `;

    return api.sendMessage(message, event.threadID);
  }
};
