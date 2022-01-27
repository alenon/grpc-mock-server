# grpc-mock-server
gRPC mock server for tests with typescript definitions.

![NPM CI](https://github.com/alenon/grpc-mock-server/workflows/NPM%20CI/badge.svg)

Installation:

[NPM link](https://www.npmjs.com/package/@alenon/grpc-mock-server)

`npm i @alenon/grpc-mock-server`

Migrating from 1.x to 2.x:
1. Change grpc dependecy from this `import * as grpc from "grpc";` by this: `import * as grpc from "@grpc/grpc-js";`

2. Handle `start` and `stop` functions which are now asynchronous and return Promises:
```typescript
this.server = new GrpcMockServer();

// async / await
try {
    await this.server.start();
    console.log('do work...');
    await this.server.stop();
} catch (error) {
    console.log(error);
}

// standard promises
this.server.start()
    .then(() => console.log('do work...'))
    .then(() => this.server.stop())
    .catch((error) => console.log(error));
```

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
