# grpc-mock-server

> A lightweight, TypeScript-first gRPC mock server designed for testing. Easily create mock gRPC services from your `.proto` files without complex setup.

[![NPM CI](https://github.com/alenon/grpc-mock-server/workflows/NPM%20CI/badge.svg)](https://github.com/alenon/grpc-mock-server/actions)
[![npm version](https://img.shields.io/npm/v/@alenon/grpc-mock-server.svg)](https://www.npmjs.com/package/@alenon/grpc-mock-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🚀 **Zero Configuration** - Get started in seconds with minimal setup
- 📦 **TypeScript Support** - Built with TypeScript, includes type definitions
- 🔧 **Flexible** - Support for single and multiple proto files with cross-package imports
- 🧪 **Test-Friendly** - Perfect for unit and integration testing
- 🎯 **Simple API** - Clean, intuitive interface
- 🔄 **Async/Await** - Modern Promise-based API

## 📦 Installation

```bash
npm install @alenon/grpc-mock-server
```

Or with yarn:

```bash
yarn add @alenon/grpc-mock-server
```

## 🚀 Quick Start

Create a mock server in just a few lines:

```typescript
import { GrpcMockServer } from '@alenon/grpc-mock-server';

// Create server instance
const server = new GrpcMockServer();

// Define your service implementations
const implementations = {
  GetUser: (call: any, callback: any) => {
    callback(null, { name: 'John Doe', id: '123' });
  }
};

// Add service from proto file
server.addService(
  './path/to/user.proto',
  'user',           // package name from proto
  'UserService',    // service name from proto
  implementations
);

// Start the server
await server.start();
console.log(`Server running at: ${server.serverAddress}`);

// Don't forget to stop when done!
await server.stop();
```

## 📚 Usage Examples

### Basic Example - Single Proto File

This example demonstrates the simplest use case with a single proto file.

**example.proto:**
```protobuf
syntax = "proto3";

package com.alenon.example;

service ExampleService {
    rpc ex1 (ExampleRequest) returns (ExampleResponse) {}
}

message ExampleRequest {
    string msg = 1;
}

message ExampleResponse {
    string msg = 1;
}
```

**example.ts:**
```typescript
import { GrpcMockServer } from '@alenon/grpc-mock-server';
import * as grpc from '@grpc/grpc-js';
import * as proto_loader from '@grpc/proto-loader';
import { ProtoUtils } from '@alenon/grpc-mock-server';

async function example() {
  const server = new GrpcMockServer();

  // Define implementations
  const implementations = {
    ex1: (call: any, callback: any) => {
      console.log('Received:', call.request.msg);
      callback(null, { msg: 'Hello from mock server!' });
    }
  };

  // Add service
  server.addService(
    __dirname + '/example.proto',
    'com.alenon.example',
    'ExampleService',
    implementations
  );

  // Start server
  await server.start();
  console.log(`Server listening at: ${server.serverAddress}`);

  // Create client and test
  const pkgDef = grpc.loadPackageDefinition(
    proto_loader.loadSync(__dirname + '/example.proto')
  );
  const proto = ProtoUtils.getProtoFromPkgDefinition('com.alenon.example', pkgDef);
  
  const client = new proto.ExampleService(
    server.serverAddress,
    grpc.credentials.createInsecure()
  );

  // Make request
  const response = await new Promise((resolve, reject) => {
    client.ex1({ msg: 'Hello!' }, (error: any, response: any) => {
      error ? reject(error) : resolve(response);
    });
  });

  console.log('Response:', response);
  
  await server.stop();
}

example().catch(console.error);
```

### Advanced Example - Multiple Proto Files

When your proto files import from other packages, use an array of proto paths with `includeDirs`:

**user.proto:**
```protobuf
syntax = "proto3";

package user;

import "address.proto";

message User {
  string name = 1;
  common.Address address = 2;
}

service UserService {
  rpc GetUser (UserRequest) returns (UserResponse);
}

message UserRequest {
  string id = 1;
}

message UserResponse {
  User user = 1;
}
```

**address.proto:**
```protobuf
syntax = "proto3";

package common;

message Address {
  string postal_code = 1;
  string city = 2;
  string country = 3;
}
```

**multi-proto-example.ts:**
```typescript
import { GrpcMockServer } from '@alenon/grpc-mock-server';

async function multiProtoExample() {
  const server = new GrpcMockServer();

  const implementations = {
    GetUser: (call: any, callback: any) => {
      callback(null, {
        user: {
          name: 'John Doe',
          address: {
            postal_code: '12345',
            city: 'San Francisco',
            country: 'USA'
          }
        }
      });
    }
  };

  // Use array of proto files with options
  server.addService(
    [
      __dirname + '/user.proto',
      __dirname + '/address.proto'
    ],
    'user',
    'UserService',
    implementations,
    {
      includeDirs: [__dirname],  // Required for imports
      keepCase: true,             // Preserve field names
      longs: String,              // Convert longs to strings
      enums: String,              // Convert enums to strings
      defaults: true,             // Include default values
      oneofs: true                // Handle oneof fields
    }
  );

  await server.start();
  // ... use server ...
  await server.stop();
}
```

### Testing Example

Perfect for Jest or other testing frameworks:

```typescript
import { GrpcMockServer, ProtoUtils } from '@alenon/grpc-mock-server';
import * as grpc from '@grpc/grpc-js';
import * as proto_loader from '@grpc/proto-loader';

describe('ExampleService Tests', () => {
  let server: GrpcMockServer;
  let client: any;

  beforeAll(async () => {
    server = new GrpcMockServer();
    
    server.addService(
      __dirname + '/example.proto',
      'com.alenon.example',
      'ExampleService',
      {
        ex1: (call: any, callback: any) => {
          callback(null, { msg: 'Test response' });
        }
      }
    );

    await server.start();

    // Setup client
    const pkgDef = grpc.loadPackageDefinition(
      proto_loader.loadSync(__dirname + '/example.proto')
    );
    const proto = ProtoUtils.getProtoFromPkgDefinition('com.alenon.example', pkgDef);
    client = new proto.ExampleService(
      server.serverAddress,
      grpc.credentials.createInsecure()
    );
  });

  afterAll(async () => {
    await server.stop();
  });

  it('should return response data', async () => {
    const response = await new Promise((resolve, reject) => {
      client.ex1({ msg: 'Test request' }, (error: any, response: any) => {
        error ? reject(error) : resolve(response);
      });
    });

    expect(response.msg).toBe('Test response');
  });
});
```

## 📖 API Reference

### `GrpcMockServer`

Main class for creating and managing mock gRPC servers.

#### Constructor

```typescript
new GrpcMockServer(serverAddress?: string)
```

- `serverAddress` (optional): Server address in format `host:port`. Default: `'127.0.0.1:50777'`

#### Methods

##### `addService(protoPath, pkgName, serviceName, implementations, protoLoadOptions?)`

Adds a gRPC service to the mock server.

**Parameters:**
- `protoPath`: `string | string[]` - Path to proto file(s). Use array for multiple files with imports.
- `pkgName`: `string` - Package name as defined in your `.proto` file.
- `serviceName`: `string` - Service name as defined in your `.proto` file.
- `implementations`: `object` - Object mapping RPC method names to their implementations.
  - Each implementation is a function: `(call: any, callback: any) => void`
  - Call `callback(null, response)` for success
  - Call `callback(error)` for errors
- `protoLoadOptions` (optional): Options for `@grpc/proto-loader`. Common options:
  - `includeDirs`: `string[]` - Directories to search for imported proto files
  - `keepCase`: `boolean` - Preserve field name casing (default: `false`)
  - `longs`: `Function` - How to handle long values (e.g., `String`)
  - `enums`: `Function` - How to handle enum values (e.g., `String`)
  - `defaults`: `boolean` - Include default values (default: `false`)
  - `oneofs`: `boolean` - Handle oneof fields (default: `false`)

**Returns:** `GrpcMockServer` (for method chaining)

##### `start()`

Starts the mock server.

**Returns:** `Promise<GrpcMockServer>`

##### `stop()`

Stops the mock server gracefully.

**Returns:** `Promise<GrpcMockServer>`

##### `serverAddress`

**Property:** `string` - The address where the server is listening.

##### `server`

**Property:** `grpc.Server` - Access to the underlying gRPC server instance.

## 🔍 Common Use Cases

### Custom Server Address

```typescript
const server = new GrpcMockServer('localhost:50051');
```

### Error Handling

```typescript
import * as grpc from '@grpc/grpc-js';

const implementations = {
  GetUser: (call: any, callback: any) => {
    if (!call.request.id) {
      callback({ code: grpc.status.INVALID_ARGUMENT, message: 'ID required' });
      return;
    }
    callback(null, { name: 'User', id: call.request.id });
  }
};
```

### Method Chaining

```typescript
await new GrpcMockServer()
  .addService(protoPath, pkgName, serviceName, impl1)
  .addService(protoPath2, pkgName2, serviceName2, impl2)
  .start();
```

## 🐛 Troubleshooting

### "Seems like the package name is wrong"

- Verify the `pkgName` matches exactly the `package` declaration in your `.proto` file
- Check for typos and case sensitivity

### "Seems like the service name is wrong"

- Verify the `serviceName` matches exactly the service name in your `.proto` file
- Check for typos and case sensitivity

### Import errors with multiple proto files

- Ensure `includeDirs` includes the directory containing imported proto files
- Verify import paths in your proto files are correct relative to `includeDirs`
- Use `keepCase: true` if your proto uses snake_case field names

### Port already in use

- Change the server address: `new GrpcMockServer('127.0.0.1:50778')`
- Ensure previous server instances are stopped

## 📝 Examples

Check out the [examples directory](./example/) for complete working examples:

- [Basic example](./example/example.ts) - Single proto file
- [Multi-proto example](./example/multi-proto-example.ts) - Multiple proto files with imports

Run examples:
```bash
npm run example
npm run multi-proto-example
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/@alenon/grpc-mock-server)
- [GitHub Repository](https://github.com/alenon/grpc-mock-server)
- [Issue Tracker](https://github.com/alenon/grpc-mock-server/issues)

## 💡 Tips

- Always call `stop()` after tests to clean up resources
- Use `keepCase: true` if your proto files use snake_case naming
- For complex proto structures, use `defaults: true` and `oneofs: true`
- The server uses insecure credentials by default (perfect for testing)

---

Made with ❤️ for the gRPC testing community
