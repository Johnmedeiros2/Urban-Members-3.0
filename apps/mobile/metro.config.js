const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Força UMA única instância de react para todo o bundle
const reactPath = path.resolve(projectRoot, "node_modules/react");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "react" ||
    moduleName === "react/jsx-runtime" ||
    moduleName === "react/jsx-dev-runtime"
  ) {
    return {
      filePath: require.resolve(moduleName, { paths: [reactPath] }),
      type: "sourceFile",
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
