# Lala Online

Online interpreter for Lala - the Linear Algebra Language

Set up your environment using the following steps:

## Dependencies:
1. Rust
2. A MongoDB server
3. A Redis storage instance
4. A Firebase Authentication Project

## Install Rust and wasm-pack
1. Install Rust. Use [this guide](https://www.rust-lang.org/tools/install) to get started.
    - **Note:** it is a *lot* easier to install Rust on a Mac or Linux machine.
2. Install wasm-pack. Use [this site](https://rustwasm.github.io/wasm-pack/installer/) for help.
    - I prefer to simlpy type `cargo install wasm-pack` once Rust and Cargo (the package manager for Rust) have been
    set up in the previous step.

## Setting up the Lala interpreter
Rust is a compiled language, so we're going to have to build our interpreter. This is probably the trickiest part
of the set-up, because we have to build it *twice*: once to compile it to wasm to interpret our Lala code
directly on the frontend, and a second time to set up the SocketIO server to enable our Lala Notebooks.
Let's get started.

If you are in the root directory of this project (`lala-online/`), you can enter the directory that houses Lala by typing
`cd lala`. **PLEASE** do the following steps *in this order*. 

First we're going to compile the interpreter to wasm. Open the `Cargo.toml` file. You can think of this as a `package.json` 
file for Rust projects. We need to remove every dependency starting with "socketioxide". To help you, I have provided a dependency 
section with these dependencies removed. Here it is:
```
[dependencies]
anyhow = "1.0.80"
pest = "2.7.7"
pest_derive = "2.7.7"
wasm-bindgen = "0.2.91"
```
Please replace the current dependency section with this one. We *cannot* compile to wasm with those dependencies, but we will
need them later. Save the file. Go back to the root directory of this project: `cd ..`

I have provided a bash script that compiles the interpreter to wasm and copies the result to the `client/` directory for the frontend
to use. Please now run `./build_lala.sh`. If you do not permission to execute the script, run `chmod 744 build_lala.sh`. 

Once that finishes, go back into the lala directory: `cd lala`. We are going to add the dependencies back into the `Cargo.toml` file.
Again, I have provided the correct dependency list:
```
[dependencies]
anyhow = "1.0.80"
pest = "2.7.7"
pest_derive = "2.7.7"
wasm-bindgen = "0.2.91"
socketioxide = "0.8"
tokio = { version = "1", features = ["full"] }
tracing = "0.1"
tracing-subscriber = "0.3"
axum = "0.6"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tower-http = { version = "0.4", features = ["cors"] }
tower = "0.4"
```
Just replace the older, shorter dependency list with this one. 

Now, we are going to build our socketio Rust server for the Lala notebooks. Simply run `cargo build --release`. 

If you are interested in why we couldn't just build the socketio server first and then compile the interpreter to wasm,
I will briefly explain. If we first compile the server, then remove dependencies from the `Cargo.toml` file, then compile
to wasm, and *then* run our application, Rust will notice that `Cargo.toml` has been changed *after* the last build was compiled
and attempt to recompile. Without the dependencies, we cannot build the socketio server. 

Cool! We are done building both of our Lala interpreters. 

## Install MongoDB
1. This part is pretty simple. Install MongoDB using [the official guide](https://www.mongodb.com/docs/manual/installation/).
    - I am on version 4.4.4

## Install Redis
1. Also pretty simple. Install Redis using [the official guide](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/).
    - I am on Redis server version 7.0.14. I am *not* using Redis-stack (it is not supported on my Linux distro).

## Set up A Firebase Authentication project
1. Create a Firebase Authentication project in the Firebase console. 
2. Go to the "Settings" page of the Firebase project. Click "Service Accounts" and then "Generate New Private Key". Download this key
(it's just a `.json` file and note where it is saved. Try making sure it is saved to the `server` directory of this project, just to 
make the next step easier.
3. We need to create two `.env` files: one in the `client` directory and one in the `server` directory. 

The server `.env` file is simple. It just contains the following value:
Variable | Type | Value
-|-|-
GOOGLE_CREDENTIALS|string|A file path to the `.json` file with the Google service account credentials. 

So my `.env` file in my `server` directory looks like this: 
```
GOOGLE_CREDENTIALS="./lala-firebase-key.json"
```


Now for the client `.env` file. 
Variable | Type | Value 
-|-|-
VITE_FIREBASE_KEY|string|Firebase key
VITE_FIREBASE_DOMAIN|string|Firebase domain
VITE_FIREBASE_PROJECT_ID|string|Firebase project id
VITE_FIREBASE_STORAGE_BUCKET|string|Firebase storage bucket
VITE_FIREBASE_SENDER_ID|string|Firebase sender id
VITE_FIREBASE_APP_ID|string|Firebase app id
VITE_MEASUREMENT_ID|string|Firebase measurement id
VITE_APP_BACKEND|string|URL to the Mongo+Redis backend (with port number)
VITE_KERNEL_ENDPOINT|string|URL to the socketio server endpoint

The first seven values come from Firebase. On the "Settings" page, scroll down and look at the code block. They can be copied and 
pasted into this `.env` file in the exact order they appear.

The second to last value, VITE_APP_BACKEND, will be provided by me: "http://127.0.0.1:4000/api/". Please insert this into the 
`.env` file and please don't change it. If you must change it, go to `server/src/server.js` and change the port on line 75 and
use that port here.

The last value, "VITE_KERNEL_ENDPOINT" will be provided by me: "http://127.0.0.1:8080". Please use this one as the socketio server
hosts itself on port 8080. If anything on your computer is running on port 8080, try killing it. If you can't, go to line 113 of 
`lala/src/main.rs` and change the address to whatever local port you want. Keep the ampersand ("&") in the front. 
So the line would be: `axum::Server::bind(&"127.0.0.1:<YOUR_PORT_HERE>".parse().unwrap())`. Rebuild the socketio server using the steps
above. If you have any trouble with this, do not hesitate to reach out to me for help.

## Setting up JS dependencies
Almost done. Let's set up our Javascript dependencies
Run these commands: 

`npm i -g concurrently`
`cd server`
`npm i`
`cd ../client`
`npm i`
`cd ..`

## Seeding
`npm run flush` this will flush the redis cache on your machine
`npm run seed`  this will seed the database for our test user

## Running Lala Online
`npm start`

You'll see a lot of output on your screen; that's because we've launched our mongo server, react client, and lala socketio server all at once.

To get started using Lala Online, consult the Guide page once you sign in!

If you like, you can signin using the Test User credentials provided in a Markdown file called
`TestUserCreds.txt`.