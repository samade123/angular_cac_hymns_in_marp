// db.js
import Dexie from "dexie";

export const db = new Dexie("ngdexieliveQuery");
db.version(1).stores({
  simpleHymnItems: 'id, hymnNumber, last_used_time',
  simpleHymns: 'id, hymnNumber',
});
db.version(2).stores({
  simpleHymnItems: 'id, hymnNumber, last_used_time',
  simpleHymns: 'id, hymnNumber',
  localHymns: 'id, hymnNumber, last_edited_time',
});
