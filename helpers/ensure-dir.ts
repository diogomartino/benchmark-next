import fs from "fs/promises";

const ensureDir = async (dir: string) => {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    console.error(`Error creating directory ${dir}:`, error);
  }
};

export { ensureDir };
