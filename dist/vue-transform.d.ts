export interface VueTransformOptions {
  filename: string;
  ignoreComponentNames?: string[];
}

export function transformVueSFC(
  code: string,
  filename: string,
  options?: { ignoreComponentNames?: string[] }
): Promise<{ code: string; map?: any } | null>;
