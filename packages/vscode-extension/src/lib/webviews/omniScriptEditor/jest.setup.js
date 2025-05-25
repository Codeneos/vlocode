// Mock vscodeApi for webview components
global.window.vscodeApi = {
    postMessage: jest.fn(),
    // You can add other vscodeApi methods if your components use them
};

// Mock for CSS modules or direct CSS imports if needed
// If you don't import CSS directly in your JS/TS files, this might not be strictly necessary.
// However, if Jest complains about CSS files, this will handle it.
jest.mock('./omniScriptEditor.css', () => ({})); // Mocks the specific CSS file we created

// You might also want to extend Jest's expect with jest-dom matchers
// if you haven't configured this globally in your main Jest config
import '@testing-library/jest-dom';
