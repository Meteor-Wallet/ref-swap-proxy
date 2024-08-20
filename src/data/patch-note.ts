let version = 0;

export interface PatchNote {
    version: number;
    humanReadableVersion: string;
    date: Date;
    description: string;
}

export const patchNotes: PatchNote[] = [
    {
        version: version++,
        humanReadableVersion: '0.1.0',
        date: new Date('2024-06-06'),
        description: 'Intiial release of contract, with will feature.',
    },
    {
        version: version++,
        humanReadableVersion: '0.1.1',
        date: new Date('2024-06-08'),
        description: 'Remove get_version method from the contract',
    },
];
