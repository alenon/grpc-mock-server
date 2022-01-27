import * as proto_loader from '@grpc/proto-loader';
import * as grpc from '@grpc/grpc-js';
import { GrpcMockServer } from '../src/GrpcMockServer';
import { ProtoUtils } from '../src/utils/ProtoUtils';

const PKG_NAME = 'com.alenon.example';
const SERVICE_NAME = 'ExampleService';
const PROTO_PATH: string = __dirname + '/resources/example.proto';

test('integration test for the server/client communication', async () => {
  const pkgDef: grpc.GrpcObject = grpc.loadPackageDefinition(
    proto_loader.loadSync(PROTO_PATH)
  );

  const proto: any = ProtoUtils.getProtoFromPkgDefinition(
    'com.alenon.example',
    pkgDef
  );

  const server: GrpcMockServer = new GrpcMockServer();

  const implementations = {
    ex1: (call: any, callback: any) => {
      const response: any = new proto.ExampleResponse.constructor({
        msg: 'the result we expect to get'
      });
      callback(null, response);
    }
  };

  server.addService(PROTO_PATH, PKG_NAME, SERVICE_NAME, implementations);

  try {
    await server.start();
    console.log(`Mock GRPC server is listening at: ${server.serverAddress}`);
  } catch (error) {
    throw new Error(`Failed initializing Mock GRPC server at: ${server.serverAddress}`)
  }

  const client: any = new proto.ExampleService(
    '127.0.0.1:50777',
    grpc.credentials.createInsecure()
  );

  const request: any = new proto.ExampleRequest.constructor({
    msg: 'the message'
  });

  const response = await new Promise<any>((resolve, reject) => {
    client.ex1(request, (error: any, response: any) => {
      error ? reject(error) : resolve(response);
    });
  })

  expect(response.msg).toBe('the result we expect to get');

  await server.stop();
}, 10000);
