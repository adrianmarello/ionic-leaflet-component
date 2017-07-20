import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';

import { LeafletMapComponent } from './leaflet-map.component';


@NgModule({
    imports: [
        CommonModule,
        IonicModule.forRoot(LeafletMapComponent)
    ],
    declarations: [
        LeafletMapComponent
    ],
    exports: [
        LeafletMapComponent
    ]
})
export class LeafletMapModule {}
