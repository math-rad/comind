import { v7 } from "uuid"
import { readFile, writeFile } from "fs/promises"
import fixedIds from "./fixed-ids.json" with {type: "json"}

export class API {
    public static fetchNode(NodeId: string): InstanceType<typeof API.Node> {
        return new this.Node()
    }

    public static Node = class NODE {
        public ID: string
        public type?: string
        public tags: Array< | string>
        public modified?: Array<string>

        constructor(ID?: string) {
            this.ID = ID || v7() // should I consider v7 parameters?
            this.tags = []
        }

        public tag() {

        }
    }

    public static Enum = class Enum extends API.Node {
        public members: (Enum | string)[]
        public parent?: typeof API.Node
        public label: string

        type = fixedIds.types.enum

        constructor(label: string, members?: (Enum | string)[], ID?: string) {
            super(ID)
            this.label = label
            this.members = []
            if (members) {
                for (var member of members) {
                    switch (typeof (member)) {
                        case "string": {
                            //@ts-expect-error
                            this.parent = this

                        }
                    }
                }
            }

        }
    }

    public static Type = class Type extends API.Enum {
        type = fixedIds.types.type

        constructor(label: string, typeChildren?: Type[], ID?: string) {
            super(label, typeChildren, ID)
        }
    }

    public static Tag = class Tag extends API.Enum {
        public type = fixedIds.types.tag
    }

    types = new API.Type("enum", [
        new API.Type("type", [], fixedIds.types.type),
        new API.Type("tag", [], fixedIds.types.tag)
    ], fixedIds.types.enum)
    
}