import * as camelcase from 'camelcase';
import * as j2j from 'json2jsii';

export function sanitizeTypeName(typeName: string) {
  const parts = typeName.split('::');
  return parts.map(part => part.substr(0, 1).toUpperCase() + part.substr(1).toLowerCase()).join('');
}

export class CfnResourceGenerator {
  sanitizedTypeName: string;

  constructor(private readonly typeName: string, private readonly typeDef: AWS.CloudFormation.DescribeTypeOutput, private readonly schema: any) {
    this.sanitizedTypeName = sanitizeTypeName(typeName);
  }

  public render(): string {
    const code = new j2j.Code();
    this.generateImports(code);
    this.generateDefinitionTypes(code);
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

  private generateConstructClass(code: j2j.Code) {
    code.line('/**');
    code.line(` * A CloudFormation \`${this.typeName}\``);
    code.line(' *');
    code.line(` * @cloudformationResource ${this.typeName}`);
    code.line(' * @stability external');
    code.line(` * @link ${this.typeDef.SourceUrl}`);
    code.line(' */');
    code.openBlock(`export class Cfn${this.sanitizedTypeName} extends cdk.CfnResource`);
    code.line('/**');
    code.line('* The CloudFormation resource type name for this resource class.');
    code.line('*/');
    code.line(`public static readonly CFN_RESOURCE_TYPE_NAME = "${this.typeName}";`);
    code.line();

    Object.keys(this.schema.properties).filter(prop => this.schema.readOnlyProperties.indexOf(`/properties/${prop}`) < 0).forEach(prop => {
      const optionalMarker = this.schema.required.indexOf(prop) < 0 ? ' | undefined' : '';
      code.line('/**');
      code.line(` * \`${this.typeName}.${prop}\``);
      if (this.schema.properties[prop].description) {
        code.line(` * ${this.schema.properties[prop].description}`);
      }
      code.line(` * @link ${this.typeDef.SourceUrl}`);
      code.line(' */');
      code.line(`public readonly ${camelcase(prop)}: ${this.getTypeOfProperty(prop)}${optionalMarker};`);
    });
    Object.keys(this.schema.properties).filter(prop => this.schema.readOnlyProperties.indexOf(`/properties/${prop}`) >= 0).forEach(prop => {
      code.line('/**');
      code.line(` * Attribute \`${this.typeName}.${prop}\``);
      code.line(` * @link ${this.typeDef.SourceUrl}`);
      code.line(' */');
      code.line(`public readonly attr${camelcase(prop, { pascalCase: true })}: ${this.getTypeOfProperty(prop)};`);
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
    code.line(`super(scope, id, { type: Cfn${this.sanitizedTypeName}.CFN_RESOURCE_TYPE_NAME, properties: toJson_Cfn${this.sanitizedTypeName}Props(props)! });`);
    this.schema.required.forEach((prop: string) => {
      code.line(`cdk.requireProperty(props, \'${camelcase(prop)}\', this);`);
    });
    code.line('');
    Object.keys(this.schema.properties).filter(prop => this.schema.readOnlyProperties.indexOf(`/properties/${prop}`) < 0).forEach(prop => {
      code.line(`this.${camelcase(prop)} = props.${camelcase(prop)};`);
    });
    Object.keys(this.schema.properties).filter(prop => this.schema.readOnlyProperties.indexOf(`/properties/${prop}`) >= 0).forEach(prop => {
      const propertyName = `attr${camelcase(prop, { pascalCase: true })}`;
      code.line(`this.${propertyName} = ${this.renderGetAtt(prop)};`);
    });
    code.closeBlock();
    // constructor

    code.closeBlock();
  }

  private renderGetAtt(prop: string): string {
    const attributeType = this.getTypeOfProperty(prop);
    const constructorArguments = `this.getAtt('${prop}')`;
    if (attributeType === 'string') {
      return `cdk.Token.asString(${constructorArguments})`;
    }
    if (attributeType === 'string[]') {
      return `cdk.Token.asList(${constructorArguments})`;
    }
    if (attributeType === 'number') {
      return `cdk.Token.asNumber(${constructorArguments})`;
    }
    return constructorArguments;
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
