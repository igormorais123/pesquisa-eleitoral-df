declare module 'react-plotly.js' {
  import { Component } from 'react';
  import { Layout, Data, Config, PlotlyHTMLElement, PlotMouseEvent } from 'plotly.js';

  interface PlotParams {
    data: Data[];
    layout?: Partial<Layout>;
    config?: Partial<Config>;
    frames?: object[];
    style?: React.CSSProperties;
    className?: string;
    useResizeHandler?: boolean;
    onInitialized?: (figure: PlotlyHTMLElement) => void;
    onUpdate?: (figure: PlotlyHTMLElement) => void;
    onPurge?: (figure: PlotlyHTMLElement) => void;
    onError?: (error: Error) => void;
    onHover?: (event: PlotMouseEvent) => void;
    onUnhover?: (event: PlotMouseEvent) => void;
    onClick?: (event: PlotMouseEvent) => void;
    onSelected?: (event: PlotMouseEvent) => void;
    onRelayout?: (event: Readonly<object>) => void;
    onRestyle?: (event: Readonly<object>) => void;
    onRedraw?: () => void;
    divId?: string;
  }

  export default class Plot extends Component<PlotParams> {}
}

declare module 'plotly.js' {
  export interface Layout {
    [key: string]: unknown;
  }

  export interface Data {
    [key: string]: unknown;
  }

  export interface Config {
    [key: string]: unknown;
  }

  export interface PlotlyHTMLElement extends HTMLElement {
    data: Data[];
    layout: Layout;
  }

  export interface PlotDatum {
    pointIndex: number;
    pointNumber: number;
    curveNumber: number;
    data: Data;
    [key: string]: unknown;
  }

  export interface PlotMouseEvent {
    points: PlotDatum[];
    event: MouseEvent;
  }
}
