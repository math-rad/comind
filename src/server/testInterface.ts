import {API, Tag} from "./api.ts";
import {colorize} from "json-colorizer"

console.log(colorize(JSON.stringify(API.nodes, undefined, '\t')))