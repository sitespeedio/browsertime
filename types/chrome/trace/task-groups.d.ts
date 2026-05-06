/**
 * Look up the group for a trace event by name. Falls through to
 * prefix matching for event-name families that share a structural
 * pattern (`V8.GC*` for any V8 GC phase) so we don't have to
 * enumerate every phase name Chrome ships. Returns undefined when
 * no group matches; callers should fall back to `taskGroups.other`.
 */
export function groupForEvent(name: any): any;
export namespace taskGroups {
    namespace parseHTML {
        let id: string;
        let label: string;
        let traceEventNames: string[];
    }
    namespace styleLayout {
        let id_1: string;
        export { id_1 as id };
        let label_1: string;
        export { label_1 as label };
        let traceEventNames_1: string[];
        export { traceEventNames_1 as traceEventNames };
    }
    namespace paintCompositeRender {
        let id_2: string;
        export { id_2 as id };
        let label_2: string;
        export { label_2 as label };
        let traceEventNames_2: string[];
        export { traceEventNames_2 as traceEventNames };
    }
    namespace scriptParseCompile {
        let id_3: string;
        export { id_3 as id };
        let label_3: string;
        export { label_3 as label };
        let traceEventNames_3: string[];
        export { traceEventNames_3 as traceEventNames };
    }
    namespace scriptEvaluation {
        let id_4: string;
        export { id_4 as id };
        let label_4: string;
        export { label_4 as label };
        let traceEventNames_4: string[];
        export { traceEventNames_4 as traceEventNames };
    }
    namespace garbageCollection {
        let id_5: string;
        export { id_5 as id };
        let label_5: string;
        export { label_5 as label };
        let traceEventNames_5: string[];
        export { traceEventNames_5 as traceEventNames };
    }
    namespace other {
        let id_6: string;
        export { id_6 as id };
        let label_6: string;
        export { label_6 as label };
        let traceEventNames_6: string[];
        export { traceEventNames_6 as traceEventNames };
    }
}
export const taskNameToGroup: {};
//# sourceMappingURL=task-groups.d.ts.map