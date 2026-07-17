/**
 * Trace-event → group classifier.
 *
 * The original list (from @sitespeed.io/tracium 0.3.3, extracted from
 * Lighthouse circa 2017) is too narrow for modern Chrome traces — it
 * only knew about ~30 event names, so half the trace fell through to
 * "other" on a busy 2026-era page. This expanded list adds the
 * events we actually see today, drawing from:
 *
 *   - Modern Lighthouse `core/lib/tracehouse/task-groups.js`
 *   - WebPageTest's `MAIN_THREAD_CATEGORY_MAP` in waterfall-tools
 *     (`src/core/mainthread-categories.js`, mirroring the reference
 *     PHP implementation at Sample/Implementations/webpagetest/
 *     www/waterfall.inc#L437-L491)
 *   - Direct sampling of trace.json from real cnet / theverge runs
 *
 * The seven-bucket structure is unchanged so the existing UI
 * categories keep working. Append-only when adding events for
 * future Chrome versions — don't move events between groups
 * without checking how it affects the rollups in
 * `parseCpuTrace.js`.
 */

export const taskGroups = {
  parseHTML: {
    id: 'parseHTML',
    label: 'Parse HTML & CSS',
    traceEventNames: [
      'ParseHTML',
      'ParseAuthorStyleSheet',
      // Document parsing / navigation pipeline — these fire during
      // the initial HTML/CSS parse phase, even though they're not
      // strictly "parse" events. Counting them as parse-time gives
      // a more honest "time spent loading the document" signal.
      'CommitLoad',
      'DocumentLoader::CommitNavigation',
      'DecodedDataDocumentParser::AppendBytes',
      // Resource lifecycle events emitted on the main thread for
      // the document and its sub-resources. waterfall-tools groups
      // them with parsing for the same reason — they're part of the
      // page-load critical path, not arbitrary "other" work.
      'ResourceSendRequest',
      'ResourceReceiveResponse',
      'ResourceReceivedData',
      'ResourceReceivedResponse',
      'ResourceFinish',
      'ResourceChangePriority',
      // Document/navigation body loading internals (sampled from real
      // Wikipedia traces, July 2026) — the main-thread side of
      // streaming the document into the parser. Same rationale as the
      // resource lifecycle events above.
      'DocumentLoader::DocumentLoader',
      'DocumentLoader::HandleData',
      'DocumentLoader::CommitData',
      'DocumentLoader::BodyDataReceivedImpl',
      'DocumentLoader::BodyLoadingFinished',
      'DocumentLoader::FinishedLoading',
      'NavigationBodyLoader::OnReadable',
      'NavigationBodyLoader::ReadFromDataPipe',
      'URLLoader::Context::OnReceivedResponse',
      'URLLoader::Context::OnCompletedRequest',
      'URLLoader::Context::Cancel',
      'ThrottlingURLLoader::OnReceiveResponse',
      'ResourceRequestSender::OnReceivedResponse',
      'ResourceRequestSender::OnRequestComplete'
    ]
  },
  styleLayout: {
    id: 'styleLayout',
    label: 'Style & Layout',
    traceEventNames: [
      'ScheduleStyleRecalculation',
      'UpdateLayoutTree', // previously RecalculateStyles
      'RecalculateStyles', // older Chrome name
      'InvalidateLayout',
      'Layout',
      // IntersectionObserver callbacks query layout to compute
      // which observed elements have crossed their thresholds; on
      // ad-heavy pages this can be hundreds of ms.
      'IntersectionObserverController::computeIntersections'
    ]
  },
  paintCompositeRender: {
    id: 'paintCompositeRender',
    label: 'Rendering',
    traceEventNames: [
      'Animation',
      'HitTest',
      'PaintSetup',
      'Paint',
      'PaintImage',
      'RasterTask', // Previously Rasterize
      'Rasterize',
      'ScrollLayer',
      'UpdateLayer',
      'UpdateLayerTree',
      'CompositeLayers',
      // Modern compositor pipeline phases (Chrome ~M100+) that
      // didn't exist when the original list was written.
      'PrePaint',
      'Commit',
      'Layerize',
      'BeginFrame',
      'BeginMainThreadFrame',
      'DrawFrame',
      // Image decode work happens on the main thread when the
      // off-thread decoder can't keep up.
      'DecodeImage',
      'Decode Image',
      'ImageDecodeTask',
      'GPUTask',
      'SetLayerTreeId'
    ]
  },
  scriptParseCompile: {
    id: 'scriptParseCompile',
    label: 'Script Parsing & Compilation',
    traceEventNames: [
      'v8.compile',
      'v8.compileModule',
      'v8.parseOnBackground',
      'v8.parseFunction',
      // Context creation + V8 snapshot deserialization — these are
      // the V8 startup costs that fire before any user JS runs.
      'V8.DeserializeContext',
      'LocalWindowProxy::CreateContext'
    ]
  },
  scriptEvaluation: {
    id: 'scriptEvaluation',
    label: 'Script Evaluation',
    traceEventNames: [
      'EventDispatch',
      'EvaluateScript',
      'v8.evaluateModule',
      'FunctionCall',
      'TimerFire',
      'TimerInstall',
      'TimerRemove',
      'FireIdleCallback',
      'FireAnimationFrame',
      'RunMicrotasks',
      'V8.Execute',
      // Modern V8 entry points (Chrome ~M115+) — `v8.run` and
      // `v8.callFunction` are the wrappers Chrome added when V8
      // reorganized its tracing categories.
      'v8.run',
      'v8.callFunction',
      'v8.callModuleMethod',
      'XHRLoad',
      'XHRReadyStateChange',
      // V8 housekeeping that only runs because JS is executing —
      // interrupt handling, stack guards, constructor instantiation.
      'v8.newInstance',
      'V8.InvokeApiInterruptCallbacks',
      'V8.HandleInterrupts',
      'V8.BytecodeBudgetInterrupt',
      'V8.StackGuard'
    ]
  },
  garbageCollection: {
    id: 'garbageCollection',
    label: 'Garbage Collection',
    traceEventNames: [
      'MinorGC', // Previously GCEvent
      'MajorGC',
      'BlinkGC.AtomicPhase',
      'BlinkGCMarking',
      'ThreadState::performIdleLazySweep',
      'ThreadState::completeSweep',
      'Heap::collectGarbage',
      // V8 GC events — there are many specific phase names but they
      // all share the `V8.GC` prefix (V8.GCScavenger, V8.GCFinalizeMC,
      // V8.GC_SCAVENGER_SCAVENGE_PARALLEL_PHASE, etc.). Specific
      // names are listed for fast exact-match; the prefix fallback
      // in groupForEvent() catches the rest.
      'V8.GCScavenger',
      'V8.GCFinalizeMC',
      'V8.GCMarkCompact',
      'V8.GCIncrementalMarking',
      'V8.GCCompactor',
      'V8.GC_SCAVENGER_SCAVENGE_PARALLEL_PHASE'
    ]
  },
  other: {
    id: 'other',
    label: 'Other',
    traceEventNames: [
      'MessageLoop::RunTask',
      'TaskQueueManager::ProcessTaskFromWorkQueue',
      'ThreadControllerImpl::DoWork',
      // The top-level scheduler wrapper. Its self-time is the
      // residual after children run — the "Chrome scheduling
      // overhead" portion. Was missing from the old list and
      // dominated the "other" bucket on busy pages.
      'RunTask',
      'ThreadControllerImpl::RunTask'
    ]
  }
};

export const taskNameToGroup = {};
for (const group of Object.values(taskGroups)) {
  for (const traceEventName of group.traceEventNames) {
    taskNameToGroup[traceEventName] = group;
  }
}

/**
 * Look up the group for a trace event by name. Falls through to
 * prefix matching for event-name families that share a structural
 * pattern (`V8.GC*` for any V8 GC phase) so we don't have to
 * enumerate every phase name Chrome ships. Returns undefined when
 * no group matches; callers should fall back to `taskGroups.other`.
 */
export function groupForEvent(name) {
  const exact = taskNameToGroup[name];
  if (exact) return exact;
  if (typeof name === 'string' && name.startsWith('V8.GC')) {
    return taskGroups.garbageCollection;
  }
}
