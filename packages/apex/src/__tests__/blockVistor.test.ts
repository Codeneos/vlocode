import { ApexSourceRange } from '../types';
import { BlockVisitor } from '../visitors/blockVisitor';

describe('BlockVisitor', () => {
    describe('resolveBlockHierarchy', () => {
        it('should return the block hierarchy', () => {
            const state = {
                name: 'R',
                sourceRange: ApexSourceRange.empty,
                blocks: [
                    {
                        name: 'A',
                        sourceRange: ApexSourceRange.empty,
                        blocks: [
                            { name: 'A1', sourceRange: ApexSourceRange.empty }
                        ]
                    },
                    {
                        name: 'B',
                        sourceRange: ApexSourceRange.empty,
                        blocks: [
                            { name: 'B1', sourceRange: ApexSourceRange.empty },
                            { name: 'B2', sourceRange: ApexSourceRange.empty },
                            {
                                name: 'B3', sourceRange: ApexSourceRange.empty,
                                blocks: [
                                    { name: 'B3-1', sourceRange: ApexSourceRange.empty },
                                    { name: 'B3-2', sourceRange: ApexSourceRange.empty }
                                ]
                            }
                        ]
                    }
                ]
            };

            const visitor = new BlockVisitor<typeof state>(state);
            const result = Array.from(visitor.resolveBlockHierarchy());

            // Assert
            const blockNames = result.map(blocks => blocks.map(block => block['name'] as string));
            expect(blockNames).toEqual([
                ['R'],
                ['R', 'A'],
                ['R', 'A', 'A1'],
                ['R', 'B'],
                ['R', 'B', 'B1'],
                ['R', 'B', 'B2'],
                ['R', 'B', 'B3'],
                ['R', 'B', 'B3', 'B3-1'],
                ['R', 'B', 'B3', 'B3-2']
            ]);
        });
    });
});