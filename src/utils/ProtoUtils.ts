export class ProtoUtils {

    public static getProtoFromPkgDefinition(pkgName: string, pkgDef: any): any {
        const pathArr: string[] = pkgName.split(".");
        return pathArr.reduce((obj, key) => {
            return (obj && obj[key] !== "undefined") ? obj[key] : undefined;
        }, pkgDef);
    }
}