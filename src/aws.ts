import { Agent } from 'http';
// import * as AWS from 'aws-sdk';
import * as agent from 'proxy-agent';


const awsOptions = {
  ...(process.env.HTTPS_PROXY || process.env.https_proxy) && {
    httpOptions: {
      agent: agent(process.env.HTTPS_PROXY || process.env.https_proxy) as any as Agent,
    },
  },
};

export function createAwsClient<T extends { new(...args: any[]): InstanceType<T> }>(cls: T): InstanceType<T> {
  return new cls(awsOptions);
}