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
        date: new Date('2024-07-04'),
        description: 'Intiial release of contract.',
    },
    {
        version: version++,
        humanReadableVersion: '0.1.1',
        date: new Date('2024-08-20'),
        description: 'Add a few getters to get variables.',
    },
    {
        version: version++,
        humanReadableVersion: '0.1.2',
        date: new Date('2024-08-22'),
        description: 'Fix a storage calculation error.',
    },
];
