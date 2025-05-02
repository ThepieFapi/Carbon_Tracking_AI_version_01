import { Service } from 'typedi';
import { ElectricityCostPerCountry } from './electricityCostPerCountry';

@Service()
export class CostService {
    calulateEnergyCost(energy: number, country: string): number {
        if (!ElectricityCostPerCountry[country]) {
            return energy * ElectricityCostPerCountry.default;
        }
        return energy * ElectricityCostPerCountry[country];
    }
}
