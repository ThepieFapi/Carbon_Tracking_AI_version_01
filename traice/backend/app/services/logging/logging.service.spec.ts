/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { assert, expect } from 'chai';
import { restore, stub } from 'sinon';
import { Container } from 'typedi';
import { Logger } from './logging.service';
import fs from 'fs';
import path from 'path';

describe('Logging', () => {
    let loggingService: Logger;

    beforeEach(async () => {
        loggingService = Container.get(Logger);
    });

    afterEach(() => {
        restore();
    });

    it('getCurrentDate() should format well', () => {
        const currentDateStub = new Date('2022-02-10T12:00:00');
        stub(global, 'Date').returns(currentDateStub as any);

        const date = loggingService['getCurrentDate']();
        expect(date).to.deep.equal(['2022', '02', '10']);
    });

    it('should create the log dir', () => {
        const logsDir = './logs';
        const currentDateStub = ['2022', '02', '10'];

        loggingService['logsDir'] = logsDir;
        stub(loggingService, 'getCurrentDate' as any).returns(currentDateStub);
        stub(fs, 'existsSync' as any).returns(true);

        const filePath = loggingService['getLogFile']();
        const expectedPath = path.join('logs', '2022', '02', 'log_10.txt');

        expect(filePath).to.equal(expectedPath);
    });
});
