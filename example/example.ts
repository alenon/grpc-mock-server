import * as proto_loader from "@grpc/proto-loader";
import * as grpc from "grpc";
import {GrpcMockServer} from "../src/GrpcMockServer";
import {ProtoUtils} from "../src/utils/ProtoUtils";

class Example {

    private static readonly PROTO_PATH: string = __dirname + "/../../example/example.proto";
    private static readonly PKG_NAME: string = "com.alenon.example";
    private static readonly SERVICE_NAME: string = "ExampleService";
    private readonly server: GrpcMockServer;
    private readonly pkgDef: any;
    private readonly proto: any;

    constructor() {
        this.server = new GrpcMockServer();

        this.pkgDef = grpc.loadPackageDefinition(proto_loader.loadSync(Example.PROTO_PATH));
        this.proto = ProtoUtils.getProtoFromPkgDefinition("com.alenon.example", this.pkgDef);
        this.initMockServer();
    }

    public run(): void {
        const client: any = new this.proto.ExampleService(GrpcMockServer.SERVER_ADDRESS, grpc.credentials.createInsecure());
        const request: any = new this.proto.ExampleRequest.constructor({msg: "the message"});

        client.ex1(request, (error: any, response: any) => {
            console.log(response.msg);
        });
    }

    private initMockServer() {
        const response: any = new this.proto.ExampleResponse.constructor({msg: "the response message"});
        const implementations = {
            ex1: (call: any, callback: any) => {
                callback(null, response);
            },
        };

        this.server.addService(Example.PROTO_PATH, Example.PKG_NAME, Example.SERVICE_NAME, implementations);
        this.server.start();
    }
}

const example: Example = new Example();
example.run();
