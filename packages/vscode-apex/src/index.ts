import { ConsoleWriter, container, Logger, LogManager, LogLevel } from "@vlocode/core";
import { ApexLanguageServer } from "./server";

// register logger
LogManager.registerWriter(new ConsoleWriter());
LogManager.setGlobalLogLevel(LogLevel.verbose);
container.registerProvider(Logger, LogManager.get.bind(LogManager));

// Start the language server
container.create(ApexLanguageServer).start();