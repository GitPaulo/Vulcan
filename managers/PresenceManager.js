const request = xrequire('request-promise');
const logger  = xrequire('./managers/LogManager').getInstance();

class PresenceManager {
    constructor (vulcan) {
        this.client  = vulcan;
        this.timeout = null;
    }

    // Update every minute by default
    updateTimeout (callback, interval = 60000) {
        if (this.timeout) {
            clearInterval(this.timeout);
        }

        this.timeout = setInterval((function cb () {
            callback();

            // ? So that cb is ran first tick.
            return cb;
        })(), interval);
    }

    useInformationalPresence () {
        this.updateTimeout(() => {
            const presenceData = {
                status  : 'dnd',
                afk     : false,
                activity: {
                    name: `#C: ${this.client.commands.size} #G: ${this.client.guilds.size} #U: ${this.client.users.size} #AS: ${this.client.servers.size}`,
                    type: 'WATCHING'
                }
            };

            this.client.user.setPresence(presenceData).then((presence) => {
                logger.debug('Presence has been updated!', presence);
            }).catch(() => {
                logger.error(`Failed to set activity.\n`, presenceData);
            });
        });
    }

    useTwitchPresence () {
        // Twitch Activity
        const requestData = {
            uri    : 'https://api.twitch.tv/helix/streams?first=1',
            headers: {
                'Client-ID': this.client.credentials.OAuth.twitch.id
            }
        };

        this.updateTimeout(() => {
            request(
                requestData,
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

                        this.client.user.setPresence(presenceData).then((presence) => {
                            logger.debug('Presence has been updated!', presence);
                        }).catch(() => {
                            logger.error(`Failed to set activity.\n`, presenceData);
                        });
                    } else {
                        logger.error('Was unable to set presence.', error);
                    }
                }
            );
        });
    }
}

module.exports = PresenceManager;
