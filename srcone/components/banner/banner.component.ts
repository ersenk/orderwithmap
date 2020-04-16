import { Component, OnInit} from '@angular/core';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { NavController, Platform } from '@ionic/angular';
import { ConfigService } from 'src/providers/config/config.service';
import { HTTP } from '@ionic-native/http/ngx';
import { LoadingService } from 'src/providers/loading/loading.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker,
  Environment,
  ILatLng
} from '@ionic-native/google-maps';
declare var google: any;

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
})
export class BannerComponent implements OnInit {
  private map: GoogleMap;
  private googleDirectionServices = new google.maps.DirectionsService;
  constructor(
    public shared: SharedDataService,
    public navCtrl: NavController,
    public config: ConfigService,
    public http: HTTP,
    public loading: LoadingService,
    public geoLocation: Geolocation,
    public platform: Platform,
    public googleMaps: GoogleMaps
  ) {}
  interval: any;
  waitingForOrder: boolean = false;
  myPosition: any = { lat: '', lng: '' };
  closestOsimdiBranch: any;
  myLatitude: any = '';
  myLongitude: any = '';
  osimdiLatitude: any;
  osimdiLongitude: any;
  originMarker: Marker;
  isCustomerCloseEnoughToBranch: boolean = false;
  slideOptions = {
    initialSlide: 0,
    slidesPerView: 1,
    autoplay: true
  };

   ngOnInit() {
    this.shared.getBranches();
    this.platform.ready().then(() => {
      this.shared.isLocationTurnedOn.subscribe(async (open) => {
        if (open) {
           this.getMyLocation();
        } else {
          this.config.freeShippingLimit = this.config.freeShippingLimitCargo;
        }
      }, error => {
        this.config.freeShippingLimit = this.config.freeShippingLimitCargo;
      });
      this.shared.customerWaitingForDelivery.subscribe((open) => {
        if (open) {
            this.waitingForOrder = true;
        } else {
            this.waitingForOrder = false;
        }
      }, error => {
        this.waitingForOrder = false;
      });
    });
  }
  bannerClick = function(image) {
    if (image.type == 'category') {
      this.navCtrl.navigateForward("products/" + image.url + "/0/newest");
    } else if (image.type == 'product') {
      this.getSingleProductDetail(parseInt(image.url));
    } else {
      this.navCtrl.navigateForward("products/0/0/" + image.type);
    }
  }

  getSingleProductDetail(id) {
    this.loading.show();
    let dat: { [k: string]: any } = {};
    if (this.shared.customerData != null) {
      dat.customers_id = this.shared.customerData.customers_id;
    }
    else {
      dat.customers_id = null;
    }
    dat.products_id = id;
    dat.language_id = this.config.langId;
    dat.currency_code = this.config.currecnyCode;
    this.config.postHttp('getallproducts', dat).then((data: any) => {
      this.loading.hide();
      if (data.success == 1) {
        this.shared.singleProductPageData.push(data.product_data[0]);
        this.navCtrl.navigateForward("product-detail/" + data.product_data[0].products_id);
      }
    });
  }
  async getMyLocation() {
    await this.geoLocation.getCurrentPosition({
      maximumAge: 1000, timeout: 5000,
      enableHighAccuracy: true
    }).then((response) => {
      this.myLatitude = response.coords.latitude;
      this.myLongitude = response.coords.longitude;
      this.findClosestBranch();
    }).catch((error) => {
    });
  }

  loadMap(lat, lng) {
    Environment.setEnv({
      API_KEY_FOR_BROWSER_RELEASE: 'AIzaSyBdqJY4fhuU-6GYqU00yjPlxZqIhROb7Qk',
      API_KEY_FOR_BROWSER_DEBUG: 'AIzaSyBdqJY4fhuU-6GYqU00yjPlxZqIhROb7Qk'
    });
    const mapOptions: GoogleMapOptions = {
      camera: {
        target: {
          lat: lat,
          lng: lng
        },
        zoom: 16,
        tilt: 30
      }
    };
    this.map = GoogleMaps.create('map_delivery', mapOptions);
    this.originMarker = this.map.addMarkerSync({
      title: 'Konumum',
      icon: 'red',
      animation: 'DROP',
      position: {
        lat: lat,
        lng: lng
      }
    });
    this.drawRoute(this.closestOsimdiBranch);
  }
  async getCourierPosition() {
    let data = { customers_id: this.shared.customerData.customers_id }
    await this.config.postHttp('whereismydelivery', data).then( ( data : any) => {
      if (data.success == 1) {
        this.loadMap(data.data[0].lat, data.data[0].lng);
      } else {
        this.waitingForOrder = false;
        this.stopInterval();
      }
    });
  }

