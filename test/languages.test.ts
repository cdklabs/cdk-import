import * as fs from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { renderCode, SUPPORTED_LANGUAGES } from '../src/languages';

jest.setTimeout(5 * 60 * 1000);

test.each(SUPPORTED_LANGUAGES)('%s', async language => {
  const outdir = await fs.mkdtemp(join(tmpdir(), 'cdk-import-test'));

  await renderCode({
    language: language,
    srcdir: join(__dirname, 'fixtures', 'awsqs-eks-cluster'),
    typeName: 'AWSQS::EKS::Cluster',
    outdir: outdir,
    goModule: 'github.com/my/module',
    javaPackage: 'com.my.module',
    csharpNamespace: 'AWSQS::EKS::Cluster',
  });

  const out = await captureDirectory(outdir);
  expect(out).toMatchSnapshot();
});

test.each(SUPPORTED_LANGUAGES)('%s', async language => {
  const outdir = await fs.mkdtemp(join(tmpdir(), 'cdk-import-test'));

  await renderCode({
    language: language,
    srcdir: join(__dirname, 'fixtures', 'sc-ec2-product'),
    typeName: 'Ec2ComputeInstance',
    outdir: outdir,
    goModule: 'github.com/my/module',
    javaPackage: 'com.my.module',
    csharpNamespace: 'AWS::FOO::BAR',
  });
  const out = await captureDirectory(outdir);
  expect(out).toMatchSnapshot();
});

/**
 * Creates a map of all the files in a directory and its subdirectories and
 * their content so it can be used as a snapshot.
 */
async function captureDirectory(base: string) {
  const files = new Map<string, string>();

  const walk = async (reldir: string = '.') => {
    const entries = await fs.readdir(join(base, reldir));
    for (const entry of entries.sort()) {
      // skip binary files
      if (entry.endsWith('.tar.gz') || entry.endsWith('.zip') || entry.endsWith('.tgz')) {
        continue;
      }

      const relpath = join(reldir, entry);
      const abspath = join(base, relpath);
      const stat = await fs.stat(abspath);
      if (stat.isDirectory()) {
        await walk(relpath);
      } else {
        files.set(relpath, filterGeneratedContent(await fs.readFile(abspath, 'utf-8')));
      }
    }
  };

  await walk();

  return files;
}

function filterGeneratedContent(content: string) {
  return content
    .split('\n')
    // Ignore dynamic content in .java files
    .filter(line => !line.includes('@javax.annotation.Generated'))
    // Ignore versions in .csproj otherwise this will fail on every update
    .filter(line => !line.includes('PackageReference Include=\"Amazon.CDK.Lib\"'))
    .filter(line => !line.includes('PackageReference Include=\"Constructs\"'))
    .join('\n');
}
