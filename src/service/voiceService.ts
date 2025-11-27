export interface VoiceClientData {
    teamspeakId: number | null;
    websocketConnection: boolean;
    voiceRange: number;
    forceMuted: boolean;
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
            client = { id: remoteId, data: { teamspeakId: null, websocketConnection: false, voiceRange: 0, forceMuted: false } };
            this.allClients.push(client);
        }

        client.data = {
            teamspeakId: data?.teamspeakId ?? client.data.teamspeakId ?? null,
            websocketConnection: data?.websocketConnection ?? client.data.websocketConnection ?? false,
            voiceRange: data?.voiceRange ?? this.defaultVoiceRange!,
            forceMuted: data?.forceMuted ?? client.data.forceMuted ?? false,
        };
    }

    SetDefaultVoiceRange(range: number): void {
        if (Number.isNaN(range)) return;
        this.defaultVoiceRange = range;
        // TODO: Trigger event for developers, so they know a voice range is being set. (mp.events.call)
    }

    Remove(remoteId: number): void {
        this.allClients = this.allClients.filter((c) => c.id !== remoteId);
    }

    Get(remoteId: number): VoiceClientEntry | undefined {
        return this.allClients.find((c) => c.id === remoteId);
    }
}
