type VoiceSettingsPayload = Record<string, string | number | boolean>;

export class VoiceSettings {
    virtualServerUid: string;
    ingameChannelId: number;
    ingameChannelPassword: string;
    fallbackChannelId: number;
    language: string;
    calculationInterval: number;
    voiceRanges: number[];
    excludedChannels: number[];
    enableDistanceBasedVolume: boolean;
    volumeDecreaseMultiplier: number;
    minimumVoiceVolume: number;

    constructor(data: VoiceSettingsPayload) {
        this.virtualServerUid = String(data['VirtualServerUid']);
        this.ingameChannelId = Number(data['IngameChannelId']);
        this.ingameChannelPassword = String(data['IngameChannelPassword']);
        this.fallbackChannelId = Number(data['FallbackChannelId']);
        this.language = String(data['Language']);
        this.calculationInterval = Number(data['CalculationInterval']);
        this.voiceRanges = JSON.parse(String(data['VoiceRanges']));
        this.excludedChannels = JSON.parse(String(data['ExcludedChannels']));
        this.enableDistanceBasedVolume = String(data['EnableDistanceBasedVolume']).toLowerCase() === 'true';
        this.volumeDecreaseMultiplier = Number(data['VolumeDecreaseMultiplier']);
        this.minimumVoiceVolume = Number(data['MinimumVoiceVolume']);
    }
}
