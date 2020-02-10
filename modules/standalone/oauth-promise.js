const OAuth = require('oauth').OAuth;

exports.OAuth = class {
    constructor (...args) {
        this.oauth = new OAuth(...args);

        return new Proxy(this, {
            get: (target, name) => {
                const oauth = target.oauth;

                if (!oauth) {
                    throw new Error('Please initialize before using');
                }

                if (!(name in oauth)) {
                    return new Error('Name not in oauth');
                }

                return (...args) => new Promise((resolve, reject) => {
                    oauth[name](...args, (e, ...args) => {
                        if (e) {
                            return reject(e);
                        }

                        return resolve(args);
                    });
                });
            }
        });
    }
};
