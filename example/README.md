# Examples

This directory contains examples demonstrating how to use grpc-mock-server.

## Basic Example - Single Proto File

**File**: `example.ts`

Demonstrates the basic usage with a single proto file:

```typescript
import { GrpcMockServer } from '../src/GrpcMockServer';

const server = new GrpcMockServer();

server.addService(
  __dirname + '/example.proto',
  'com.alenon.example',
  'ExampleService',
  implementations
);
```

**Run**: `npm run example`

## Multi-Proto Example - Multiple Proto Files

**Files**: `multi-proto-example.ts`, `user.proto`, `address.proto`

Demonstrates how to use multiple proto files with cross-package imports:

```typescript
server.addService(
  [
    __dirname + '/user.proto',
    __dirname + '/address.proto'
  ],
  'user',
  'UserService',
  implementations,
  {
    includeDirs: [__dirname],
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);
```

The `user.proto` imports `Address` message from `address.proto`:

```protobuf
// user.proto
import "address.proto";

message User {
  string name = 1;
  common.Address address = 2;  // From address.proto
}
```

**Run**: `npm run multi-proto-example`

## Key Points

1. **Single Proto**: Simple usage with one proto file
2. **Multiple Proto**: Use array of proto files with proper options:
   - `includeDirs`: Directories to search for imported files
   - `keepCase`: Preserve field name casing (snake_case)
   - `defaults`, `oneofs`: Handle protobuf features properly
3. **Cross-Package Imports**: Proto files can import messages from other packages 

Mock server listening at: 127.0.0.1:50777
GetUser called with ID: 123
User response: {
  name: 'John Doe',
  address: { postal_code: '12345', city: 'San Francisco', country: 'USA' }
} 