import * as proto_loader from '@grpc/proto-loader';
import * as log from 'debug';
import * as grpc from '@grpc/grpc-js';
import { ProtoUtils } from './utils/ProtoUtils';

export class GrpcMockServer {
  private readonly _server: grpc.Server;

  public constructor(
    public readonly serverAddress: string = '127.0.0.1:50777'
  ) {
    this._server = new grpc.Server();
  }

  /**
   * Adds a gRPC service to the mock server.
   *
   * @param protoPath - Path to the proto file, or array of proto file paths (for modular protos).
   * @param pkgName - The package name defined in the proto.
   * @param serviceName - The service name defined in the proto.
   * @param implementations - The service implementation object.
   * @param protoLoadOptions - Options for proto-loader. Use `includeDirs` to specify import paths for modular protos.
   * @returns The GrpcMockServer instance.
   *
   * Example usage for modular protos:
   *   server.addService([
   *     'user/user.proto',
   *     'common/address.proto'
   *   ], 'user', 'UserService', impl, {
   *     includeDirs: ['common']
   *   });
   */
  public addService(
    protoPath: string | string[],
    pkgName: string,
    serviceName: string,
    implementations: any,
    protoLoadOptions?: any
  ): GrpcMockServer {
    const pkgDef: grpc.GrpcObject = grpc.loadPackageDefinition(
      proto_loader.loadSync(protoPath, protoLoadOptions)
    );
    const proto: any = ProtoUtils.getProtoFromPkgDefinition(pkgName, pkgDef);

    if (!proto) {
      throw new Error('Seems like the package name is wrong.');
    }

    if (!proto[serviceName]) {
      throw new Error('Seems like the service name is wrong.');
    }

    const service: any = proto[serviceName].service;
    this.server.addService(service, implementations);
    return this;
  }

  public get server(): grpc.Server {
    return this._server;
  }

  public async start(): Promise<GrpcMockServer> {
    log.debug('Starting gRPC mock server ...');

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
    log.debug('Stopping gRPC mock server ...');

    await new Promise<void>((resolve, reject) => {
      this.server.tryShutdown(
        (error) => error ? reject(error) : resolve()
      );
    });

    return this;
  }
}
