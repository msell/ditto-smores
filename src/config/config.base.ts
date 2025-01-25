export interface ConfigBaseProps {
  dittoAppId: string;
  dittoPlaygroundToken: string;
  persistNavigation: "always" | "dev" | "prod" | "never";
  catchErrors: "always" | "dev" | "prod" | "never";
  exitRoutes: string[];
}

export type PersistNavigationConfig = ConfigBaseProps["persistNavigation"];

const BaseConfig: ConfigBaseProps = {
  // This feature is particularly useful in development mode, but
  // can be used in production as well if you prefer.
  persistNavigation: "dev",

  /**
   * Only enable if we're catching errors in the right environment
   */
  catchErrors: "always",

  /**
   * This is a list of all the route names that will exit the app if the back button
   * is pressed while in that screen. Only affects Android.
   */
  exitRoutes: ["Welcome"],

  dittoAppId: process.env.EXPO_PUBLIC_DITTO_APP_ID || "",
  dittoPlaygroundToken: process.env.EXPO_PUBLIC_DITTO_PLAYGROUND_TOKEN || "",
};

export default BaseConfig;
