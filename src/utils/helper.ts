export class Helper {
    getPlayerSeat(player: PlayerMp): number | null {
        if (player.vehicle === null)
            return null;

        for (let i = 0; i < player.vehicle.getMaxNumberOfPassengers(); i++) {
            if (player.handle === player.vehicle.getPedInSeat(i)) {
                return i;
            }
        }
        return null;
    }

    isAnyDoorOpen(vehicle: VehicleMp): boolean {
        for (let i = 0; i < vehicle.getMaxNumberOfPassengers(); i++) {
            if (vehicle.getDoorAngleRatio(i) > 0.0)
                return true;
        }
        return false;
    }
}