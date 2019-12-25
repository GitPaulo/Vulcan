const request = xrequire('request-promise');
const logger  = xrequire('./managers/LogManager').getInstance();

class PresenceManager {
    constructor (vulcan) {
        this.client   = vulcan;
        this.current  = null;
        this.previous = null;
    }

    switchToPrevious () {
        if (!this.previous) {
            throw new Error(`No previous presence to switch to!`);
        }

        this.updateTimeout(this.previous.callback, this.previous.interval);
        logger.log(`Using previous presence...`);
    }

    // Update every minute by default
    updateTimeout (callback, interval = 60000) {
        if (this.current) {
            clearInterval(this.current.timeout);

            // Store previous, if there was a previous!
            this.previous = this.current;
        }

        this.current = {
            timeout: setInterval((function cb () {
                callback();

                // ? So that cb is ran first tick.
                return cb;
            })(), interval),
            callback,
            interval
        };
    }

    useUpdating () {
        this.updateTimeout(() => {
            const presenceData = {
                status  : 'idle',
                afk     : false,
                activity: {
                    name: 'An update has started!',
                    type: 'LISTENING'
                }
            };

            this.client.user.setPresence(presenceData).then((presence) => {
                logger.debug('Presence has been updated!', presence);
            }).catch(() => {
                logger.error(`Failed to set activity.\n`, presenceData);
            });
        });
    }

    useInformational () {
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

    useTwitch () {
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
