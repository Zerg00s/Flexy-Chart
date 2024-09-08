declare interface IChartWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  ProgramFieldLabel: string;
  MasterChartLabel: string;
  ChartLayoutLabel: string;
  ChartThemeLabel: string;
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
}

declare module 'ChartWebPartStrings' {
  const strings: IChartWebPartStrings;
  export = strings;
}
