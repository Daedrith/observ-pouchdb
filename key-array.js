// TODO: write in typescript, compile to js, and make npm compatible?

import defaultOpts from './defaults';

function KeyArray(disposeSignal, opts)
{
  // disposeSignal 
  opts = Object.assign({}, defaultOpts, opts);
  
  let { ObservArray, ObservValue, db, errorHandler } = opts;
  let observ = ObservArray([]);
  
  if (opts.prefix)
  {
    opts.startkey = opts.prefix;
    opts.endkey = opts.prefix + '\uffff';
    opts.inclusive_end = true;
  }
  
  let queryOpts = Object.assign({ include_docs: true }, opts);
  observ.ready = db.allDocs(queryOpts)
    .then(
      res =>
      {
        observ.set(res.rows.map(d => ObservValue(d.doc)));
        
        let changes = db.changes({ live: true, include_docs: true, since: 'now' })
          .on('change', c =>
          {
            if (!(opts.inclusive_end
                  ? c => opts.startkey <= c.id && c.id <= opts.endkey
                  : c => opts.startkey <= c.id && c.id <  opts.endkey))
            {
              return;
            }
            
            let ind;
            observ.some((d, i) =>
            {
              if (d()._id === c.id)
              {
                ind = i;
                return true;
              }
            });

            if (c.deleted) observ.splice(ind, 1);
            else if (ind != null) observ.get(ind).set(c.doc);
            // insert in order?
            else observ.push(ObservValue(c.doc));
          });
        
        if (errorHandler) changes.on('error', errorHandler);
        
        disposeSignal(() => changes.cancel());

        observ.ready.yet = true
        
        return observ;
      },
      errorHandler);
      
  return observ;
}

export default KeyArray;
export var __useDefault = true;