import Container from 'typedi';
import { CostService } from './cost.service';
import { restore } from 'sinon';
import { ElectricityCostPerCountry } from './electricityCostPerCountry';
import { expect } from 'chai';

describe('Cost', () => {
    let service: CostService;

    beforeEach(async () => {
        service = Container.get(CostService);
    });

    afterEach(async () => {
        restore();
    });

    it('should calculate the energy cost', () => {
        expect(service.calulateEnergyCost(100, 'Germany')).to.equal(100 * ElectricityCostPerCountry['Germany']);
    });

    it('should calculate the energy cost with default value', () => {
        expect(service.calulateEnergyCost(100, 'Unknown')).to.equal(100 * ElectricityCostPerCountry.default);
    });
});
