import * as proto_loader from "@grpc/proto-loader";
import * as log from "debug";
import * as grpc from "grpc";
import { ProtoUtils } from "./utils/ProtoUtils";

export class GrpcMockServer {
  private readonly _server: grpc.Server;

  public constructor(public serverAddress: string = "127.0.0.1:50777") {
    this._server = new grpc.Server();
    this.server.bind(
      this.serverAddress,
      grpc.ServerCredentials.createInsecure()
    );
  }

  public addService(
    protoPath: string,
    pkgName: string,
    serviceName: string,
    implementations: any
  ): GrpcMockServer {
    const pkgDef: any = grpc.loadPackageDefinition(
      proto_loader.loadSync(protoPath)
    );
    const proto: any = ProtoUtils.getProtoFromPkgDefinition(pkgName, pkgDef);

    if (!proto) {
      throw new Error("Seems like the package name is wrong.");
    }

    if (!proto[serviceName]) {
      throw new Error("Seems like the service name is wrong.");
    }

    const service: any = proto[serviceName].service;
    this.server.addService(service, implementations);
    return this;
  }

  public get server(): grpc.Server {
    return this._server;
  }

  public start(): GrpcMockServer {
    log.debug("Starting gRPC mock server ...");
    this.server.start();
    return this;
  }

  public stop(): GrpcMockServer {
    log.debug("Stopping gRPC mock server ...");
    this.server.forceShutdown();
    return this;
  }
}
