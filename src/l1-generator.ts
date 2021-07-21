import * as camelcase from 'camelcase';
import * as j2j from 'json2jsii';

export function sanitizeTypeName(typeName: string) {
  const parts = typeName.split('::');
  return parts.map(part => part.substr(0, 1).toUpperCase() + part.substr(1).toLowerCase()).join('');
}

export class L1Generator {
  sanitizedTypeName: string;

  constructor(private typeName: string, private typeDef: AWS.CloudFormation.DescribeTypeOutput, private schema: any) {
    this.sanitizedTypeName = sanitizeTypeName(typeName);
  }

  public render(): string {
    const code = new j2j.Code();
    this.generateImports(code);
    this.generateDefinitionTypes(code);
    // this.generatePropsInterface(code);
    this.generateConstructClass(code);
    return code.render();
  }

  private generateImports(code: j2j.Code) {
    code.line("import * as cdk from '@aws-cdk/core';");
    code.line();
  }

  private generateDefinitionTypes(code: j2j.Code) {
    const gen = new j2j.TypeGenerator({
      definitions: this.schema.definitions,
    });

    const schema = JSON.parse(JSON.stringify(this.schema));
    this.schema.readOnlyProperties.map((prop: string) => prop.replace(/^\/properties\//, '')).forEach((prop: string) => {
      delete schema.properties[prop];
    });

    gen.emitType(`Cfn${this.sanitizedTypeName}Props`, schema);

    gen.renderToCode(code);
    code.line();
  }

  // private generatePropsInterface(code: j2j.Code) {
  //   code.openBlock(`export interface Cfn${this.sanitizedTypeName}Props`);
  //   Object.keys(this.schema.properties).filter(prop => this.schema.readOnlyProperties.indexOf(`/properties/${prop}`) < 0).forEach(prop => {
  //     const optionalMarker = this.schema.required.indexOf(prop) < 0 ? '?' : '';
  //     code.line('/**');
  //     code.line(` * \`${this.typeName}.${prop}\``);
  //     code.line(` * @link ${this.typeDef.SourceUrl}`);
  //     code.line(' */');
  //     code.line(`readonly ${prop.substr(0, 1).toLowerCase() + prop.substr(1)}${optionalMarker}: ${this.getTypeOfProperty(prop)};`);
  //   });
  //   code.closeBlock();
  //   code.line();
  // }

