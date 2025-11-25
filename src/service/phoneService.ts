export class PhoneService {
    currentCallMembers: number[];

    constructor() {
        this.currentCallMembers = []; // Contains all remote IDs

        mp.events.add({
            'Client:GTA5Voice:UpdatePhoneCall': (callIds: number[]) => {
                this.currentCallMembers = callIds;
                mp.events.call('Client:GTA5Voice:OnPhoneCallUpdated', callIds);
            },
            'Client:GTA5Voice:KillPhoneCall': () => {
                this.currentCallMembers = [];
                mp.events.call('Client:GTA5Voice:OnPhoneCallEnd');
            },
        });
    }
}
