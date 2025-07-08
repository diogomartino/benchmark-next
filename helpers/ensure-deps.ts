import { execSync } from "child_process";

const ensureDeps = () => {
  try {
    execSync("psrecord -h", { stdio: "ignore" });
  } catch (error) {
    console.error("psrecord is not installed. Please install it using:");
    console.error("pip install psrecord");
    process.exit(1);
  }
};

export { ensureDeps };
