import { GrpcMockServer } from '../src/GrpcMockServer';

async function basicExample() {
  // Create mock server
  const server = new GrpcMockServer();

  // Define service implementation
  const implementations = {
    ex1: (call: any, callback: any) => {
      console.log('Received request:', call.request.msg);
      callback(null, { msg: 'Hello from mock server!' });
    }
  };

  // Add service to server
  server.addService(
    __dirname + '/example.proto',
    'com.alenon.example',
    'ExampleService',
    implementations
  );

  // Start server
  await server.start();
  console.log(`Mock server listening at: ${server.serverAddress}`);

  // Create client and make request
  const grpc = require('@grpc/grpc-js');
  const proto_loader = require('@grpc/proto-loader');
  const { ProtoUtils } = require('../src/utils/ProtoUtils');

  const pkgDef = grpc.loadPackageDefinition(
    proto_loader.loadSync(__dirname + '/example.proto')
  );
  const proto = ProtoUtils.getProtoFromPkgDefinition('com.alenon.example', pkgDef);

  const client = new proto.ExampleService(
    '127.0.0.1:50777',
    grpc.credentials.createInsecure()
  );

  // Make request
  const response = await new Promise<any>((resolve, reject) => {
    client.ex1({ msg: 'Hello from client!' }, (error: any, response: any) => {
      error ? reject(error) : resolve(response);
    });
  });

  console.log('Response:', response.msg);

  // Stop server
  await server.stop();
}

// Run example
basicExample().catch(console.error);
