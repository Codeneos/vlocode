import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
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
    readonly value = input('');
    readonly suggestions = input<FieldSuggestion[]>([]);
    readonly placeholder = input('');
    readonly ariaLabel = input<string>();
    readonly disabled = input(false);

    readonly valueChange = output<string>();

    protected readonly open = signal(false);
    protected readonly search = signal('');

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
        this.open.set(true);
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
}
