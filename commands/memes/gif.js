const Command       = require("../../classes/Command");
const RandomUtility = require("../../modules/objects/RandomUtility");
const gifModel      = require("../../database/models/gif")

class Gif extends Command {
    constructor(type) { // type = root folder name (passed on by command loader)
        super(type, {
            name: 'gif',
            aliases: ['GIF'],
            group: 'group2',
            description: 'Retrieves a Gif from the database',
            examples: ['gif cat'],
            throttling: 2000,
            args: []
        });
    }

    async validate(message) {
        return true; // if true execute() will run
    }

    async execute(message) {
        const m = await message.channel.send("Working on it...");
        switch (message.args[0]) {
            case "get":
                if(message.args.length < 2) m.edit("Invalid usage");
                else this.retrieveImage(message.args[1], m);
                break;
            case "put":
                if(message.args.length < 3) m.edit("Invalid usage")
                else this.insertImage(message.args[1], message.args[2], message.author.id, m)
                break;
            case "list":
                this.listImages(m);
                break;
            default:
                m.edit("I don't know that command");
                break;
        }
    }

    retrieveImage(name, message) {
        gifModel.findOne({
            name: name
        }, 'link', (err, meme) => {
            if (err || !meme) message.edit('Not Found');
            else message.edit(meme.link);
        });
    }

    listImages(message) {
        gifModel.find({}, 'name', (err, result) => {
            if (err){
                message.edit("Could not preform action");
                vulcan.logger.error(err);
            }
            else {
                let images = "";
                for(let element in result) {
                    console.log(result[element]);
                    images = images + " " + result[element].name;
                }
                message.edit("Memes in my possession: " + images);
            }
        })
    }

    insertImage(name, link, owner, message) {
        //check if gif with that name already exists
        gifModel.findOne({name: name}, (err, result) => {
            if (result){
                message.edit("Image with name " + name + " already exists, bakayaro, konoyaro");
                return;
            }
        });

        let gif = new gifModel({
            name: name,
            link: link,
            owner: owner
        });
        
        gif.save((err) => {
            if(err) {
                vulcan.logger.error(err);
                message.edit("Could not add image");
            }
            else message.edit("Image added with name " + name);
         });
    }
}

module.exports = Gif;