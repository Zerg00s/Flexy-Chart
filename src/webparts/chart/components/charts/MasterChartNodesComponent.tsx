import { useLayoutEffect, useRef } from 'react';
import * as React from 'react';
import { OrgChart } from 'd3-org-chart';
import * as d3 from 'd3';
import { FontIcon, getFontIcon } from 'office-ui-fabric-react/lib/components/Icon/FontIcon';
import styles from './Chart.module.scss';
import { NodeItem } from '../../../Interfaces/NodeItem';
import { globalContext } from '../../Services/GlobalContext';
import { Documents } from '../../Services/DocumentService';
import { Button, PrimaryButton } from 'office-ui-fabric-react/lib/components/Button';

interface MasterChartNodesComponentProps {
  onNodeClick: (nodeId: string) => void;
  data: NodeItem[];
  // connections: NodeConnection[];
  addItem: (item: NodeItem) => void;
  removeItem: (itemId: string) => void;
  updateItem: (item: NodeItem) => void;
  saveItems: () => void;
  toggleEdit: () => void;

  editMode: boolean;
  compactChart: boolean;
  layout: string;
  nodeHeight: number;
  nodeWidth: number;
  childrenMargin: number;
  compactMarginBetween: number;
  compactMarginPair: number;
  neightbourMargin: number;
  siblingsMargin: number;
  linkWidth: number;
  linkStroke: string;
  fontSize: number;
}

