import * as React from 'react';
import * as ReactDom from 'react-dom';
import './Overrides.module.scss';
import { sp } from "@pnp/sp";
import { Version } from '@microsoft/sp-core-library';
import { globalContext } from './Services/GlobalContext';
import { SPPermission } from '@microsoft/sp-page-context';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider,
  PropertyPaneCheckbox,
  PropertyPaneButton,
  PropertyPaneDropdown, PropertyPaneDropdownOptionType
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'ChartWebPartStrings';
import MasterProgramChart from './components/charts/MasterChart';
import { NodeItem } from '../Interfaces/NodeItem';

export interface IChartWebPartProps {
  program: string;
  masterChart: boolean;

  
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
  lastUpdated: number;
  theme: string;
}

export default class ProgramChartWebPart extends BaseClientSideWebPart<IChartWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  protected get disableReactivePropertyChanges(): boolean {
    // Show Apply button in the properties pane:
    return false;
  }

  public onInit(): Promise<void> {
    this._environmentMessage = this._getEnvironmentMessage();

    return super.onInit().then(_ => {
      //  to make sure that REST calls are send to the correct relative URL:

      globalContext.siteUrl = this.context.pageContext.web.absoluteUrl;
      console.log(this.context.pageContext.web.permissions.value);
      // Check if the current user has full control permissions
      try {
        let permission = new SPPermission(this.context.pageContext.web.permissions.value);
        let isFullControl = permission.hasPermission(SPPermission.manageWeb);
        globalContext.isAdmin = isFullControl;
      } catch (error) {
        console.error('Error while checking permissions', error);
      }

      sp.setup({
        spfxContext: this.context
      });
    });
  }

  public render(): void {
    console.log('RE-RENDER!');
    let element: React.ReactElement<any> = null;
    element = React.createElement(
      MasterProgramChart,
      {
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
        listTitle: this.properties.listTitle,
        itemTitle: this.properties.itemTitle,
        compactChart: this.properties.compactChart,
        layout: this.properties.layout,
        nodeHeight: this.properties.nodeHeight,
        nodeWidth: this.properties.nodeWidth,
        childrenMargin: this.properties.childrenMargin,
        compactMarginBetween: this.properties.compactMarginBetween,
        compactMarginPair: this.properties.compactMarginPair,
        neightbourMargin: this.properties.neightbourMargin,
        siblingsMargin: this.properties.siblingsMargin,
        fontSize: this.properties.fontSize,
        linkWidth: this.properties.linkWidth ?? 2,
        linkStroke: this.properties.linkStroke ?? "#CCCCCC",       
        lastUpdated: this.properties.lastUpdated,
        context: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  private _getEnvironmentMessage(): string {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams
      return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
    }

    return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment;
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;
    this.domElement.style.setProperty('--bodyText', semanticColors.bodyText);
    this.domElement.style.setProperty('--link', semanticColors.link);
    this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: "Data Source",
              groupFields: [

                PropertyPaneTextField('listTitle', {
                  label: strings.ProgramFieldLabel,
                  description: "List Title used as a data source",
                  value: "Source"
                }),

                PropertyPaneTextField('itemTitle', {
                  label: strings.ProgramFieldLabel,
                  description: "List Item Title used as a data source"
                }),

                PropertyPaneButton('bindData', {
                  text: "Bind Data",
                  buttonType: 0,
                  icon: "Sync",
                  onClick: () => {
                    console.log("Bind Data");

                    // check if item already exists
                    sp.web.lists.getByTitle(this.properties.listTitle).items.filter(`Title eq '${this.properties.itemTitle}'`).get().then((items: NodeItem[]) => {
                      if (items.length > 0) {
                        console.log("Item already exists");
                        this.properties.lastUpdated = Date.now();
                        this.render();
                      } else {
                        console.log("Item does not exist");
                        // item does not exist, create the item
                        // add placeholder for root node
                        let rootItem = {
                          id: "0",
                          Title: this.properties.itemTitle,
                          SubTitle: 'Root subtitle', 
                          Description: '', 
                          parentId: null,
                          IconName: 'Settings',
                          HexColorCodeText: '#FFFFFF',
                          HexColorCode: '#25408F',                          
                          
                          Hyperlink: ''
                        } as NodeItem;

                        // add a child node 
                        let childItem = {
                          id: "1",
                          Title: 'Child',
                          SubTitle: 'Child subtitle',
                          Description: '', 
                          parentId: 0,
                          IconName: 'D365ProjectOperations',
                          HexColorCodeText: '#FFFFFF',
                          HexColorCode: '#41535D',
                          Hyperlink: ''
                        } as NodeItem;

                        let childItem2 = {
                          id: "2",
                          Title: 'Child 2',
                          SubTitle: 'Child subtitle 2',
                          Description: '', 
                          parentId: 0,
                          IconName: 'TestPlan',
                          HexColorCodeText: '#FFFFFF',
                          HexColorCode: '#258F40',
                          Hyperlink: ''
                        } as NodeItem;

                        // create array of items to display. include root and child nodes
                        const freshItems = [rootItem, childItem, childItem2];

                        // save the item to SharePoint
                        sp.web.lists.getByTitle(this.properties.listTitle).items.add({
                          Title: this.properties.itemTitle,
                          Data: JSON.stringify(freshItems),
                          Connections: JSON.stringify([]),
                        }).then(() => {
                          this.properties.lastUpdated = Date.now();
                          this.render();
                        });

                      }
                    });

                  }
                })

              ]
            },


            {
              groupName: "Appearance",
              groupFields: [

                PropertyPaneSlider('nodeHeight', {
                  label: "Node Height",
                  min: 30,
                  max: 400,
                  value: 125
                }),

                PropertyPaneSlider('nodeWidth', {
                  label: "Node Width",
                  min: 200,
                  max: 800,
                  value: 350

                }),

                PropertyPaneSlider('childrenMargin', {
                  label: "Children Margin",
                  min: 10,
                  max: 100,
                  value: 50
                }),

                PropertyPaneSlider('neightbourMargin', {
                  label: "Neighbor Margin",
                  min: 5,
                  max: 200,
                  value: 80
                }),

                PropertyPaneSlider('siblingsMargin', {
                  label: "Siblings Margin",
                  min: 5,
                  max: 200,
                  value: 80
                }),

                PropertyPaneSlider('fontSize', {
                  label: "Font Size",
                  min: 8,
                  max: 65,
                  value: 15
                }),

                PropertyPaneSlider('linkWidth', {
                  label: "Link Width",
                  min: 1,
                  max: 10,
                  value: 2
                }),

                PropertyPaneTextField('linkStroke', {
                  label: "Link Stroke",
                  description: "Link stroke color in HEX or RGB format",
                  value: "#CCCCCC"
                }),

              ]
            },

            {
              groupName: "View",
              groupFields: [
                PropertyPaneDropdown('layout', {
                  label: "Layout",
                  options: [
                    { key: 'default', text: 'Default', },
                    { key: 'icons', text: 'Icons' },
                    { key: 'table', text: 'Table' }
                  ],
                  selectedKey: 'icons',                 
                }),       
               
                PropertyPaneCheckbox('compactChart', {
                  text: "Compact Chart",
                  checked: false
                }),
     
              ]
            },

          ]
        }
      ]
    };
  }
}
