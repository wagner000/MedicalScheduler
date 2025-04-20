#!/bin/bash
export NG_CLI_ANALYTICS=false
npx --yes ng serve --host=0.0.0.0 --port=5000 --public-host=$(hostname -I | awk '{print $1}'):5000