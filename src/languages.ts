import * as fs from 'fs/promises';
import * as path from 'path';
import * as caseutil from 'case';
import { srcmak, Options } from 'jsii-srcmak';

const cdkDeps = [
  'aws-cdk-lib',
  'constructs',
];

export const SUPPORTED_LANGUAGES = [
  'typescript',
  'python',
  'java',
  'csharp',
  'golang',
];

export interface RenderCodeOptions {
  readonly srcdir: string;
  readonly outdir: string;
  readonly language: string;
  readonly typeName: string;

  /**
   * The name of the Go module to use for the generated code. Required if `language` is `golang`.
   */
  readonly goModule?: string;

  /**
   * The name of the Java package to use for the generated code. Required if `language` is `java`.
   */
  readonly javaPackage?: string;
}

export async function renderCode(options: RenderCodeOptions) {
  const srcmakopts: Options = {
    deps: cdkDeps.map(x => path.dirname(require.resolve(`${x}/package.json`))),
  };

  switch (options.language) {
    case 'typescript':
      await fs.mkdir(options.outdir, { recursive: true });
      return fs.copyFile(path.join(options.srcdir, 'index.ts'), path.join(options.outdir, `${caseutil.header(options.typeName).toLowerCase()}.ts`));

    case 'python':
      srcmakopts.python = {
        outdir: options.outdir,
        moduleName: caseutil.snake(options.typeName),
      };
      break;

    case 'csharp':
      srcmakopts.csharp = {
        outdir: options.outdir,
        namespace: options.typeName, // already AWS::Foo::Bar
      };
      break;

    case 'java':
      if (!options.javaPackage) {
        throw new Error('Java package name (`--java-package`) must be specified (e.g. "com.foo.bar.my.resource")');
      }

      srcmakopts.java = {
        outdir: options.outdir,
        package: options.javaPackage,
      };
      break;

    case 'golang':
      if (!options.goModule) {
        throw new Error('Go module name (--go-module) is required (e.g. "github.com/foo/bar")');
      }

      srcmakopts.golang = {
        outdir: options.outdir,
        packageName: caseutil.lower(options.typeName, '-'),
        moduleName: options.goModule,
      };
      break;

    default:
      throw new Error(`Unsupported language: ${options.language}`);
  }

  await srcmak(options.srcdir, srcmakopts);
}
