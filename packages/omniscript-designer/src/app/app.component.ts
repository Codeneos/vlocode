import { Component } from "@angular/core";
import * as uiToolkit from "@vscode/webview-ui-toolkit";
import { vscode } from "./utilities/vscode";
import { elements } from "./elements";
import { OmniScriptElementDefinition } from "@vlocode/vlocity-deploy";

// In order to use the Webview UI Toolkit web components they
// must be registered with the browser (i.e. webview) using the
// syntax below.
uiToolkit.provideVSCodeDesignSystem().register(uiToolkit.allComponents);

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  public elements = elements;

  public selectedElement?: OmniScriptElementDefinition;

  handleHowdyClick() {
    vscode.postMessage({
      command: "hello",
      text: "Hey there partner! 🤠",
    });
  }
}
