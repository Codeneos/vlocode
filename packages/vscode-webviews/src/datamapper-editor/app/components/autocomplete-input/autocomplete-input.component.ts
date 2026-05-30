import { ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { FieldSuggestion } from '../../models/datamapper.model';

@Component({
    selector: 'dm-autocomplete-input',
    standalone: true,
    imports: [FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './autocomplete-input.component.html'
})
export class AutocompleteInputComponent {
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly value = input('');
    readonly suggestions = input<FieldSuggestion[]>([]);
    readonly placeholder = input('');
    readonly ariaLabel = input<string>();
    readonly disabled = input(false);

    readonly valueChange = output<string>();

    protected readonly open = signal(false);
    protected readonly search = signal('');
    protected readonly listTop = signal(0);
    protected readonly listLeft = signal(0);
    protected readonly listWidth = signal(0);
    protected readonly listMaxHeight = signal(300);

    protected readonly filteredSuggestions = computed(() => {
        const query = (this.search() || this.value()).trim().toLowerCase();
        const suggestions = this.suggestions();
        if (!query) {
            return suggestions.slice(0, 40);
        }
        return suggestions
            .filter(field => `${field.path} ${field.label ?? ''} ${field.name}`.toLowerCase().includes(query))
            .slice(0, 40);
    });

    protected updateValue(value: string) {
        this.search.set(value);
        this.openList();
        this.valueChange.emit(value);
    }

    protected selectValue(value: string) {
        this.search.set(value);
        this.valueChange.emit(value);
        this.open.set(false);
    }

    protected closeSoon() {
        window.setTimeout(() => this.open.set(false), 120);
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
        const rect = inputElement.getBoundingClientRect();
        const gap = 3;
        const viewportPadding = 12;
        const maxPreferredHeight = 300;
        const availableBelow = viewportHeight - rect.bottom - viewportPadding;
        const maxHeight = Math.max(96, Math.min(maxPreferredHeight, availableBelow));

        this.listLeft.set(0);
        this.listWidth.set(inputElement.offsetWidth);
        this.listMaxHeight.set(maxHeight);
        this.listTop.set(inputElement.offsetTop + inputElement.offsetHeight + gap);
    }
}