  startTrackingCourier() {
    this.interval = setInterval(() => {
      this.getCourierPosition();
    }, 20000);
  }

  stopInterval() {
    clearInterval(this.interval);
  }
  async drawRoute(position: any) {
    Environment.setEnv({
      'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyBkxgvbtJaN7UFK-I-7DXBhbAXApRQ7Mqg',
      'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyBkxgvbtJaN7UFK-I-7DXBhbAXApRQ7Mqg'
    });
    const mapOptions: GoogleMapOptions = {
      camera: {
        target: {
          lat: position.lat,
          lng: position.lng
        },
        zoom: 18,
        tilt: 30
      }
    };
    this.map = GoogleMaps.create('map_canvas', mapOptions);
    const osimdiBranchMarker: Marker = this.map.addMarkerSync({
      icon: '#1baaaa',
      animation: 'DROP',
      position: position
    });
    this.originMarker = this.map.addMarkerSync({
      icon: '#e34b3d',
      animation: 'DROP',
      position: {
        lat: this.myLatitude,
        lng: this.myLongitude
      }
    });
    this.googleDirectionServices.route({
      origin: osimdiBranchMarker.getPosition(),
      destination: this.originMarker.getPosition(),
      travelMode: 'DRIVING'
    }, async results => {
      const points = new Array<ILatLng>();
      const routes = results.routes[0].overview_path;
      for (let index = 0; index < routes.length; index++) {
        points[index] = {
          lat: routes[index].lat(),
          lng: routes[index].lng()
        };
      }
      this.map.addPolyline({
        points: points,
        color: 'rgba(27, 170, 170,0.7)',
        width: 6
      });
      this.map.moveCamera({ target: points });
    });
  }

  async findClosestBranch() {
    return await this.config.postHttp('branches', {}).then((data: any) => {
      this.calculateClosestBranch(data.data);
    });
  }
  async calculateClosestBranch(branches) {
    let distance = 0;
    let closestBranch;
    const myPos = { lat: this.myLatitude, lng: this.myLongitude };
    if (branches.length > 1) {
      for (let index = 0; index < branches.length; index++) {
        const branchPos = { lat: branches[index].lat, lng: branches[index].lng };
        const distanceToBranch: number = this.mesureDistanceFromMeToBranches(myPos, branchPos);
        if (index == 0) {
          closestBranch = branches[index];
          distance = distanceToBranch;
        } else if (index > 0) {
          if (distanceToBranch < distance) {
            closestBranch = branches[index];
            distance = distanceToBranch;
          }
        }
      }
    } else {
      closestBranch = branches;
    }
    if (parseFloat(this.config.maxDistanceToClosestOsimdiBranch) > distance) {
      this.isCustomerCloseEnoughToBranch = true;
      this.config.freeShippingLimit = this.config.freeShippingLimitCourier;
      this.shared.isLocationTurnedOn.next(true);
      this.shared.branchId = closestBranch.id;
      this.shared.shippingMethod = 2;
      this.shared.branchIdHasChanged.next(true);
      this.closestOsimdiBranch = closestBranch;
      this.drawRoute(closestBranch);
    } else {
      this.shared.branchId = 1; //Default merkez şube
      this.shared.shippingMethod = 1;
      this.config.freeShippingLimit = this.config.freeShippingLimitCargo;
    }
    return await closestBranch;
  }
  mesureDistanceFromMeToBranches(p1, p2) {
    const R = 6378137; // Earth’s mean radius in meter
    const dLat = this.rad(p2.lat - p1.lat);
    const dLong = this.rad(p2.lng - p1.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.rad(p1.lat)) * Math.cos(this.rad(p2.lat)) *
      Math.sin(dLong / 2) * Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d: number = (R * c);
    return (d); // returns the distance in meter
  }
  rad(x) {
    return x * Math.PI / 180;
  }
}
