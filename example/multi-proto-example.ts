import { GrpcMockServer } from '../src/GrpcMockServer';

async function multiProtoExample() {
  // Create mock server
  const server = new GrpcMockServer();

  // Define service implementation
  const implementations = {
    GetUser: (call: any, callback: any) => {
      console.log('GetUser called with ID:', call.request.id);
      
      // Return user with address from different proto package
      const user = {
        name: 'John Doe',
        address: {
          postal_code: '12345',
          city: 'San Francisco',
          country: 'USA'
        }
      };
      
      callback(null, { user });
    }
  };

  // Add service with multiple proto files
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

  // Start server
  await server.start();
  console.log(`Multi-proto mock server listening at: ${server.serverAddress}`);

  // Create client
  const grpc = require('@grpc/grpc-js');
  const proto_loader = require('@grpc/proto-loader');
  const { ProtoUtils } = require('../src/utils/ProtoUtils');

  const pkgDef = grpc.loadPackageDefinition(
    proto_loader.loadSync([
      __dirname + '/user.proto',
      __dirname + '/address.proto'
    ], {
      includeDirs: [__dirname],
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    })
  );

  const proto = ProtoUtils.getProtoFromPkgDefinition('user', pkgDef);
  const client = new proto.UserService(
    '127.0.0.1:50777',
    grpc.credentials.createInsecure()
  );

  // Make request
  const response = await new Promise<any>((resolve, reject) => {
    client.GetUser({ id: '123' }, (error: any, response: any) => {
      error ? reject(error) : resolve(response);
    });
  });

  console.log('User response:', {
    name: response.user.name,
    address: {
      postal_code: response.user.address.postal_code,
      city: response.user.address.city,
      country: response.user.address.country
    }
  });

  // Stop server
  await server.stop();
}

// Run example
multiProtoExample().catch(console.error); 