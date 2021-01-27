export class PathHelper {
  constructor(private readonly separator: string) {}

  public isNested(path: string): boolean {
    return path.includes(this.separator);
  }

  public getParent(path: string): string {
    if (!this.isNested(path)) return path;
    const parts = path.split(this.separator);
    parts.pop();
    return parts.join(this.separator);
  }

  public getSelf(path: string): string {
    if (!this.isNested(path)) return path;
    return path.split(this.separator).pop() as string;
  }

  public getLevel(path: string): number {
    return path.split(this.separator).length - 1;
  }
}
