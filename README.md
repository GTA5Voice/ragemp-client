## GTA5Voice Client Integration for [RAGE Multiplayer](https://rage.mp)
For more information, visit our website: https://gta5voice.com<br>
We are not in any way affiliated, associated, authorized, endorsed by, or connected with Rockstar Games or Take-Two Interactive.

## Links
- The latest plugin version can be found here: https://gta5voice.com/downloads
- The documentation can be found here: https://docs.gta5voice.com
- Join our Discord for more information: https://gta5voice.com/discord

## Quick setup
1. Download the latest [release](https://github.com/GTA5Voice/ragemp-client/releases) or [build the project](https://github.com/GTA5Voice/ragemp-client#manual-build-instructions) by yourself.
2. Copy the **gta5voice** folder into your `client_packages` directory.
3. Add the following line to your client_packages `index.js`:
```js
require('gta5voice');
```

## Manual build instructions
1. Install the development dependencies:
```bash
npm install --save-dev
```
2. Build the project:
```bash
npm run build
```
3. After building, you will find the generated folder:
```
build/gta5voice
```
