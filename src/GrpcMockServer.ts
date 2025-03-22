import * as proto_loader from '@grpc/proto-loader';
import * as log from 'debug';
import * as grpc from '@grpc/grpc-js';
import { ProtoUtils } from './utils/ProtoUtils';

export class GrpcMockServer {
  private readonly _server: grpc.Server;

  constructor(readonly serverAddress: string = '127.0.0.1:50777') {
    this._server = new grpc.Server();
  }

  public addService(
    protoPath: string,
    pkgName: string,
    serviceName: string,
    implementations: any,
    protoLoadOptions?: any
  ): GrpcMockServer {
    const pkgDef = grpc.loadPackageDefinition(
      proto_loader.loadSync(protoPath, protoLoadOptions)
    );
    const proto = ProtoUtils.getProtoFromPkgDefinition(pkgName, pkgDef);

    if (!proto) {
      throw new Error('Seems like the package name is wrong.');
    }

    if (!proto[serviceName]) {
      throw new Error('Seems like the service name is wrong.');
    }

    const service = proto[serviceName].service;
    this.server.addService(service, implementations);
    return this;
  }

  public get server(): grpc.Server {
    return this._server;
  }

  public async start(): Promise<GrpcMockServer> {
    log('grpc-mock-server')('Starting gRPC mock server ...');

    await new Promise<number>((resolve, reject) => {
      this.server.bindAsync(
        this.serverAddress,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => error ? reject(error) : resolve(port)
      );
    });

    this.server.start();

    return this;
  }

  public async stop(): Promise<GrpcMockServer> {
    log('grpc-mock-server')('Stopping gRPC mock server ...');

    await new Promise<void>((resolve, reject) => {
      this.server.tryShutdown(
        (error) => error ? reject(error) : resolve()
      );
    });

    return this;
  }
}
