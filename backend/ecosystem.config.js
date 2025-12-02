// ecosystem.config.js
const os = require("os");
const path = require("path");

const isWindows = os.platform() === "win32";
const basePath = isWindows ? "F:\\all.ai_new\\all-ai" : "/home/ec2-user/all-ai";

module.exports = {
  apps: [
    {
      name: "backend",
      cwd: path.join(basePath, "backend"),
      script: "npm",
      watch: false,
      args: "run build-start",
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: "production",
      },
    },
    {
  name: "frontend",
  cwd: path.join(basePath, "frontend"),
  script: "npm",
  args: "run start",
  env: {
    NODE_ENV: "production"
  }
}

  ],
};
