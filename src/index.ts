import 'gta5voice/extensions/keys';
import { VoiceSettings } from 'gta5voice/models/voiceSettings';
import { VoiceClient } from 'gta5voice/models/voiceClient';
import { Translations } from 'gta5voice/translations';
import { Calculation } from 'gta5voice/core/calculation';

let vs: VoiceSettings | null = null;
let vc: VoiceClient | null = null;
let t: Translations | null = null;
const c = new Calculation();

interface PluginData {
    TeamspeakId: number | null
    WebsocketConnection: boolean
    CurrentVoiceRange: number
    ForceMuted: boolean
    PhoneSpeakerEnabled: boolean
    CurrentCallMembers: number[]
}

interface ClientData {
    RemoteId: number
    TeamspeakId: number | null
    WebsocketConnection: boolean
    CurrentVoiceRange: number
    ForceMuted: boolean
    PhoneSpeakerEnabled: boolean
    CurrentCallMembers: number[]
}

// WebSocket browser initialization
let ws: (BrowserMp & { orderId?: number }) | null = mp.browsers.new('http://package/gta5voice/browser/index.html');
ws.active = false;
ws.orderId = -1;

const wsIdent = [...Array(16)].map(() => Math.random().toString(36)[2]).join('');
ws.execute(`loadWsIdent(${JSON.stringify(wsIdent)})`);

function executeWs(wsFunction: string, ...args: unknown[]): void {
    if (ws === null) return;
    const callArgs = [wsIdent, ...args];
    ws.execute(`${wsFunction}(${JSON.stringify(callArgs)})`);
}

let wsOpen = false;
const showErrors = false;
let calculationInterval: ReturnType<typeof setInterval> | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let voiceRangeIndex = 0;
let teamspeakName: string | null = null;
let isInRadio = false;
let isTalkingInRadio = false;

// Rage Multiplayer
const localPlayer = mp.players.local;

function getAnimation(talking: boolean): { name: string; dictionary: string } {
    return {
        name: talking ? 'mic_chatter' : 'mood_normal_1',
        dictionary: talking ? 'mp_facial' : 'facials@gen_male@variations@normal',
    };
}

mp.events.add({
    'Client:GTA5Voice:initialize': (data: Record<string, string | number>, tsName: string) => {
        vs = new VoiceSettings(data);
        vc = new VoiceClient(localPlayer.remoteId, wsOpen, vs.voiceRanges[0]);
        c.voiceService.SetDefaultVoiceRange(vs.voiceRanges[0]);
        t = new Translations(vs.language);
        calculationInterval = setInterval(() => {
            const playersInRange = c.calculatePlayersInRange();
            executeWs('sendCalculationData', JSON.stringify(Array.from(playersInRange.values())));
        }, vs.calculationInterval);
        heartbeatInterval = setInterval(() => {
            executeWs('heartbeat');
        }, 1000);
        teamspeakName = tsName;
    },
    'Client:GTA5Voice:connect': () => {
        executeWs('connect', '127.0.0.1:20264', teamspeakName, vs?.virtualServerUid);
    },
    'Client:GTA5Voice:onMessage': (type: string, message: unknown) => {
        switch (type) {
            case 'open':
                updateConnectionState(true);
                break;
            case 'close':
                updateConnectionState(false);
                break;
            case 'message':
                handleMessage(message as string | Record<string, unknown>);
                break;
            case 'error':
                if (!showErrors || !t) return;
                let errorCode = 0;
                const msg = `~r~${t.translate('error.title')}:~s~ ${t.translate('error.description')} (${t.translate('error.code')}: ${errorCode})`;
                switch (message) {
                    case 0:
                        errorCode = 104;
                        mp.game.graphics.notify(msg);
                        break;
                    case 2:
                        errorCode = 105;
                        mp.game.graphics.notify(msg);
                        break;
                    case 3:
                        errorCode = 106;
                        mp.game.graphics.notify(msg);
                        break;
                    default:
                        break;
                }
                break;
        }
    },
    'Client:GTA5Voice:OnPlayerDisconnected': () => {
        executeWs('playerDisconnected');
        ws?.destroy();
        ws = null;
    },
    'Client:GTA5Voice:SyncTalkingState': (player: PlayerMp, talking: boolean) => {
        const anim = getAnimation(talking);
        const animTarget = mp.players.atRemoteId(player.remoteId);
        if (animTarget && animTarget !== localPlayer) {
            animTarget.playFacialAnim(anim.name, anim.dictionary);
        }
    },
    'Client:GTA5Voice:OnTeamspeakDataChanged': () => {
        if (!vc || !t) {
            mp.game.graphics.notify(`~r~${t?.translate('error.title') ?? 'GTA5Voice Error'}:~s~ ${t?.translate('error.description') ?? 'An unexpected error occurred.'} (${t?.translate('error.code') ?? 'Error code'}: 107)`);
            return;
        }
        mp.events.callRemote('Server:GTA5Voice:OnTeamspeakDataChanged', JSON.stringify(vc));
    },
    'Client:GTA5Voice:LoadClientData': (clientData: string | Array<Record<string, number>>) => {
        const parsedData = typeof clientData === 'string' ? JSON.parse(clientData) : clientData;
        parsedData.forEach((data: ClientData) => {
            c.voiceService.Set(data.RemoteId, {
                teamspeakId: data.TeamspeakId,
                websocketConnection: data.WebsocketConnection,
                voiceRange: data.CurrentVoiceRange,
                forceMuted: data.ForceMuted,
                phoneSpeakerEnabled: data.PhoneSpeakerEnabled,
                currentCallMembers: data.CurrentCallMembers,
            });

            if (vc && data.RemoteId === localPlayer.remoteId && data.ForceMuted !== undefined) {
                vc.setForceMuted(data.ForceMuted);
            }
            if (vc && data.RemoteId === localPlayer.remoteId && data.PhoneSpeakerEnabled !== undefined) {
                vc.setPhoneSpeakerEnabled(data.PhoneSpeakerEnabled);
            }
            if (vc && data.RemoteId === localPlayer.remoteId && data.CurrentCallMembers !== undefined) {
                vc.setCurrentCallMembers(data.CurrentCallMembers);
            }
        });
    },
    'Client:GTA5Voice:UpdateClientData': (remoteId: number, pluginData: PluginData) => {
        c.voiceService.Set(remoteId, {
            teamspeakId: pluginData.TeamspeakId,
            websocketConnection: pluginData.WebsocketConnection,
            voiceRange: pluginData.CurrentVoiceRange,
            forceMuted: pluginData.ForceMuted,
            phoneSpeakerEnabled: pluginData.PhoneSpeakerEnabled,
            currentCallMembers: pluginData.CurrentCallMembers,
        });

        if (vc && remoteId === localPlayer.remoteId && pluginData.ForceMuted !== undefined) {
            vc.setForceMuted(pluginData.ForceMuted);
        }
        if (vc && remoteId === localPlayer.remoteId && pluginData.PhoneSpeakerEnabled !== undefined) {
            vc.setPhoneSpeakerEnabled(pluginData.PhoneSpeakerEnabled);
        }
        if (vc && remoteId === localPlayer.remoteId && pluginData.CurrentCallMembers !== undefined) {
            vc.setCurrentCallMembers(pluginData.CurrentCallMembers);
        }
    },
    'Client:GTA5Voice:RemoveClient': (remoteId: number) => {
        c.voiceService.Remove(remoteId);
    },
    'Client:GTA5Voice:EnterRadio': () => {
        isInRadio = true;
    },
    'Client:GTA5Voice:LeaveRadio': () => {
        isInRadio = false;
    },
});

