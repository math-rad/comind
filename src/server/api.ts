import { v7 } from "uuid"
import fixedIds from "./fixed-ids.json" with {type: "json"}
import { getEnvironmentData } from "worker_threads"
import { loadEnvFile } from "process"
import { Script } from "vm"

export class API {
    public static nodes: Record<string, InstanceType<typeof API.Node>> = {}
    public static prevID: string

    public static fetchNode(NodeId: string): InstanceType<typeof API.Node> {
        return API.nodes[NodeId]
    }

    private static getNode(node: InstanceType<typeof API.Node> | string) {
        return (typeof (node) === "string" ? API.fetchNode(node) : node)
    }

    private static getNodeID(node: InstanceType<typeof API.Node> | string) {
        return typeof(node) == "string" ? node : this.getNode(node).ID
    }

    public static Node = class {
        public ID: string
        public label?: string
        public modified?: string
        public edges: Record<string, string | InstanceType<typeof API.Node>> | Record<string, string | Array<InstanceType<typeof API.Node>>> = {}

        constructor(label?: string, ID?: string) {
            this.ID = ID || v7() // should I consider v7 parameters?
            this.label = label
            API.nodes[this.ID] = this

            this.edges.prevID = API.prevID
            if (API.getNode(API.prevID)) {
                API.getNode(API.prevID).edges.nextID = this.ID
            }

            API.prevID = this.ID
        }

        public attachNode(node: InstanceType<typeof API.Node> | string, label: string) {
            this.edges[label] = API.getNodeID(node)
        }

        private prepareBranch(branch: string) {
            if (!this.edges[branch]) {
                this.edges[branch] = []
            }
        }

        public attachNodeToBranch(branch: string, node: InstanceType<typeof API.Node> | string) {
            this.prepareBranch(branch)
            this.edges[branch].push(API.getNodeID(node))
        }

    }

    public static Node_sys_layer = class extends API.Node {
        constructor(label?: string, ID?: string) {
            super(label, ID)
        }

        tag(...tags: (InstanceType<typeof API.Node> | string)[]) {
            for (var tag in tags) {
               this.attachNodeToBranch("tags", API.getNodeID(tag))
            }
        }

        setType(type: InstanceType<typeof API.Node> | string) {
            this.attachNode(API.getNodeID(type), "type")
        }
    }

    public static Container = class extends API.Node_sys_layer {
        constructor(label: string, members?: Array<InstanceType<typeof API.Node> | string>, ID?: string) {
            super(label, ID)
            this.setType(fixedIds.types.container)
            if (members) {
                for (var member of members) {
                    this.addMember(API.getNode(member))
                }
            }
        }

        addMember(node: InstanceType<typeof API.Node> | string) {
            node = API.getNode(node)
            this.attachNodeToBranch("members", node.ID)
            node.attachNodeToBranch("memberships", this.ID)
        }

        addMembers(...nodes: (InstanceType<typeof API.Node> | string)[]) {
            for (let node of nodes) {
                this.addMember(node)
            }
        }
    }

    public static Enum = class extends API.Container {
        constructor(label: string, members?: Array<InstanceType<typeof API.Node> | string>, ID?: string) {
            super(label, members, ID)
            this.setType(fixedIds.types.enum)
        }
    }

    public static Type = class Type extends API.Enum {
        constructor(label: string, members?: Array<InstanceType<typeof API.Node> | string>, ID?: string) {
            super(label, members, ID)
            this.setType(fixedIds.types.type)
        }
    }

    public static Tag = class Tag extends API.Enum {
        constructor(label: string, members?: Array<InstanceType<typeof API.Node> | string>, ID?: string) {
            super(label, members, ID)
            this.setType(fixedIds.types.tag)
        }
    }

    public static File = class File extends API.Node_sys_layer {
        path: string
        constructor(path: string, label: string, ID?: string) {
            super(label, ID)
            this.path = path
            this.setType(fixedIds.types.file)
            this.tag(fixedIds.tags.internal.document, fixedIds.tags.internal.organizational)
        }
    }

    public static interfaceEnums: {
        textual: InstanceType<typeof API.Enum>
        semitextual: InstanceType<typeof API.Enum>
        canvas: InstanceType<typeof API.Enum>
        custom: InstanceType<typeof API.Enum>
    }

    public static Interface = class extends API.Node_sys_layer {
        mode: InstanceType<typeof API.Enum>
        source: InstanceType<typeof API.Module>
        constructor(mode:InstanceType<typeof API.Enum>, label: string, source: InstanceType<typeof API.Module>) {
            super(label)
            this.setType(fixedIds.types.interface)
            this.tag(fixedIds.tags.internal.functional)
            this.mode = mode
            this.source = source
        }
    }

    constructor() {
        const internal_tags = new API.Tag("internal", [
            new API.Tag("organizational", [], fixedIds.tags.internal.organizational),
            new API.Tag("functional", [], fixedIds.tags.internal.functional),
            new API.Tag("primitive", [], fixedIds.tags.internal.primitive)
        ], fixedIds.tags.internal.internal)
        const types = new API.Container("types", [
            new API.Type("container", [], fixedIds.types.container),
            new API.Type("enum", [], fixedIds.types.enum),
            new API.Type("tag", [], fixedIds.types.tag),
            new API.Type("module", [], fixedIds.types.module),
            new API.Type("module", [], fixedIds.types.file),
            new API.Type("module", [], fixedIds.types.script)
        ])
        API.interfaceEnums =  {
            textual: new API.Enum("textual", [], fixedIds.enums.interface.textual),
            semitextual: new API.Enum("semitextual", [], fixedIds.enums.interface.semitextual),
            canvas: new API.Enum("canvas", [], fixedIds.enums.interface.canvas),
            custom: new API.Enum("custom", [], fixedIds.enums.interface.custom)
        }
    }
}