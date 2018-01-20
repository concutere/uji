/* 

byRow : [['LABEL 1', 'LABEL 2'],[row0col0, row0col1]...]
byCol : {'LABEL 1':[row0col0, row1col0...], 'LABEL 2':[row0col1data, row1col1...]}
dictByRow : [{'LABEL 1':row0col0, 'LABEL 2', row0col1}, {'LABEL 1':row1col0, 'LABEL 2':row1col1}]

*/
class Uji {
  // data assumed to be row array. static methods can go both ways ...
  constructor(dataByRow=null, dataByCol=null) {
    this.byRow = dataByRow || Uji.cols2rows(dataByCol);
    this.byCol = dataByCol || Uji.rows2cols(dataByRow);
    if (this.byRow.length > 0) {
      this.updateStats();
    }
    else {
      this.defaultStats();
    }
  }

  defaultStats() {
    this.headers = [];
    this.mincs = [];
    this.maxcs = [];
  }

  updateStats() {
    this.headers =  this.byRow[0]; //always assume headers row? TODO force A,B,C headers if row[0] is all numeric/sequential once col types are checked

    let headers = this.headers;
    let rows = this.byRow.slice(1);

    this.mincs = this.headers.map((c,ci) => Math.min(this.byCol[c]));
    this.maxcs = this.headers.map((c,ci) => Math.max(this.byCol[c]));
  }

  minFor(colid) {
    if(this.byRow.length > 0) {
      return this.byRow[this.mincs[colid]]
    }
    else {
      return 0;
    }
  }

  maxFor(colid) {
    if(this.byRow.length > 0) {
      return this.byRow[this.maxcs[colid]]
    }
    else {
      return 0;
    }
  }

  /*
  nrml(min=0, max=1) {
    let range = max - min;
    let ds = this.mincs.map((min,i) => this.maxcs[i] - min);

    let scales = ds.map((d,i) => {
      if (d > range) {
        return d / range;
      }
      else {
        return 1;
      }
    });

    return this.byRow.slice(1).map((r,ri) => {
      return r.map((v,i) => {
        return v / scales[i];
      });
    });
  }*/

  ////////////////////////////////

  ptstr(x, y) {
    if(this.byCol === null || this.byCol === undefined) {
      return '';
    }

    let data = this.byCol[this.headers[1]]; //TODO multicol + vari col opts

    if (data === null || data === undefined || data.length < 1) {
      return '';
    }

    let max = Math.max(...data);
    let min = Math.min(...data);
    let diff = max - min;

    let scale = diff === 0 ? 1 : Math.min(1, y / diff);
    let scaled = data.map((v) => (v - min) * scale);

    let step = x / data.length;

    let str = scaled.map((v,i) => `${step*i},${v}`).join(' ');
    console.log(str);
    return str;
  }

  ////////////////////////////////

  static cols2rows(dataByCol) {
    if(!dataByCol) {//TODO check structure, col types
      return [];
    }
    let headers = Object.keys(dataByCol);
    let rows = [];
    dataByCol[0].forEach((v,i) => {
      rows.push(headers.map((h,hi) => {
       return dataByCol[h][i]; 
      }));
    });
    console.log(rows);
    return rows;
  }

  static rows2cols(dataByRow) {
    if(!dataByRow) {
      return [];
    }

    let headers = dataByRow[0]; // headers assumption todo already in constructor....
    let rows = dataByRow.slice(1);
    let columns = {};
    headers.forEach((h,hi) => {
      columns[h] = [];
    });
    rows.forEach((r,ri) => {
      headers.forEach((h,hi) => {
        columns[h][ri] = r[hi];
      });
    });
    console.log(columns);
    return columns;
  }

  static rows2rowsets(dataByRow) {
    if(dataByRow === null || dataByRow === undefined || dataByRow.length < 1) {
      return [];
    }
    let headers = dataByRow[0];
    let rows = dataByRow.slice(1);
    return rows.map((r,ri) => { 
      let rowset = {};
      headers.forEach((h,hi) => {
        rowset[h] = r[hi];
      });
      return rowset;
    });
  }

  static rows2string(dataByRow, includeHeaders = true, includeDates=true) {
    if (dataByRow === null || dataByRow === undefined || dataByRow.length < 1) {
      return '';
    }
    let headers = dataByRow[0];
    let rows = dataByRow.slice(1);
    if (!includeDates) {
      headers=headers.slice(1);
      rows = rows.map((r,i) => r.slice(1));
    }

    let hstr = '';
    if (includeHeaders) {
      `${headers.join('\t')}\n`;
    }
    return `${hstr}${rows.map((r) => { return r.map((v) => {return v.toString();}).join('\t')}).join('\n')}`;
    
  }

  toString() {
    return Uji.rows2string(this.byRow);
  }

///////////////////////////////////////

  static smooth(calcVals) {
    var smoothWith = [];
    var smoothMax = 3;
    const ticksPerMonth = 21.5; //(365*(5/7))/12;
    const monthSpan = Math.round(calcVals.length / ticksPerMonth);
    if(monthSpan > 1 && monthSpan < 6) {
      smoothMax = 7;
    }
    else if(monthSpan >= 6) {
      smoothMax = 21;
    }

    return calcVals.map((v,vi) => {
      if (smoothWith.length == smoothMax) {
        smoothWith = smoothWith.slice(1);
      }
      smoothWith.push(v);

      if(smoothWith.length > 1) {
        return smoothWith.reduce((acc,n) => acc+n) / smoothWith.length;
      }
      else {
        return v;
      }
    });
  }

  static log(calcVals) {
    return calcVals.map((v) => Math.log(v));
  }

  static index(calcVals) {
    return calcVals.map((v,i,a) => (v/a[0])*100); //TODO why is array sorted backwards here? clearer to fix elsewhere and use a[0] here ...
  }

  //////////////////////////////////////

  static combine(cols, data) {
    return data.map((row) => 
            cols.map((vc) => row[vc])
              .reduce((acc,n) => acc*n)
    );
  }

  static flatten(vals) {
    if(this.stack) {
      this.stack.forEach((transform,i) => {
        vals = transform(vals);
      });
    }
    return vals;
  }

  static flattenStack(cols, data) {
    return Uji.flatten(Uji.combine(cols, data));
  }

  static stackOn(transform) {
    if(!this.stack) {
      this.stack=[transform];
    }
    else if (!this.stack.includes(transform)) {
      this.stack.push(transform);
    }
  }

  static stackOff(transform) {
    if(this.stack && this.stack.includes(transform)) {
      this.stack.splice(this.stack.indexOf(transform),1);
    }
  }
}

export default Uji;