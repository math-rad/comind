import { v7 } from "uuid"
import { readFile, writeFile } from "fs/promises"
import fixedIds from "./fixed-ids.json" with {type: "json"}

export class API {
    public static nodes: Record<string, InstanceType<typeof API.Node>> = {}
    public static fetchNode(NodeId: string): InstanceType<typeof API.Node> {
        return API.nodes[NodeId]
    }

    public static Node = class {
        public ID: string
        public type?: string
        public modified?: string
        public edges: Record<number | string, InstanceType<typeof API.Node> | string>

        constructor(ID?: string) {
            this.ID = ID || v7() // should I consider v7 parameters?
            this.edges = {}

            API.nodes[this.ID] = this
        }

        public attach(node: InstanceType<typeof API.Node>, label: string) {
            this.edges[label] = node
        }
    }

    public static Container = class extends API.Node {
        public members: (InstanceType<typeof API.Node> | string)[]
        public label: string
        constructor(label: string, members?: Array<InstanceType<typeof API.Node> | string>, ID?: string) {
            super(ID)
            this.members = members || []
            this.label = label

            if (members) {
                for (var member of members) {
                    switch (typeof (member)) {
                        case "string": {
                            this.addMember(API.nodes[member])
                            break
                        };
                        default: {
                            this.addMember(member)
                        }
                    }
                }
            }
        }

        addMember(node: InstanceType<typeof API.Node> | string) {
            this.members.push(node);
            (typeof(node) == "string"? API.nodes[node] : node).attach(this, this.label)
            
        }
    }

    public static Enum = class Enum extends API.Container {
        type = fixedIds.types.enum
    }

    public static Type = class Type extends API.Enum {
        type = fixedIds.types.type

    }

    public static Tag = class Tag extends API.Enum {
        public type = fixedIds.types.tag
        
    }

    constructor() {
        new API.Container("types", [
            new API.Type("container", [], fixedIds.types.container),
            new API.Type("enum", [], fixedIds.types.enum),
            new API.Type("tag", [], fixedIds.types.tag),
            new API.Type("module", [], fixedIds.types.module),
        ], "types")
    }
}