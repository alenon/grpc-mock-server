export class ProtoUtils {
  static getProtoFromPkgDefinition(pkgName: string, pkgDef: any): any {
    const pathArr = pkgName.split('.');
    return pathArr.reduce((obj, key) =>
      obj && obj[key] !== 'undefined' ? obj[key] : undefined, pkgDef
    );
  }
}
