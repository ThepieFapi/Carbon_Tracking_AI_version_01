import { WarningStatus } from '../enums/warning-status';
import { WarningType } from '../enums/warning-type';

export interface Warning {
    id: number;
    cumulative: boolean;
    status: WarningStatus;
    data: string;
    type: WarningType;
    threshold: number;
    unit?: string;
}
