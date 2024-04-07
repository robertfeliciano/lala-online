#!/bin/bash

wasm-pack build lala/
rm -rf client/src/wasm/
mkdir client/src/wasm/
cp lala/pkg/lala_lib.js lala/pkg/lala_lib_bg.js lala/pkg/lala_lib_bg.wasm client/src/wasm
