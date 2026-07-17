import 'jest';

import { QueryBuilder } from '../queryBuilder';

describe('QueryBuilder', () => {
    describe('#where', () => {
        it('should escape quotes and backslashes in literal condition values', () => {
            const query = new QueryBuilder('Account', [ 'Id' ]).where.equals('Name', `O'Neil \\ Sons`).getQuery();
            expect(query).toContain(`Name = 'O\\'Neil \\\\ Sons'`);
        });
        it('should escape quotes in list condition values', () => {
            const query = new QueryBuilder('Account', [ 'Id' ]).where.in('Name', [ `O'Neil`, 'Acme' ]).getQuery();
            expect(query).toContain(`Name in ('O\\'Neil','Acme')`);
        });
        it('should keep backslash pattern escapes in like condition values', () => {
            const query = new QueryBuilder('Account', [ 'Id' ]).where.like('Name', `100\\% O'Neil%`).getQuery();
            expect(query).toContain(`Name LIKE '100\\% O\\'Neil%'`);
        });
        it('should escape backslashes that are not LIKE wildcard escapes', () => {
            const query = new QueryBuilder('Account', [ 'Id' ]).where.like('Name', `O\\Brien's 100\\%`).getQuery();
            expect(query).toContain(`Name LIKE 'O\\\\Brien\\'s 100\\%'`);
        });
    });
});
