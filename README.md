## GTA5Voice Client Integration for [RAGE Multiplayer](https://rage.mp)
For more information, visit our website: https://gta5voice.com<br>
We are not in any way affiliated, associated, authorized, endorsed by, or connected with Rockstar Games or Take-Two Interactive.

## Quick setup
1. Copy the **gta5voice** folder into your `client_packages` directory.
2. Add the following line to your client_packages `index.js`:
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
