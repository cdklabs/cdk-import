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
      srcmakopts.java = {
        outdir: options.outdir,
        package: snake.replace(/_/g, '.'),
      };
      break;

    case 'golang':
    case 'go':
      srcmakopts.golang = {
        outdir: options.outdir,
        packageName: hyphenated,
        moduleName: 'github.com/foo/bar',
      };
      break;

    default:
      throw new Error(`Unsupported language: ${options.language}`);
  }

  await srcmak(options.srcdir, srcmakopts);
}
