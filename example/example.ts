import * as proto_loader from "@grpc/proto-loader";
import * as grpc from "@grpc/grpc-js";
import {GrpcMockServer} from "../src/GrpcMockServer";
import {ProtoUtils} from "../src/utils/ProtoUtils";

class Example {

    private static readonly PROTO_PATH: string = __dirname + "/example.proto";
    private static readonly PKG_NAME: string = "com.alenon.example";
    private static readonly SERVICE_NAME: string = "ExampleService";
    private readonly server: GrpcMockServer;
    private readonly pkgDef: any;
    private readonly proto: any;

    constructor() {
        this.server = new GrpcMockServer((error: Error | null, port: Number) => {
            if(error) {
              throw new Error("Failed initializing Mock GRPC server on port: " + port);
            } else {
              console.log("Mock GRPC server is listening on port: " + port);
              this.initMockServer();
            }
          });

        this.pkgDef = grpc.loadPackageDefinition(proto_loader.loadSync(Example.PROTO_PATH));
        this.proto = ProtoUtils.getProtoFromPkgDefinition("com.alenon.example", this.pkgDef);
    }

    public run(): void {
        const client: any = new this.proto.ExampleService("127.0.0.1:50777", grpc.credentials.createInsecure());
        const request: any = new this.proto.ExampleRequest.constructor({msg: "the message"});

        client.ex1(request, (error: any, response: any) => {
            console.log(response.msg);
            this.server.stop();
        });
    }

    private initMockServer() {

        const implementations = {
            ex1: (call: any, callback: any) => {
                const response: any =
                    new this.proto.ExampleResponse.constructor({msg: "the response message"});
                callback(null, response);
            },
        };

        this.server.addService(Example.PROTO_PATH, Example.PKG_NAME, Example.SERVICE_NAME, implementations);
        this.server.start();
    }
}

const example: Example = new Example();
example.run();
