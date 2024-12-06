Migrating from 1.x to 3.x:
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