import { API as comindAPI} from "./api.ts";
import {colorize} from "json-colorizer"
const {Container, Enum, Type, Tag, Interface, interfaceEnums} = comindAPI

const API = new comindAPI()

const myEnum = new Enum("myContainer", [
    new Enum("thing", [], "thingid"),
    new Enum("that", [], "thatid")
], "asd")

console.log(colorize(JSON.stringify(comindAPI.nodes, undefined, '\t')))
