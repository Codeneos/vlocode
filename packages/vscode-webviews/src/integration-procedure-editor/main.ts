import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { VlocodeDialogComponent } from '../shared/components/dialog/dialog.component';
import { VlocodeEmptyStateComponent } from '../shared/components/empty-state/empty-state.component';
import type { monaco } from '../shared/components/monaco-editor/monaco-editor.component';
import { IpCanvasComponent } from './app/components/canvas/ip-canvas/ip-canvas.component';
import { IpInspectorComponent } from './app/components/inspector/ip-inspector/ip-inspector.component';
import { IpRailComponent } from './app/components/rail/ip-rail/ip-rail.component';
import { IpToolbarComponent } from './app/components/toolbar/ip-toolbar/ip-toolbar.component';
import {
    defaultElementName,
    defaultPropertySet,
    elementSummary,
    ELEMENT_TEMPLATES,
    uniqueElementName
} from './app/models/element-templates';
import { buildFlowTree, flattenElements, insertElementInFlow, isDescendantOf, moveElementIntoGroupInFlow, previousSiblingKey, removeElementTree, reorderElementInFlow, resequence } from './app/models/flow';
import {
    DEFAULT_LAYOUT,
    EMPTY_MODEL,
    INSPECTOR_KEYBOARD_RESIZE_STEP,
    INSPECTOR_TABS,
    normalizeLayout,
    type DataRaptorInputParameterFieldChange,
    type DropPosition,
    type ElementFieldChange,
    type ExtensionToWebviewMessage,
    type HeaderFieldChange,
    type InspectorTab,
    type InsertContext,
    type IntegrationProcedureElement,
    type IntegrationProcedureLayout,
    type IntegrationProcedureModel,
    type LeftTab,
    type MapEntriesChange,
    type Problem,
    type PropertyValueChange,
    type ReferenceOpen,
    type WebviewToExtensionMessage
} from './app/models/integration-procedure.model';
import { asRecord, dataRaptorInputParameters as getDataRaptorInputParameters, isRecord, setObjectValue, stringifyValue } from './app/models/property-set';
import { validateModel } from './app/models/validation';
import { getErrorMessage } from '../shared/utils/object';
import { registerWebviewApi, type WebviewApi } from '../shared/utils/webview-clipboard';

declare const acquireVsCodeApi: undefined | (() => VsCodeApi);

const DRAG_ELEMENT_MIME = 'application/x-vlocode-ip-element';
const DRAG_TEMPLATE_MIME = 'application/x-vlocode-ip-template';
const EMPTY_FLOW_DROP_KEY = '__empty-flow__';

interface VsCodeApi {
    postMessage(message: WebviewToExtensionMessage): void;
}

const jsonEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    folding: true,
    foldingStrategy: 'auto',
    lineNumbersMinChars: 2,
    showFoldingControls: 'always'
};

