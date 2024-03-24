import redis from 'redis';
import {
  documents as documentCollection,
  notebooks as notebookCollection,
  users as userCollection
} from '../config/mongoCollections.js';
import * as val from './validation.js';
import {GraphQLError} from "graphql";

const client = redis.createClient();
await client.on('error', err => console.error('redis did not connect...', err)).connect();

const notFound = (msg) => {
  throw new GraphQLError(msg, {
    extensions: {code: "NOT_FOUND"},
    http: {status: 404}
  });
}

const badInput = (msg) => {
  throw new GraphQLError(msg, {
    extensions: {code: "BAD_USER_INPUT"},
    http: {status: 400}
  });
}

const ISE = (msg) => {
  throw new GraphQLError(msg, {
    extensions: {code: "INTERNAL_SERVER_ERROR"},
    http: {status: 400}
  });
}

const checkId = (id) => {
  try {
    return val.checkId(id);
  } catch(e) {
    badInput(e);
  }
}

const parseObj = (obj) => {
  obj = JSON.parse(obj);
  obj.date = new Date(obj.date);
  return obj;
}

const setObjInRedis = async (key, data, exp=60*60) => {
  await client.set(key, JSON.stringify(data));
  await client.expire(key, exp);
}

const setArrayInRedis = async (key, arr, exp=60*60) => {
  for (const obj of arr)
    await client.rPush(key, JSON.stringify(obj));
  await client.expire(key, exp)
}

export const getDocumentById = async (id) => {
  id = checkId(id);
  const key = `doc${id.toString()}`;
  const exists = await client.exists(key);
  if (exists)
    return JSON.parse(await client.get(key));
  const docs = await documentCollection();
  const found = await docs.findOne({_id: id});
  if (!found)
    notFound('document not found');
  await setObjInRedis(key, found);
  return found;
}

export const getNotebookById = async (id) => {
  id = checkId(id);
  const key = `nb${id.toString()}`;
  const exists = await client.exists(key);
  if (exists)
    return JSON.parse(await client.get(key));
  const notes = await notebookCollection();
  const found = await notes.findOne({_id: id});
  if (!found)
    notFound('document not found');
  await setObjInRedis(key, found);
  return found;
}

export const getQuickDataFromUser = async (fid) => {
  const key = `qd${fid}`;
  const exists = await client.exists(key);
  if (exists)
    return (await client.lRange(key, 0, -1)).map(parseObj);
  const docs = await documentCollection();
  const nbs  = await notebookCollection();

  let userDocs = await docs.find(
    {ownerFid: fid},
    {$project: {name:1, date:1}}
  ).toArray();
  userDocs = userDocs.map(d => ({...d, type:'document'}));
  let userNbs = await nbs.find(
    {ownerFid: fid},
    {$project: {name:1, date:1}}
  ).toArray();
  userNbs = userNbs.map(nb => ({...nb, type:'notebook'}));

  const quickData = userDocs.concat(userNbs).sort((a,b) => b.date - a.date);
  await setArrayInRedis(key, quickData, 60*60*3);
  return quickData;
}

export const getUserField = async (fid, field) => {
  const key = `${fid}-${field}`
  const exists = await client.exists(key);
  if (exists)
    return (await client.lRange(key, 0, -1)).map(parseObj);
  const users = await userCollection();
  const entries = await users.aggregate([
    {
      '$unwind': {
        'path': `$${field}`
      }
    }, {
      '$lookup': {
        'from': `${field}`,
        'localField': `${field}`,
        'foreignField': '_id',
        'as': 'result'
      }
    }, {
      '$replaceRoot': {
        'newRoot': {
          '$arrayElemAt': [
            '$result', 0
          ]
        }
      }
    }
  ]).toArray();
  if (!entries)
    ISE('could not get user quick data')
  await setArrayInRedis(key, entries)
  return entries;
}

export const newDocument = async (fid) => {
  const users = await userCollection();
  const docs  = await documentCollection();
  const insertedDoc = await docs.insertOne(
    {
      ownerFid: fid,
      file: "let a = 1 0 0 ; 0 1 0 ; 0 0 1\n",
      name: "New Document",
      date: new Date()
    }
  );
  if (!insertedDoc)
    ISE('could not create new document. try again soon!');
  const updatedUser = await users.findOneAndUpdate(
    {firebaseId: fid},
    {$push: {documents: insertedDoc.insertedId}},
    {returnDocument: 'after'}
  );
  const newDoc = await docs.findOne({_id: insertedDoc.insertedId});
  if (!newDoc)
    ISE('could not create new document. try again soon!');
  const key = `doc${insertedDoc.insertedId.toString()}`;
  await setObjInRedis(key, newDoc, 60*60*3);
  return newDoc;
}

export const newNotebook = async (fid) => {
  const users = await userCollection();
  const nbs  = await notebookCollection();
  const input = 'let a = 1 0 0 ; 0 1 0 ; 0 0 1';
  const output = '';
  const insertedNb = await nbs.insertOne(
    {
      ownerFid: fid,
      name: "New Notebook",
      pairs: [{input, output}],
      date: new Date()
    }
  );
  if (!insertedNb)
    ISE('could not create new notebook. try again soon!');
  const updatedUser = await users.findOneAndUpdate(
    {firebaseId: fid},
    {$push: {notebooks: insertedNb.insertedId}},
    {returnDocument: 'after'}
  );
  const newNb = await nbs.findOne({_id: insertedNb.insertedId});
  if (!newNb)
    ISE('could not create new notebook. try again soon!');
  const key = `nb${insertedNb.insertedId.toString()}`;
  await setObjInRedis(key, newNb, 60*60*3);
  return newNb;
}

