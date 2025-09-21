export interface MdsvexConfig {
  extensions: string[];
  smartypants: {
    dashes: string;
  };
  layout: {
    _: string;
    blog: string;
    project: string;
  };
  remarkPlugins: any[];
  rehypePlugins: any[];
}

declare const config: MdsvexConfig;
export default config;