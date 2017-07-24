import { Component, ViewChild, Input, ElementRef } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';

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
    markers: any[] = [];
    circles: any[] = [];
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

    setCenter(fromPosition: boolean = false, latitude: number = this.latitude, longitude: number = this.longitude): void {
        if (fromPosition && this.myPositionMarker){
            this.map.setView(this.myPositionMarker.getLatLng());
        }else{
            let latLng = new L.LatLng(latitude, longitude);
            this.map.setView(latLng);
        }
    }

    setBounds(layer: any, route:boolean=false): void {}
    
    setHeightMap(height: number): void {
        this.height_map = height;
    }


    // LAYER METHODS

    createLayer(layer: string) {
        this.layers[layer] = L.geoJSON().addTo(this.map);
    }

    removeLayer(layer: string) {
        if(this.layers[layer]){
            this.map.removeLayer(this.layers[layer]);
        }else{
            return false
        }
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

    myLocationSet(center: boolean = false, latitud: string = '', longitud: string = ''){
        // Get current position
        if(latitud && longitud){
            let latLng = new L.LatLng(latitud, longitud);
            if(!this.myPositionMarker){
                var icon1 = L.icon({
                    iconUrl: 'assets/images/marker2.png',
                    iconSize: [40,40]
                });
                // Create marker if it dont exist
                this.myPositionMarker = L.marker(latLng, {icon: icon1}).addTo(this.map).bindPopup("Estoy aquí");
            }
        }else{
            this.geolocation.getCurrentPosition({enableHighAccuracy: true, timeout: 6000}).then((data) => {
                if(center){this.globalService.presentLoading('Buscando su ubicación...')}
                let latLng = new L.LatLng(data.coords.latitude, data.coords.longitude);
                if(!this.myPositionMarker){
                    var icon1 = L.icon({
                        iconUrl: 'assets/images/marker2.png',
                        iconSize: [40,40]
                    });
                    // Create marker if it dont exist
                    this.myPositionMarker = L.marker(latLng, {icon: icon1}).addTo(this.map).bindPopup("Estoy aquí");
                }
                // Set marker new position on the map
                this.myPositionMarker.setLatLng(latLng);
                //this.globalService.showAlert('gps', 'success');
                this.globalService.dismissLoading();
            }).catch((error) => {
                console.log(error);
                this.globalService.dismissLoading();
            });
        }
    }

    myLocationWatch(){
        let watch = this.geolocation.watchPosition({enableHighAccuracy: true});
        watch.subscribe((data) => {
            let latLng = new L.LatLng(data.coords.latitude, data.coords.longitude);
            if (this.myPositionMarker){
                this.myPositionMarker.setLatLng(latLng);
            }else{
                this.myLocationSet();
            }
        });
    }

    getMyLocation() {
        if(this.myPositionMarker){
            return this.myPositionMarker.getLatLng();
        }else{
            return false
        }
    }


    // ROUTE METHODS

    prepareRoute(layer: string){}

    setRoute(origin: any, destination:any){}

    removeRoute(){}


    // MARKER METHODS

    setMarkerOnClick(layer:string){}
    
    addOnClick(layer: string){}

    setLabel(layer: string, field: string){
        this.layers[layer].bindPopup(function(data){
            return '<div class="hospedajedata" data-hospedaje="'+ data.feature.properties[field] +'">' + data.feature.properties[field] + '</div>'
        });
    }

    createCircle(latitud: number, longitud: number, radio: number, nombre: string) {
        let latLng = new L.LatLng(latitud, longitud);
        this.circles[nombre] = L.circle(latLng, {radius: radio}).addTo(this.map);
    }

    removeCircle(nombre: string){
        if (this.circles[nombre]){
            this.map.removeLayer(this.circles[nombre]);
        }
    }

    setOnClick(layer: string){
        
    }

}
