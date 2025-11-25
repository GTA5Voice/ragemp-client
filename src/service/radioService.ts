export class RadioService {
    currentRadioMembers: number[];

    constructor() {
        this.currentRadioMembers = []; // Contains all remote IDs

        mp.events.add({
            'Client:GTA5Voice:UpdateRadioMembers': (radioIds: number[]) => {
                this.currentRadioMembers = radioIds;
            },
            'Client:GTA5Voice:LeaveRadio': () => {
                this.currentRadioMembers = [];
            },
        });
    }
}
