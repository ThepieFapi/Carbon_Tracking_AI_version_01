import 'reflect-metadata';
import { Server } from './server';
import { Container } from 'typedi';

const server: Server = Container.get(Server);
server.init();
