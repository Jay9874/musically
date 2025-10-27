export function generateFile(data: Uint8Array, mimetype: string): string {
  let blob = new Blob([new Uint8Array(data).buffer], { type: mimetype });
  const url: string = URL.createObjectURL(blob);
  return url;
}
