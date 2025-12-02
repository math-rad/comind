**EVERYTHING IS A NODE**
###### meant for me to read as of writing this 

## **BACK-END**

##### **STORAGE**

*   Every node is identified by a UUID
*   Every node is stored in:
    *   A file system where the path segregates by segments of the UUID
        *   /\[S1\]/\[S…\]/\[SN\]/\[UUID\].json where S indicates a  shared segment/shard of a family of UUIDs
    *   A SQL database for recording information of the node such as meta data, properties, relational information, and tags
        *   It indexed by its UUID within the database, and, when needed, the path to the JSON storage object is implicitly known / reconstructable during runtime, therefore need NOT be stored in the SQL database

### NODES

*   Every node upon its creation is linked to a _special_ time node, which tracks the instantaneous moment a node was created, and potentially altered upon a more sophisticated implementation

#### Querying & Indexing

Each _time_ node respectively links itself to an automatically created succeeding unit of time node, i.e., second; minute; hour; day; week; month; year; etc., and each instantaneous node and unit node links itself both to its respective node and the previous instantaneous moment / unit, which makes for easy sequential tracking, and provides the fundamental framework for indexing information because querying will recall by chronological order, filtering/skipping and noting which next node matches the query criteria. 

The notation for querying is up in the air however the modes envisioned per both content specific and name specific are:

*   content
*   starts with
*   regex?

*   implementation details:
    *   a potential process:
        1.  t(ignored)
        2.  th(potentially ignored)
        3.  the → triggers trunk of tree for context specific parameter BASE “the”, searching from the LATEST node to the OLDEST node by means of the _time_ nodes' relational structure
        4.  BRANCH
            1.  the th → divides trunk, truncating all that follows not meeting criteria exclusive to 'th'
            2.  the wh → does the same as the former
                
                → these networks are preserved in a cache potentially located in the SQL database

Querying will also be possible via tags.

## INTERFACE

It will be a text based interface that follows a command-esque paradigm. Commands themselves are nodes, though top level, or what is ever that which may be globally referred to; and such embedded interfaces operate through a special type of node, a _functional_ node, which contain code. Every functional node denotes itself to be one of the following:

*   Textual
    *   completely textual, with potential for some UI
*   Semi-textual
    *   for more sophisticated-pixel based-UI but ultimately textual
*   Canvas
    *   The code completely relies on a canvas accessible through the NODE API
    *   Text still can be rendered, and input too, but the mode of interaction moves to the mouse or touch screen
*   Custom
    *   May not be distinguishable from canvas, but left distinct for emphasis on a complete custom implementation

### Notation

*   “x→y”
    *   linking nodes such that now a new implicit node is created and copied, where now both x and y refer to that.
    *   potential issues with this, if x and y are already both existent
    *   used for short hand notation, and possibly for implicating parameters
    *   assign <name>/<label> → todo … #school
        *   #school somehow leads to the propagated node being assigned the #school tag

### Envisioned core “app nodes”

*   “jot” / “thinking”
    *   A semi-textual to canvas level app used to write down thoughts.
    *   A “notion” may be created and placed at the root space for all thoughts, but may also be attached to other _nodes_
    *   A “notion” has various attachment styles to other “notions" such as:
        *   sequential
        *   page based
        *   canvas
        *   key/index
    *   A “notion” **need not be attached to a “notion”**
        *   This is intentional to enable sentiment in your actions; for example, you create a timer, a reminder, anything which propagates a node, this will, by virtue of the atomic implementation, be attachable(become related to, i.e, somewhere in the meta of the desired node it shall reference itself in an array of references) allow a notion to be attached to any node
    *   This interface will heavily rely on the fundamental query API exposed in the NODE API, and should it be implemented ideally, the API exposes a streamable method so that current matches are piped back while query notation and context is piped in.
    *   this, of course, allows for tags to be attached to notions, but again, assume tags are attachable to anything
*   “ENUM”
    *   A utility node to create enum functioning nodes which serve as additional labels, and are ultimately a more sophiticated version of a tag as these support hierarchical enums(nodes)
    *   would serve useful for the task manager
*   “timer” / “remind”
    *   A smaller app for reminding
    *   upon a timer or reminder being instantiated, 2 time nodes are attached, the instantaneous moment, and the future moment at which the device is triggered, which places that respective time node into the scheduler and handles future operations accordingly
    *   you can, of course, add details in a field provided as well as tags
    *   you can also reuse timers and reminders by referencing previous nodes, which here, has the querying API filter for respective device node types here
    *   you can also create a stop watch
    *   if implemented, such timers might be visible on the homescreen of the app, or visible in other areas, and optionally hidden
*   “todo”
    *   potential canvas interface, meant to be semi-textual
    *   create tasks and track them, assign them labels, priorities, etc.
    *   meant to be one of the more sophisticated node apps and highly utilized
*   “headspace”
    *   shows attractive bubbles(based on relation) where a bubble represents a notion, or some node, and the more used / modified / “thought of” the larger it becomes.
        *   it can be useful, for example, say you jot something down with the intention to remember and / or pick it up at another point, you could jot it down and then later open “headspace”, look through the many bubbles, and identify what you want to do
*   “topl”
    
    *   a canvas node
    *   graphically generate a node graph with filters
        *   one could theoretically filter by “time” and view nodes most recently done and view the time period and what things were done around that period, such as a journal, etc.
            *   this could be extended and additionally filter for certain node types or other criteria, allowing you to view your notions and the ordered they were modified / created
        *   filter by tags, any critiera / query mode / etc.
        *   VISUALLY POWERFUL
