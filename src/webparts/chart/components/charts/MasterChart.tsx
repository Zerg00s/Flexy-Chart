import * as React from 'react';
import styles from './MasterChart.module.scss';
import { IMasterProgramChartProps } from './IChartProps';
import MasterChartDataComponent from './MasterChartDataComponent';
import ItemsTable from '../ItemsTable/ItemsTable';

interface IMasterProgramChartState {
  lastUpdated: number;
}
export default class MasterProgramChart extends React.Component<IMasterProgramChartProps, IMasterProgramChartState> {

  constructor(props: IMasterProgramChartProps) {
    super(props);
    this.state = {
      lastUpdated: props.lastUpdated || Date.now()
    };
  }

  public componentDidUpdate(prevProps: IMasterProgramChartProps) {
    if (prevProps.lastUpdated !== this.props.lastUpdated) {
      this.setState({ lastUpdated: this.props.lastUpdated });
    }
  }

  public render(): React.ReactElement<IMasterProgramChartProps> {
    if (this.props.layout === 'table') {
      return (<ItemsTable {...this.props} />);
    }

    return (
      <section className={`${styles.programChart}`}>
        <MasterChartDataComponent {...this.props} lastUpdated={this.state.lastUpdated} />
      </section>
    );
  }
}
