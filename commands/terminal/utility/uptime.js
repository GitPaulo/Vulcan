const uptime = module.exports;

// eslint-disable-next-line no-unused-vars
uptime.execute = line => {
  console.log('Uptime: ', this.command.client.uptime);
};
