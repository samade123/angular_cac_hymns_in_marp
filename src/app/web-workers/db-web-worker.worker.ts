/// <reference lib="webworker" />
// import Dexie from 'dexie';
import { db } from './../db'; // You get a db with property table1 attached (because the schema is declared)

addEventListener('message', async ({ data, type }) => {
  console.log(data.type);

  await db.on('ready', () => {});
  if (data.type == 'bulkPut') {
    await db.table('simpleHymns').bulkPut(data.data);
  }
});
