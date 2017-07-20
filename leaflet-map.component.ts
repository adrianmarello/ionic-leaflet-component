import { Component, ViewChild, Input, ElementRef } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { GlobalService } from './../../providers/global.service';

import * as L from 'leaflet';


@Component({
    selector: 'app-leaflet-map',
    templateUrl: './leaflet-map.component.html',
})
export class LeafletMapComponent {

    @ViewChild('map') mapElement: ElementRef;

    // MAP CONFIG
    @Input() zoom: number = 14;
    @Input('lat') latitude: number = -28.468452;
    @Input('lng') longitude: number = -65.779094;
    @Input('height_map') public height_map;

    // INITIAL VARS
    map: any;
    layers: any[] = [];
    polyline: any;
    myPositionMarker: any;
    originRouteLatLng: any;
    destRouteLatLng: any;
    destRouteLatLngGlobal: any;

    constructor(private geolocation: Geolocation, private globalService: GlobalService) {
        this.layers = [];
    }

    ngAfterViewInit() {
        this.initMap();
    }

    initMap() {
        let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGF0cmlja3IiLCJhIjoiY2l2aW9lcXlvMDFqdTJvbGI2eXUwc2VjYSJ9.trTzsdDXD2lMJpTfCVsVuA');
        let satellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGF0cmlja3IiLCJhIjoiY2l2aW9lcXlvMDFqdTJvbGI2eXUwc2VjYSJ9.trTzsdDXD2lMJpTfCVsVuA');
        var baseMaps = {
            "Satellite": satellite,
            "Streets": streets
        };

        let mapEle = this.mapElement.nativeElement;
        this.map = L.map(mapEle, {
            center: [this.latitude, this.longitude],
            zoom: this.zoom,
            scrollWheelZoom: false,
            layers: [streets]
        });
    }

    // MAP METHODS

    resizeMap(): void {
        this.map.resize()
    }

    setCenter(latitude: number = this.latitude, longitude: number = this.longitude): void {}

    setBounds(layer: any, route:boolean=false): void {}
    
    setHeightMap(height: number): void {
        this.height_map = height;
    }


    // LAYER METHODS

    createLayer(layer: string) {
        this.layers[layer] = L.geoJSON().addTo(this.map);
    }

    removeLayer(layer: string) {
        this.map.removeLayer(this.layers[layer]);
    }

    addGeoJson(layer: string, json: any) {
        this.layers[layer].addData(json);
    }

    removeFeature(layer: string, feature: any) {
        this.layers[layer].eachLayer(_layer =>{
            if(_layer.feature.properties.id == feature.properties.id) {
                this.layers[layer].removeLayer(_layer._leaflet_id);
            }
        });
    }

    setIcons(layer: string, icon: any) {
        this.layers[layer].eachLayer(function(layer){
            layer.setIcon(layer.options.icon = icon);
        });
    }

    myLocationSet(center?:boolean){
        // Get current position
        this.geolocation.getCurrentPosition({enableHighAccuracy: true, timeout: 6000}).then((data) => {
            //let latLng = new google.maps.LatLng(data.coords.latitude, data.coords.longitude);
            /*if(!this.myPositionMarker){
                // Create marker if it dont exist
                this.myPositionMarker = new google.maps.Marker({
                    position: latLng,
                    map: this.map,
                    title: 'Estoy aquí!',
                    icon: 'assets/images/person-marker2.png'
                });
            }*/
            // Set marker new position on the map
           // this.myPositionMarker.setPosition(latLng);
           this.globalService.showAlert('gps', 'work');
        }).catch((error) => {
            console.log(error);
        });
    }

    myLocationWatch(){
        let watch = this.geolocation.watchPosition({enableHighAccuracy: true});
        watch.subscribe((data) => {
            //let latLng = new google.maps.LatLng(data.coords.latitude, data.coords.longitude);
            if (this.myPositionMarker){
                //this.myPositionMarker.setPosition(latLng);
            }else{
                this.myLocationSet();
            }
        });
    }


    // ROUTE METHODS

    prepareRoute(layer: string){}

    setRoute(origin: any, destination:any){}

    removeRoute(){}


    // MARKER METHODS

    setMarkerOnClick(layer:string){}
    
    addOnClick(layer: string){}

    setLabel(layer: string){
        this.layers[layer].bindPopup(function(data){
            return data.feature.properties.nombre
        });
    }

}
