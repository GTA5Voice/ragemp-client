export class VoiceClient {
    IngameId: number;
    TeamspeakId: number | null;
    WebsocketConnection: boolean;
    CurrentVoiceRange: number;
    ForceMuted: boolean;
    PhoneSpeakerEnabled: boolean;
    CurrentCallMembers: number[];

    constructor(ingameId: number, websocketConnection: boolean, defaultVoiceRange: number) {
        this.IngameId = ingameId;
        this.TeamspeakId = null;
        this.WebsocketConnection = websocketConnection;
        this.CurrentVoiceRange = defaultVoiceRange;
        this.ForceMuted = false;
        this.PhoneSpeakerEnabled = false;
        this.CurrentCallMembers = [];
    }

    setTeamspeakId(teamspeakId: number | null): void {
        this.TeamspeakId = teamspeakId;
        this.teamspeakDataChanged();
    }

    setWebsocketConnection(newWebsocketConnection: boolean): void {
        this.WebsocketConnection = newWebsocketConnection;
        this.teamspeakDataChanged();
    }

    setCurrentVoiceRange(voiceRange: number): void {
        this.CurrentVoiceRange = voiceRange;
        this.teamspeakDataChanged();
    }

    setForceMuted(forceMuted: boolean): void {
        this.ForceMuted = forceMuted;
        this.teamspeakDataChanged();
    }

    setPhoneSpeakerEnabled(phoneSpeakerEnabled: boolean): void {
        this.PhoneSpeakerEnabled = phoneSpeakerEnabled;
        this.teamspeakDataChanged();
    }

    setCurrentCallMembers(callMembers: number[]): void {
        this.CurrentCallMembers = callMembers;
        this.teamspeakDataChanged();
    }

    private teamspeakDataChanged(): void {
        mp.events.call('Client:GTA5Voice:OnTeamspeakDataChanged');
    }
}
