export class VoiceClient {
    IngameId: number;
    TeamspeakId: number | null;
    WebsocketConnection: boolean;
    CurrentVoiceRange: number;

    constructor(ingameId: number, websocketConnection: boolean, defaultVoiceRange: number) {
        this.IngameId = ingameId;
        this.TeamspeakId = null;
        this.WebsocketConnection = websocketConnection;
        this.CurrentVoiceRange = defaultVoiceRange;
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

    private teamspeakDataChanged(): void {
        mp.events.call('Client:GTA5Voice:OnTeamspeakDataChanged');
    }
}
