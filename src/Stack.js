import React, { Component } from 'react';
import Uji from './uji.js';

class Stackbox extends Component {
  constructor(props) {
    super(props);

    this.state = {'onafterupdated':props.onafterupdated || null};

    this.afterUpdated = this.afterUpdated.bind(this);    
  }

  afterUpdated(data, origin) {
    console.log('Stackbox.afterUpdated');
    this.setState({'data':data});
    if(this.state.onafterupdated !== null) {
      this.state.onafterupdated(data, origin);
    }
  }

  render() {
    return <div id="stackbox"><LoadFileOp onafterupdated={this.afterUpdated}/></div>;
  }
}

class StackOp extends Component {
  constructor(props) {
    super(props);

    this.state = {'onafterupdated':props.onafterupdated || null};
  }

  afterUpdated(data, origin) {
    console.log('StackOp.afterUpdated');
    if(this.state.onafterupdated !== null) {
      this.state.onafterupdated(data, origin);
    }
  }

  render() {
    return <div id="stackop"></div>
  }
  
}

class LoadFileOp extends Component {
  constructor(props) {
    super(props);

    //default to quandl params for example, need to APIify + handle csv ...
    this.state = {'dateCol':0,'valCols':[1],'onafterupdated':props.onafterupdated || null};

    this.parseFile = this.parseFile.bind(this);
    this.afterLoaded = this.afterLoaded.bind(this);
  }

  afterLoaded() {
    if(this.state.onafterupdated !== null) {
      this.state.onafterupdated(this.state.data, 'loadfile');
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

export default Stackbox;