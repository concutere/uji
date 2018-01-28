import React, {Component} from 'react';
import Uji from './uji.js';

class Autochart extends Component {
  constructor(props) {
    super(props);

    this.state = {'data':props.data || new Uji()};
  }

  componentWillReceiveProps(props) {
    this.setState({'data':props.data});
  }

  render() {
    //TODO better svg width/height, scaling on viewBox makes for oversized lines...
    return (
      <div id="autochart-outer" style={{width:'100%',height:'100%'}}>
        <AutoSvg data={this.state.data} />
      </div>
    );
  }

  rendertmp() {
    return 
    {
      <div id="autochart-outer" style={{width:'100%',height:'100%'}}>
        <svg id="autochart" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points={this.state.data.ptstr(100,100)} stroke="black" fill="transparent" strokeWidth="1"/>
        </svg>
      </div>
      };
    }
}

class AutoSvg extends Component {
  constructor(props) {
    super(props);

    this.state = {
      'data':props.data || new Uji(), 
      'width':100, 
      'height':100
    };
  }

  componentWillReceiveProps(props) {
    if (this.state.data !== props.data) {
      this.setState({
        'data':props.data || this.state.data
      });
    }
  }

  componentDidMount() {
    if(this.autosvg !== undefined) {
      let svg = this.autosvg;
      this.setState({
        'width':svg.clientWidth, 
        'height': svg.clientHeight}
      );
    }
  }

  minmax(hi, lo, val) {
    return Math.min(lo, Math.max(hi, val));
  }

  xaxis(x, y) {
    if (!this.state.data) {
      return;
    }

    let axs = this.state.data.axes(x, y);
    console.log(axs);
    let xs = axs[0];

    return xs.map((xx, i) => <g><line x1={100*(i+1)} y1={this.state.height-30} x2={100*(i+1)} y2={this.state.height-25} stroke="black" strokeWidth="1"/><text x={100*(i+1) - 35} y={this.state.height - 10} fontFamily="Helvetica, Tahoma, Arial, sans-serif" fontSize="12">{xx}</text></g>);
  }

  yaxis(x, y) {
    if (!this.state.data) {
      return;
    }

    let axs = this.state.data.axes(x, y);
    console.log(axs);
    let xs = axs[0];
    let ys = axs[1];

    return ys.map((yy, i) => <g transform="translate(0,10)"><line x1="85" y1={this.state.height-((i+1))*50} x2="90" y2={this.state.height-((i+1))*50} stroke="black" strokeWidth="1"/><text textAnchor="end" x="80" y={this.state.height-((i+1))*50+4 } fontFamily="Helvetica, Tahoma, Arial, sans-serif" fontSize="12">{yy}</text></g>);
  }

  

  render() {
    //TODO X/Y axis gutter/legend
    var xaxis,yaxis;
    if (this.state.width ) {
      xaxis = this.xaxis(this.state.width-100, this.state.height-50);
      yaxis = this.yaxis(this.state.width-100, this.state.height-50);
    }

    return <svg id="autochart" ref={(svg) => { this.autosvg = svg; }} width="100%" height="100%" viewBox={`0 0 ${this.state.width} ${this.state.height}`} preserveAspectRatio="none">
  <g id="autoxaxis">
    {xaxis}
  </g>
  <g id="autoyaxis">
    {yaxis}
  </g>
      <polyline transform="translate(100, 10)" width={this.state.width-100} height={this.state.height-50} 
        points={this.state.data.ptstr(this.state.width-100,this.state.height-50)} />

    </svg>;
  }

  tmp() {
  return [<g id="autoxaxis" fill="red">
    <rect x="100" y={this.state.height-50} width={this.state.width-100} height="50"/>
  </g>,
  <g id="autoyaxis" fill="blue">
    <rect y="0" x={0} height={this.state.height-50} width="100"/>
  </g>,
  <g id="legend" fill="yellow">
    <rect x="0" width="100" y={this.state.height-50} height="50" />
  </g>];
  }
}

export default Autochart;
