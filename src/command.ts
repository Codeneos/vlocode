
export default function command<T extends new(...args: any) => InstanceType<T>>(id: string, title: string, ...args: ConstructorParameters<T>) {

}

// Function command2(attr: any) {
//     return function <T extends {new(...args: any[]): {} }>(constr: T){
//         return class extends constr {
//             constructor(...args: any[]) {
//                 super(...args);
//                 console.log('Did something after the original constructor!');
//                 console.log('Here is my attribute!', attr.attrName);
//             }
//         };
//     };
//   }