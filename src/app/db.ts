// db.js
import Dexie from "dexie";

export const db = new Dexie("ngdexieliveQuery");
db.version(1).stores({
  simpleHymnItems: 'id, hymnNumber, last_used_time',
  simpleHymns: 'id, hymnNumber',
});
