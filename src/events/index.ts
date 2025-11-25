mp.events.add({
    'Client:GTA5Voice:OnInputStateChanged': (muted: boolean) => {
        mp.game.graphics.notify('Microphone ' + (muted ? '~r~muted' : '~g~unmuted'));
    },
    'Client:GTA5Voice:OnOutputStateChanged': (muted: boolean) => {
        mp.game.graphics.notify('Sound ' + (muted ? '~r~muted' : '~g~unmuted'));
    },
    'Client:GTA5Voice:OnConnectionStateChanged': (connected: boolean) => {
        mp.game.graphics.notify((connected ? '~g~Connected~s~ to' : '~r~Disconnected~s~ from') + ' ~s~TeamSpeak');
    },
    'Client:GTA5Voice:OnTalkingStateChanged': (talking: boolean) => {
        mp.game.graphics.notify((talking ? '~g~Started' : '~r~Stopped') + '~s~ talking');
    },
    'Client:GTA5Voice:OnClientJoinedChannel': (channelId: number) => {
        mp.game.graphics.notify('Joined channel ~b~(ID: ' + channelId + ')~s~.');
    },
    'Client:GTA5Voice:OnTeamspeakDataChanged': () => {
        mp.game.graphics.notify('TeamSpeak data has been updated.');
    },
    'Client:GTA5Voice:OnVoiceRangeChanged': (voiceRange: number) => {
        mp.game.graphics.notify('Voice range set to ~b~' + voiceRange);
    },
    'Client:GTA5Voice:OnPhoneCallUpdated': (callMembers: number[]) => {
        mp.game.graphics.notify('Call Members: ' + JSON.stringify(callMembers));
    },
    'Client:GTA5Voice:OnPhoneCallEnd': () => {
        mp.game.graphics.notify('~r~Call ended!');
    },
    'Client:GTA5Voice:EnterRadio': (frequency: number) => {
        mp.game.graphics.notify('Entered radio frequency: ~g~' + frequency);
    },
    'Client:GTA5Voice:LeaveRadio': (frequency: number) => {
        mp.game.graphics.notify('Left radio frequency: ~r~' + frequency);
    },
});
