import { RadioService } from 'gta5voice/service/radioService';
import { VoiceService } from 'gta5voice/service/voiceService';
import { PhoneService } from 'gta5voice/service/phoneService';
import { FilterTypes } from 'gta5voice/models/enums/filter';

const getDistanceBetweenCoords = mp.game.gameplay.getDistanceBetweenCoords;
const toJson = JSON.stringify;

export type PlayerVoiceData = {
    teamspeakId: number | null;
    websocketConnection: boolean;
    voiceRange: number;
    muffleIntensity: number;
    filter: FilterTypes;
    direction: string | null;
    forceMuted: boolean;
};

export class Calculation {
    voiceService: VoiceService;
    phoneService: PhoneService;
    radioService: RadioService;
    localPlayer: PlayerMp;

    constructor() {
        this.voiceService = new VoiceService();
        this.phoneService = new PhoneService();
        this.radioService = new RadioService();
        this.localPlayer = mp.players.local;
    }

    calculatePlayersInRange(): Map<number, PlayerVoiceData> {
        const streamedPlayers = mp.players.streamed;
        const phoneMembers = this.phoneService.currentCallMembers;
        const radioMembers = this.radioService.currentRadioMembers;
        const playerData = new Map<number, PlayerVoiceData>();

        streamedPlayers.forEach((s) => {
            if (!s || s.remoteId === this.localPlayer.remoteId) return;

            const sData = this.buildSingleTeamspeakData(
                s.remoteId,
                this.getMuffleIntensity(s),
                FilterTypes.NONE,
                this.spatialize3D(s),
            );
            if (!sData || !sData.websocketConnection) return; // not in voice

            const { x: lx, y: ly, z: lz } = this.localPlayer.position;
            const { x: sx, y: sy, z: sz } = s.position;

            const playerVoiceRange = sData.voiceRange;
            if (getDistanceBetweenCoords(lx, ly, lz, sx, sy, sz, false) <= playerVoiceRange) {
                playerData.set(s.remoteId, sData);
            }
        });

        phoneMembers.forEach((p) => {
            if (p === this.localPlayer.remoteId) return;

            const sData = this.buildSingleTeamspeakData(p, 0, FilterTypes.PHONE, null);
            if (!sData || !sData.websocketConnection) return; // not in voice

            playerData.set(p, sData);
        });

        radioMembers.forEach((r) => {
            if (r === this.localPlayer.remoteId) return;

            const sData = this.buildSingleTeamspeakData(r, 0, FilterTypes.RADIO, null);
            if (!sData || !sData.websocketConnection) return; // not in voice

            playerData.set(r, sData);
        });

        return playerData;
    }

    private getMuffleIntensity(mpPlayer: PlayerMp): number {
        const pRoom = mp.game.interior.getRoomKeyFromEntity(this.localPlayer.handle);
        const sRoom = mp.game.interior.getRoomKeyFromEntity(mpPlayer.handle);
        let intensity = 0;

        if (pRoom !== sRoom) intensity = 100;

        if (this.localPlayer.hasClearLosTo(mpPlayer.handle, 17)) {
            intensity *= 0.5; // -50% if line of sight is there
        }

        return intensity;
    }

    private spatialize3D(mpPlayer: PlayerMp): string {
        const toOther = new mp.Vector3(
            mpPlayer.position.x - this.localPlayer.position.x,
            mpPlayer.position.y - this.localPlayer.position.y,
            mpPlayer.position.z - this.localPlayer.position.z,
        );

        const direction = toOther.unit();
        const forward = this.localPlayer.getForwardVector();
        const right = forward.cross(new mp.Vector3(0, 0, 1));

        return toJson(
            new mp.Vector3(
                right.dot(direction),
                forward.dot(direction),
                0,
            ),
        );
    }

    private buildSingleTeamspeakData(
        remoteId: number,
        muffleIntensity: number,
        filter: FilterTypes,
        direction: string | null,
    ): PlayerVoiceData | null {
        const client = this.voiceService.Get(remoteId);
        const settings = client?.data;
        if (!settings) return null;

        return {
            teamspeakId: settings.teamspeakId ?? null,
            websocketConnection: settings.websocketConnection ?? false,
            voiceRange: settings.voiceRange,
            muffleIntensity,
            filter,
            direction,
            forceMuted: settings.forceMuted ?? false,
        };
    }
}