const updateConnectionState = (newState: boolean): void => {
    if (wsOpen === newState) return;

    if (newState && vs) {
        executeWs('moveChannelAction', JSON.stringify(vs), newState);
    }

    wsOpen = newState;
    vc?.setWebsocketConnection(newState);
    mp.events.call('Client:GTA5Voice:OnConnectionStateChanged', newState);
};

const handleMessage = (data: string | Record<string, unknown>): void => {
    if (typeof data === 'string') {
        data = JSON.parse(data);
    }

    const event = (data as Record<string, unknown>).event;
    switch (event) {
        case 'mute_input':
            mp.events.call('Client:GTA5Voice:OnInputStateChanged', (data as Record<string, unknown>).state);
            break;
        case 'mute_output':
            mp.events.call('Client:GTA5Voice:OnOutputStateChanged', (data as Record<string, unknown>).state);
            break;
        case 'client_joined':
            mp.events.call('Client:GTA5Voice:OnClientJoinedChannel', (data as Record<string, number>).channelId);
            break;
        case 'talking': {
            const isTalking = (data as Record<string, boolean>).state ?? false;
            mp.events.call('Client:GTA5Voice:OnTalkingStateChanged', isTalking);
            mp.events.callRemote('Server:GTA5Voice:OnTalkingStateChanged', isTalking);
            const anim = getAnimation(isTalking);
            localPlayer.playFacialAnim(anim.name, anim.dictionary);
            break;
        }
        case 'receive_data':
            if (vc) {
                vc.setTeamspeakId((data as Record<string, number>).clientId ?? null);
                mp.events.call('Client:GTA5Voice:OnTeamspeakDataChanged');
            }
            break;
        default:
            break;
    }
};

const changeVoiceRange = (): void => {
    if (!vs || !vc) return;
    voiceRangeIndex = (voiceRangeIndex + 1) % vs.voiceRanges.length;
    const newVoiceRange = vs.voiceRanges[voiceRangeIndex];
    vc.setCurrentVoiceRange(newVoiceRange);
    mp.events.call('Client:GTA5Voice:OnVoiceRangeChanged', newVoiceRange);
};

const toggleRadioPTT = (isTalking: boolean): void => {
    if (!isInRadio || isTalkingInRadio === isTalking) return;
    mp.events.callRemote('Server:GTA5Voice:OnRadioPTTChanged', isTalking);
    isTalkingInRadio = isTalking;
};

// Change voice range example
mp.keys.bindSpam(0x59, false, 100, () => changeVoiceRange());

// Toggle PTT in radio example
// Make sure, you add additional checks (e.g. isCuffed, isContinuousTX etc.)
mp.keys.bindSpam(0x28, true, 1000, () => toggleRadioPTT(true));
mp.keys.bind(0x28, false, () => toggleRadioPTT(false));
