import { Agent } from 'http';
import { ProxyAgent } from 'proxy-agent';

const awsOptions = {
  ...(process.env.HTTPS_PROXY || process.env.https_proxy) && {
    httpOptions: {
      agent: new ProxyAgent({ host: process.env.HTTPS_PROXY || process.env.https_proxy }) as any as Agent,
    },
  },
};

/**
 * Create an AWS service client
 * @param cls the class to use to create the client
 * @returns the created client including proxy settings
 */
export function createAwsClient<T extends { new(...args: any[]): InstanceType<T> }>(cls: T): InstanceType<T> {
  return new cls(awsOptions);
}