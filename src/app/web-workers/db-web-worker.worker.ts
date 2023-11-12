/// <reference lib="webworker" />
import { db } from './../db'; // You get a db with property table1 attached (because the schema is declared)

addEventListener('message', async ({ data, type }) => {
  console.log(data.type);
  if (data.type == 'bulkPut') {
    db.on('populate', (transaction) => {
      db.table('simpleHymns').bulkPut(data.data);
    });
  }

  await db.on('ready', () => {});
  if (data.type == 'bulkPut') {
    await db.table('simpleHymns').bulkPut(data.data);
  }
});
