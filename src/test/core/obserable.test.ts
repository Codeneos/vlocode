import { expect } from 'chai';
import { observeObject, PropertyChangedEventArgs, observeArray, ArrayChangedEventArgs } from 'lib/util/observer';

describe('observable', () => {

    describe('#object.get', () => {
        it('should work transparently for caller', () => {
            const target = { 'prop': 'a' };
            const observer = observeObject(target);
            expect(observer.prop).equals(target.prop);
        });
    });

    describe('#object.set', () => {
        it('should work transparently for caller', () => {
            const target = { 'prop': 'a' };
            const observer = observeObject(target);
            observer.prop = 'b';
            expect(target.prop).equals('b');
        });
        it('should trigger onPropertyChangedEvent', () => {
            const target = { 'prop': 'a' };
            const eventArgs : PropertyChangedEventArgs[] = [];
            const observer = observeObject(target);
            observer.onPropertyChanged(e => eventArgs.push(e));

            observer.prop = 'b';

            expect(eventArgs.length).equals(1);
            expect(eventArgs[0].newValue).equals('b');
            expect(eventArgs[0].oldValue).equals('a');
            expect(eventArgs[0].property).equals('prop');
        });
        it('should trigger onPropertyChangedEvent for child objects', () => {
            const target = { 'prop': { 'prop': 'a' } };
            const eventArgs : PropertyChangedEventArgs[] = [];
            const observer = observeObject(target);
            observer.onPropertyChanged(e => eventArgs.push(e));

            observer.prop.prop = 'b';

            expect(eventArgs.length).equals(1);
            expect(eventArgs[0].newValue).equals('b');
            expect(eventArgs[0].oldValue).equals('a');
            expect(eventArgs[0].property).equals('prop');
        });
    });
});

describe('observableArray', () => {

    describe('#array.push', () => {
        it('should work transparently for caller', () => {
            const target = new Array<number>();
            const arrayObserver = observeArray(target);
            expect(arrayObserver.push(1)).equals(1);
            expect(arrayObserver.push(2)).equals(2);
            expect(arrayObserver.length).equals(2);
            expect(arrayObserver.push(3, 4)).equals(4);
            expect(target).deep.equals([1,2,3,4]);
        });
        it('should trigger onArrayChangedEvent', () => {
            const target = new Array<number>();
            const eventArgs = new Array<ArrayChangedEventArgs<number>>();
            const arrayObserver = observeArray(target);
            arrayObserver.onArrayChanged(e => eventArgs.push(e));

            arrayObserver.push(1);

            expect(eventArgs.length).equals(1);
            expect(eventArgs[0].newValues?.[0]).equals(1);
            expect(eventArgs[0].oldValues).equals(undefined);
            expect(eventArgs[0].index).equals(0);
        });
    });

    describe('#array.pop', () => {
        it('should work transparently for caller', () => {
            const target = [1,2,3,4];
            const arrayObserver = observeArray(target);
            expect(arrayObserver.pop()).equals(4);
            expect(arrayObserver.pop()).equals(3);
            expect(arrayObserver.length).equals(2);
        });
        it('should trigger onArrayChangedEvent', () => {
            const target = [1,2];
            const eventArgs = new Array<ArrayChangedEventArgs<number>>();
            const arrayObserver = observeArray(target);
            arrayObserver.onArrayChanged(e => eventArgs.push(e));

            arrayObserver.pop();

            expect(eventArgs.length).equals(1);
            expect(eventArgs[0].newValues).equals(undefined);
            expect(eventArgs[0].oldValues?.[0]).equals(2);
            expect(eventArgs[0].index).equals(1);
        });
    });

    describe('#array.shift', () => {
        it('should work transparently for caller', () => {
            const target = [1,2,3,4];
            const arrayObserver = observeArray(target);
            expect(arrayObserver.shift()).equals(1);
            expect(arrayObserver.shift()).equals(2);
            expect(arrayObserver.length).equals(2);
        });
        it('should trigger onPropertyChangedEvent', () => {
            const target = [1,2];
            const eventArgs = new Array<ArrayChangedEventArgs<number>>();
            const arrayObserver = observeArray(target);
            arrayObserver.onArrayChanged(e => eventArgs.push(e));

            arrayObserver.shift();

            expect(eventArgs.length).equals(1);
            expect(eventArgs[0].newValues).equals(undefined);
            expect(eventArgs[0].oldValues?.[0]).equals(1);
            expect(eventArgs[0].index).equals(0);
        });
    });
});
