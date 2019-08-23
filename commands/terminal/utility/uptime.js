const uptime = module.exports;

uptime.execute = () => {
    console.log('Uptime: ', this.command.client.uptime);
};
