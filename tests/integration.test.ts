import * as proto_loader from '@grpc/proto-loader';
import * as grpc from '@grpc/grpc-js';
import { GrpcMockServer } from '../src/GrpcMockServer';
import { ProtoUtils } from '../src/utils/ProtoUtils';

import { assert } from 'console';

const PKG_NAME = 'com.alenon.example';
const SERVICE_NAME = 'ExampleService';
const PROTO_PATH: string = __dirname + '/resources/example.proto';

test('integration test for the server/client communication', (done) => {
  runServer((error: Error | null, response: any): void => {
    try {
      expect(response).toBe('the result we expect to get');
      done();
    } catch (error) {
      done(error);
    }
  });
}, 10000);

function runServer(
  testResultCallback: (error: Error | null, message: string) => void
): void {
  const pkgDef: grpc.GrpcObject = grpc.loadPackageDefinition(
    proto_loader.loadSync(PROTO_PATH)
  );
  const proto: any = ProtoUtils.getProtoFromPkgDefinition(
    'com.alenon.example',
    pkgDef
  );

  const server: GrpcMockServer = new GrpcMockServer(
    (error: Error | null, port: number) => {
      if (error) {
        testResultCallback(
          new Error('Failed initializing Mock GRPC server on port: ' + port),
          ''
        );
        server.stop();
      } else {
        console.log('Mock GRPC server is listening on port: ' + port);

        const implementations = {
          ex1: (call: any, callback: any) => {
            const response: any = new proto.ExampleResponse.constructor({
              msg: 'the result we expect to get'
            });
            callback(null, response);
          }
        };

        server.addService(PROTO_PATH, PKG_NAME, SERVICE_NAME, implementations);
        server.start();

        const client: any = new proto.ExampleService(
          '127.0.0.1:50777',
          grpc.credentials.createInsecure()
        );
        const request: any = new proto.ExampleRequest.constructor({
          msg: 'the message'
        });

        client.ex1(request, (error: any, response: any) => {
          testResultCallback(null, response.msg);
          server.stop();
        });
      }
    }
  );
}
