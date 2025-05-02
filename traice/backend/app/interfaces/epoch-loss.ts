export interface EpochLoss {
    value: number;
    difference: number;
    ratio: {
        emission: number;
        energy: number;
    };
}
