/**
 * Interface to specify additional type information
 */
export interface TypeInfo {
  /** The name of the resource type */
  TypeName: string;
  /** The URL of the source code of the resource type */
  SourceUrl: string;
  /** the JSOn schema of the resource type as JSON encoded string */
  Schema: string;
}