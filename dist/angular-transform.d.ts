export interface AngularTransformOptions {
  filename: string;
  ignoreComponentNames?: string[];
}

export function transformAngularTemplate(
  code: string,
  options: AngularTransformOptions
): { code: string; map?: any } | null;

export function transformAngularComponent(
  code: string,
  filename: string,
  options?: { ignoreComponentNames?: string[] }
): { code: string; map?: any } | null;

export function transformAngularFile(
  code: string,
  filename: string,
  options?: { ignoreComponentNames?: string[] }
): { code: string; map?: any } | null;
