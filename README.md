# grpc-mock-server
gRPC mock server for tests. With typescript definitions.


Usage example:
```typescript
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