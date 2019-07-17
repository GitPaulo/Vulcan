const vulcan  = xrequire('./bot');
const pjson   = xrequire('./package.json');
const request = xrequire('request');
const logger  = xrequire('./managers/LogManager').getInstance();

const _2mins = 2 * 60 * 1000;

module.exports = () => {
    // Twitch Activity
    setInterval((function cb () {
        request(
            {
                uri    : 'https://api.twitch.tv/helix/streams?first=1',
                headers: {
                    'Client-ID': vulcan.credentials.OAuth.twitch.id
                }
            },
            (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    const twitchResponse = JSON.parse(body);
                    const presenceData   = {
                        status  : 'dnd',
                        afk     : false,
                        activity: {
                            name: twitchResponse.data[0].user_name,
                            type: 'STREAMING',
                            url : `https://www.twitch.tv/${twitchResponse.data[0].user_name}`
                        }
                    };

                    vulcan.user.setPresence(presenceData).then((presence) => {
                        logger.log(`Presence data has been set to:`, { twitchResponse, presenceData, presence });
                    }).catch(() => {
                        logger.error(`Failed to set activity.\n`, presenceData);
                    });
                } else {
                    logger.error('Was unable to set presence.', error);
                }
            }
        );

        return cb;
    })(), _2mins);

    // Prevent ml string de-format
    const p = pjson.version;
    const u = vulcan.users.size;
    const c = vulcan.channels.size;
    const g = vulcan.guilds.size;

    logger.plain(
        `=========================== [ Vulcan Is Ready (v${p}) ] ===========================\n`
      + `    Vulcan has connected with (${u}) users, (${c}) channels and (${g}) guilds.     \n`
      + `       => Blacklisted users: ${vulcan.blacklist.size}                              \n`
      + `       => Authenticated guilds: ${vulcan.servers.size}                             \n`
      + `====================================================================================`
    );
};
