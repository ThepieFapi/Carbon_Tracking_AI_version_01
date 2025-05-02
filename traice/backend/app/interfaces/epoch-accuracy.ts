export interface EpochAccuracy {
    value: number;
    difference: number;
    ratio: {
        emission: number;
        energy: number;
    };
}
