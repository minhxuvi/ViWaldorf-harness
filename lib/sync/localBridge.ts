import { WaldorfData } from "../types";

export class LocalFileBridge {
  private static dirHandle: FileSystemDirectoryHandle | null = null;
  private static fileHandle: FileSystemFileHandle | null = null;

  public static isSupported(): boolean {
    return typeof window !== "undefined" && ("showDirectoryPicker" in window || "showOpenFilePicker" in window);
  }

  public static isConnected(): boolean {
    return this.dirHandle !== null || this.fileHandle !== null;
  }

  /**
   * Prompts user to pick their ~/Library/Application Support/XuViHarness folder or waldorf.json file.
   */
  public static async connectFolder(): Promise<WaldorfData | null> {
    if (!this.isSupported()) {
      throw new Error("File System Access API is not supported in this browser.");
    }

    try {
      if ("showDirectoryPicker" in window) {
        this.dirHandle = await (window as any).showDirectoryPicker({
          id: "xuvi-harness-dir",
          mode: "readwrite",
        });
        const file = await this.dirHandle!.getFileHandle("waldorf.json", { create: true });
        this.fileHandle = file;
      } else {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [
            {
              description: "Waldorf JSON Data",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        this.fileHandle = handle;
      }

      return await this.readFile();
    } catch (err: any) {
      if (err.name === "AbortError") return null;
      throw err;
    }
  }

  public static async readFile(): Promise<WaldorfData | null> {
    if (!this.fileHandle) return null;
    const file = await this.fileHandle.getFile();
    const text = await file.text();
    if (!text || text.trim().length === 0) return null;
    try {
      return JSON.parse(text) as WaldorfData;
    } catch (e) {
      console.warn("Failed to parse waldorf.json from local file bridge:", e);
      return null;
    }
  }

  public static async writeFile(data: WaldorfData): Promise<boolean> {
    if (!this.fileHandle) return false;
    try {
      const serialized = JSON.stringify(data, null, 2);

      // Write backup if directory handle is available
      if (this.dirHandle) {
        try {
          const bakHandle = await this.dirHandle.getFileHandle("waldorf.json.bak", { create: true });
          const bakWritable = await (bakHandle as any).createWritable();
          await bakWritable.write(serialized);
          await bakWritable.close();
        } catch {
          // Non-fatal if backup cannot be written
        }
      }

      const writable = await (this.fileHandle as any).createWritable();
      await writable.write(serialized);
      await writable.close();
      return true;
    } catch (err) {
      console.error("Local file bridge write failed:", err);
      return false;
    }
  }
}
