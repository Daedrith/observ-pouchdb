observ-pouchdb
==============

A series of observable adapters for PouchDB.

Usage
-----

First, import `observ-pouchdb/defaults` and set some default options:

- `db`: a PouchDB instnace
- `ObservArray`: factory to turn an array into an observable array
- `ObservValue`: factory to create an observable value
- `errorHandler`: function to be called when an error occurs

Then, use one of the factories:

- (common to all factories)  
  - `disposeSignal`: a function that accepts a callback, which it should invoke when the observable no longer needs to update
  - `opts`: options. Can override the defaults set above. Also passes through to PouchDB. Sometimes has extra options depending on the factory.
  - returns: an observable (with an initial empty value), with an additonal `.ready` promise that returns the observable once it has a proper initial value; also sets `.ready.yet` to true.
- `KeyArray`: an observable array of docs for a given primary key range.
  - `opts`:
    - `prefix`: observes documents whose ids begin with this string (alternative to `startkey` and `endkey`)
- `KeyValue`: observe a particular document, by id
  - `id`: id of the document to observe. Must already exist
- `KeyObject`: an observable object mapping ids to documents
- `QueryValue`: observes the first value from a view
  - `view`: name of a view
- `QueryObject`: an observable object mapping keys to values in a view
  - `view`: name of a view
  
TODO
----

- Finish porting KeyObject, QueryValue, QueryObject
