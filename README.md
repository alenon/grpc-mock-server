# grpc-mock-server
gRPC mock server for tests with typescript definitions.

![NPM CI](https://github.com/alenon/grpc-mock-server/workflows/NPM%20CI/badge.svg)

Installation:

[NPM link](https://www.npmjs.com/package/@alenon/grpc-mock-server)

`npm i @alenon/grpc-mock-server`

Usage example:
```typescript
private static readonly PROTO_PATH: string = __dirname + "example.proto";
private static readonly PKG_NAME: string = "com.alenon.example";
private static readonly SERVICE_NAME: string = "ExampleService";

...

const implementations = {
    ex1: (call: any, callback: any) => {
        const response: any =
            new this.proto.ExampleResponse.constructor({msg: "the response message"});
        callback(null, response);
    },
};

this.server.addService(PROTO_PATH, PKG_NAME, SERVICE_NAME, implementations);
this.server.start();
```
