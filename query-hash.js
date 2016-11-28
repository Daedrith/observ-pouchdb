// TODO: write in typescript, compile to js, and make npm compatible?

import defaultOpts from './defaults';

function QueryHash(view, disposeSignal, opts)
{
  opts = Object.assign({ include_docs: true }, defaultOpts, opts);
  
  let { ObservValue, ObservVarhash, db, errorHandler } = opts;
  let observ = ObservVarhash({}, ObservValue);
  
  if (opts.prefix)
  {
    opts.startkey = opts.prefix;
    opts.endkey = opts.prefix + '\uffff';
    opts.inclusive_end = true;
  }
  
  let refresh = () => db
    .query(view, opts)
    .then(
      res =>
      {
        // o and n are [ [key, doc], ... ], sorted by key
        let o = Object.entries(observ());
        o.sort((a, b) => +(a[0] > b[0]) || +(a[0] === b[0]) - 1);
        let n = res.rows.map(r => [r.key, r.doc]);
        n.sort((a, b) => +(a[0] > b[0]) || +(a[0] === b[0]) - 1);
        
        // run through both arrays, correlating keys to determine whether they intersect
        // or only on one of the arrays.
        let i = -1, j = -1;
        let a = o[++i], b = n[++j];
        while (i < o.length || j < n.length)
        {
          if (j === n.length || a[0] < b[0])
          {
            // n ran out, or a is lagging behind b: means a is not in n (doc removed)
            observ.delete(a[0]);
            a = o[++i];
          }
          else if (i === o.length || b[0] < a[0])
          {
            // n ran out, or b is lagging behind a: means b is not in o (doc added)
            observ.put(b[0], b[1]);
            b = n[++j];
          }
          else
          {
            // a and b match (doc in both sets), but need to check for update
            if (a[1]._rev !== b[1]._rev) observ.put(b[0], b[1]);
            
            a = o[++i];
            b = n[++j];
          }
        }
      },
      errorHandler);
  
  observ.ready = refresh().then(() =>
  {
    let changes = db.changes({ live: true, since: 'now', filter: '_view', view })
      .on('change', c =>
      {
        if (!(opts.inclusive_end
              ? c => opts.startkey <= c.id && c.id <= opts.endkey
              : c => opts.startkey <= c.id && c.id <  opts.endkey))
        {
          return;
        }
        
        refresh();
      });
          
    if (errorHandler) changes.on('error', errorHandler);
          
    disposeSignal(() => changes.cancel());

    observ.ready.yet = true;
  });
  
  return observ;
}

export default QueryHash;
export var __useDefault = true;