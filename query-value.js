// TODO: write in typescript, compile to js, and make npm compatible?

import defaultOpts from './defaults';

function QueryValue(view, disposeSignal, opts)
{
  opts = Object.assign({}, defaultOpts, opts);
  
  let { defaultValue, ObservValue, db, errorHandler } = opts;
  let val = ObservValue(defaultValue);
  
  let refresh = () =>
    db
      .query(view, opts)
      .then(res => val.set(res.rows[0].value));
  
  val.ready = db
    .get(id, opts)
    .then(doc =>
    {
      val.set(doc);
      
      let changes = db.changes({ live: true, include_docs: true, since: 'now' })
        .on('change', c =>
        {
          if (c.id !== id) return;
          
          // dispose ourselves once deleted?
          val.set(c.deleted ? null : c.doc);
        });
      
      if (errorHandler) changes.on('error', errorHandler);
      
      disposeSignal(() => changes.cancel());
      val.ready.yet = true;
      return val;
    })
    .catch(errorHandler);
    
  return val;
}

export default QueryValue;
export var __useDefault = true;