declare module '@eslint/js' {
  interface ESLintJSConfig {
    rules: Record<string, unknown>;
  }
  
  interface ESLintJSConfigs {
    recommended: ESLintJSConfig;
  }
  
  const js: {
    configs: ESLintJSConfigs;
  };
  
  export default js;
}