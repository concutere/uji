import React, {Component} from 'react';

class Autochart extends Component {
  constructor(props) {
    super(props);

    this.state = {'data':props.data};
  }

  componentWillReceiveProps(props) {
    this.setState({'data':props.data});
  }

  render() {
    return (
      <div id="autochart-outer">
        <svg id="autochart" width="100" height="100" viewBox="0 0 100 100">
          <g id="x-axis-region" x="0" y="0" width="0" height="0" fill="lightgray">

          </g>
          <g id="y-axis-region" fill="lightgray">

          </g>
          <g id="chart-region">
            
          </g>
        </svg>
      </div>
    );
  }
}

export default Autochart;