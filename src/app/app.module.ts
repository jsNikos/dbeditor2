import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { ModalModule } from 'ng2-bootstrap';
import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';
import { SelectModule } from 'ng2-select/ng2-select';

import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { TablemenuComponent } from './tablemenu/tablemenu.component';
import { InstancesComponent } from './instances/instances.component';
import { ServererrorComponent } from './servererror/servererror.component';
import { LoaderComponent } from './loader/loader.component';
import { DatetimepickerComponent } from './editor/customFieldEditor/datetimepicker/datetimepicker.component';
import { TimeofdayComponent } from './editor/customFieldEditor/timeofday/timeofday.component';
import { ImageChooserComponent } from './editor/customFieldEditor/image-chooser/image-chooser.component';
import { ConfirmDeleteComponent } from './editor/confirm-delete/confirm-delete.component';

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    TablemenuComponent,
    InstancesComponent,
    ServererrorComponent,
    LoaderComponent,
    DatetimepickerComponent,
    TimeofdayComponent,
    ImageChooserComponent,
    ConfirmDeleteComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ModalModule.forRoot(),
    NKDatetimeModule,
    SelectModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
