## TODO - 'The Comeback' - SD: 21/10/2020

- [x] **(Task)** Comeback configuration/installation/CI testing. Fix any problems.
- [x] **(Task)** Reform eslint & add prettier w/ proper configuration & format everything to a standard & add EditorConfig.
- [x] **(Task)** Format all files to prettier standards.
- [ ] **(Task)** Configure jsdoc & enforce proper docs (where appropriate).
- [ ] **(Task)** Make a list of things to learn and use from [this repo.](https://github.com/SwitchbladeBot/switchblade/)
- [ ] **(Task)** Make a commit series of improvements (general code).
- [ ] **(Task)** Test and make sure everything is ready for receiving more devs.
- [ ] **(Bug)** Developers cannot bypass unauthorised guild block.
- [ ] **(Task)** Hosts vs Owners inconsitency in naming.
- [ ] **(Bug)** No bot hosts -> permission granted by default (on request) -> no guild notification (fix).
- [ ] **(Bug)** Music player `v!play <no url>` command errors (SyntaxError - dep - node_modules/ytsr/lib/main.js).
- [ ] **(Bug)** Exiting CLI still buggy (test on dev and start scripts)
- [ ] **(Bug)** `weather` command crashes bot.

```sh
  (10/30/2020, 22:56:31)[error] => [saikono-memes] => Internal error has occured due to an action originating from this channel.
        Error message: undefined
        Stack: undefined
(10/30/2020, 22:56:31)[error] => [Unhandeled Rejection]
Stack: TypeError: Cannot read property 'toString' of undefined
    at Vulcan.module.exports (C:\Users\santosp\Documents\Work\Personal\Vulcan\events\vulcan\channelError.js:30:47)
    at Vulcan.emit (events.js:315:20)
    at Vulcan.module.exports (C:\Users\santosp\Documents\Work\Personal\Vulcan\events\discord\message.js:155:16)
    at runMicrotasks (<anonymous>)
    at processTicksAndRejections (internal/process/task_queues.js:97:5)
Promise: [object Promise]
(10/30/2020, 22:56:31)[log] => [Clock: 0001ms] => Performance checks on 'C:\Users\santosp\Documents\Work\Personal\Vulcan\handlers\messageFormatHandler.js'
(10/30/2020, 22:56:31)[error] => [Multiple Resolved Detected] => reject, [object Promise], Error: This log clock (FormatHandler@1604098591675) already exits.
```

- [ ] ...
