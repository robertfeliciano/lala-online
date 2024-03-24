import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import * as col from '../config/mongoCollections.js';

const main = async () => {
    const db = await dbConnection();
    await db.dropDatabase();

    const users = await col.users();
    let newUser = await users.insertOne({
        firebaseId: "123",
        notebooks: [],
        documents: []
    });

    const docs = await col.documents();
    const nbs = await col.notebooks();

    newUser = await users.findOne({_id: newUser.insertedId});

    const newDoc = await docs.insertOne({
        ownerFid: newUser.firebaseId,
        file: "i am a new doc",
        name: "document 1",
    });
    const newDoc2 = await docs.insertOne({
        ownerFid: newUser.firebaseId,
        file: "i am another new doc",
        name: "document 2",
    });
    const newDoc3 = await docs.insertOne({
        ownerFid: newUser.firebaseId,
        file: "i am a third new doc",
        name: "document 3",
    });

    for (const doc of [newDoc, newDoc2, newDoc3]) {
        await users.findOneAndUpdate(
          { _id: newUser._id },
          { $push: { documents: doc.insertedId } },
          { returnDocument: 'after' }
        );
    }

    const newNB = await nbs.insertOne({
        ownerFid: newUser.firebaseId,
        pairs: [{ input: 'input', output: 'output' }],
        name: "notebook 1",
    });
    const newNB2 = await nbs.insertOne({
        ownerFid: newUser.firebaseId,
        pairs: [{ input: 'input2', output: 'output2' }],
        name: "notebook 2",
    });
    const newNB3 = await nbs.insertOne({
        ownerFid: newUser.firebaseId,
        pairs: [{ input: 'input3', output: 'output3' }],
        name: "notebook 3",
    });

    for (const nb of [newNB, newNB2, newNB3]) {
        await users.findOneAndUpdate(
          { _id: newUser._id },
          { $push: { notebooks: nb.insertedId } },
          { returnDocument: 'after' }
        );
    }

    closeConnection();
}

main();
