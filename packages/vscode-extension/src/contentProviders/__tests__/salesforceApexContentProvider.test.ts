import * as vscode from 'vscode';
import { SalesforceApexContentProvider } from '../salesforceApexContentProvider';
import { SalesforceConnectionProvider } from '@vlocode/salesforce';

describe('SalesforceApexContentProvider', () => {
    let mockConnectionProvider: jest.Mocked<SalesforceConnectionProvider>;
    let mockConnection: any;
    let mockLogger: any;
    let provider: SalesforceApexContentProvider;

    beforeEach(() => {
        mockConnectionProvider = {
            getJsForceConnection: jest.fn(),
            isProductionOrg: jest.fn(),
            getApiVersion: jest.fn()
        } as jest.Mocked<SalesforceConnectionProvider>; 

        mockConnection = {
            tooling: {
                sobject: jest.fn().mockReturnValue({
                    findOne: jest.fn()
                })
            }
        };

        mockLogger = {
            name: 'test-logger',
            focus: jest.fn(),
            log: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            verbose: jest.fn(),
            distinct: jest.fn(),
            write: jest.fn(),
            writeEntry: jest.fn()
        };

        mockConnectionProvider.getJsForceConnection.mockResolvedValue(mockConnection);
        provider = new SalesforceApexContentProvider(mockConnectionProvider, mockLogger);
    });

    // Mock timers to control async behavior
    beforeAll(() => {        
        jest.useFakeTimers();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    describe('provideTextDocumentContent', () => {
        it('should return class body for valid class name URI', async () => {
            // Arrange
            const uri = vscode.Uri.parse('apex://MyTestClass');
            const expectedBody = 'public class MyTestClass { }';
            
            mockConnection.tooling.sobject().findOne.mockResolvedValue({
                Body: expectedBody,
                Name: 'MyTestClass',
                NamespacePrefix: null
            });

            // Act
            const result = await provider.provideTextDocumentContent(uri);
            jest.runAllTimers(); // Ensure all promises are resolved

            // Assert
            expect(result).toBe(expectedBody);
            expect(mockConnection.tooling.sobject).toHaveBeenCalledWith('ApexClass');
            expect(mockConnection.tooling.sobject().findOne).toHaveBeenCalledWith(
                { Name: 'MyTestClass', NamespacePrefix: null },
                ['Body', 'Name', 'NamespacePrefix']
            );
        });

        it('should return class body for namespaced class URI', async () => {
            // Arrange
            const uri = vscode.Uri.parse('apex://MyNamespace/MyTestClass');
            const expectedBody = 'public class MyTestClass { }';
            
            mockConnection.tooling.sobject().findOne.mockResolvedValue({
                Body: expectedBody,
                Name: 'MyTestClass',
                NamespacePrefix: 'MyNamespace'
            });

            // Act
            const result = await provider.provideTextDocumentContent(uri);
            jest.runAllTimers(); // Ensure all promises are resolved

            // Assert
            expect(result).toBe(expectedBody);
            expect(mockConnection.tooling.sobject().findOne).toHaveBeenCalledWith(
                { Name: 'MyTestClass', NamespacePrefix: 'MyNamespace' },
                ['Body', 'Name', 'NamespacePrefix']
            );
        });

        it('should return error comment when class does not exist', async () => {
            // Arrange
            const uri = vscode.Uri.parse('apex://NonExistentClass');
            
            mockConnection.tooling.sobject().findOne.mockResolvedValue(null);

            // Act
            const result = await provider.provideTextDocumentContent(uri);
            jest.runAllTimers(); // Ensure all promises are resolved

            // Assert
            expect(result).toContain('// Error fetching Apex class');
            expect(result).toContain('NonExistentClass\' not found');
        });

        it('should return error comment when class has no body', async () => {
            // Arrange
            const uri = vscode.Uri.parse('apex://EmptyClass');
            
            mockConnection.tooling.sobject().findOne.mockResolvedValue({
                Body: null,
                Name: 'EmptyClass',
                NamespacePrefix: null
            });

            // Act
            const result = await provider.provideTextDocumentContent(uri);
            jest.runAllTimers(); // Ensure all promises are resolved

            // Assert
            expect(result).toContain('// Error fetching Apex class');
            expect(result).toContain('has no body content');
        });

        it('should handle cancellation token', async () => {
            // Arrange
            const uri = vscode.Uri.parse('apex://MyTestClass');
            const cancellationToken = {
                isCancellationRequested: true,
                onCancellationRequested: jest.fn()
            } as vscode.CancellationToken;

            // Act
            const result = await provider.provideTextDocumentContent(uri, cancellationToken);
            jest.runAllTimers(); // Ensure all promises are resolved

            // Assert
            expect(result).toContain('// Error fetching Apex class');
            expect(result).toContain('Request was cancelled');
            expect(mockConnection.tooling.sobject().findOne).not.toHaveBeenCalled();
        });

        it('should use cache for subsequent calls with same URI', async () => {
            // Arrange
            const uri = vscode.Uri.parse('apex://CachedClass');
            const expectedBody = 'public class CachedClass { }';
            
            mockConnection.tooling.sobject().findOne.mockResolvedValue({
                Body: expectedBody,
                Name: 'CachedClass',
                NamespacePrefix: null
            });

            // Act
            const result1 = await provider.provideTextDocumentContent(uri);
            const result2 = await provider.provideTextDocumentContent(uri);
            jest.runAllTimers(); // Ensure all promises are resolved

            // Assert
            expect(result1).toBe(expectedBody);
            expect(result2).toBe(expectedBody);
            expect(mockConnection.tooling.sobject().findOne).toHaveBeenCalledTimes(1);
        });
    });

    describe('clearCache', () => {
        it('should clear cache and refetch content', async () => {
            // Arrange
            const uri = vscode.Uri.parse('apex://TestClass');
            const expectedBody = 'public class TestClass { }';
            
            mockConnection.tooling.sobject().findOne.mockResolvedValue({
                Body: expectedBody,
                Name: 'TestClass',
                NamespacePrefix: null
            });

            // Cache content first
            await provider.provideTextDocumentContent(uri);

            // Act
            provider.clearCache();
            await provider.provideTextDocumentContent(uri);

            // Assert
            expect(mockConnection.tooling.sobject().findOne).toHaveBeenCalledTimes(2);
            expect(mockLogger.debug).toHaveBeenCalledWith('Apex content cache cleared');
        });
    });
});
