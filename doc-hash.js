// TODO: write in typescript, compile to js, and make npm compatible?

import defaultOpts from './defaults';

function DocHash(disposeSignal, opts)
{
  opts = Object.assign({}, defaultOpts, opts);
  
  let { ObservValue, ObservVarhash, db, errorHandler } = opts;
  let observ = ObservVarhash({}, ObservValue);
  
  let queryOpts = Object.assign({ include_docs: true }, opts.queryOpts);

  if (opts.prefix)
  {
    queryOpts.startkey = opts.prefix;
    queryOpts.endkey = opts.prefix + '\uffff';
    queryOpts.inclusive_end = true;
  }
  
  observ.ready = db.allDocs(queryOpts)
    .then(
      res =>
      {
        for (let d of res.rows) observ.put(d.id, d.doc);
        
        let changes = db.changes({ live: true, include_docs: true, since: 'now' })
          .on('change', c =>
          {
            if (!(opts.inclusive_end
                  ? c => opts.startkey <= c.id && c.id <= opts.endkey
                  : c => opts.startkey <= c.id && c.id <  opts.endkey))
            {
              return;
            }
            
            
            if (c.deleted) observ.delete(c.id);
            else observ.put(c.id, c.doc);
          });
        
        if (errorHandler) changes.on('error', errorHandler);
        
        disposeSignal(() => changes.cancel());

        observ.ready.yet = true;
        
        return observ;
      },
      errorHandler);
      
  return observ;
}

export default DocHash;
export var __useDefault = true;