@Component({
    selector: 'vlocode-integration-procedure-editor',
    standalone: true,
    imports: [IpCanvasComponent, IpInspectorComponent, IpRailComponent, IpToolbarComponent, VlocodeDialogComponent, VlocodeEmptyStateComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './app/app.component.html'
})
export class AppComponent {
    private readonly destroyRef = inject(DestroyRef);

    protected readonly addFilter = signal('');
    protected readonly error = signal<string | undefined>(undefined);
    protected readonly hasLoaded = signal(false);
    protected readonly inspectorTab = signal<InspectorTab>('settings');
    protected readonly insertFilter = signal('');
    protected readonly jsonDraft = signal('');
    protected readonly jsonError = signal<string | undefined>(undefined);
    protected readonly leftTab = signal<LeftTab>('outline');
    protected readonly model = signal<IntegrationProcedureModel>(EMPTY_MODEL);
    protected readonly outlineFilter = signal('');
    protected readonly pendingDeleteKey = signal<string | undefined>(undefined);
    protected readonly pendingInsert = signal<InsertContext | undefined>(undefined);
    protected readonly refreshing = signal(false);
    protected readonly saving = signal(false);
    protected readonly deploying = signal(false);
    protected readonly draggedKey = signal<string | undefined>(undefined);
    protected readonly draggedTemplateType = signal<string | undefined>(undefined);
    protected readonly dropPosition = signal<DropPosition | undefined>(undefined);
    protected readonly dropTargetKey = signal<string | undefined>(undefined);
    protected readonly openingSalesforce = signal(false);
    protected readonly selectedKey = signal<string | undefined>(undefined);
    protected readonly apexClasses = signal<string[]>([]);
    protected readonly dataMappers = signal<string[]>([]);
    protected readonly layout = signal<IntegrationProcedureLayout>({ ...DEFAULT_LAYOUT });

    protected readonly inspectorTabs = INSPECTOR_TABS;
    protected readonly emptyFlowDropKey = EMPTY_FLOW_DROP_KEY;
    protected readonly jsonEditorOptions = jsonEditorOptions;
    private readonly vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : undefined;
    private resizeCleanup?: () => void;

    protected readonly selectedElement = computed(() =>
        this.model().elements.find(element => element.key === this.selectedKey())
    );

    protected readonly pendingDeleteElement = computed(() =>
        this.model().elements.find(element => element.key === this.pendingDeleteKey())
    );

    protected readonly pendingDeleteChildCount = computed(() => {
        const element = this.pendingDeleteElement();
        return element ? this.descendantCount(element.key) : 0;
    });
    protected readonly pendingDeleteMessage = computed(() => {
        const childCount = this.pendingDeleteChildCount();
        return childCount
            ? `Delete this node and ${childCount} child ${childCount === 1 ? 'node' : 'nodes'}?`
            : 'Delete this node?';
    });

    protected readonly flowRows = computed(() => flattenElements(this.model().elements));
    protected readonly flowTree = computed(() => buildFlowTree(this.model().elements));

    protected readonly filteredOutline = computed(() => {
        const filter = this.outlineFilter().trim().toLowerCase();
        const rows = this.flowRows();
        if (!filter) {
            return rows;
        }
        return rows.filter(row => `${row.element.name} ${row.element.type} ${elementSummary(row.element)}`.toLowerCase().includes(filter));
    });

    protected readonly filteredTemplates = computed(() => {
        const filter = this.addFilter().trim().toLowerCase();
        if (!filter) {
            return ELEMENT_TEMPLATES;
        }
        return ELEMENT_TEMPLATES.filter(template => `${template.type} ${template.family} ${template.description}`.toLowerCase().includes(filter));
    });

    protected readonly filteredInsertTemplates = computed(() => {
        const filter = this.insertFilter().trim().toLowerCase();
        if (!filter) {
            return ELEMENT_TEMPLATES;
        }
        return ELEMENT_TEMPLATES.filter(template => `${template.type} ${template.family} ${template.description}`.toLowerCase().includes(filter));
    });

    protected readonly problems = computed(() => validateModel(this.model()));

    protected readonly dataMapperOptions = computed(() => {
        const current = this.propertyValue('bundle');
        return [...new Set([...this.dataMappers(), current].filter(Boolean))].sort((a, b) => a.localeCompare(b));
    });
    protected readonly apexClassOptions = computed(() => {
        const current = this.propertyValue('remoteClass');
        return [...new Set([...this.apexClasses(), current].filter(Boolean))].sort((a, b) => a.localeCompare(b));
    });

    protected readonly jsonTargetLabel = computed(() => this.selectedElement() ? 'selected element property set' : 'procedure property set');
    protected readonly inspectorCollapsed = computed(() => this.layout().inspectorCollapsed);
    protected readonly inspectorWidth = computed(() => `${this.layout().inspectorWidth}px`);
    protected readonly navigationCollapsed = computed(() => this.layout().leftCollapsed);

    constructor() {
        registerWebviewApi(this.vscode as WebviewApi | undefined);
        const handleWindowMessage = (event: MessageEvent) => this.handleMessage(event.data as ExtensionToWebviewMessage);
        window.addEventListener('message', handleWindowMessage);
        this.destroyRef.onDestroy(() => {
            window.removeEventListener('message', handleWindowMessage);
            this.stopInspectorResize();
        });
        effect(() => {
            this.jsonDraft.set(JSON.stringify(this.activePropertySet(), undefined, 4));
            this.jsonError.set(undefined);
        });
        if (this.vscode) {
            this.vscode.postMessage({ type: 'ready' });
        } else {
            this.hasLoaded.set(true);
        }
    }

    protected requestReload() {
        this.error.set(undefined);
        this.hasLoaded.set(false);
        this.vscode?.postMessage({ type: 'ready' });
    }

    protected save() {
        this.saving.set(true);
        this.vscode?.postMessage({ type: 'save', model: this.model() });
        window.setTimeout(() => this.saving.set(false), 800);
    }

    protected deploy() {
        this.deploying.set(true);
        this.vscode?.postMessage({ type: 'deploy', model: this.model() });
        window.setTimeout(() => this.deploying.set(false), 1200);
    }

    protected refresh() {
        this.refreshing.set(true);
        this.vscode?.postMessage({ type: 'refresh' });
        window.setTimeout(() => this.refreshing.set(false), 1200);
    }

    protected openSalesforce() {
        this.openingSalesforce.set(true);
        this.vscode?.postMessage({ type: 'openSalesforce' });
        window.setTimeout(() => this.openingSalesforce.set(false), 1200);
    }

    protected viewSource() {
        this.vscode?.postMessage({ type: 'viewSource' });
    }

    protected openReference(reference: ReferenceOpen) {
        this.vscode?.postMessage({
            type: 'openReference',
            kind: reference.kind,
            name: reference.name
        });
    }

    protected toggleNavigationSidebar() {
        this.updateLayout({ leftCollapsed: !this.layout().leftCollapsed });
    }

    protected toggleInspector() {
        this.updateLayout({ inspectorCollapsed: !this.layout().inspectorCollapsed });
    }

    protected startInspectorResize(event: PointerEvent) {
        if (this.layout().inspectorCollapsed) {
            return;
        }
        event.preventDefault();
        this.stopInspectorResize();
        const startX = event.clientX;
        const startWidth = this.layout().inspectorWidth;
        const handleMove = (moveEvent: PointerEvent) => {
            this.updateLayout({
                inspectorCollapsed: false,
                inspectorWidth: startWidth + startX - moveEvent.clientX
            }, false);
        };
        const handleUp = () => {
            this.stopInspectorResize();
            this.persistLayout();
        };
        document.body.classList.add('ip-resizing');
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp, { once: true });
        this.resizeCleanup = () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
            document.body.classList.remove('ip-resizing');
        };
    }

    protected resizeInspectorWithKeyboard(event: KeyboardEvent) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
            return;
        }
        event.preventDefault();
        this.updateLayout({
            inspectorCollapsed: false,
            inspectorWidth: this.layout().inspectorWidth + (event.key === 'ArrowLeft' ? INSPECTOR_KEYBOARD_RESIZE_STEP : -INSPECTOR_KEYBOARD_RESIZE_STEP)
        });
    }

    protected selectProcedure() {
        this.endDrag();
        this.selectedKey.set(undefined);
        this.inspectorTab.set('settings');
    }

    protected selectElement(key: string) {
        this.endDrag();
        this.selectedKey.set(key);
    }

    protected selectProblem(problem: Problem) {
        if (problem.elementKey) {
            this.selectElement(problem.elementKey);
        } else {
            this.selectProcedure();
        }
    }

    protected updateHeaderField(change: HeaderFieldChange) {
        this.updateModel(model => ({
            ...model,
            header: {
                ...model.header,
                [change.field]: change.value
            },
            title: change.field === 'name' ? String(change.value) : model.title
        }));
    }

    protected updateProcedurePropertyFromChange(change: PropertyValueChange) {
        this.updateProcedurePropertyValue(change.field, change.value);
    }

    protected updateProcedurePropertyValue(field: string, value: unknown) {
        this.updateModel(model => ({
            ...model,
            propertySet: setObjectValue(model.propertySet, field, value)
        }));
    }

    protected updateElementFieldValue(change: ElementFieldChange) {
        const selected = this.selectedElement();
        if (!selected) {
            return;
        }
        this.updateElement(selected.key, { [change.field]: change.value } as Partial<IntegrationProcedureElement>);
    }

    protected updateElementPropertyFromChange(change: PropertyValueChange) {
        this.updateElementPropertyValue(change.field, change.value);
    }

    protected updateElementPropertyValue(field: string, value: unknown) {
        const selected = this.selectedElement();
        if (!selected) {
            return;
        }
        this.updateElement(selected.key, {
            propertySet: setObjectValue(selected.propertySet, field, value)
        });
    }

    protected updateMapEntries(change: MapEntriesChange) {
        this.updateMap(change.mapName, () => Object.fromEntries(change.entries
            .filter(entry => entry.key.trim())
            .map(entry => [entry.key.trim(), entry.value])));
    }

    protected dataRaptorInputParameters() {
        return getDataRaptorInputParameters(this.activePropertySet());
    }

    protected addDataRaptorInputParameter() {
        this.updateDataRaptorInputParameters(parameters => [...parameters, { inputParam: '', element: '' }]);
    }

    protected updateDataRaptorInputParameter(change: DataRaptorInputParameterFieldChange) {
        this.updateDataRaptorInputParameters(parameters => parameters.map((parameter, parameterIndex) =>
            parameterIndex === change.index ? { ...parameter, [change.field]: change.value } : parameter
        ));
    }

    protected deleteDataRaptorInputParameter(index: number) {
        this.updateDataRaptorInputParameters(parameters => parameters.filter((_parameter, parameterIndex) => parameterIndex !== index));
    }

    protected openInsertPicker(afterKey?: string, parentKey?: string) {
        this.insertFilter.set('');
        this.pendingInsert.set({ afterKey, parentKey });
    }

    protected closeInsertPicker() {
        this.insertFilter.set('');
        this.pendingInsert.set(undefined);
    }

    protected isInsertPickerOpen(afterKey?: string, parentKey?: string) {
        const context = this.pendingInsert();
        return context?.afterKey === afterKey && context?.parentKey === parentKey;
    }

    protected addSelectedElement(type: string) {
        const context = this.pendingInsert();
        this.closeInsertPicker();
        this.addElement(type, context?.afterKey, context?.parentKey);
    }

    protected addElement(type: string, afterKey?: string, parentKey?: string, beforeKey?: string) {
        const model = this.model();
        const afterElement = afterKey ? model.elements.find(element => element.key === afterKey) : undefined;
        const beforeElement = beforeKey ? model.elements.find(element => element.key === beforeKey) : undefined;
        const resolvedParentKey = parentKey ?? afterElement?.parentKey ?? beforeElement?.parentKey;
        const name = uniqueElementName(model.elements, defaultElementName(type));
        const sourceKey = `${model.sourceKey ?? `IntegrationProcedure/${model.header.type}/${model.header.subType}`}/OmniProcessElement/${name}`;
        const element: IntegrationProcedureElement = {
            active: true,
            key: sourceKey,
            level: resolvedParentKey ? 1 : 0,
            name,
            parentKey: resolvedParentKey,
            propertySet: defaultPropertySet(type, name),
            sequenceNumber: 1,
            sourceKey,
            type
        };
        const elements = insertElementInFlow(model.elements, element, afterKey, resolvedParentKey, beforeKey);
        this.setModel({ ...model, elements: resequence(elements) });
        this.selectedKey.set(element.key);
        this.leftTab.set('outline');
    }

    protected startTemplateDrag(type: string, event: DragEvent) {
        event.stopPropagation();
        this.draggedKey.set(undefined);
        this.draggedTemplateType.set(type);
        this.dropTargetKey.set(undefined);
        this.dropPosition.set(undefined);
        event.dataTransfer?.setData(DRAG_TEMPLATE_MIME, type);
        event.dataTransfer?.setData('text/plain', type);
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'copy';
        }
    }

    protected addChildElement(parentKey: string) {
        this.openInsertPicker(undefined, parentKey);
    }

    protected duplicateElement(key: string) {
        const model = this.model();
        const original = model.elements.find(element => element.key === key);
        if (!original) {
            return;
        }
        const name = uniqueElementName(model.elements, `${original.name}Copy`);
        const sourceKey = `${model.sourceKey ?? 'IntegrationProcedure'}/OmniProcessElement/${name}`;
        const duplicate: IntegrationProcedureElement = {
            ...structuredClone(original),
            key: sourceKey,
            sourceKey,
            name,
            propertySet: {
                ...structuredClone(original.propertySet),
                label: name
            }
        };
        const index = model.elements.findIndex(element => element.key === key);
        const elements = [...model.elements];
        elements.splice(index + 1, 0, duplicate);
        this.setModel({ ...model, elements: resequence(elements) });
        this.selectedKey.set(duplicate.key);
    }

    protected deleteElement(key: string) {
        const model = this.model();
        this.setModel({ ...model, elements: removeElementTree(model.elements, key) });
        if (this.selectedKey() && !this.model().elements.some(element => element.key === this.selectedKey())) {
            this.selectedKey.set(undefined);
        }
    }

    protected startDrag(key: string, event: DragEvent) {
        event.stopPropagation();
        this.draggedKey.set(key);
        this.draggedTemplateType.set(undefined);
        this.dropTargetKey.set(undefined);
        this.dropPosition.set(undefined);
        event.dataTransfer?.setData(DRAG_ELEMENT_MIME, key);
        event.dataTransfer?.setData('text/plain', key);
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
        }
    }

    protected dragOver(targetKey: string, event: DragEvent) {
        event.stopPropagation();
        const templateType = this.getDraggedTemplateType(event);
        if (templateType) {
            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'copy';
            }
            const target = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
            const midpoint = target ? target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2 : 0;
            this.dropTargetKey.set(targetKey);
            this.dropPosition.set(event.clientY < midpoint ? 'before' : 'after');
            return;
        }

        const draggedKey = this.getDraggedElementKey(event);
        if (!draggedKey || !this.canDropOn(draggedKey, targetKey)) {
            return;
        }
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }
        const target = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
        const midpoint = target ? target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2 : 0;
        const position = event.clientY < midpoint ? 'before' : 'after';
        const dropTarget = this.normalizeDropTarget(targetKey, position, draggedKey);
        if (!dropTarget || !this.canDropOn(draggedKey, dropTarget.targetKey)) {
            this.dropTargetKey.set(undefined);
            this.dropPosition.set(undefined);
            return;
        }
        this.dropTargetKey.set(dropTarget.targetKey);
        this.dropPosition.set(dropTarget.position);
    }

    protected dragLeave(targetKey: string) {
        const previousKey = previousSiblingKey(this.model().elements, targetKey);
        if (this.dropTargetKey() === targetKey || this.dropTargetKey() === previousKey) {
            this.dropTargetKey.set(undefined);
            this.dropPosition.set(undefined);
        }
    }

    protected dragOverInsert(afterKey: string, event: DragEvent) {
        event.stopPropagation();
        const templateType = this.getDraggedTemplateType(event);
        if (templateType) {
            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'copy';
            }
            this.dropTargetKey.set(afterKey);
            this.dropPosition.set('after');
            return;
        }

        const draggedKey = this.getDraggedElementKey(event);
        if (!draggedKey || !this.canDropOn(draggedKey, afterKey)) {
            return;
        }
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }
        this.dropTargetKey.set(afterKey);
        this.dropPosition.set('after');
    }

    protected dropOnInsert(afterKey: string, event: DragEvent) {
        event.stopPropagation();
        event.preventDefault();
        const templateType = this.getDraggedTemplateType(event);
        if (templateType) {
            this.endDrag();
            this.addElement(templateType, afterKey);
            return;
        }

        const draggedKey = this.getDraggedElementKey(event);
        this.endDrag();
        if (!draggedKey || !this.canDropOn(draggedKey, afterKey)) {
            return;
        }
        this.reorderElement(draggedKey, afterKey, 'after');
    }

    protected dropOnElement(targetKey: string, event: DragEvent) {
        event.stopPropagation();
        event.preventDefault();
        const templateType = this.getDraggedTemplateType(event);
        const dropTargetKey = this.dropTargetKey();
        const position = this.dropPosition();
        if (templateType) {
            this.endDrag();
            if (!dropTargetKey || !position || position === 'inside') {
                return;
            }
            this.addElementRelative(templateType, dropTargetKey, position);
            return;
        }

        const draggedKey = this.getDraggedElementKey(event);
        this.endDrag();
        if (!draggedKey || !dropTargetKey || !position || position === 'inside' || !this.canDropOn(draggedKey, dropTargetKey)) {
            return;
        }
        this.reorderElement(draggedKey, dropTargetKey, position);
    }

    protected dragOverGroup(parentKey: string, event: DragEvent) {
        event.stopPropagation();
        const templateType = this.getDraggedTemplateType(event);
        if (templateType) {
            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'copy';
            }
            this.dropTargetKey.set(parentKey);
            this.dropPosition.set('inside');
            return;
        }

        const draggedKey = this.getDraggedElementKey(event);
        if (!draggedKey || !this.canDropOn(draggedKey, parentKey)) {
            return;
        }
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }
        this.dropTargetKey.set(parentKey);
        this.dropPosition.set('inside');
    }

    protected dropOnGroup(parentKey: string, event: DragEvent) {
        event.stopPropagation();
        event.preventDefault();
        const templateType = this.getDraggedTemplateType(event);
        if (templateType) {
            this.endDrag();
            this.addElement(templateType, undefined, parentKey);
            return;
        }

        const draggedKey = this.getDraggedElementKey(event);
        this.endDrag();
        if (!draggedKey || !this.canDropOn(draggedKey, parentKey)) {
            return;
        }
        this.moveElementIntoGroup(draggedKey, parentKey);
    }

    protected endDrag() {
        this.draggedKey.set(undefined);
        this.draggedTemplateType.set(undefined);
        this.dropTargetKey.set(undefined);
        this.dropPosition.set(undefined);
    }

    protected dragOverEmptyFlow(event: DragEvent) {
        event.stopPropagation();
        const templateType = this.getDraggedTemplateType(event);
        if (!templateType) {
            return;
        }
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'copy';
        }
        this.dropTargetKey.set(EMPTY_FLOW_DROP_KEY);
        this.dropPosition.set('inside');
    }

    protected dragLeaveEmptyFlow() {
        if (this.dropTargetKey() === EMPTY_FLOW_DROP_KEY) {
            this.dropTargetKey.set(undefined);
            this.dropPosition.set(undefined);
        }
    }

    protected dropOnEmptyFlow(event: DragEvent) {
        event.stopPropagation();
        event.preventDefault();
        const templateType = this.getDraggedTemplateType(event);
        this.endDrag();
        if (templateType) {
            this.addElement(templateType);
        }
    }

    protected confirmDeleteElement(key: string) {
        this.pendingDeleteKey.set(key);
    }

    protected cancelDelete() {
        this.pendingDeleteKey.set(undefined);
    }

    protected deletePendingElement() {
        const key = this.pendingDeleteKey();
        this.pendingDeleteKey.set(undefined);
        if (key) {
            this.deleteElement(key);
        }
    }

    protected setJsonDraftValue(value: string) {
        this.jsonDraft.set(value);
        this.jsonError.set(undefined);
    }

    protected applyJson() {
        try {
            const parsed = JSON.parse(this.jsonDraft());
            if (!isRecord(parsed)) {
                throw new Error('JSON must be an object.');
            }
            const selected = this.selectedElement();
            if (selected) {
                this.updateElement(selected.key, { propertySet: parsed });
            } else {
                this.updateModel(model => ({ ...model, propertySet: parsed }));
            }
            this.jsonError.set(undefined);
        } catch (error) {
            this.jsonError.set(getErrorMessage(error));
        }
    }

    protected activePropertySet() {
        return this.selectedElement()?.propertySet ?? this.model().propertySet;
    }

    protected propertyValue(field: string) {
        return stringifyValue(this.activePropertySet()[field]);
    }

    private handleMessage(message: ExtensionToWebviewMessage) {
        switch (message.type) {
            case 'load':
                this.model.set(message.state.model);
                this.apexClasses.set(message.state.apexClasses ?? []);
                this.dataMappers.set(message.state.dataMappers ?? []);
                this.layout.set(normalizeLayout(message.state.layout));
                this.hasLoaded.set(true);
                this.refreshing.set(false);
                this.error.set(undefined);
                if (this.selectedKey() && !message.state.model.elements.some(element => element.key === this.selectedKey())) {
                    this.selectedKey.set(undefined);
                }
                break;
            case 'saved':
                this.saving.set(false);
                break;
            case 'error':
                this.error.set(message.message);
                this.saving.set(false);
                this.deploying.set(false);
                this.refreshing.set(false);
                break;
        }
    }

    private setModel(model: IntegrationProcedureModel) {
        this.model.set(model);
        this.vscode?.postMessage({ type: 'change', model });
    }

    private updateLayout(patch: Partial<IntegrationProcedureLayout>, persist = true) {
        const layout = normalizeLayout({ ...this.layout(), ...patch });
        this.layout.set(layout);
        if (persist) {
            this.persistLayout(layout);
        }
    }

    private persistLayout(layout = this.layout()) {
        this.vscode?.postMessage({ type: 'layout', layout });
    }

    private stopInspectorResize() {
        this.resizeCleanup?.();
        this.resizeCleanup = undefined;
    }

    private updateModel(updater: (model: IntegrationProcedureModel) => IntegrationProcedureModel) {
        this.setModel(updater(this.model()));
    }

    private updateElement(key: string, patch: Partial<IntegrationProcedureElement>) {
        this.updateModel(model => ({
            ...model,
            elements: resequence(model.elements.map(element => element.key === key ? { ...element, ...patch } : element))
        }));
    }

    private canDropOn(draggedKey: string, targetKey: string) {
        if (draggedKey === targetKey) {
            return false;
        }
        const keys = new Set(this.model().elements.map(element => element.key));
        return keys.has(draggedKey) && keys.has(targetKey) && !isDescendantOf(this.model().elements, targetKey, draggedKey);
    }

    private getDraggedElementKey(event: DragEvent) {
        const key = this.draggedKey() || event.dataTransfer?.getData(DRAG_ELEMENT_MIME) || event.dataTransfer?.getData('text/plain');
        return this.model().elements.some(element => element.key === key) ? key : undefined;
    }

    private getDraggedTemplateType(event: DragEvent) {
        const type = this.draggedTemplateType() || event.dataTransfer?.getData(DRAG_TEMPLATE_MIME) || event.dataTransfer?.getData('text/plain');
        return ELEMENT_TEMPLATES.some(template => template.type === type) ? type : undefined;
    }

    private addElementRelative(type: string, targetKey: string, position: Exclude<DropPosition, 'inside'>) {
        const target = this.model().elements.find(element => element.key === targetKey);
        if (!target) {
            return;
        }
        if (position === 'after') {
            this.addElement(type, targetKey);
            return;
        }
        this.addElement(type, undefined, target.parentKey, targetKey);
    }

    private normalizeDropTarget(targetKey: string, position: Exclude<DropPosition, 'inside'>, draggedKey: string) {
        if (position === 'after') {
            return targetKey === draggedKey ? undefined : { targetKey, position };
        }
        const previousKey = previousSiblingKey(this.model().elements, targetKey);
        const normalized = previousKey ? { targetKey: previousKey, position: 'after' as const } : { targetKey, position };
        return normalized.targetKey === draggedKey ? undefined : normalized;
    }

    private reorderElement(draggedKey: string, targetKey: string, position: Exclude<DropPosition, 'inside'>) {
        const model = this.model();
        this.setModel({ ...model, elements: reorderElementInFlow(model.elements, draggedKey, targetKey, position) });
        this.selectedKey.set(draggedKey);
    }

    private moveElementIntoGroup(draggedKey: string, parentKey: string) {
        const model = this.model();
        this.setModel({ ...model, elements: moveElementIntoGroupInFlow(model.elements, draggedKey, parentKey) });
        this.selectedKey.set(draggedKey);
    }

    private descendantCount(parentKey: string) {
        return this.model().elements.filter(element => isDescendantOf(this.model().elements, element.key, parentKey)).length;
    }

    private updateMap(mapName: string, updater: (current: Record<string, unknown>) => Record<string, unknown>) {
        const selected = this.selectedElement();
        if (selected) {
            this.updateElement(selected.key, {
                propertySet: {
                    ...selected.propertySet,
                    [mapName]: updater(asRecord(selected.propertySet[mapName]))
                }
            });
            return;
        }
        this.updateModel(model => ({
            ...model,
            propertySet: {
                ...model.propertySet,
                [mapName]: updater(asRecord(model.propertySet[mapName]))
            }
        }));
    }

    private updateDataRaptorInputParameters(updater: (current: Array<Record<string, string>>) => Array<Record<string, string>>) {
        const current = this.dataRaptorInputParameters().map(parameter => ({
            inputParam: parameter.inputParam,
            element: parameter.element
        }));
        const next = updater(current);
        this.updateElementPropertyValue('dataRaptor Input Parameters', next);
    }
}

export function bootstrapIntegrationProcedureEditor() {
    return bootstrapApplication(AppComponent, {
        providers: [provideZonelessChangeDetection()]
    });
}

if (!(globalThis as { __VLOCODE_WEBVIEW_PREVIEW__?: boolean }).__VLOCODE_WEBVIEW_PREVIEW__) {
    bootstrapIntegrationProcedureEditor().catch(error => console.error(error));
}
