export type PackageChange = {
  source: string;
  imports?: Record<
    string,
    { name?: string; source?: string; removeAlias?: true }
  >;
  packageSource?: string;
  packageRemoved?: boolean;
};
