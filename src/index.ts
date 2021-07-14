// import { appendFileSync, readFileSync } from 'fs';
import { Agent } from 'http';
// import * as os from 'os';
// import * as path from 'path';
import * as AWS from 'aws-sdk';
import * as minimist from 'minimist';
import * as agent from 'proxy-agent';

const args = minimist(process.argv.slice(2), {
  string: [
    'outdir',
  ],
  alias: {
    outdir: 'o',
  },
});

const awsOptions = {
  ...(process.env.HTTPS_PROXY || process.env.https_proxy) && {
    httpOptions: {
      agent: agent(process.env.HTTPS_PROXY || process.env.https_proxy) as any as Agent,
    },
  },
};

async function getResourceDefinitonFromRegistry(name: string, version?: string): Promise<AWS.CloudFormation.DescribeTypeOutput> {
  const cfn = new AWS.CloudFormation(awsOptions);
  const type = await cfn.describeType({
    Type: name.endsWith('MODULE') ? 'MODULE' : 'RESOURCE',
    TypeName: name,
    VersionId: version,
  }).promise();
  return type;
}

void (async () => {
  if (args._.length !== 1) {
    console.log('Please specify a resource name');
    process.exit(1);
  }
  try {
    const [resourceName, resourceVersion] = args._[0].split('@');
    const outdir = args.outdir ?? 'src';
    console.log(resourceName);
    console.log(resourceVersion);
    console.log(outdir);

    const schema = await getResourceDefinitonFromRegistry(resourceName, resourceVersion);
    console.log(schema);

  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();
