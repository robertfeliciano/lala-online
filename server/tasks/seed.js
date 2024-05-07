import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import * as col from '../config/mongoCollections.js';

const main = async () => {
    const db = await dbConnection();
    await db.dropDatabase();

    const users = await col.users();
    let newUser = await users.insertOne({
        firebaseId: "yjr3nW5daGO4QOkZBVvGnEoujTI2",
        notebooks: [],
        documents: []
    });

    const docs = await col.documents();
    const nbs = await col.notebooks();

    newUser = await users.findOne({_id: newUser.insertedId});

    const newDoc = await docs.insertOne({
        ownerFid: newUser.firebaseId,
        file: `
        let a = 1 0 0 ; 0 1 0 ; 0 0 1
        let b = 1 2 3 ; 4 5 6 ; 7 8 9
        let c = a @ b
        // c should equal b
        // note that this matrix does not have an inverse !
        c
        `,
        name: "dot products!",
        date: new Date('12/19/2023')
    });
    const newDoc2 = await docs.insertOne({
        ownerFid: newUser.firebaseId,
        file: `
          fun myFunction = (a b) => {
            let c = a @ b    // dot product
            let d = % c    // transpose
            let e = (? d) ** (2 1 3 ; 9 1 4 ; 8 1 7)    // inverse and elem-wise multiplication
            e
          }
          
          /* 
          wrapper is going to return the function myFunction
          */  
          fun wrapper = () => {
            myFunction
          }
          
          let m = 1 0 0 ; 0 1 0 ; 0 0 1
          let n = 1 2 3 ; 4 5 6 ; 7 8 10
          
          let anon = wrapper()
          let z = anon(m n)
          z`,
        name: "first class functions",
        date: new Date('4/5/2023')
    });

    for (const doc of [newDoc, newDoc2]) {
        await users.findOneAndUpdate(
          { _id: newUser._id },
          { $push: { documents: doc.insertedId } },
          { returnDocument: 'after' }
        );
    }

    const newNB = await nbs.insertOne({
        ownerFid: newUser.firebaseId,
        pairs: [{ input: 'let a = 1 0 0 ; 0 1 0 ; 0 0 1', output: '' }],
        name: "notebook 1",
        date: new Date('3/22/2024')
    });
    const newNB2 = await nbs.insertOne({
        ownerFid: newUser.firebaseId,
        pairs: [{ input: `
        fun coolFun = (p1 p2) => {
          let tmp = p1 @ p2
          let tmp = % tmp
          tmp
        }
        
        let a = 1 2 ; 3 4 
        let b = 3 4 ; 1 2
        let c = coolFun(a b)
        c
        `, output: '' }],
        name: "notebook 2",
        date: new Date('1/4/2024')
    });
    const bigNB = await nbs.insertOne({
        ownerFid: newUser.firebaseId,
        pairs: [
            { input: 'let a = 1 2 ; 3 4\na', output: '' },
            { input: 'let b = 5 6 ; 7 8', output: '' },
            { input: 'let c = a @ b', output: '' },
        ],
        name: "big notebook",
        date: new Date()
    })

    for (const nb of [newNB, newNB2, bigNB]) {
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
