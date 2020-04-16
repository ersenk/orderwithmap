import { Component } from '@angular/core';
import { Platform, NavController, Events, ModalController, MenuController, AlertController } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ConfigService } from 'src/providers/config/config.service';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { LoadingService } from 'src/providers/loading/loading.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { LoginPage } from './modals/login/login.page';
import { SignUpPage } from './modals/sign-up/sign-up.page';
import { LanguagePage } from './modals/language/language.page';
import { CurrencyListPage } from './modals/currency-list/currency-list.page';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent {
  counter = 0;
  rootPage: any;
  appPages = [];

  constructor(
    public shared: SharedDataService,
    public config: ConfigService,
    public router: Router,
    private navCtrl: NavController,
    public modalCtrl: ModalController,
    public statusBar: StatusBar,
    public storage: Storage,
    public network: Network,
    public loading: LoadingService,
    public events: Events,
    public plt: Platform,
    private appVersion: AppVersion,
    public iab: InAppBrowser,
    private socialSharing: SocialSharing,
    public menuCtrl: MenuController,
    public alertController: AlertController,
    public ga: GoogleAnalytics,
    public geoLocation: Geolocation,
    private locationAccuracy: LocationAccuracy,
    public splashScreen: SplashScreen,
    private diagnostic: Diagnostic,
  ) {
    this.plt.ready().then(() => {
      this.splashScreen.hide();
      this.statusBar.styleLightContent();
      this.statusBar.backgroundColorByHexString('#137d7d');
      events.subscribe('openHomePage', (value) => {
        this.openHomePage();
      });
    });
    let connectedToInternet = true;
    network.onDisconnect().subscribe(() => {
      connectedToInternet = false;
      this.shared.showAlertWithTitle("İnternete bağlı değilsiniz", "Bağlantı koptu");
    });
    network.onConnect().subscribe(() => {
      if (!connectedToInternet) {
        this.shared.onStart();
        this.shared.showAlertWithTitle("İnternete bağlanıldı. Veriler güncelleniyor" + '...', "Bağlandı");
      }
    });
    document.documentElement.dir = localStorage.direction;
    shared.dir = localStorage.direction;
    this.initializeApp();
  }
  initializeApp() {
    this.plt.ready().then(() => {
      this.config.siteSetting().then((value) => {
        this.checkIfLocationEnabled();
        this.splashScreen.hide();
        this.storage.get('pushNotification').then((val) => {
          if (val == undefined) {
            this.shared.subscribePush();
            this.storage.set('pushNotification', "loaded");
          }
        });
        this.ga.startTrackerWithId('UA-155093060-1').then( () => {
        });
      });
    });
  }

  openHomePage() {
    this.navCtrl.navigateRoot("app/home3");
  }
  async openLoginPage() {
    let modal = await this.modalCtrl.create({
      component: LoginPage
    });
    return await modal.present();
  }
  async openSignUpPage() {
    let modal = await this.modalCtrl.create({
      component: SignUpPage,
    });
    return await modal.present();
  }
  logOut() {
    this.shared.logOut();
  }
  rateUs() {
    this.loading.autoHide(2000);
    if (this.plt.is('ios')) {
      this.iab.create(this.config.packgeName.toString(), "_system");
    } else if (this.plt.is('android')) {
      this.appVersion.getPackageName().then((val) => {
        this.iab.create("https://play.google.com/store/apps/details?id=" + val, "_system");
      });
    }
  }
  share() {
    this.loading.autoHide(2000);
    if (this.plt.is('ios')) {
      this.socialSharing.share(
        "O Şimdi Sanal Market",
        this.config.appName,
        "",
        this.config.packgeName.toString()
      ).then(() => {
      }).catch(() => {

      });
    } else if (this.plt.is('android')) {

      this.appVersion.getPackageName().then((val) => {
        this.socialSharing.share(
          "O Şimdi Sanal Market",
          this.config.appName,
          "",
          "https://play.google.com/store/apps/details?id=" + val
        ).then(() => {

        }).catch(() => {
        });
      });
    }
  }
  async openLanguagePage() {
    let modal = await this.modalCtrl.create({
      component: LanguagePage,
    });
    return await modal.present();
  }
  async openCurrencyPage() {
    let modal = await this.modalCtrl.create({
      component: CurrencyListPage,
    });
    return await modal.present();
  }

  async checkIfLocationEnabled() {
    console.log('checking if loc enabled');
    await this.diagnostic.isLocationEnabled().then((response: any ) => {
      if (!response) {
        this.turnOnLocationSettings();
        console.log('loc is not enabled');
      } else {
      this.shared.isLocationTurnedOn.next(true);
      console.log('loc is enabled..shared is loc turned on' + this.shared.isLocationTurnedOn.value);
      }
    });
  }

  async turnOnLocationSettings() {
    await this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then((response) => {
          if (response) {
          this.shared.isLocationTurnedOn.next(true);
          }
        },
          error => console.log('Error requesting location permissions', error)
        );
      }
    });
  }

//Unnecessary ones
  getStatusBarColor() {
  }

  expandItem(i) {
    if (i.expanded == false) { i.expanded = true; }
    else { i.expanded = false; }
  }
  showImg() {
    return !this.config.defaultIcons;
  }

  getNameFirstLetter() {
    return this.shared.getNameFirstLetter();
  }
}
