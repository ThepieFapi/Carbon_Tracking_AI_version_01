import cors from 'cors';
import express from 'express';
import { Service } from 'typedi';
import { HttpStatusCode } from '../../common/enums/http-status';
import { Router } from 'express';

@Service()
export class Application {
    app: express.Application;
    private readonly internalError!: number;
    router!: Router;

    constructor() {
        this.app = express();
        this.internalError = HttpStatusCode.InternalServerError;
        this.router = Router();
        this.config();
        this.bindRoutes();
    }

    bindRoutes(): void {
        this.app.use('/api', this.router);
        this.app.use('/', (_req, res): void => {
            res.redirect('/api');
        });
        this.errorHandling();
    }

    private config(): void {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors());
    }

    private errorHandling(): void {
        this.app.use((_req: express.Request, _res: express.Response, next: express.NextFunction): void => {
            const err: HttpStatusCode = HttpStatusCode.NotFound;
            next(err);
        });

        if (this.app.get('env') === 'development')
            this.app.use((err: HttpStatusCode, _req: express.Request, res: express.Response): void => {
                res.status(err || this.internalError);
                res.send({
                    message: err,
                    error: err,
                });
            });

        this.app.use((err: HttpStatusCode, _req: express.Request, res: express.Response): void => {
            res.status(err || this.internalError);
            res.send({
                message: err,
                error: {},
            });
        });
    }
}
