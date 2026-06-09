export function inputChecked(event: Event) {
    return (event.target as HTMLInputElement | null)?.checked ?? false;
}

export function inputValue(event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    return target?.value ?? '';
}
