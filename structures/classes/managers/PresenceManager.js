/**
 * ? Manager File: Presence
 * Represents an structured abstraction built to control the presence of vulcan in an easy way.
 * Keep this class simple.
 */

const httpFetch = xrequire('node-fetch');
const settings = xrequire('./prerequisites/settings');
const logger = xrequire('./modules/logger').getInstance();

class PresenceManager {
  constructor(vulcan) {
    this.client = vulcan;
    this.vulcan = vulcan;
    this.current = null;
    this.previous = null;
    this.interval = 60000;

    // Log
    logger.log(`[Managers] => Instance of Presence Manager initialised.`);
  }

  _log(str) {
    logger.log(`[Presence Manager] => ${str}`);
  }

  _updatePresence(callback, interval = this.interval) {
    if (this.current) {
      clearInterval(this.current.timeout);

      // Store previous, if there was a previous!
      this.previous = this.current;
    }

    // Return callback
    let cb;

    this.current = {
      timeout: setInterval(
        (cb = () => {
          const presenceData = callback();

          if (!presenceData) {
            throw new Error(`Callback passed to 'updatePresence' must return presence data.`);
          }

          this.client.user.setPresence(presenceData).catch(() => {
            logger.error(`Failed to set activity.\n`, presenceData);
          });

          // ? So that cb is ran first tick.
          return cb;
        })(),
        interval
      ),
      callback,
      interval
    };
  }

  /**
   * Switches the presence to the last known used mode.
   */
  usePrevious() {
    if (!this.previous) {
      throw new Error(`No previous presence to switch to!`);
    }

    // User previous presence
    this._updatePresence(this.previous.callback, this.previous.interval);

    // Log
    this._log(`Switched to last used presence.`);
  }

  /**
   * Presence used when updating vulcan.
   */
  useUpdating() {
    this._updatePresence(() => ({
      status: 'idle',
      afk: false,
      activity: {
        name: 'An update has started!',
        type: 'LISTENING'
      }
    }));
  }

  /**
   * Presence with general statistics.
   */
  useInformational() {
    this._updatePresence(() => ({
      status: 'dnd',
      afk: false,
      activity: {
        name: `| Help: ${settings.configuration.prefixes[0]}docs`,
        type: 'PLAYING'
      }
    }));
  }

  /**
   * Presence with twitch data.
   */
  useTwitch() {
    // Constant HTTP options
    const httpOptions = {
      headers: {
        'Client-ID': settings.credentials.OAuth.twitch.id
      }
    };

    this._updatePresence(async () => {
      const response = await httpFetch('http://api.twitch.tv/helix/streams?first=1', httpOptions);
      const code = response.statusCode;
      const presenceData = {
        status: 'dnd',
        afk: false,
        activity: {
          name: '(Error)',
          type: 'STREAMING',
          url: 'http://www.twitch.tv/xqcow'
        }
      };

      if (code === 200) {
        const twitchResponse = await response.json();

        // Update properties
        (presenceData.activity.name = twitchResponse.data[0].user_name),
          (presenceData.activity.type = 'STREAMING'),
          (presenceData.activity.url = `http://www.twitch.tv/${twitchResponse.data[0].user_name}`);
      } else {
        logger.error(`Was unable to set presence. (Bad repsonse code: ${code}`);
      }

      return presenceData;
    });
  }
}

module.exports = PresenceManager;