  private generateConstructClass(code: j2j.Code) {
    code.line('/**');
    code.line(` * A CloudFormation \`${this.typeName}\``);
    code.line(' *');
    code.line(` * @cloudformationResource ${this.typeName}`);
    code.line(' * @stability external');
    code.line(` * @link ${this.typeDef.SourceUrl}`);
    code.line(' */');
    code.openBlock(`export class Cfn${this.sanitizedTypeName} extends cdk.CfnResource implements cdk.IInspectable`);
    code.line('/**');
    code.line('* The CloudFormation resource type name for this resource class.');
    code.line('*/');
    code.line(`public static readonly CFN_RESOURCE_TYPE_NAME = "${this.typeName}";`);
    code.line();

    Object.keys(this.schema.properties).filter(prop => this.schema.readOnlyProperties.indexOf(`/properties/${prop}`) < 0).forEach(prop => {
      const optionalMarker = this.schema.required.indexOf(prop) < 0 ? ' | undefined' : '';
      code.line('/**');
      code.line(` * \`${this.typeName}.${prop}\``);
      code.line(` * @link ${this.typeDef.SourceUrl}`);
      code.line(' */');
      code.line(`public ${camelcase(prop)}: ${this.getTypeOfProperty(prop)}${optionalMarker};`);
    });
    Object.keys(this.schema.properties).filter(prop => this.schema.readOnlyProperties.indexOf(`/properties/${prop}`) >= 0).forEach(prop => {
      code.line('/**');
      code.line(` * Attribute \`${this.typeName}.${prop}\``);
      code.line(` * @link ${this.typeDef.SourceUrl}`);
      code.line(' */');
      code.line(`public attr${camelcase(prop, { pascalCase: true })}: ${this.getTypeOfProperty(prop)};`);
    });
    code.line();

    code.line('/**');
    code.line(` * Create a new \`${this.typeName}\`.`);
    code.line(' *');
    code.line(' * @param scope - scope in which this resource is defined');
    code.line(' * @param id    - scoped id of the resource');
    code.line(' * @param props - resource properties');
    code.line(' */');
    code.openBlock(`constructor(scope: cdk.Construct, id: string, props: Cfn${this.sanitizedTypeName}Props)`);
    code.line(`super(scope, id, { type: Cfn${this.sanitizedTypeName}.CFN_RESOURCE_TYPE_NAME, properties: props });`);
    this.schema.required.forEach((prop: string) => {
      code.line(`cdk.requireProperty(props, \'${prop}\', this);`);
    });
    code.line('');
    Object.keys(this.schema.properties).filter(prop => this.schema.readOnlyProperties.indexOf(`/properties/${prop}`) < 0).forEach(prop => {
      code.line(`this.${camelcase(prop)} = props.${camelcase(prop)};`);
    });
    Object.keys(this.schema.properties).filter(prop => this.schema.readOnlyProperties.indexOf(`/properties/${prop}`) >= 0).forEach(prop => {
      const attributeType = this.getTypeOfProperty(prop);
      const propertyName = `attr${camelcase(prop, { pascalCase: true })}`;
      const constructorArguments = `this.getAtt('${prop}')`;
      if (attributeType === 'string') {
        code.line(`this.${propertyName} = cdk.Token.asString(${constructorArguments});`);
      } else if (attributeType === 'string[]') {
        code.line(`this.${propertyName} = cdk.Token.asList(${constructorArguments});`);
      } else if (attributeType === 'number') {
        code.line(`this.${propertyName} = cdk.Token.asNumber(${constructorArguments});`);
        // } else if (attributeType === genspec.TOKEN_NAME.fqn) {
        //   code.line(`this.${propertyName} = ${at.constructorArguments};`);
      }
    });
    // TODO ref


    code.closeBlock();
    // constructor

    code.openBlock('protected renderProperties(props: { [key: string]: any }): { [key: string]: any }');

    code.closeBlock();

    code.closeBlock();
  }

  private getTypeOfProperty(prop: string) {
    return this.getTypeFromSchema(this.schema.properties[prop]);
  }

  private getTypeFromSchema(prop: any): string {
    if (prop.type) {
      switch (prop.type) {
        case 'string':
          return 'string';
        case 'array':
          // TODO Resolvables
          return `${this.getTypeFromSchema(prop.items)}[]`;
        default:
          return 'any';
      }
    }
    if (prop.hasOwnProperty('$ref')) {
      return prop.$ref.replace(/#\/definitions\//, '');
    }
    return 'any';
  }

}


//   /**
//    * Examines the CloudFormation resource and discloses attributes.
//    *
//    * @param inspector - tree inspector to collect and process attributes
//    *
//    */
//   public inspect(inspector: cdk.TreeInspector) {
//     inspector.addAttribute("aws:cdk:cloudformation:type", CfnCertificate.CFN_RESOURCE_TYPE_NAME);
//     inspector.addAttribute("aws:cdk:cloudformation:props", this.cfnProperties);
//   }

//   protected get cfnProperties(): { [key: string]: any } {
//     return {
//       domainName: this.domainName,
//       certificateAuthorityArn: this.certificateAuthorityArn,
//       certificateTransparencyLoggingPreference: this.certificateTransparencyLoggingPreference,
//       domainValidationOptions: this.domainValidationOptions,
//       subjectAlternativeNames: this.subjectAlternativeNames,
//       tags: this.tags.renderTags(),
//       validationMethod: this.validationMethod,
//     };
//   }

//   protected renderProperties(props: { [key: string]: any }): { [key: string]: any } {
//     return cfnCertificatePropsToCloudFormation(props);
//   }
// }
