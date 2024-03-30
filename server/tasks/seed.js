import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import * as col from '../config/mongoCollections.js';

const main = async () => {
    const db = await dbConnection();
    await db.dropDatabase();

    const users = await col.users();
    let newUser = await users.insertOne({
        firebaseId: "a2JTGDDkBPSJjHCYMTt2KsdMgAD3",
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
        date: new Date('12/19/2023')
    });
    const newDoc2 = await docs.insertOne({
        ownerFid: newUser.firebaseId,
        file: "i am another new doc",
        name: "document 2",
        date: new Date('4/5/2023')
    });
    const newDoc3 = await docs.insertOne({
        ownerFid: newUser.firebaseId,
        file: "i am a third new doc",
        name: "document 3",
        date: new Date('8/1/2023')
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
        date: new Date('3/22/2024')
    });
    const newNB2 = await nbs.insertOne({
        ownerFid: newUser.firebaseId,
        pairs: [{ input: 'input2', output: 'output2' }],
        name: "notebook 2",
        date: new Date('1/4/2024')
    });
    const newNB3 = await nbs.insertOne({
        ownerFid: newUser.firebaseId,
        pairs: [{ input: 'input3', output: 'output3' }],
        name: "notebook 3",
        date: new Date('9/05/2023')
    });
    const bigNB = await nbs.insertOne({
        ownerFid: newUser.firebaseId,
        pairs: [
            { input: 'let a = 1 2 ; 3 4\na', output: '1 2 ; 3 4' },
            { input: '/dbg', output: 'a := 12 ; 34' },
            { input: '//hmmmmm', output: '' },
            { input: 'let b = ident(1)\nb', output: '1 0 ; 0 1' },
            { input: 'b@a', output: '1 2 ; 3 4' },
            { input: '//vectors..', output: 'yess...' },
            { input: 'almost done', output: 'output' },
            { input: 'finally', output: 'yes!' },
        ],
        name: "big notebook",
        date: new Date()
    })

    for (const nb of [newNB, newNB2, newNB3, bigNB]) {
        await users.findOneAndUpdate(
          { _id: newUser._id },
          { $push: { notebooks: nb.insertedId } },
          { returnDocument: 'after' }
        );
    }
    console.log("Done seeding DB");
    closeConnection();
}

main();
