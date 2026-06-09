import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, HostListener, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface AutocompleteSuggestion {
    label?: string;
    name?: string;
    path?: string;
    value?: string;
}

interface NormalizedSuggestion {
    detail?: string;
    label: string;
    searchText: string;
    value: string;
}

@Component({
    selector: 'vlo-autocomplete-input',
    standalone: true,
    imports: [FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './autocomplete-input.component.html'
})
export class VlocodeAutocompleteInputComponent {
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly destroyRef = inject(DestroyRef);
    private readonly suggestionList = viewChild<ElementRef<HTMLUListElement>>('suggestionList');

    readonly value = input('');
    readonly suggestions = input<readonly (AutocompleteSuggestion | string)[]>([]);
    readonly placeholder = input('');
    readonly ariaLabel = input<string>();
    readonly commitOnInput = input(true);
    readonly disabled = input(false);

    readonly valueChange = output<string>();

    protected readonly draftValue = signal('');
    protected readonly open = signal(false);
    protected readonly filterText = signal('');
    protected readonly filterEnabled = signal(false);
    protected readonly listTop = signal(0);
    protected readonly listLeft = signal(0);
    protected readonly listWidth = signal(0);
    protected readonly listMaxHeight = signal(300);
    private readonly editing = signal(false);
    private readonly updateOverlayPosition = () => {
        if (this.open()) {
            this.updateListPosition();
        }
    };

    constructor() {
        effect(() => {
            if (!this.editing()) {
                this.draftValue.set(this.value());
            }
        });

        effect(() => {
            if (this.open()) {
                this.attachListToBody();
                this.updateListPosition();
            }
        });

        document.addEventListener('scroll', this.updateOverlayPosition, true);
        this.destroyRef.onDestroy(() => {
            document.removeEventListener('scroll', this.updateOverlayPosition, true);
            this.detachListFromBody();
        });
    }

    protected readonly normalizedSuggestions = computed<NormalizedSuggestion[]>(() => this.suggestions().map(suggestion => {
        if (typeof suggestion === 'string') {
            return {
                label: suggestion,
                searchText: suggestion.toLowerCase(),
                value: suggestion
            };
        }
        const value = suggestion.value ?? suggestion.path ?? suggestion.name ?? '';
        const label = suggestion.path ?? suggestion.value ?? suggestion.name ?? value;
        const detail = suggestion.label && suggestion.label !== label ? suggestion.label : undefined;
        return {
            detail,
            label,
            searchText: `${value} ${label} ${detail ?? ''} ${suggestion.name ?? ''}`.toLowerCase(),
            value
        };
    }).filter(suggestion => suggestion.value));

    protected readonly filteredSuggestions = computed(() => {
        const query = this.filterEnabled() ? this.filterText().trim().toLowerCase() : '';
        const suggestions = this.normalizedSuggestions();
        if (!query) {
            return suggestions.slice(0, 40);
        }
        return suggestions
            .filter(suggestion => suggestion.searchText.includes(query))
            .slice(0, 40);
    });

    protected updateValue(value: string) {
        this.startEditing();
        this.draftValue.set(value);
        this.filterText.set(value);
        this.filterEnabled.set(true);
        this.openList();
        if (this.commitOnInput()) {
            this.valueChange.emit(value);
        }
    }

    protected selectValue(value: string) {
        this.commitValue(value);
    }

    protected closeSoon() {
        window.setTimeout(() => {
            if (!this.editing()) {
                this.open.set(false);
                return;
            }
            if (this.commitOnInput()) {
                this.editing.set(false);
                this.open.set(false);
            } else {
                this.cancelEdit();
            }
        }, 120);
    }

    protected openAll() {
        this.startEditing();
        this.filterText.set('');
        this.filterEnabled.set(false);
        this.openList();
    }

    protected handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.commitValue(this.draftValue());
        } else if (event.key === 'Escape') {
            event.preventDefault();
            this.cancelEdit();
        }
    }

    protected openList() {
        this.updateListPosition();
        this.open.set(true);
    }

    @HostListener('window:resize')
    protected updateListPosition() {
        const inputElement = this.host.nativeElement.querySelector('input');
        if (!inputElement) {
            return;
        }

        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const rect = inputElement.getBoundingClientRect();
        const gap = 3;
        const viewportPadding = 12;
        const maxPreferredHeight = 300;
        const availableBelow = viewportHeight - rect.bottom - viewportPadding;
        const availableAbove = rect.top - viewportPadding;
        const renderAbove = availableBelow < 96 && availableAbove > availableBelow;
        const availableHeight = renderAbove ? availableAbove : availableBelow;
        const maxHeight = Math.max(96, Math.min(maxPreferredHeight, availableHeight));
        const width = Math.min(rect.width, viewportWidth - viewportPadding * 2);
        const left = Math.min(Math.max(rect.left, viewportPadding), viewportWidth - width - viewportPadding);

        this.listLeft.set(left);
        this.listWidth.set(width);
        this.listMaxHeight.set(maxHeight);
        this.listTop.set(renderAbove
            ? Math.max(viewportPadding, rect.top - maxHeight - gap)
            : Math.min(rect.bottom + gap, viewportHeight - maxHeight - viewportPadding)
        );
    }

    private attachListToBody() {
        const list = this.suggestionList()?.nativeElement;
        if (list && list.parentElement !== document.body) {
            document.body.appendChild(list);
        }
    }

    private detachListFromBody() {
        const list = this.suggestionList()?.nativeElement;
        if (list?.parentElement === document.body) {
            list.remove();
        }
    }

    private startEditing() {
        if (!this.editing()) {
            this.draftValue.set(this.value());
            this.editing.set(true);
        }
    }

    private commitValue(value: string) {
        this.draftValue.set(value);
        this.filterText.set('');
        this.filterEnabled.set(false);
        this.editing.set(false);
        this.open.set(false);
        if (value !== this.value()) {
            this.valueChange.emit(value);
        }
    }

    private cancelEdit() {
        this.draftValue.set(this.value());
        this.filterText.set('');
        this.filterEnabled.set(false);
        this.editing.set(false);
        this.open.set(false);
    }
}
