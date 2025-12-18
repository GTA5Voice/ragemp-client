import { RadioService } from 'gta5voice/service/radioService';
import { VoiceService } from 'gta5voice/service/voiceService';
import { PhoneService } from 'gta5voice/service/phoneService';
import { FilterTypes } from 'gta5voice/models/enums/filter';
import { Helper } from 'gta5voice/utils/helper';

const getDistanceBetweenCoords = mp.game.gameplay.getDistanceBetweenCoords;

export type PlayerVoiceData = {
    teamspeakId: number | null;
    websocketConnection: boolean;
    voiceRange: number;
    muffleIntensity: number;
    filter: FilterTypes;
    direction: Vector3 | null;
    forceMuted: boolean;
};

export class Calculation {
    voiceService: VoiceService;
    phoneService: PhoneService;
    radioService: RadioService;
    localPlayer: PlayerMp;
    helper: Helper;

    constructor() {
        this.voiceService = new VoiceService();
        this.phoneService = new PhoneService();
        this.radioService = new RadioService();
        this.helper = new Helper();
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
        let intensity = 0; // default muffle value

        const localInVehicle = this.localPlayer.vehicle;
        const otherInVehicle = mpPlayer.vehicle;

        if (localInVehicle || otherInVehicle) {
            // both in same vehicle
            if (localInVehicle && otherInVehicle && localInVehicle === otherInVehicle) {
                return intensity;
            }

            if (otherInVehicle && !localInVehicle) {
                const seat = this.helper.getPlayerSeat(mpPlayer);
                if (seat !== null) {
                    const pDoorAngle = otherInVehicle.getDoorAngleRatio(seat);
                    intensity = (1 - pDoorAngle) * 0.2; // muffle based on vehicle door state
                }
            }

            if (localInVehicle && !otherInVehicle) {
                const seat = this.helper.getPlayerSeat(this.localPlayer);
                if (seat !== null) {
                    const pDoorAngle = localInVehicle.getDoorAngleRatio(seat);
                    intensity = (1 - pDoorAngle) * 0.2; // muffle based on vehicle door state
                }
            }
        } else {
            if (pRoom !== sRoom) {
                intensity = 1; // full muffle if in different rooms
            }

            if (intensity > 0 && this.localPlayer.hasClearLosTo(mpPlayer.handle, 17)) {
                intensity *= 0.5; // -50% if line of sight is there
            }
        }

        return intensity;
    }

    private spatialize3D(mpPlayer: PlayerMp): Vector3 {
        const selfPos = this.localPlayer.position;
        const otherPos = mpPlayer.position;

        const dir = otherPos.subtract(selfPos);
        const distance = dir.length();

        const heading = this.localPlayer.getRotation(0).z * Math.PI / 180;
        const sin = Math.sin(heading);
        const cos = Math.cos(heading);

        const rotated = new mp.Vector3(
            dir.x * cos + dir.y * sin,
            -dir.x * sin + dir.y * cos,
            dir.z
        );

        const leftRight = Math.max(-1, Math.min(1, rotated.x));

        return new mp.Vector3(
            distance,
            leftRight,
            rotated.z
        );
    }

    private buildSingleTeamspeakData(
        remoteId: number,
        muffleIntensity: number,
        filter: FilterTypes,
        direction: Vector3 | null,
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
