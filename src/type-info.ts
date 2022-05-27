/**
 * Interface to specify additional type information
 */
export interface TypeInfo {
  /**
   * The name of the resource type
   *
   * Looks like 'AWS::<Service>::<Resource>'.
  */
  TypeName: string;

  /**
   * The URL of the source code of the resource type
   *
   * `undefined` if using a local schema file.
   */
  SourceUrl?: string;

  /**
   * The JSON schema of the resource type as JSON encoded string
   */
  Schema: string;
}