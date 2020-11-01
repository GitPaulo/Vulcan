/**
 * ? Handler file
 * Loads all vulcan and discord events from './events'.
 */

const fs = xrequire('fs');
const path = xrequire('path');
const logger = xrequire('./modules/logger').getInstance();

// Path to folder with all events
const eventsFolderPath = './events';
const eventsPath = path.join(global.basedir, eventsFolderPath);
const vulcanEventsPath = path.join(eventsPath, 'vulcan');
const discordjsEventsPath = path.join(eventsPath, 'discord');

// Util
const filterFunc = file => file.endsWith('.js');
const loadEvents = (client, eventsPath) => {
  let events = fs.readdirSync(eventsPath).filter(filterFunc);

  for (let eventFile of events) {
    logger.logTimeStart(`Event ${eventFile}`);

    client.on(eventFile.replace(/\.js$/i, ''), xrequire(path.join(eventsPath, eventFile)));

    logger.logTimeEnd(`Event ${eventFile}`, `Loaded (event) file '${eventFile}'.`);
  }
};

module.exports = vulcan => {
  // Discord Events
  loadEvents(vulcan, discordjsEventsPath);

  // Vulcan Events
  loadEvents(vulcan, vulcanEventsPath);
};
