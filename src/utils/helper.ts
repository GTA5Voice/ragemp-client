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
}