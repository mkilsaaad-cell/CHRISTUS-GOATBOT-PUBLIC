
const { getTime, drive } = global.utils;

if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "1.8",
		author: "shtot",
		category: "events"
	},

	langs: {
		ar: {
			session1: "الصباح",
			session2: "الظهيرة",
			session3: "العشية",
			session4: "الليل",

			welcomeMessage:
				"╭───〔 ✦ ســحــتــوت ✦ 〕───╮\n" +
				"│ ✧ تم ربط البوت بالمجموعة بنجاح\n" +
				"│ ✧ بوت سحتوت\n" +
				"│ ✧ الحالة: 100% 🟢\n" +
				"╰────────────────────╯",

			multiple1: "أنت",
			multiple2: "أنتم",

			defaultWelcomeMessage:
				"╭━━━〔 🌸 أهــلاً وســهــلاً 🌸 〕━━━╮\n" +
				"│\n" +
				"│ ✦ العضو الجديد: {userName}\n" +
				"│ ✦ المجموعة: {boxName}\n" +
				"│ ✦ وقت الدخول: {time}\n" +
				"│ ✦ الفترة: {session}\n" +
				"│\n" +
				"│ ♡ نورت مجموعتنا بوجودك!\n" +
				"│ نتمنى لك أجمل الأوقات معنا\n" +
				"│ ومرحبا بك بين أفراد عائلتنا ♡\n" +
				"│\n" +
				"╰━━━〔 ✨ بوت سحتوت ✨ 〕━━━╯"
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;

				// عند دخول البوت للمجموعة
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(getLang("welcomeMessage", prefix));
				}

				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);

				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);

					if (threadData.settings.sendWelcomeMessage == false)
						return;

					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const threadName = threadData.threadName;
					const userName = [];
					const mentions = [];

					let multiple = false;

					if (dataAddedParticipants.length > 1)
						multiple = true;

					for (const user of dataAddedParticipants) {
						if (dataBanned.some((item) => item.id == user.userFbId))
							continue;

						userName.push(user.fullName);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}

					if (userName.length == 0) return;

					let { welcomeMessage = getLang("defaultWelcomeMessage") } =
						threadData.data;

					const form = {
						mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
					};

					welcomeMessage = welcomeMessage
						.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
						.replace(/\{boxName\}|\{threadName\}/g, threadName)
						.replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
						.replace(/\{time\}/g, getTime("HH:mm"))
						.replace(
							/\{session\}/g,
							hours <= 10
								? getLang("session1")
								: hours <= 12
									? getLang("session2")
									: hours <= 18
										? getLang("session3")
										: getLang("session4")
						);

					form.body = welcomeMessage;

					if (threadData.data.welcomeAttachment) {
						const files = threadData.data.welcomeAttachment;
						const attachments = files.reduce((acc, file) => {
							acc.push(drive.getFile(file, "stream"));
							return acc;
						}, []);

						form.attachment = (await Promise.allSettled(attachments))
							.filter(({ status }) => status == "fulfilled")
							.map(({ value }) => value);
					}

					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
