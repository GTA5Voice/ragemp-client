export interface VoiceClientData {
    teamspeakId: number | null;
    websocketConnection: boolean;
    voiceRange: number;
}

interface VoiceClientEntry {
    id: number;
    data: VoiceClientData;
}

export class VoiceService {
    private allClients: VoiceClientEntry[];
    private defaultVoiceRange: number | null;

    constructor() {
        this.allClients = [];
        this.defaultVoiceRange = null;
    }

    Set(remoteId: number, data?: Partial<VoiceClientData>): void {
        let client = this.allClients.find((c) => c.id === remoteId);

        if (!client) {
            client = { id: remoteId, data: { teamspeakId: null, websocketConnection: false, voiceRange: 0 } };
            this.allClients.push(client);
        }

        const fallbackRange = typeof this.defaultVoiceRange === 'number' ? this.defaultVoiceRange : 0;
        const currentVoiceRange =
            typeof data?.voiceRange === 'number'
                ? data.voiceRange
                : typeof client.data?.voiceRange === 'number'
                ? client.data.voiceRange
                : fallbackRange;

        client.data = {
            teamspeakId: data?.teamspeakId ?? client.data.teamspeakId ?? null,
            websocketConnection: data?.websocketConnection ?? client.data.websocketConnection ?? false,
            voiceRange: currentVoiceRange,
        };
    }

    SetDefaultVoiceRange(range: number): void {
        if (typeof range !== 'number' || Number.isNaN(range)) return;
        this.defaultVoiceRange = range;
    }

    GetDefaultVoiceRange(): number {
        return typeof this.defaultVoiceRange === 'number' ? this.defaultVoiceRange : 0;
    }

    Remove(remoteId: number): void {
        this.allClients = this.allClients.filter((c) => c.id !== remoteId);
    }

    Get(remoteId: number): VoiceClientEntry | undefined {
        return this.allClients.find((c) => c.id === remoteId);
    }

    GetAll(): VoiceClientEntry[] {
        return this.allClients;
    }

    GetData(remoteId: number): VoiceClientData | null {
        const client = this.Get(remoteId);
        return client ? client.data : null;
    }
}
