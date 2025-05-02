import { Service } from 'typedi';
import fs from 'fs';
import path from 'path';

enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

@Service()
export class Logger {
    private logsDir = path.join(process.cwd(), 'logs');

    constructor() {}

    debug(message: string): void {
        this.log(LogLevel.DEBUG, message);
    }

    info(message: string): void {
        this.log(LogLevel.INFO, message);
    }

    warn(message: string): void {
        this.log(LogLevel.WARN, message);
    }

    error(message: string): void {
        this.log(LogLevel.ERROR, message);
    }

    private log(level: LogLevel, message: string): void {
        try {
            const logFileName = this.getLogFile();
            const logMessage = `[${level.toString()}] - [${new Date().toISOString()}] - ${message}\n`;

            fs.appendFileSync(logFileName, logMessage);
        } catch (error) {
            console.error('Error caught logging:', error);
        }
    }

    private getLogFile(): string {
        const [year, month, day] = this.getCurrentDate();

        const filePath: string = path.join(this.logsDir, year, month);
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath, { recursive: true });
        }
        return path.join(filePath, `log_${day}.txt`);
    }

    private getCurrentDate(): [string, string, string] {
        const currentDate = new Date();
        const year = currentDate.getFullYear().toString();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 because months are zero-based
        const day = currentDate.getDate().toString().padStart(2, '0');

        return [year, month, day];
    }
}
