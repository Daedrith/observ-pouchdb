// TODO: probably should use a factory that creates a KeyArray factory with the given defaults
export default {
  // these options required to be set:
  db: null, // a PouchDB instance
  ObservArray: null, // constructor for an observable array
  ObservValue: null, // constructor for an observable value
  // optional, but recommended:
  errorHandler: null,
};
export var __useDefault = true;