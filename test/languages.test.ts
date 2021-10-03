import * as fs from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { renderCode, SUPPORTED_LANGUAGES } from '../src/languages';

jest.setTimeout(5 * 60 * 1000);

test.each(SUPPORTED_LANGUAGES)('%s', async language => {
  const outdir = join(tmpdir(), 'cdk-import-test');

  await renderCode({
    language: language,
    srcdir: join(__dirname, 'fixtures', 'awsqs-eks-cluster'),
    typeName: 'AWSQS::EKS::Cluster',
    outdir: outdir,
    goModule: 'github.com/my/module',
    javaPacakge: 'com.my.module',
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
    for (const entry of entries) {
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
        files.set(relpath, await fs.readFile(abspath, 'utf-8'));
      }
    }
  };

  await walk();

  return files;
}
