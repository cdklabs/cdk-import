import * as camelcase from 'camelcase';
import * as j2j from 'json2jsii';
import { sanitizeTypeName } from './util';
import { TypeInfo } from './type-info';

/**
 * Generator to emit classes and types for the L1 construct of the given resource type
 */
export class CfnResourceGenerator {

  private readonly sanitizedTypeName: string;
  readOnlyProperties: string[];
  writeProperties: string[];
  constructClassName: string;
  propsClassName: string;

  /**
   * 
   * @param typeName the name of the CFN resource type (e.g. AWSQS::EKS::Cluster)
   * @param typeDef the type info containing the source url
   * @param schema the schema of the resource type for input and output properties
   */
  constructor(private readonly typeName: string, private readonly typeDef: TypeInfo, private readonly schema: any) {
    this.sanitizedTypeName = sanitizeTypeName(typeName);
    this.readOnlyProperties = this.schema.readOnlyProperties.map((prop: string) => prop.replace(/^\/properties\//, ''));
    this.writeProperties = Object.keys(this.schema.properties).filter(prop => this.schema.readOnlyProperties.indexOf(`/properties/${prop}`) === -1);
    this.constructClassName = `Cfn${this.sanitizedTypeName}`;
    this.propsClassName = `${this.constructClassName}Props`;
  }

  /**
   * Render the type into a TypeScript class fil defining the props and the L1 construct
   *
   * @returns the rendered class file content
   */
  public render(): string {
    const code = new j2j.Code();
    this.emitImports(code);
    this.emitDefinitionTypes(code);
    this.emitConstructClass(code);
    return code.render();
  }

  private emitImports(code: j2j.Code) {
    code.line("import * as cdk from '@aws-cdk/core';");
    code.line();
  }

  private emitDefinitionTypes(code: j2j.Code) {
    const gen = new j2j.TypeGenerator({
      definitions: this.schema.definitions,
    });

    const schema = JSON.parse(JSON.stringify(this.schema));
    for (const prop of this.readOnlyProperties) {
      delete schema.properties[prop];
    }

    gen.emitType(this.propsClassName, schema);

    gen.renderToCode(code);
    code.line();
  }

  private emitConstructClass(code: j2j.Code) {
    code.line('/**');
    code.line(` * A CloudFormation \`${this.typeName}\``);
    code.line(' *');
    code.line(` * @cloudformationResource ${this.typeName}`);
    code.line(' * @stability external');
    code.line(` * @link ${this.typeDef.SourceUrl}`);
    code.line(' */');
    code.openBlock(`export class ${this.constructClassName} extends cdk.CfnResource`);
    code.line('/**');
    code.line('* The CloudFormation resource type name for this resource class.');
    code.line('*/');
    code.line(`public static readonly CFN_RESOURCE_TYPE_NAME = "${this.typeName}";`);
    code.line();

    for (const prop of this.writeProperties) {
      const optionalMarker = this.schema.required.indexOf(prop) === -1 ? ' | undefined' : '';
      code.line('/**');
      code.line(` * \`${this.typeName}.${prop}\``);
      if (this.schema.properties[prop].description) {
        code.line(` * ${this.schema.properties[prop].description}`);
      }
      code.line(` * @link ${this.typeDef.SourceUrl}`);
      code.line(' */');
      code.line(`public readonly ${camelcase(prop)}: ${this.getTypeOfProperty(prop)}${optionalMarker};`);
    }

    for (const prop of this.readOnlyProperties) {
      code.line('/**');
      code.line(` * Attribute \`${this.typeName}.${prop}\``);
      code.line(` * @link ${this.typeDef.SourceUrl}`);
      code.line(' */');
      code.line(`public readonly attr${camelcase(prop, { pascalCase: true })}: ${this.getTypeOfProperty(prop)};`);
    }

    code.line();

    code.line('/**');
    code.line(` * Create a new \`${this.typeName}\`.`);
    code.line(' *');
    code.line(' * @param scope - scope in which this resource is defined');
    code.line(' * @param id    - scoped id of the resource');
    code.line(' * @param props - resource properties');
    code.line(' */');
    code.openBlock(`constructor(scope: cdk.Construct, id: string, props: ${this.propsClassName})`);
    code.line(`super(scope, id, { type: ${this.constructClassName}.CFN_RESOURCE_TYPE_NAME, properties: toJson_${this.propsClassName}(props)! });`);
    code.line('');
    for (const prop of this.writeProperties) {
      code.line(`this.${camelcase(prop)} = props.${camelcase(prop)};`);
    }
    for (const prop of this.readOnlyProperties) {
      const propertyName = `attr${camelcase(prop, { pascalCase: true })}`;
      code.line(`this.${propertyName} = ${this.renderGetAtt(prop)};`);
    }
    code.closeBlock();

    // Close construct class
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
