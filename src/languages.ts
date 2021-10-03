import * as fs from 'fs/promises';
import * as path from 'path';
import * as caseutil from 'case';
import { srcmak, Options } from 'jsii-srcmak';

const cdkDeps = [
  '@aws-cdk/cloud-assembly-schema',
  '@aws-cdk/core',
  '@aws-cdk/cx-api',
  '@aws-cdk/region-info',
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
  readonly javaPacakge?: string;
}

export async function renderCode(options: RenderCodeOptions) {
  const srcmakopts: Options = {
    deps: cdkDeps.map(x => path.dirname(require.resolve(`${x}/package.json`))),
  };

  const hyphenated = caseutil.header(options.typeName);
  const snake = caseutil.snake(options.typeName);

  switch (options.language) {
    case 'typescript':
      return fs.copyFile(path.join(options.srcdir, 'index.ts'), path.join(options.outdir, `${hyphenated.toLowerCase()}.ts`));

    case 'python':
      srcmakopts.python = {
        outdir: options.outdir,
        moduleName: snake,
      };
      break;

    case 'csharp':
      srcmakopts.csharp = {
        outdir: options.outdir,
        namespace: options.typeName, // already AWS::Foo::Bar
      };
      break;

    case 'java':
      if (!options.javaPacakge) {
        throw new Error('Java package name (`--java-package`) must be specified (e.g. "com.foo.bar.my.resource")');
      }

      srcmakopts.java = {
        outdir: options.outdir,
        package: options.javaPacakge,
      };
      break;

    case 'golang':
      if (!options.goModule) {
        throw new Error('Go module name (--go-module-name) is required (e.g. "github.com/foo/bar")');
      }

      srcmakopts.golang = {
        outdir: options.outdir,
        packageName: hyphenated,
        moduleName: options.goModule,
      };
      break;

    default:
      throw new Error(`Unsupported language: ${options.language}`);
  }

  await srcmak(options.srcdir, srcmakopts);
}
