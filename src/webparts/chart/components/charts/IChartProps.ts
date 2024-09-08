import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IMasterProgramChartProps {
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  listTitle: string;
  itemTitle: string;

  compactChart: boolean;
  layout: string;
  nodeHeight: number;
  nodeWidth: number;
  childrenMargin: number;
  compactMarginBetween: number;
  compactMarginPair: number;
  neightbourMargin: number;
  siblingsMargin: number;
  fontSize: number;

  linkWidth: number;
  linkStroke: string;

  lastUpdated?: number;
  context: WebPartContext;
}

