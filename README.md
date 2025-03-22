# 🧪 grpc-mock-server

A lightweight **gRPC mock server** for integration tests with full **TypeScript** support.

[![NPM CI](https://github.com/alenon/grpc-mock-server/workflows/NPM%20CI/badge.svg)](https://github.com/alenon/grpc-mock-server/actions)
[![NPM Version](https://img.shields.io/npm/v/@alenon/grpc-mock-server.svg)](https://www.npmjs.com/package/@alenon/grpc-mock-server)

---

## 🚀 Installation

```bash
npm install @alenon/grpc-mock-server
```

---

## 📦 Usage Example

```ts
private static readonly PROTO_PATH = __dirname + "/example.proto";
private static readonly PKG_NAME = "com.alenon.example";
private static readonly SERVICE_NAME = "ExampleService";

const implementations = {
  ex1: (call: any, callback: any) => {
    const response = new this.proto.ExampleResponse.constructor({ msg: "the response message" });
    callback(null, response);
  },
};

this.server.addService(PROTO_PATH, PKG_NAME, SERVICE_NAME, implementations);
this.server.start();
```

---

## 💡 Features

- Easy to spin up and shut down a gRPC mock server.
- Fully typed in TypeScript.
- Ideal for automated testing and local development.

---

## 📄 License

MIT
