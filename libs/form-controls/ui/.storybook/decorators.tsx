import { Decorator } from "@storybook/react";
import { FluentProvider } from "@fluentui/react-components";
import {
  webLightTheme,
  webDarkTheme,
  teamsLightTheme,
  teamsDarkTheme,
  teamsHighContrastTheme
} from "@fluentui/react-theme";

export const withFluentProvider: Decorator = (Story, context) => {
  const { theme } = context.parameters,
    storyTheme =
      theme === "Dark"
        ? webDarkTheme
        : theme === "TeamsLight"
        ? teamsLightTheme
        : theme === "TeamsDark"
        ? teamsDarkTheme
        : theme === "TeamsHighContrast"
        ? teamsHighContrastTheme
        : webLightTheme;

  return (
    <FluentProvider theme={storyTheme}>
      <Story />
    </FluentProvider>
  );
};
