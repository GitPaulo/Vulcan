<div align="center">
    <d>
        <a href="" title="Vulcan" target="_blank">
            <img src="./.github/resources/banner.png">
        </a>
    </p>
    <p> 
    <a href="https://travis-ci.org/GitPaulo/Vulcan" title="Build Status"><img src="https://travis-ci.org/GitPaulo/Vulcan.svg?branch=master"></a>
    <a href="https://david-dm.org/GitPaulo/Vulcan" title="Dependencies"><img src="https://david-dm.org/GitPaulo/Vulcan/status.svg"/></a>
    <a href="https://github.com/GitPaulo/eslint-config-mudamuda" title="Code Style"><img src="https://img.shields.io/badge/codestyle-mudamuda-success.svg"></a>
    <a href="https://www.codacy.com/app/GitPaulo/Vulcan?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=GitPaulo/Vulcan&amp;utm_campaign=Badge_Grade" title="Code Quality"><img src="https://api.codacy.com/project/badge/Grade/f7e68b17b25b4f43b2bfd74756e488fb"/></a>
    </p>
    <p>
    <a href="https://forthebadge.com/">
    <img src="https://forthebadge.com/images/badges/contains-cat-gifs.svg">
    <img src="https://forthebadge.com/images/badges/built-with-love.svg">
    </a>
    </p>
</div>

# Overview

**Vulcan** is a multi-purpose discord bot built with [discord.js](https://github.com/discordjs/discord.js). Its creation purpose is set out to acomplish the tasks of administration, utility and entertainment for the discord server of our group of friends. As such, the design and features are tailored to our needs.
  
The project is currently **under early development**. All of the code present is subject to significant changes.

# Documentation

Currently there is no documentation. This page will be updated as soon as there is a change.

# Invite Vulcan

Vulcan features are **disabled by default** on __new guilds__. They must be activated by one of the bot owners.

Note that this is **intended**. Once Vulcan is invited to a new server an automatic request to enable its features on the new guild is sent to the bot owners. You may also use the `authorise` command to manually send a request. 

To invite Vulcan to your discord server simply click the image link below:

<a href="https://discordapp.com/oauth2/authorize?client_id=284079399165231106&scope=bot&permissions=8&redirect_uri=https%3A%2F%2Fgithub.com%2FGitPaulo%2FVulcan" title="Vulcan-invite" target="_blank">
    <img src="./.github/resources/join.png" width="30%" height="30%">
</a>

# Self Hosting
Make sure you have updated versions of your host machine's OS services and follow these steps:

1. Download and install [python (v2.7)](https://www.python.org/downloads/).
2. Download and install [node.js (lastest stable)](https://nodejs.org/en/download/).
    
    2.1 If on Linux machine we recommend using [NVM](https://stackabuse.com/using-nvm-to-install-node/)
3. Download and extract the [zipped repository code](https://github.com/GitPaulo/Vulcan.git).
4. Open a [shell](https://git-scm.com/downloads) in the location of directory of the extraced zip.
5. Run the following command: `npm ci && npm test`
6. Navigate to the new `'settings/'` folder and fill in the required configuration & credentials.
7. Run the following command: `npm run production`

# FAQ

May I use code in this repository?

- **Yes.** Follow the license.
  
May I host this program publicly?

- **Yes.** Credit this repository and follow the license.

What platforms does self-hosting support?

- Both modern Windows and Linux machines have been tested to be compatible with Vulcan.
