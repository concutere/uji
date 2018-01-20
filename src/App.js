import React, { Component } from 'react';
import Uji from './uji.js';
import './Uji.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {'data':null};

    this.afterUpdated = this.afterUpdated.bind(this);
  }

  afterUpdated(data) {
    console.log('App.afterUpdated');
    this.setState({'data':data});
  }

  render() {
    return ( 
      <div id="outer">
        <Stackbox onafterupdated={this.afterUpdated} />
        <Visbox data={this.state.data} />
        <Datagrid data={this.state.data} />
      </div>   
    );
  }
}

class Stackbox extends Component {
  constructor(props) {
    super(props);

    this.state = {'onafterupdated':props.onafterupdated || null};

    this.afterUpdated = this.afterUpdated.bind(this);    
  }

  afterUpdated(data) {
    console.log('Stackbox.afterUpdated');
    this.setState({'data':data});
    if(this.state.onafterupdated !== null) {
      this.state.onafterupdated(data);
    }
  }

  render() {
    return <div id="stackbox"><LoadFileOp onafterloaded={this.afterUpdated}/></div>;
  }
}

class LoadFileOp extends Component {
  constructor(props) {
    super(props);

    //default to quandl params for example, need to APIify
    this.state = {'dateCol':0,'valCols':[5],'onafterloaded':props.onafterloaded || null};

    this.parseFile = this.parseFile.bind(this);
    this.afterLoaded = this.afterLoaded.bind(this);
  }

  afterLoaded() {
    if(this.state.onafterloaded !== null) {
      this.state.onafterloaded(this.state.data);
    }
  }

  parseFile(e) {
    let res = JSON.parse(e.target.result).dataset;
    let data = [res.column_names].concat(res.data).map((v) => {return v.filter((vv,i) => {return this.state.dateCol === i || this.state.valCols.includes(i)})});
    this.setState({'data': new Uji(data), 'name':res.dataset_code});
    //console.log(this.state);
    this.afterLoaded();
  }

  render() {
    return <div id="fetch" style={{fontWeight:'bold', color:'steelblue'}}><input type="file" onClick={(e) => e.target.value=''} onChange={(e) => {let fr = new FileReader(); fr.addEventListener('loadend', this.parseFile); fr.readAsText(e.target.files[0]); }} /></div>
  }
}

class Visbox extends Component {
  constructor(props) {
    super(props);
    this.state = {'data':props.data || new Uji(),'vspec':this.respec(props.data)};

    this.respec = this.respec.bind(this);
  }

  respec(data) {
    /*let visbox = document.getElementById('visbox');
    if (visbox !== null && visbox !== undefined) {
    //let vlSpec =
      return createClassFromLiteSpec('Autochart',{
        "$schema": "https://vega.github.io/schema/vega-lite/v2.0.json",
        "description": "autochart prototyping with vega!",
        "width":visbox.clientWidth,
        "height":visbox.clientHeight,
        "autosize":{
          "type":"fit",
          "contains":"padding"
        },
        "data": {
          "values": data.byCol
        },
        "mark": "line",
        "encoding": {
          "x": {"field": "Date", "type": "temporal", "axis": {"grid":false}},
          "y": {"field": data.byRow[0][1], "type": "quantitative", "axis": {"grid":false}},
        }
      });
    }*/
    //vega.embed("#visbox", vlSpec, {"actions":false});
  }

  shouldComponentUpdate() {
    return true;
  }
  componentWillReceiveProps(props) {
    this.setState({'data':props.data, 'vspec':this.respec(props.data)});
  }
  componentDidUpdate(props) {
    console.log('...')
    //vega.embed("#visbox", this.respec(props.data), {"actions":false});
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


class Autochart extends Component {
  constructor(props) {
    super(props);

    this.state = {'data':props.data || new Uji()};
  }

  componentWillReceiveProps(props) {
    this.setState({'data':props.data});
  }

  render() {
    return (
      <div id="autochart-outer" style={{width:'100%',height:'100%'}}>
        <svg id="autochart" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points={this.state.data.ptstr(100,100)} stroke="black" fill="transparent" strokeWidth="1"/>
        </svg>
      </div>
    );
  }
}


export default App;
