let wsIdent;
function loadWsIdent(i) {
    wsIdent = i || null;
}

const wsCheck = fn => (...args) => {
    const flatArgs = Array.isArray(args[0]) ? args[0] : args;
    const [clientWsIdent, ...rest] = flatArgs;
    if (clientWsIdent !== wsIdent) return console.warn('WS mismatch');
    return fn(...rest);
};

// Voice functions
let voice = null;
let wsAddress = null;
let reconnectInterval = null;
let teamspeakName = null;
let lastHeartbeat = Date.now();
let lostInterval;

const connect = wsCheck((address, tsName) => {
    wsAddress = address;
    teamspeakName = tsName;

    if (voice != null) {
        return;
    }

    // Init websocket
    voice = new window.WebSocket(`ws://${wsAddress}/`);
    voice.onopen = function (event) {
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
        mp.trigger("Client:GTA5Voice:onMessage", 'open', event.type);
        requestTeamspeakData();
    };
    voice.onmessage = function (event) {
        mp.trigger("Client:GTA5Voice:onMessage", 'message', event.data);
    };
    voice.onclose = function (event) {
        mp.trigger("Client:GTA5Voice:onMessage", 'close', JSON.stringify(`Code: ${event.code}, Reason: ${event.reason}`));
        voice = null;

        if (!reconnectInterval) {
            reconnectInterval = setInterval(() => {
                connect([wsIdent, wsAddress, tsName]);
            }, 2000);
        }
    };
    voice.onerror = function (event) {
        mp.trigger("Client:GTA5Voice:onMessage", 'error', voice.readyState);
    };

    // Start server connection monitoring
    startHeartbeatMonitor();
});

const playerDisconnected = wsCheck(() => {
    if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
    }
});

const isConnected = () => {
    return voice && voice.readyState === WebSocket.OPEN;
};

const heartbeat = () => {
    lastHeartbeat = Date.now();
};

const startHeartbeatMonitor = () => {
    if (lostInterval) clearInterval(lostInterval);
    lostInterval = setInterval(() => {
        if (Date.now() - lastHeartbeat > 10000) {
            clearInterval(lostInterval);
            onServerConnectionLost();
        }
    }, 1000);
};

// WebSocket Server Actions
const moveChannelAction = wsCheck((voiceData, moveIntoGameChannel) => {
    if (!isConnected() || !teamspeakName) return;
    if (typeof voiceData === "string") {
        voiceData = JSON.parse(voiceData);
    }

    let channelId = (moveIntoGameChannel) ? voiceData['ingameChannelId'] : voiceData['fallbackChannelId'];
    let password = (moveIntoGameChannel) ? voiceData['ingameChannelPassword'] : '';
    let excludedChannels = voiceData['excludedChannels'] || [];

    const payload = {
        action: "move",
        channelId,
        ingameChannelPassword: password,
        isIngameChannel: moveIntoGameChannel,
        excludedChannels: excludedChannels,
        clientName: teamspeakName
    };
    voice.send(JSON.stringify(payload));
});

const requestTeamspeakData = () => {
    if (!isConnected()) return;
    voice.send(JSON.stringify({
        action: "requestTeamspeakData",
    }));
};

const onServerConnectionLost = () => {
    if (!isConnected()) return;
    voice.send(JSON.stringify({
        action: "serverConnectionLost",
    }));
};

const sendCalculationData = wsCheck((tickData) => {
    if (!isConnected()) return;
    const payload = typeof tickData === "string" ? tickData : JSON.stringify(tickData);
    voice.send(payload);
});