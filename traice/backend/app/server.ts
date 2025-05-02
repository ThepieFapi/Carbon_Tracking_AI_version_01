/* eslint-disable no-console */
import * as http from 'http';
import { Service } from 'typedi';
import { AddressInfo } from 'net';
import { Application } from './app';
import { SocketService } from './services/socket/socket.service';

@Service()
export class Server {
    private server!: http.Server;
    // eslint-disable-next-line @typescript-eslint/member-ordering, @typescript-eslint/no-magic-numbers
    private static readonly port: number = 3000;

    constructor(
        private readonly application: Application,
        private readonly socketService: SocketService,
    ) {}

    init() {
        this.server = http.createServer(this.application.app);
        this.socketService.init(this.server);
        this.socketService.handleEvents();
        this.server.listen(Server.port);
        this.server.on('error', (error: NodeJS.ErrnoException) => console.error(error));
        this.server.on('listening', () => this.onListening());
    }

    onListening(): void {
        const addr = this.server.address() as AddressInfo;
        const bind = `port ${addr.port}`;
        console.log(`Listening on ${bind}`);
    }
}
