import React, { Component } from 'react';
import Uji from './uji.js';
import Autochart from './Autochart.js';
import './Uji.css';
import Stackbox from './Stack.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {'data':null};

    this.afterUpdated = this.afterUpdated.bind(this);
  }

  afterUpdated(data, origin) {
    console.log('App.afterUpdated from ' + origin);
    this.setState({'data':data});
  }

  render() {
    return ( 
      <div id="outer">
        <Stackbox onafterupdated={this.afterUpdated} ops={{'index':Uji.index, 'log':Uji.log, 'smooth':Uji.smooth}} />
        <Visbox data={this.state.data} />
        <Datagrid data={this.state.data} />
      </div>   
    );
  }
}

class Visbox extends Component {
  constructor(props) {
    super(props);
    this.state = {'data':props.data || new Uji()};

  }

  componentWillReceiveProps(props) {
    this.setState({'data':props.data});
  }

  render() {
    return (<div id="visbox">
      <Autochart data={this.state.data} />
    </div>
    );
  }
}
class Datagrid extends Component {
  constructor(props) {
    super(props);

    this.state = {'data':props.data, 'parsed':this.parseData(props.data)};

    this.parseData = this.parseData.bind(this);
  }

  componentWillReceiveProps(props) {
    
    this.setState({'data':props.data, 'parsed':this.parseData(props.data)});
  }
  parseData(data) {
    let ss = '';
    if(data === null || data === undefined) {
      ss = null;
    }
    else {
      ss = data.toString();//`${data.map((r) => { return r[0] })}`;
    }
    //console.log(ss);
    return ss;
  }

  render() {
    return <div id="content"><pre>{this.state.parsed}</pre></div>
  }
}

export default App;