export const MasterChartNodesComponent = (props: MasterChartNodesComponentProps, ref) => {
  const d3Container = useRef(null);
  let chart = null;

  const items: NodeItem[] = props.data;
  useLayoutEffect(() => {
    if (items && d3Container.current) {
      if (!chart) {
        chart = new OrgChart();
      }
      chart
        .container(d3Container.current)
        .data(items)
        .nodeHeight((d) => props.nodeHeight)
        .nodeWidth((d) => props.nodeWidth)
        .childrenMargin((d) => props.childrenMargin)
        .compactMarginBetween((d) => props.compactMarginBetween)
        .compactMarginPair((d) => props.compactMarginPair)
        .neightbourMargin((a, b) => props.neightbourMargin)
        .siblingsMargin((d) => props.siblingsMargin)
        .expandLevel(4)
        .buttonContent(({ node, state }) => {
          return ``; // Hide expand-collapse button
        })
        .nodeContent(function (d: any, i, arr, state) {
          const item: NodeItem = d.data;
          let backgroundColor = item.HexColorCode || '#FFFFFF';
          let textColor = item.HexColorCodeText || '#000000';

          let iconComponent = getFontIcon(item.IconName);
          const iconClassName = iconComponent.props.className;
          let fontFamily = 'FabricMDL2Icons-2;';
          let dataIconName = 'Accounts';
          let children = "";
          if (iconComponent.props.style.fontFamily) {
            fontFamily = iconComponent.props.style.fontFamily.replace('"', '');
            dataIconName = iconComponent.props['data-icon-name'];
            children = iconComponent.props.children;
          }

          const wrapperStyle = item.Selected ? "box-shadow: 8px 8px grey !important; " : "";

          const content = props.layout === "default" ? `
            <div class='depth-${d.depth}' style="${wrapperStyle} font-family:inherit;background-color:${backgroundColor}; position:absolute;margin-top:-1px; margin-left:-1px;width:${d.width}px;height:${d.height}px;border-radius:10px;border: 1px solid #E4E2E9">
            <div >
              <div style="font-size:${props.fontSize}px;color:${textColor};margin-left:20px;margin-top:20px"> 
                <i data-icon-name="${dataIconName}" role="presentation" aria-hidden="true" class="${iconClassName}" style="font-family: ${fontFamily};">${children}</i>
                ${item.Title}
              </div>            
              <div style="font-size:${props.fontSize}px;color:${textColor};margin-left:20px;margin-top:20px"> 
                ${item.SubTitle}                
              </div>
            </div>
          </div>     
          `
            :
            `
            <div class='depth-${d.depth} ${item.Placeholder ? "placeholder" : ""} ${Documents.IsDownloadOnClick(item) ? "download-document-container" : ""}' style="${wrapperStyle} font-family:inherit;background-color:${item.HexColorCode}; position:absolute;margin-top:-1px; margin-left:-1px;width:${d.width}px;height:${d.height}px;border-radius:10px;border: 1px solid #E4E2E9">
                <div>              
                  <span aria-hidden="true" class="ms-Icon-imageContainer image-110">
                    <div class="ms-Image root-114" style="top:-20px; left:25px; position:relative">
                      <img width="48" src="${Documents.getDocumentIcon(item)}" class="ms-Image-image is-loaded ms-Image-image--portrait is-fadeIn image-115"></img>
                    </div>
                  </span>             
                </div>              
              
              <div style="font-size:${props.fontSize}px;color:${item.HexColorCodeText};margin-left:20px;margin-top:1px"> 
                ${item.Title}
              </div>

              <div style="font-size:${props.fontSize}px; color:${item.HexColorCodeText};margin-left:20px;margin-top:3px;"> 
                <strong>${item.SubTitle && item.SubTitle}</strong>
              </div>

              <div style="font-size:${props.fontSize}px; color:${item.HexColorCodeText};margin-left:20px;margin-top:3px;"> 
               ${item.Description && item.Description}
              </div>

            </div>
        `;

          const wrapperElement = item.Hyperlink
            ? `<a href='${Documents.getDocumentHyperlink(item)}' ${item.OpenInNewTab ? "target='_blank'" : ""} style='text-decoration: none !important'>${content}</a>`
            : `<span >${content}</span>`;

          return props.editMode ? content : wrapperElement;
        })
        .onNodeClick((nodeId, i, arr) => {
          props.onNodeClick(nodeId);
        })

        .render();
      chart.linkUpdate(function (d, i, arr) { d3.select(this).attr("stroke", props.linkStroke).attr("stroke-width", props.linkWidth); });
      // chart.connections(props.connections);
      chart.expandAll();
      chart.compact(props.compactChart);
      chart.render();
    }
  }, [
    props.data,
    props.nodeHeight,
    props.nodeWidth,
    props.childrenMargin,
    props.compactMarginBetween,
    props.compactMarginPair,
    props.neightbourMargin,
    props.siblingsMargin,
    props.fontSize,
    props.compactChart,
    props.layout,
    props.onNodeClick,
    props.editMode, // Add editMode to the dependency array
  ]);

  return (
    <div>
      <FontIcon aria-label="Zoom In" iconName="ZoomIn" onClick={() => { chart.zoomIn(); }} className={styles.chartIconButton} />
      <FontIcon aria-label="Zoom Out" iconName="ZoomOut" onClick={() => { chart.zoomOut(); }} className={styles.chartIconButton} />


      {globalContext.isAdmin && (
        <span>
          {props.editMode ? (
            <div>
              <pre>
                {/* {JSON.stringify(props.connections, null, 2)} */}
              </pre>
              <span>
                {/* <FontIcon aria-label="Cancel" iconName="Cancel" onClick={() => { props.toggleEdit(); }} className={styles.chartIconButton} /> */}
                <Button aria-label="Cancel"
                  iconProps={{ iconName: 'Cancel' }}
                  onClick={() => { props.toggleEdit(); }} className={styles.chartIconButton} />

                {/* <FontIcon aria-label="Save" iconName="Save" onClick={() => { props.toggleEdit(); props.saveItems(); }} className={styles.chartIconButton} /> */}
                <PrimaryButton aria-label="Save"
                  iconProps={{ iconName: 'Save' }}
                  onClick={() => { props.toggleEdit(); props.saveItems(); }} className={styles.chartIconButton} />
              </span>

            </div>
          ) : (
            <PrimaryButton aria-label="Edit"
              iconProps={{ iconName: 'Edit' }}
              onClick={() => { props.toggleEdit(); }} className={styles.chartIconButton} />
          )}
        </span>
      )}
      <div ref={d3Container} style={{ border: props.editMode ? "dashed red 6px" : "" }} />
    </div>
  );
};