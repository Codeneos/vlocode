import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { ScriptElementTreeComponent } from './script-element-tree/script-element-tree.component';
import { ScriptElementComponent } from './script-element/script-element.component';
import { ScriptElementDetailComponent } from './script-element-detail/script-element-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    ScriptElementTreeComponent,
    ScriptElementComponent,
    ScriptElementDetailComponent
  ],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
