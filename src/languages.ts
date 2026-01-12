import * as fs from 'fs/promises';
import * as path from 'path';
import * as caseutil from 'case';
import { srcmak, Options } from 'jsii-srcmak';

const cdkDeps = [
  'aws-cdk-lib',
  'constructs',
  '@aws-cdk/asset-awscli-v1',
  '@aws-cdk/asset-node-proxy-agent-v6',
  '@aws-cdk/cloud-assembly-schema',
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

  /**
   * The name of the C# namespace to use for the generated code. Required if `language` is `csharp`.
   */
  readonly csharpNamespace?: string;
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
        namespace: sanitizeCsharpNamespace(options.csharpNamespace!),
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
        packageName: sanitizeGoPackageName(options.typeName),
        moduleName: options.goModule,
      };
      break;

    default:
      throw new Error(`Unsupported language: ${options.language}`);
  }

  await srcmak(options.srcdir, srcmakopts);
}

/**
 * Sanitizes a type name to be a valid Go package name.
 * Go package names must be lowercase and cannot contain hyphens or special characters.
 */
function sanitizeGoPackageName(typeName: string): string {
  // Replace :: with empty string, convert to lowercase, replace non-alphanumeric with empty string
  return typeName.replace(/::/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Sanitizes a namespace to be a valid C# namespace.
 * C# namespaces use dots as separators and cannot contain :: or other special characters.
 */
function sanitizeCsharpNamespace(namespace: string): string {
  // Replace :: with . to create valid C# namespace hierarchy
  return namespace.replace(/::/g, '.');
}
