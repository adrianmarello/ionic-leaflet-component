import { Component, ViewChild, Input, ElementRef } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';

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

    constructor(private geolocation: Geolocation, private globalService: GlobalService, private diagnostic: Diagnostic, public alertCtrl: AlertController) {
        this.layers = [];
    }

    ngAfterViewInit() {
        this.initMap();
    }

    initMap() {
        let streets = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');
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
            this.myLocationSet(true);
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

    clearLayer(layer: string) {
        this.layers[layer].clearLayers();
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

    createPositionMarker(latLng) {
        if(!this.myPositionMarker){
            var icon1 = L.icon({
                iconUrl: 'assets/images/marker2.png',
                iconSize: [40,40]
            });
            // Create marker if it dont exist
            this.myPositionMarker = L.marker(latLng, {icon: icon1}).addTo(this.map).bindPopup("Estoy aquí");
        }
    }

    presentConfirmGPS(title: string, message: string) {
        let alert = this.alertCtrl.create({
            title: title,
            message: message,
            buttons: [
                {
                    text: 'Ahora no',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Activar GPS',
                    handler: () => {
                        this.diagnostic.switchToLocationSettings();
                    }
                }
                ]
            });
        alert.present();
    }

    myLocationSet(center: boolean = false, latitud: string = '', longitud: string = ''){
        // Get current position
        if(latitud && longitud){
            let latLng = new L.LatLng(latitud, longitud);
            this.createPositionMarker(latLng);
        }else{
            this.diagnostic.isLocationAvailable().then(enabled => {
                if(!enabled){
                    this.presentConfirmGPS('Activar GPS', 'Por favor active su GPS para encontrar su ubicación.');
                }else{
                    this.geolocation.getCurrentPosition({enableHighAccuracy: true, timeout: 6000}).then((data) => {
                        if(center){this.globalService.presentLoading('Buscando su ubicación...')}
                        let latLng = new L.LatLng(data.coords.latitude, data.coords.longitude);
                        this.createPositionMarker(latLng);
                        this.myPositionMarker.setLatLng(latLng);
                        this.map.setView(this.myPositionMarker.getLatLng());
                        //this.globalService.showAlert('gps', 'success');
                        this.globalService.dismissLoading();
                    }).catch((error) => {
                        console.log(error);
                        this.globalService.dismissLoading();
                    });
                }
            }).catch(error => {
                console.log(error);
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
                 this.createPositionMarker(latLng);
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

    setLabel(layer: string, className: string, dataName: string, field: string){
        this.layers[layer].bindPopup(function(data){
            let json = JSON.stringify(data.feature);

            let div = 
            "<div class='"+ className +"' data-"+ dataName + "='" + json + "'>" +
                "<span class='map-popup-title'>" + data.feature.properties[field] + "</span><br>" +
                "<div class='map-popup-btn-group'>" +
                    "<a class='map-popup-btn detalle-popup-btn'>Detalle</a>"+
                "</div>"+
            "</div>";

            return div;
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