export const updateDocument = async (fid, id, name, file) => {
  id = checkId(id);
  const fieldsToUpdate = {};
  if (name)
    fieldsToUpdate.name = name;
  if (file)
    fieldsToUpdate.file = file;
  if (Object.keys(fieldsToUpdate).length < 1)
    badInput('must supply at least one field to update');
  const docs = await documentCollection();
  fieldsToUpdate.date = new Date();
  const updatedDoc = await docs.findOneAndUpdate(
    {_id: id},
    {$set: fieldsToUpdate},
    {returnDocument: 'after'}
  );
  if (!updatedDoc)
    ISE('could not update document!');
  await setObjInRedis(`doc${id.toString()}`, updatedDoc);
  if (name && (await client.exists(`qd${fid}`)))
    await client.del(`qd${fid}`);
  return updatedDoc;
}

export const updateNotebook = async (fid, id, name, pairs) => {
  id = checkId(id);
  const fieldsToUpdate = {};
  if (name)
    fieldsToUpdate.name = name;
  if (pairs?.length > 0)
    fieldsToUpdate.pairs = pairs;
  if (Object.keys(fieldsToUpdate).length < 1)
    badInput('must supply at least one field to update');
  fieldsToUpdate.date = new Date();
  const nbs = await notebookCollection();
  const updatedNb = await nbs.findOneAndUpdate(
    {_id: id},
    {$set: {...fieldsToUpdate}},
    {returnDocument: 'after'}
  );
  if (!updatedNb)
    ISE('could not update notebook');
  await setObjInRedis(`nb${id.toString()}`, updatedNb);
  if (name && (await client.exists(`qd${fid}`)))
    //TODO going to have to refetch quick data for sidebar whenever client
    // does any updates
    await client.del(`qd${fid}`);
  return updatedNb;
}

export const updateSpecificCells = async (fid, id, name, indices, pairs) => {
  id = checkId(id);
  const fieldsToUpdate = {};
  if (name)
    fieldsToUpdate.name = name;
  if (indices?.length > 0)
    fieldsToUpdate.indices = indices;
  if (pairs?.length > 0)
    fieldsToUpdate.pairs = pairs;
  if (Object.keys(fieldsToUpdate).length < 1)
    badInput('must supply at least one field to update');
  fieldsToUpdate.date = new Date();
  const nbs = await notebookCollection();
  indices.forEach((indexToChange, elemIdx) => {
    const newPair = pairs[elemIdx];
    nbs.findOneAndUpdate(
      { _id: id },
      { $set: { [`pairs.${indexToChange}`]: newPair } }
    )
  });
  const updatedNb = await nbs.findOne({ _id: id });
  if (!updatedNb)
    ISE('could not update notebook');
  await setObjInRedis(`nb${id.toString()}`, updatedNb);
  if (name && (await client.exists(`qd${fid}`)))
    await client.del(`qd${fid}`);
  return updatedNb;
}

export const removeDocument = async (fid, id) => {
  id = checkId(id);
  const users = await userCollection();
  const docs = await documentCollection();
  const updatedUser = await users.findOneAndUpdate(
    {firebaseId: fid},
    {$pull: {documents: id}},
    {returnDocument: 'after'}
  );
  if (!updatedUser)
    ISE('could not remove document from user docs. try again soon!')
  const removedDoc = await docs.findOneAndDelete(
    {_id: id}
  );
  if (!removedDoc)
    ISE('could not delete document');
  const key = `doc${id.toString()}`;
  const exists = await client.exists(key);
  if (exists)
    await client.del(key);
  if (await client.exists(`${fid}-documents`))
    await client.del(`${fid}-documents`);
  return removedDoc;
}

export const removeNotebook = async (fid, id) => {
  id = checkId(id);
  const users = await userCollection();
  const nbs = await notebookCollection();
  const updatedUser = await users.findOneAndUpdate(
    {firebaseId: fid},
    {$pull: {notebooks: id}},
    {returnDocument: 'after'}
  );
  if (!updatedUser)
    ISE('could not remove notebook from user docs. try again soon!')
  const removedNb = await nbs.findOneAndDelete(
    {_id: id}
  );
  if (!removedNb)
    ISE('could not delete notebook');
  const key = `nb${id.toString()}`;
  const exists = await client.exists(key);
  if (exists)
    await client.del(key);
  if (await client.exists(`${fid}-notebooks`))
    await client.del(`${fid}-notebooks`);
  return removedNb;
}

export const parseDate = (date) => {
  // should get a string and return a Date object
  let dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  if (!dateRegex.test(date))
    throw "date is not in the correct format";

  let dateparse = date.split('/');
  if (dateparse.length !== 3)
    throw "date is not in the correct format";
  let [mm, dd, yyyy] = dateparse.map(s => +s);
  if (mm < 1 || mm > 12)
    throw "Invalid month. Must be between 1 and 12.";

  const mms_with_31_dds = new Set([1, 3, 5, 7, 8, 10, 12]);
  const mms_with_30_dds = new Set([4, 6, 9, 11]);
  if (mm === 2 && dd > 29)
    throw "Invalid date. February has a max of 29 days.";
  else if (mms_with_31_dds.has(mm) && dd > 31)
    throw `Invalid date. Month ${mm} has a max of 31 days.`;
  else if (mms_with_30_dds.has(mm) && dd > 30)
    throw `Invalid date. Month ${mm} has a max of 30 days.`;
  return new Date(yyyy, mm - 1, dd);
}