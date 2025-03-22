import * as grpc from '@grpc/grpc-js';
import { GrpcMockServer } from '../src/GrpcMockServer';
import { ExampleServiceClient } from '../src/generated/example';
import { ExampleRequest, ExampleResponse } from '../src/generated/example';

class Example {
  private readonly server: GrpcMockServer;

  constructor() {
    this.server = new GrpcMockServer();
  }

  public async run(): Promise<void> {
    await this.initMockServer();

    const client = new ExampleServiceClient(
      '127.0.0.1:50777',
      grpc.credentials.createInsecure()
    );
    const request = new ExampleRequest({
      msg: 'the message'
    });

    const response = await new Promise((resolve, reject) => {
      client.ex1(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });

    console.log(response.msg);

    await this.server.stop();
  }

  private async initMockServer() {
    const implementations = {
      ex1: (call, callback) => {
        const response = new ExampleResponse({
          msg: 'the response message'
        });
        callback(null, response);
      }
    };

    this.server.addService(
      ExampleServiceClient.service,
      implementations
    );

    try {
      await this.server.start();
      console.log(`Mock GRPC server is listening at: ${this.server.serverAddress}`);
    } catch (error) {
      throw new Error(`Failed initializing Mock GRPC server at: ${this.server.serverAddress}`);
    }
  }
}

const example: Example = new Example();
example.run();
