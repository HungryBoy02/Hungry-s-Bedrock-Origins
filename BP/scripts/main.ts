// This file demonstrates that the code is working by
// Spamming the chat with "Hello World"

// Import world component from "@minecraft/server"
import { initialize } from './libs/horiginsapi.js'
initialize()

import * as actionbarApi from "./libs/multi_addon_actionbar.js"
actionbarApi.initiate()
import './events.js'

// Register origins
import './origins/fox.js'
import './origins/raccoon.js'
import './origins/creeper.js'
import './origins/merling.js'
import './origins/enderian.js'
import './origins/elytran.js'